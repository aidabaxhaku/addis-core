package org.drugis.addis.trialverse;

import net.minidev.json.JSONArray;
import net.minidev.json.JSONObject;
import net.minidev.json.parser.ParseException;
import org.apache.jena.graph.Graph;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.sparql.graph.GraphFactory;
import org.drugis.addis.TestUtils;
import org.drugis.addis.covariates.CovariateRepository;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.interventions.repository.InterventionRepository;
import org.drugis.addis.trialverse.model.*;
import org.drugis.addis.trialverse.model.emun.CovariateOption;
import org.drugis.addis.trialverse.model.emun.StudyDataSection;
import org.drugis.addis.trialverse.model.trialdata.CovariateStudyValue;
import org.drugis.addis.trialverse.service.QueryResultMappingService;
import org.drugis.addis.trialverse.service.TriplestoreService;
import org.drugis.addis.trialverse.service.impl.ReadValueException;
import org.drugis.addis.trialverse.service.impl.TriplestoreServiceImpl;
import org.drugis.addis.util.WebConstants;
import org.junit.Before;
import org.junit.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.*;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.Assert.*;
import static org.mockito.Matchers.any;
import static org.mockito.Mockito.when;

/**
 * Created by connor on 2/28/14.
 */

public class TriplestoreServiceTest {

  @Mock
  private RestTemplate restTemplate;

  @Mock
  CovariateRepository covariateRepository;

  @Mock
  InterventionRepository interventionRepository;

  @Mock
  QueryResultMappingService queryResultMappingService;

  @InjectMocks
  private TriplestoreService triplestoreService;

  @Before
  public void setUp() {
    triplestoreService = new TriplestoreServiceImpl();
    MockitoAnnotations.initMocks(this);
  }

  @Test
  public void testQueryNamespaces() throws ParseException {
    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleQueryNamespacesResult.json");
    ResponseEntity<String> resultEntity = new ResponseEntity<>(mockResult, HttpStatus.OK);

    UriComponents uriComponents = UriComponentsBuilder
            .fromHttpUrl(WebConstants.getTriplestoreBaseUri())
            .path("datasets/")
            .build();

    String datasetUuid = "d1";
    String query = TriplestoreServiceImpl.NAMESPACE;
    UriComponents uriComponents2 = UriComponentsBuilder.fromHttpUrl(WebConstants.getTriplestoreBaseUri())
            .path("datasets/" + datasetUuid)
            .path(TriplestoreServiceImpl.QUERY_ENDPOINT)
            .queryParam(TriplestoreServiceImpl.QUERY_PARAM_QUERY, query)
            .build();
    String mockResult2 = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleGetNamespaceResult.json");
    MultiValueMap<String, String> responceHeaders = new HttpHeaders();
    responceHeaders.add(TriplestoreServiceImpl.X_EVENT_SOURCE_VERSION, "version");
    ResponseEntity<String> resultEntity2 = new ResponseEntity<>(mockResult2, responceHeaders, HttpStatus.OK);
    String graphBody = TestUtils.loadResource(this.getClass(), "triplestoreService/exampleNamespaceResult.ttl");
    Graph graph = GraphFactory.createGraphMem();
    RDFDataMgr.read(graph, graphBody);
    ResponseEntity<Graph> resultEntity3 = new ResponseEntity<>(graph, responceHeaders, HttpStatus.OK);

    when(restTemplate.exchange(uriComponents.toUri(), HttpMethod.GET, TriplestoreServiceImpl.acceptJsonRequest, String.class)).thenReturn(resultEntity);
    when(restTemplate.exchange(uriComponents2.toUri(), HttpMethod.GET, TriplestoreServiceImpl.acceptSparqlResultsRequest, String.class)).thenReturn(resultEntity2);
    when(restTemplate.exchange(URI.create("http://baseurl/d1"), HttpMethod.GET, new HttpEntity<String>(new HttpHeaders()), Graph.class)).thenReturn(resultEntity3);

    Collection<Namespace> namespaces = triplestoreService.queryNameSpaces();

    assertEquals(1, namespaces.size());
  }

  @Test
  public void testGetOutcomes() throws ReadValueException {
    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleOutcomeResult.json");
    createMockTrialverseService(mockResult);
    List<SemanticVariable> result = triplestoreService.getOutcomes("abc", "version");
    SemanticVariable result1 = new SemanticVariable(URI.create("http://trials.drugis.org/namespace/1/endpoint/fdszgs-adsfd-1"), "DBP 24-hour mean");
    assertEquals(result.get(0), result1);
  }

  @Test
  public void testGetPopulationCharacteristics() throws ReadValueException {
    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleOutcomeResult.json");
    createMockTrialverseService(mockResult);
    List<SemanticVariable> result = triplestoreService.getOutcomes("abc", "version");
    SemanticVariable result1 = new SemanticVariable(URI.create("http://trials.drugis.org/namespace/1/endpoint/fdszgs-adsfd-1"), "DBP 24-hour mean");
    assertEquals(result.get(0), result1);
  }

  @Test
  public void testGetInterventions() {
    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleInterventionResult.json");
    createMockTrialverseService(mockResult);

    List<SemanticInterventionUriAndName> result = triplestoreService.getInterventions("abc", "version");
    SemanticInterventionUriAndName intervention = result.get(0);
    SemanticInterventionUriAndName expectedSemanticInterventionUriAndName = new SemanticInterventionUriAndName(URI.create("fdhdfgh-saddsgfsdf-123-a"), "Azilsartan");
    assertEquals(expectedSemanticInterventionUriAndName, intervention);
  }

