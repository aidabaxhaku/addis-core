package org.drugis.trialverse.dataset.controller;

import org.apache.commons.codec.digest.DigestUtils;
import org.apache.http.HttpResponse;
import org.apache.http.HttpVersion;
import org.apache.http.message.BasicHttpResponse;
import org.apache.http.message.BasicStatusLine;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFLanguages;
import org.apache.jena.riot.WebContent;
import org.drugis.addis.security.Account;
import org.drugis.addis.security.repository.AccountRepository;
import org.drugis.addis.util.WebConstants;
import org.drugis.trialverse.dataset.controller.command.DatasetCommand;
import org.drugis.trialverse.dataset.model.Dataset;
import org.drugis.trialverse.dataset.model.VersionNode;
import org.drugis.trialverse.dataset.repository.DatasetReadRepository;
import org.drugis.trialverse.dataset.repository.DatasetWriteRepository;
import org.drugis.trialverse.dataset.service.DatasetService;
import org.drugis.trialverse.dataset.service.HistoryService;
import org.drugis.trialverse.graph.service.GraphService;
import org.drugis.trialverse.security.TrialversePrincipal;
import org.drugis.trialverse.util.Namespaces;
import org.drugis.trialverse.util.Utils;
import org.drugis.trialverse.util.service.TrialverseIOUtilsService;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Matchers;
import org.mockito.Mock;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.social.connect.Connection;
import org.springframework.social.connect.ConnectionData;
import org.springframework.social.security.SocialAuthenticationToken;
import org.springframework.social.security.SocialUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import javax.servlet.http.HttpServletResponse;
import java.net.URI;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.*;
import static org.mockito.MockitoAnnotations.initMocks;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Created by connor on 6-11-14.
 */
@Configuration
@EnableWebMvc
public class DatasetControllerTest {

  private MockMvc mockMvc;

  @Mock
  private AccountRepository accountRepository;

  @Mock
  private DatasetWriteRepository datasetWriteRepository;

  @Mock
  private DatasetReadRepository datasetReadRepository;

  @Mock
  private TrialverseIOUtilsService trialverseIOUtilsService;

  @Mock
  private GraphService graphService;

  @Mock
  private WebConstants webConstants;

  @Mock
  private HistoryService historyService;

  @Mock
  private DatasetService datasetService;

  @InjectMocks
  private DatasetController datasetController;

  private TrialversePrincipal principal;
  private SocialAuthenticationToken user;
  private Account john = new Account(1, "john@apple.co.uk", "John", "Lennon", DigestUtils.sha256Hex("john@apple.co.uk"));

  @Before
  public void setUp() {
    Connection connection = mock(Connection.class);
    ConnectionData connectionData = mock(ConnectionData.class);
    when(connectionData.getProviderId()).thenReturn("providerId");
    when(connection.createData()).thenReturn(connectionData);

    user = new SocialAuthenticationToken(connection, new SocialUser(john.getUsername(), "password", Collections.emptyList()), null, null);
    principal = new TrialversePrincipal(user);
    accountRepository = mock(AccountRepository.class);
    datasetWriteRepository = mock(DatasetWriteRepository.class);
    datasetController = new DatasetController();
    webConstants = mock(WebConstants.class);

    initMocks(this);
    mockMvc = MockMvcBuilders.standaloneSetup(datasetController).build();
    when(user.getName()).thenReturn(john.getUsername());
  }


  @After
  public void tearDown() {
    verifyNoMoreInteractions(accountRepository, datasetWriteRepository);
  }

  @Test
  public void testCreateDatasetForNonLoginUser() throws Exception {
    String newDatasetUri = "http://some.thing.like/this/asd123";
    URI uri = new URI(newDatasetUri);
    DatasetCommand datasetCommand = new DatasetCommand("dataset title");
    String jsonContent = Utils.createJson(datasetCommand);
    Account account = new Account(3, "username", "Pete", "smith", "foo@bar.com");
    when(accountRepository.findAccountByUsername(john.getUsername())).thenReturn(account);
    when(datasetWriteRepository.createDataset(datasetCommand.getTitle(), datasetCommand.getDescription(), principal)).thenReturn(uri);
    mockMvc
            .perform(post("/users/37/datasets")
                    .principal(user)
                    .content(jsonContent)
                    .contentType(webConstants.getApplicationJsonUtf8())
            )
            .andExpect(status().isForbidden());

    verify(accountRepository).findAccountByUsername(john.getUsername());
    verifyNoMoreInteractions(datasetWriteRepository);
  }

