package org.drugis.addis.trialverse.service;

import net.minidev.json.JSONArray;
import net.minidev.json.parser.ParseException;
import org.apache.commons.io.IOUtils;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.interventions.model.AbstractIntervention;
import org.drugis.addis.trialverse.model.*;
import org.drugis.addis.trialverse.model.emun.CovariateOption;
import org.drugis.addis.trialverse.model.emun.StudyDataSection;
import org.drugis.addis.trialverse.model.mapping.TriplestoreUuidAndOwner;
import org.drugis.addis.trialverse.model.trialdata.CovariateStudyValue;
import org.drugis.addis.trialverse.model.trialdata.TrialDataArm;
import org.drugis.addis.trialverse.model.trialdata.TrialDataStudy;
import org.drugis.addis.trialverse.service.impl.ReadValueException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Collection;
import java.util.List;
import java.util.Set;

/**
 * Created by connor on 2/28/14.
 */
public interface TriplestoreService {
  static String loadResource(String filename) {
    try {
      Resource myData = new ClassPathResource(filename);
      InputStream stream = myData.getInputStream();
      return IOUtils.toString(stream, "UTF-8");
    } catch (IOException e) {
      e.printStackTrace();
    }
    return "";
  }

  Collection<Namespace> queryNameSpaces() throws ParseException;

  Namespace getNamespaceHead(TriplestoreUuidAndOwner uuidAndOwner);

  Namespace getNamespaceVersioned(TriplestoreUuidAndOwner datasetUri, URI versionUri);

  String getHeadVersion(URI datasetUri);

  List<SemanticVariable> getOutcomes(String namespaceUid, URI version) throws ReadValueException;

  List<SemanticVariable> getPopulationCharacteristics(String versionedUuid, URI version) throws ReadValueException;

  List<SemanticInterventionUriAndName> getInterventions(String namespaceUid, URI version);

  List<Study> queryStudies(String namespaceUid, URI version);

  StudyWithDetails getStudydetails(String namespaceUid, String studyUuid) throws ResourceDoesNotExistException;

  JSONArray getStudyGroups(String namespaceUid, String studyUuid);

  JSONArray getStudyEpochs(String namespaceUid, String studyUuid);

  List<TrialDataStudy> getSingleStudyData(String namespaceUid, URI studyUri, URI version, Set<URI> outcomeUris, Set<URI> interventionUids) throws ReadValueException;

  List<TreatmentActivity> getStudyTreatmentActivities(String namespaceUid, String studyUuid);

  List<StudyData> getStudyData(String namespaceUid, String studyUuid, StudyDataSection studyDataSection);

  Set<AbstractIntervention> findMatchingIncludedInterventions(Set<AbstractIntervention> includedInterventions, TrialDataArm arm);

  List<CovariateStudyValue> getStudyLevelCovariateValues(String namespaceUid, URI version, List<CovariateOption> covariates) throws ReadValueException;

  List<TrialDataStudy> getNetworkData(String namespaceUid, URI version, URI outcomeUri, Set<URI> interventionUris, Set<String> covariateKeys) throws ReadValueException;

  List<TrialDataStudy> getAllTrialData(String namespaceUid, URI datasetVersion, Set<URI> outcomeUris, Set<URI> interventionUris) throws ReadValueException;

  List<TrialDataStudy> addMatchingInformation(Set<AbstractIntervention> includedInterventions, List<TrialDataStudy> trialData);

  List<URI> getUnitUris(String trialverseDatasetUuid, URI headVersion);
}