  @Test
  public void testGetStudyDetails() throws ResourceDoesNotExistException {
    String namespaceUid = "namespaceUid";

    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleGetStudyDetailsResult.json");
    createMockTrialverseService(mockResult);

    StudyWithDetails studyWithDetails = triplestoreService.getStudydetails(namespaceUid, "version");

    assertNotNull(studyWithDetails.getStudyUid());
    assertNotNull(studyWithDetails.getName());
    assertNotNull(studyWithDetails.getTitle());
  }

  @Test
  public void testGetStudyGroups() throws ResourceDoesNotExistException {
    String namespaceUid = "namespaceUid";

    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleStudyGroupsResult.json");
    createMockTrialverseService(mockResult);

    JSONArray arms = triplestoreService.getStudyGroups(namespaceUid, "version");

    assertEquals(4, arms.size());
    JSONObject jsonObject = (JSONObject) arms.get(0);
    assertTrue(jsonObject.containsKey("groupUri"));
    assertTrue(jsonObject.containsKey("label"));
    assertTrue(jsonObject.containsKey("numberOfParticipantsStarting"));
    assertTrue(jsonObject.containsKey("isArm"));

    assertTrue(jsonObject.containsValue("http://trials.drugis.org/instances/5959fd08-9c5b-4016-8118-d195cdb80c70"));
    assertTrue(jsonObject.containsValue("Olmesartan medoxomil 20-40mg/hydrochlorothiazide 12.5-25mg QD"));
    assertTrue(jsonObject.containsValue("356"));
    assertTrue(jsonObject.containsValue(true));
  }

  @Test
  public void testGetTreatmentActivities() {
    String namespaceUid = "namespaceUid";

    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleStudyTreatmentActivitiesResult.json");
    createMockTrialverseService(mockResult);

    List<TreatmentActivity> treatmentActivities = triplestoreService.getStudyTreatmentActivities(namespaceUid, "version");
    assertEquals(4, treatmentActivities.size());
  }

  @Test
  public void testGetStudyDataForBaseLineCharacteristics() {
    String namespaceUid = "namespaceUid";
    String studyUid = "studyUid";
    StudyDataSection studyDataSection = StudyDataSection.BASE_LINE_CHARACTERISTICS;

    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleBaseLineCharacteristicsResult.json");
    createMockTrialverseService(mockResult);

    List<StudyData> result = triplestoreService.getStudyData(namespaceUid, studyUid, studyDataSection);
    assertEquals(2, result.size());
  }

  @Test
  public void testGetStudyDataForEndPoints() {
    String namespaceUid = "namespaceUid";
    String studyUid = "studyUid";
    StudyDataSection studyDataSection = StudyDataSection.ENDPOINTS;

    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleEndPointResult.json");
    createMockTrialverseService(mockResult);

    List<StudyData> result = triplestoreService.getStudyData(namespaceUid, studyUid, studyDataSection);
    assertEquals(15, result.size());
  }

  @Test
  public void testQueryStudies() {
    String namespaceUid = "namespaceUid";
    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/exampleQueryStudiesResult.json");
    createMockTrialverseService(mockResult);

    List<Study> result = triplestoreService.queryStudies(namespaceUid, "version");
    assertEquals(5, result.size()); // epar example
    assertEquals(3, result.get(0).getTreatmentArms().size());

    for(Study study : result) {
      if(study.getTitle().equals("TAK491-301 / NCT00846365")){
        for(StudyTreatmentArm arm : study.getTreatmentArms()) {
          if(arm.getArmUid().equals("http://trials.drugis.org/instances/5b9bb252-59d3-4936-a005-7ee443878c43")) {
            // this one should have a multi drug arm
            arm.getInterventionUids().size();
          }
        }
      }
    }
  }

  @Test
  public void getCovariateTestData() throws ReadValueException {
    String namespaceUid = "namespaceUid";
    String version = "version";
    String mockResult = TestUtils.loadResource(this.getClass(), "/triplestoreService/covariateDataExample.json");
    createMockTrialverseService(mockResult);

    List<CovariateStudyValue> result = triplestoreService.getStudyLevelCovariateValues(namespaceUid, version, Collections.singletonList(CovariateOption.ALLOCATION_RANDOMIZED));
    assertEquals(4, result.size());

  }

  @Test
  public void testRegEx() {
    String studyOptionsString = "1|2";
    String uri1 = "foo/study/1/whatevr";
    String uri10 = "foo/study/10/whatevr";
    String uri12 = "foo/study/12/whatevr";
    String reg = "/study/(" + studyOptionsString + ")/";
    Pattern pattern = Pattern.compile(reg);
    Matcher matcher1 = pattern.matcher(uri1);
    Matcher matcher10 = pattern.matcher(uri10);
    Matcher matcher12 = pattern.matcher(uri12);
    assertTrue(matcher1.find());
    assertFalse(matcher10.find());
    assertFalse(matcher12.find());
  }

  private void createMockTrialverseService(String result) {
    ResponseEntity resultEntity = new ResponseEntity<>(result, HttpStatus.OK);
    when(restTemplate.exchange(any(URI.class), any(HttpMethod.class), any(HttpEntity.class), any(Class.class))).thenReturn(resultEntity);
  }

}