  @Test
  public void testCreateDataset() throws Exception {
    String newDatasetUri = "http://some.thing.like/this/asd123";
    URI uri = new URI(newDatasetUri);
    DatasetCommand datasetCommand = new DatasetCommand("dataset title");
    String jsonContent = Utils.createJson(datasetCommand);
    when(accountRepository.findAccountByUsername(john.getUsername())).thenReturn(john);
    when(datasetWriteRepository.createDataset(datasetCommand.getTitle(), datasetCommand.getDescription(), principal)).thenReturn(uri);
    Integer userId = john.getId();
    mockMvc
            .perform(post("/users/" + userId + "/datasets")
                    .principal(user)
                    .content(jsonContent)
                    .contentType(webConstants.getApplicationJsonUtf8())
            )
            .andExpect(status().isCreated())
            .andExpect(header().string("Location", newDatasetUri));

    verify(accountRepository).findAccountByUsername(john.getUsername());
    verify(datasetWriteRepository).createDataset(datasetCommand.getTitle(), datasetCommand.getDescription(), principal);
  }

  @Test
  public void queryDatasetsRequestPathTurtleType() throws Exception {
    Model model = mock(Model.class);
    when(datasetReadRepository.queryDatasets(john)).thenReturn(model);
    Integer userId = 1;
    when(accountRepository.findAccountById(userId)).thenReturn(john);

    mockMvc.perform(get("/users/" + userId + "/datasets").principal(user)
            .accept(RDFLanguages.TURTLE.getHeaderString()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(RDFLanguages.TURTLE.getContentType().getContentType()));

    verify(accountRepository).findAccountById(userId);
    verify(datasetReadRepository).queryDatasets(john);
    verify(trialverseIOUtilsService).writeModelToServletResponse(Matchers.any(Model.class), Matchers.any(HttpServletResponse.class));
  }

  @Test
  public void queryDatasetsRequestPathJsonType() throws Exception {
    List<Dataset> datasets = Arrays.asList(new Dataset("uri", john, "title", "description", "headVersion"));
    when(datasetService.findDatasets(john)).thenReturn(datasets);
    Integer userId = 1;
    when(accountRepository.findAccountById(userId)).thenReturn(john);

    mockMvc.perform(get("/users/" + userId + "/datasets").principal(user)
            .accept(WebConstants.getApplicationJsonUtf8()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(WebConstants.getApplicationJsonUtf8()))
            .andExpect(jsonPath("$", hasSize(datasets.size())));

    verify(accountRepository).findAccountById(userId);
    verify(datasetService).findDatasets(john);
  }

  @Test
  public void queryDatasetsGraphs() throws Exception {
    Model model = mock(Model.class);
    HttpServletResponse mockServletResponse = mock(HttpServletResponse.class);
    when(datasetReadRepository.queryDatasets(john)).thenReturn(model);
    Integer userId = 1;
    when(accountRepository.findAccountById(userId)).thenReturn(john);

    datasetController.queryDatasetsGraphsByUser(mockServletResponse, userId);

    verify(accountRepository).findAccountById(userId);
    verify(datasetReadRepository).queryDatasets(john);
    verify(trialverseIOUtilsService).writeModelToServletResponse(model, mockServletResponse);
  }

  @Test
  public void testGetDataset() throws Exception {
    String uuid = "uuuuiiid-yeswecan";
    URI datasetUri = new URI(Namespaces.DATASET_NAMESPACE + uuid);
    Model model = mock(Model.class);
    when(datasetReadRepository.getVersionedDataset(datasetUri, null)).thenReturn(model);
    when(accountRepository.findAccountByUsername(user.getName())).thenReturn(john);

    mockMvc.perform((get("/users/some-user-uid/datasets/" + uuid)).principal(user))
            .andExpect(status().isOk())
            .andExpect(content().contentType(RDFLanguages.TURTLE.getContentType().getContentType()));

    verify(datasetReadRepository).getVersionedDataset(datasetUri, null);
    verify(trialverseIOUtilsService).writeModelToServletResponse(Matchers.any(Model.class), Matchers.any(HttpServletResponse.class));
  }

  @Test
  public void testGetDatasetAsJson() throws Exception {
    String uuid = "uuuuiiid-yeswecan";
    URI datasetUri = new URI(Namespaces.DATASET_NAMESPACE + uuid);
    Model model = mock(Model.class);
    when(datasetReadRepository.getVersionedDataset(datasetUri, null)).thenReturn(model);
    when(accountRepository.findAccountByUsername(user.getName())).thenReturn(john);

    mockMvc.perform((get("/users/some-user-uid/datasets/" + uuid)).principal(user).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(content().contentType(RDFLanguages.JSONLD.getContentType().getContentType()));

    verify(datasetReadRepository).getVersionedDataset(datasetUri, null);
    verify(trialverseIOUtilsService).writeModelToServletResponseJson(Matchers.any(Model.class), Matchers.any(HttpServletResponse.class));
  }

  @Test
  public void testGetDatasetVersion() throws Exception {
    String uuid = "uuuuiiid-yeswecan";
    String versionUuid = "versionUuid";

    URI datasetUri = new URI(Namespaces.DATASET_NAMESPACE + uuid);
    Model model = mock(Model.class);
    when(datasetReadRepository.getVersionedDataset(datasetUri, versionUuid)).thenReturn(model);
    when(accountRepository.findAccountByUsername(user.getName())).thenReturn(john);

    mockMvc.perform((get("/users/user-name-hash/datasets/" + uuid + "/versions/" + versionUuid)).principal(user))
            .andExpect(status().isOk())
            .andExpect(content().contentType(RDFLanguages.TURTLE.getContentType().getContentType()));

    verify(datasetReadRepository).getVersionedDataset(datasetUri, versionUuid);
    verify(trialverseIOUtilsService).writeModelToServletResponse(Matchers.any(Model.class), Matchers.any(HttpServletResponse.class));
  }

  @Test
  public void testGetHistory() throws Exception {
    String uuid = "uuuuiiid-yeswecan";

    mockMvc.perform((get("/users/user-name-hash/datasets/" + uuid + "/history")).principal(user))
            .andExpect(status().isOk())
            .andExpect(content().contentType("application/json;charset=UTF-8"));

    verify(historyService).createHistory(URI.create(Namespaces.DATASET_NAMESPACE + uuid));
  }

  @Test
  public void testExecuteHeadQuery() throws Exception {
    String uuid = "uuuuiiid-yeswecan";
    String query = "Select * where { ?a ?b ?c}";
    URI trialverseDatasetUri = new URI(Namespaces.DATASET_NAMESPACE + uuid);
    HttpResponse httpResponse = new BasicHttpResponse(new BasicStatusLine(new HttpVersion(1, 1), HttpStatus.OK.value(), "reason"));
    String acceptValue = "c/d";
    httpResponse.setHeader("Content-Type", acceptValue);

    String responseStr = "whatevs";
    when(datasetReadRepository.executeQuery(query, trialverseDatasetUri, null, acceptValue)).thenReturn(responseStr.getBytes());
    mockMvc.perform(get("/users/user-name-hash/datasets/" + uuid + "/query")
            .param("query", query)
            .header("Accept", acceptValue)
            .principal(user))
            .andExpect(status().isOk())
            .andExpect(content().contentType(acceptValue));

    verify(datasetReadRepository).executeQuery(query, trialverseDatasetUri, null, acceptValue);
    verify(trialverseIOUtilsService).writeContentToServletResponse(any(byte[].class), Matchers.any(HttpServletResponse.class));

  }

  @Test
  public void testExecuteVersionedQuery() throws Exception {
    String uuid = "uuuuiiid-yeswecan";
    String query = "Select * where { ?a ?b ?c}";
    String version = "my-version";
    URI trialverseDatasetUri = new URI(Namespaces.DATASET_NAMESPACE + uuid);
    String acceptValue = "c/d";
    String responseStr = "foo";
    when(datasetReadRepository.executeQuery(query, trialverseDatasetUri, version, acceptValue)).thenReturn(responseStr.getBytes());
    mockMvc.perform(get("/users/user-name-hash/datasets/" + uuid + "/versions/" + version + "/query")
            .param("query", query)
            .header("Accept", acceptValue)
            .principal(user))
            .andExpect(status().isOk())
            .andExpect(content().contentType(acceptValue));

    verify(datasetReadRepository).executeQuery(query, trialverseDatasetUri, version, acceptValue);
    verify(trialverseIOUtilsService).writeContentToServletResponse(any(byte[].class), Matchers.any(HttpServletResponse.class));
  }

  @Test
  public void testEditDataset() throws Exception {
    String newTitle = "new title";
    String newDescription = "new desc";
    DatasetCommand datasetCommand = new DatasetCommand(newTitle, newDescription);
    String jsonContent = Utils.createJson(datasetCommand);
    String datasetUuid = "datasetUuid";
    String newVersion = "newVersion";
    when(accountRepository.findAccountByUsername(john.getUsername())).thenReturn(john);
    when(datasetWriteRepository.editDataset(principal, datasetUuid, newTitle, newDescription)).thenReturn(newVersion);
    mockMvc.perform(post("/users/1/datasets/" + datasetUuid)
            .contentType(WebContent.contentTypeJSON)
            .content(jsonContent).principal(user))
            .andExpect(status().isOk())
            .andExpect(header().string(WebConstants.X_EVENT_SOURCE_VERSION, newVersion));
    verify(accountRepository).findAccountByUsername(john.getUsername());
    verify(datasetWriteRepository).editDataset(principal, datasetUuid, newTitle, newDescription);
  }

  @Test
  public void testGetSpecificVersionInfo() throws Exception {
    String versionUuid = "someVersion";
    String datasetUuid = "someDataset";
    URI datasetUri = URI.create(Namespaces.DATASET_NAMESPACE + datasetUuid);
    URI versionUri = URI.create(WebConstants.getVersionBaseUri() + versionUuid);

    VersionNode versionNode = new VersionNode("Uri", "title", null, "desc", "creatore", 1, 2, "application");

    when(historyService.getVersionInfo(datasetUri, versionUri)).thenReturn(versionNode);

    mockMvc.perform(get("/users/1/datasets/" + datasetUuid + "/history/" + versionUuid).principal(user))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.versionTitle").value(versionNode.getVersionTitle()))
    ;

    verify(historyService).getVersionInfo(datasetUri, versionUri);
  }

}
