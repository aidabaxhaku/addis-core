package importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.http.*;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.message.BasicHttpResponse;
import org.apache.http.message.BasicStatusLine;
import org.drugis.addis.importer.service.ClinicalTrialsImportService;
import org.drugis.addis.importer.service.impl.ClinicalTrialsImportError;
import org.drugis.addis.importer.service.impl.ClinicalTrialsImportServiceImpl;
import org.drugis.addis.intermediateImport.IntermediateImport;
import org.drugis.addis.intermediateImport.repository.IntermediateImportRepository;
import org.drugis.trialverse.graph.exception.UpdateGraphException;
import org.drugis.trialverse.graph.repository.GraphWriteRepository;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.mock.web.DelegatingServletInputStream;

import javax.servlet.ServletInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Date;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.mockito.Matchers.any;
import static org.mockito.Matchers.eq;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.MockitoAnnotations.initMocks;

public class ClinicalTrialsImportServiceTest {

  private ObjectMapper objectMapper = new ObjectMapper();

  @Mock
  private HttpClient httpClient = mock(HttpClient.class);

  @Mock
  private GraphWriteRepository graphWriteRepository = mock(GraphWriteRepository.class);

  @Mock
  private IntermediateImportRepository intermediateImportRepository = mock(IntermediateImportRepository.class);

  @InjectMocks
  private ClinicalTrialsImportService clinicalTrialsImportService;

  @Before
  public void setUp() {
    clinicalTrialsImportService = new ClinicalTrialsImportServiceImpl();
    initMocks(this);
  }

  @After
  public void tearDown() {
    verifyNoMoreInteractions(graphWriteRepository, intermediateImportRepository);
  }

  @Test
  public void fetchInfo() throws ClinicalTrialsImportError, IOException {
    String ntcID = "ntcId";
    String jsonObjectString = "{\"foo\": \"bar\"}";
    JsonNode mockResultFromService = objectMapper.readTree(jsonObjectString);
    mockHttpGetWithContent(jsonObjectString);

    JsonNode result = clinicalTrialsImportService.fetchInfo(ntcID);

    assertEquals(result, mockResultFromService);
  }

  @Test
  public void fetchInfoNotFound() throws ClinicalTrialsImportError, IOException {
    String ntcID = "ntcId";

    CloseableHttpResponse response = mock(CloseableHttpResponse.class);
    when(response.getStatusLine()).thenReturn(new BasicStatusLine(HttpVersion.HTTP_1_1, HttpStatus.SC_NOT_FOUND, "FINE!"));
    when(httpClient.execute(any())).thenReturn(response);

    JsonNode result = clinicalTrialsImportService.fetchInfo(ntcID);
    assertNull(result);
  }

  @Test(expected = ClinicalTrialsImportError.class)
  public void fetchInfoOtherCode() throws ClinicalTrialsImportError, IOException {
    String ntcID = "ntcId";
    BasicHttpResponse response = new BasicHttpResponse(
            new BasicStatusLine(new ProtocolVersion("p", 1, 1), 12345, "reason")
    );
    when(httpClient.execute(any())).thenReturn(response);

    clinicalTrialsImportService.fetchInfo(ntcID);
  }

  @Test
  public void testImportStudy() throws ClinicalTrialsImportError, IOException, UpdateGraphException {
    String commitTitle = "title";
    String commitDesc = "desc";
    String datasetUuid = "dataset";
    String graphUuid = "graph";
    String studyRef = "123435ABC";
    String jsonObjectString = "{\"foo\": \"bar\"}";
    InputStream inputStream = mockHttpGetWithContent(jsonObjectString);
    Header mockHeader = mock(Header.class);
    when(graphWriteRepository.updateGraph(URI.create(datasetUuid), graphUuid, inputStream, commitTitle, commitDesc)).thenReturn(mockHeader);

    Header result = clinicalTrialsImportService.importStudy(commitTitle, commitDesc, datasetUuid, graphUuid, studyRef);
    assertEquals(mockHeader, result);

    verify(graphWriteRepository).updateGraph(URI.create(datasetUuid), graphUuid, inputStream, commitTitle, commitDesc);
  }

  @Test
  public void testImportEudract() throws ClinicalTrialsImportError, IOException, UpdateGraphException {
    String datasetUuid = "dataset";
    String graphUuid = "graph";
    String anyInput = "<xml></xml>";
    InputStream inputStream = mockHttpGetWithContent(anyInput);
    Header mockHeader = mock(Header.class);
    when(graphWriteRepository.updateGraph(URI.create(datasetUuid), graphUuid, inputStream,
            "Imported study from EudraCT XML", null)).thenReturn(mockHeader);

    ServletInputStream mockXML = new DelegatingServletInputStream(inputStream);
    Header result = clinicalTrialsImportService.importEudract(datasetUuid, graphUuid, mockXML);
    assertEquals(mockHeader, result);

    verify(graphWriteRepository).updateGraph(URI.create(datasetUuid), graphUuid, inputStream,
            "Imported study from EudraCT XML", null);
  }

  private InputStream mockHttpGetWithContent(String content) throws IOException {
    CloseableHttpResponse response = mock(CloseableHttpResponse.class);
    HttpEntity entity = mock(HttpEntity.class);
    InputStream inputStream = new ByteArrayInputStream(content.getBytes());
    when(response.getStatusLine()).thenReturn(new BasicStatusLine(HttpVersion.HTTP_1_1, HttpStatus.SC_OK, "FINE!"));
    when(entity.getContent()).thenReturn(inputStream);
    when(response.getEntity()).thenReturn(entity);
    when(httpClient.execute(any())).thenReturn(response);
    return inputStream;
  }

  static String readFile(String path, Charset encoding)
          throws IOException
  {
    byte[] encoded = Files.readAllBytes(Paths.get(path));
    return new String(encoded, encoding);
  }

  @Test
  public void testIntermediateImport() throws IOException {
    String datasetUuid = "dataset";
    String title = "Title";
    String content = readFile("src/test/resources/jenaBugTest.ttl", Charset.defaultCharset());
    String nctId = "nctId";
    Integer newId = 123123;

    IntermediateImport intermediateImportMock = mock(IntermediateImport.class);
    when(intermediateImportMock.getId()).thenReturn(newId);
    mockHttpGetWithContent(content);

    when(intermediateImportRepository.create(eq(title), any(Date.class), any(String.class),
            eq(datasetUuid))).thenReturn(intermediateImportMock);

    Integer result = clinicalTrialsImportService.intermediateImport(nctId, datasetUuid, title);

    assertEquals(result, newId);
    verify(intermediateImportRepository).create(eq(title), any(Date.class), any(String.class),
            eq(datasetUuid));
  }
}
