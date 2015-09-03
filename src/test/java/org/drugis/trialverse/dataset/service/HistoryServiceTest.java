package org.drugis.trialverse.dataset.service;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.drugis.trialverse.dataset.exception.RevisionNotFoundException;
import org.drugis.trialverse.dataset.model.VersionMapping;
import org.drugis.trialverse.dataset.model.VersionNode;
import org.drugis.trialverse.dataset.repository.DatasetReadRepository;
import org.drugis.trialverse.dataset.repository.VersionMappingRepository;
import org.drugis.trialverse.dataset.service.impl.HistoryServiceImpl;
import org.drugis.trialverse.graph.repository.GraphReadRepository;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.core.io.ClassPathResource;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;

import static junit.framework.TestCase.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.when;
import static org.mockito.MockitoAnnotations.initMocks;

/**
 * Created by daan on 3-9-15.
 */
public class HistoryServiceTest {

  @Mock
  private VersionMappingRepository versionMappingRepository;

  @Mock
  private GraphReadRepository graphReadRepository;

  @Mock
  private DatasetReadRepository datasetReadRepository;

  @Mock
  private RestTemplate restTemplate;

  @InjectMocks
  private HistoryService historyService;

  @Before
  public void setUp() {
    historyService = new HistoryServiceImpl();
    initMocks(this);
  }

  @Test
  public void testCreateHistory() throws RevisionNotFoundException, IOException, URISyntaxException {
    URI trialverseDatasetUri = URI.create("http://anyUri");
    String versionedDatasetUri = "http://anyVersionedUri";
    VersionMapping mapping = new VersionMapping(versionedDatasetUri, null, trialverseDatasetUri.toString());
    InputStream historyStream = new ClassPathResource("mockHistory.ttl").getInputStream();
    Model historyModel = ModelFactory.createDefaultModel();
    historyModel.read(historyStream, null, "TTL");

    when(versionMappingRepository.getVersionMappingByDatasetUrl(trialverseDatasetUri)).thenReturn(mapping);
    when(datasetReadRepository.getHistory(mapping.getVersionedDatasetUri())).thenReturn(historyModel);
    when(datasetReadRepository.getHistory(URI.create("http://localhost:8080/datasets/be177e27-7978-41de-b4f9-9267ddd1cc41"))).thenReturn(historyModel);
    when(datasetReadRepository.getHistory(URI.create("http://localhost:8080/datasets/a06d83d2-5819-402f-b6f3-e2682766a723"))).thenReturn(historyModel);
    List<VersionNode> history = historyService.createHistory(trialverseDatasetUri);

    assertTrue(history.size() > 0);
    assertEquals("http://testhost/versions/e53caa0d-c0df-46db-977e-37f48fecb042", history.get(0).getUri());
    assertEquals("Added an arm", history.get(0).getVersionTitle());
  }

}