package org.drugis.addis.problems.service.impl;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.drugis.addis.analyses.*;
import org.drugis.addis.analyses.repository.AnalysisRepository;
import org.drugis.addis.analyses.repository.SingleStudyBenefitRiskAnalysisRepository;
import org.drugis.addis.covariates.Covariate;
import org.drugis.addis.covariates.CovariateRepository;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.interventions.Intervention;
import org.drugis.addis.interventions.repository.InterventionRepository;
import org.drugis.addis.models.Model;
import org.drugis.addis.models.repository.ModelRepository;
import org.drugis.addis.outcomes.Outcome;
import org.drugis.addis.outcomes.repository.OutcomeRepository;
import org.drugis.addis.patavitask.PataviTask;
import org.drugis.addis.patavitask.repository.PataviTaskRepository;
import org.drugis.addis.problems.model.*;
import org.drugis.addis.problems.service.ProblemService;
import org.drugis.addis.problems.service.model.AbstractMeasurementEntry;
import org.drugis.addis.projects.Project;
import org.drugis.addis.projects.repository.ProjectRepository;
import org.drugis.addis.trialverse.service.MappingService;
import org.drugis.addis.trialverse.service.TrialverseService;
import org.drugis.addis.trialverse.service.TriplestoreService;
import org.drugis.addis.trialverse.service.impl.TriplestoreServiceImpl;
import org.springframework.stereotype.Service;

import javax.inject.Inject;
import java.io.IOException;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.*;
import java.util.function.Function;
import java.util.function.ToIntFunction;
import java.util.stream.Collectors;

/**
 * Created by daan on 3/21/14.
 */
@Service
public class ProblemServiceImpl implements ProblemService {

  @Inject
  private SingleStudyBenefitRiskAnalysisRepository singleStudyBenefitRiskAnalysisRepository;

  @Inject
  private ProjectRepository projectRepository;

  @Inject
  private PerformanceTableBuilder performanceTableBuilder;

  @Inject
  private AnalysisRepository analysisRepository;

  @Inject
  private TrialverseService trialverseService;

  @Inject
  private InterventionRepository interventionRepository;

  @Inject
  private TriplestoreService triplestoreService;

  @Inject
  private CovariateRepository covariateRepository;

  @Inject
  private MappingService mappingService;

  @Inject
  private ModelRepository modelRepository;

  @Inject
  private OutcomeRepository outcomeRepository;

  @Inject
  private PataviTaskRepository pataviTaskRepository;

  private ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public AbstractProblem getProblem(Integer projectId, Integer analysisId) throws ResourceDoesNotExistException, URISyntaxException, SQLException, IOException {
    Project project = projectRepository.get(projectId);
    AbstractAnalysis analysis = analysisRepository.get(analysisId);
    if (analysis instanceof SingleStudyBenefitRiskAnalysis) {
      return getSingleStudyBenefitRiskProblem(project, (SingleStudyBenefitRiskAnalysis) analysis);
    } else if (analysis instanceof NetworkMetaAnalysis) {
      return getNetworkMetaAnalysisProblem(project, (NetworkMetaAnalysis) analysis);
    } else if (analysis instanceof MetaBenefitRiskAnalysis) {
      return getMetaBenefitRiskAnalysisProblem(project, (MetaBenefitRiskAnalysis) analysis);
    }
    throw new RuntimeException("unknown analysis type");
  }

  private MetaBenefitRiskProblem getMetaBenefitRiskAnalysisProblem(Project project, MetaBenefitRiskAnalysis analysis) throws SQLException, IOException {
    final List<Integer> networkModelIds = getInclusionIds(analysis, MbrOutcomeInclusion::getModelId);
    final List<Integer> outcomeIds = getInclusionIds(analysis, MbrOutcomeInclusion::getOutcomeId);
    final List<Model> models = modelRepository.get(networkModelIds);
    final Map<Integer, Model> modelMap = models.stream().collect(Collectors.toMap(Model::getId, Function.identity()));
    final Map<String, Outcome> outcomesByName = outcomeRepository.get(project.getId(), outcomeIds).stream().collect(Collectors.toMap(Outcome::getName, Function.identity()));
    final Map<Integer,PataviTask> pataviTaskMap = pataviTaskRepository.findByIds(models.stream().map(Model::getTaskId).collect(Collectors.toList()))
            .stream().collect(Collectors.toMap(PataviTask::getId, Function.identity()));
    final Map<Integer, PataviTask> tasksByModelId = models.stream().collect(Collectors.toMap(Model::getId, m -> pataviTaskMap.get(m.getTaskId())));
    ArrayList<Integer> taskIds = new ArrayList<>(pataviTaskMap.keySet());
    final Map<Integer, JsonNode> resultsByTaskId = pataviTaskRepository.getResults(taskIds);

    List<Intervention> includedAlternatives = analysis.getIncludedAlternatives();

    Map<String, CriterionEntry> criteria = outcomesByName.values()
            .stream()
            .collect(Collectors.toMap(Outcome::getName, o -> new CriterionEntry(o.getSemanticOutcomeUri(), o.getName())));
    Map<String, AlternativeEntry> alternatives = includedAlternatives
            .stream()
            .collect(Collectors.toMap(Intervention::getName, i -> new AlternativeEntry(i.getSemanticInterventionUri(), i.getName())));
    final Map<Integer, Intervention> includedInterventionsById = includedAlternatives.stream().collect(Collectors.toMap(Intervention::getId, Function.identity()));
    final  Map<Integer, Intervention> interventions = interventionRepository.query(project.getId()).stream().collect(Collectors.toMap(Intervention::getId, Function.identity()));;
    final Map<String, Intervention> includedInterventionsByName = includedAlternatives.stream().collect(Collectors.toMap(Intervention::getName, Function.identity()));

    List<MetaBenefitRiskProblem.PerformanceTableEntry> performanceTable = new ArrayList<>(outcomesByName.size());
    for(MbrOutcomeInclusion outcomeInclusion : analysis.getMbrOutcomeInclusions()) {

      Baseline baseline = objectMapper.readValue(outcomeInclusion.getBaseline(), Baseline.class);
      Integer taskId = tasksByModelId.get(outcomeInclusion.getModelId()).getId();
      JsonNode taskResults = resultsByTaskId.get(taskId);

      Map<Integer, MultiVariateDistribution> distributionByInterventionId = objectMapper
              .readValue(taskResults.get("multivariateSummary").toString(),  new TypeReference<Map<Integer, MultiVariateDistribution>>() {});

      Intervention baselineIntervention = includedInterventionsByName.get(baseline.getName());
      MultiVariateDistribution distr = distributionByInterventionId.get(baselineIntervention.getId());
      //
      Map<String,Double> mu = distr.getMu().entrySet().stream()
              .collect(Collectors.toMap(
                      e -> {
                       String key = e.getKey();
                        int interventionId = Integer.parseInt(key.substring(key.lastIndexOf('.') + 1));
                        return interventions.get(interventionId).getName();
                      },
                      Map.Entry::getValue));

      // filter mu
      mu = mu.entrySet().stream().filter(m -> includedInterventionsByName.keySet().contains(m.getKey()))
              .collect(Collectors.toMap(m -> m.getKey(), m -> m.getValue()));


      List<String> rowNames = new ArrayList<>();
      rowNames.add(baseline.getName());
      rowNames.addAll(mu.keySet());
      final List<String> colNames = rowNames;
      final List<List<Double>> data = new ArrayList<>(rowNames.size());
      // add baseLine row (which means covariance is zero)
      final Map<String, Map<String, Double>> sigma = distr.getSigma();


      Map<String, Map<String, Double>> sigmaByInterventionName = distr.getSigma().entrySet().stream().collect(Collectors.toMap(
              e -> {
                String key = e.getKey();
                int interventionId = Integer.parseInt(key.substring(key.lastIndexOf('.') + 1));
                return interventions.get(interventionId).getName();
              },
              Map.Entry::getValue));

      //filter sigma comparison to only included comparisons for included interventions
      sigmaByInterventionName  = sigmaByInterventionName.entrySet().stream().filter(m -> includedInterventionsByName.keySet().contains(m.getKey()))
              .collect(Collectors.toMap(m -> m.getKey(), m -> m.getValue()));

      Map<String, Map<String, Double>> collect = sigmaByInterventionName.entrySet().stream().collect(Collectors.toMap(
              Map.Entry::getKey,
              e -> e.getValue().entrySet().stream().filter(m -> {
                String key = m.getKey();
                int interventionId = Integer.parseInt(key.substring(key.lastIndexOf('.') + 1));
                return includedInterventionsById.keySet().contains(interventionId);
              })
              .collect(Collectors.toMap(m -> m.getKey(), m -> m.getValue()))
      ));

      List<String> sigmaKeys = new ArrayList<>(collect.keySet());

      // setup data structure and init with null values
      for(int i=0; i<rowNames.size(); ++i){
        List<Double> row = new ArrayList<>(colNames.size());
        for(int j=0; j<colNames.size(); ++j) {
          row.add(0.0);
        }
        data.add(row);
      }

      for(int i=1; i<rowNames.size(); ++i){
        for(int j=1; j<colNames.size(); ++j) {
            data.get(i).set(j, collect.get(sigmaKeys.get(i-1)).get(sigmaKeys.get(j-1)));
        }
      }

      MetaBenefitRiskProblem.PerformanceTableEntry.Performance.Parameters.Relative.CovarianceMatrix cov =
              new MetaBenefitRiskProblem.PerformanceTableEntry.Performance.Parameters.Relative.CovarianceMatrix(rowNames, colNames, data);
      MetaBenefitRiskProblem.PerformanceTableEntry.Performance.Parameters.Relative relative =
              new MetaBenefitRiskProblem.PerformanceTableEntry.Performance.Parameters.Relative("dmnorm", mu, cov);
      MetaBenefitRiskProblem.PerformanceTableEntry.Performance.Parameters parameters =
              new MetaBenefitRiskProblem.PerformanceTableEntry.Performance.Parameters(outcomeInclusion.getBaseline(), relative);
      String modelLinkType = modelMap.get(outcomeInclusion.getModelId()).getLink();

      String modelPerformanceType = "relative-normal";
      if(!Model.LINK_IDENTITY.equals(modelLinkType)){
         modelPerformanceType = "relative-" + modelLinkType + "-normal";
      }

      MetaBenefitRiskProblem.PerformanceTableEntry.Performance performance =
              new MetaBenefitRiskProblem.PerformanceTableEntry.Performance(modelPerformanceType, parameters);
      MetaBenefitRiskProblem.PerformanceTableEntry entry =
              new MetaBenefitRiskProblem.PerformanceTableEntry("criterion", performance);
      performanceTable.add(entry);
    }

    return new MetaBenefitRiskProblem(criteria, alternatives, performanceTable);
  }

  private List<Integer> getInclusionIds(MetaBenefitRiskAnalysis analysis, ToIntFunction<MbrOutcomeInclusion> idSelector) {
    return analysis.getMbrOutcomeInclusions().stream().mapToInt(idSelector).boxed().collect(Collectors.toList());
  }

  private NetworkMetaAnalysisProblem getNetworkMetaAnalysisProblem(Project project, NetworkMetaAnalysis analysis) throws URISyntaxException {
    List<String> alternativeUris = new ArrayList<>();
    List<Intervention> interventions = interventionRepository.query(project.getId());
    Map<String, Integer> interventionIdsByUrisMap = new HashMap<>();

    interventions = filterExcludedInterventions(interventions, analysis.getIncludedInterventions());

    List<TreatmentEntry> treatments = new ArrayList<>();
    for (Intervention intervention : interventions) {
      alternativeUris.add(intervention.getSemanticInterventionUri());
      interventionIdsByUrisMap.put(intervention.getSemanticInterventionUri(), intervention.getId());
      treatments.add(new TreatmentEntry(intervention.getId(), intervention.getName()));
    }

    Collection<Covariate> projectCovariates = covariateRepository.findByProject(project.getId());
    Map<Integer, Covariate> definedMap = projectCovariates
            .stream()
            .collect(Collectors.toMap(Covariate::getId, Function.identity()));
    List<String> includedCovariateKeys = analysis.getCovariateInclusions().stream()
            .map(ic -> definedMap.get(ic.getCovariateId()).getDefinitionKey())
            .collect(Collectors.toList());

    String namespaceUid = mappingService.getVersionedUuid(project.getNamespaceUid());
    List<ObjectNode> trialDataStudies = trialverseService.getTrialData(namespaceUid, project.getDatasetVersion(),
            analysis.getOutcome().getSemanticOutcomeUri(), alternativeUris, includedCovariateKeys);
    ObjectMapper mapper = new ObjectMapper();
    List<TrialDataStudy> convertedTrialDataStudies = new ArrayList<>();
    for (ObjectNode objectNode : trialDataStudies) {
      convertedTrialDataStudies.add(mapper.convertValue(objectNode, TrialDataStudy.class));
    }

    List<AbstractNetworkMetaAnalysisProblemEntry> entries = new ArrayList<>();

    for (TrialDataStudy trialDataStudy : convertedTrialDataStudies) {
      List<TrialDataArm> filteredArms = filterUnmatchedArms(trialDataStudy, interventionIdsByUrisMap);
      filteredArms = filterExcludedArms(filteredArms, analysis);
      // do not include studies with fewer than two included and matched arms
      if (filteredArms.size() >= 2) {
        for (TrialDataArm trialDataArm : filteredArms) {
          Integer treatmentId = interventionIdsByUrisMap.get(trialDataArm.getDrugConceptUid());
          entries.add(buildEntry(trialDataStudy.getName(), treatmentId, trialDataArm.getMeasurement()));
        }
      }
    }

    // add covariate values to problem
    Map<String, Map<String, Double>> studyLevelCovariates = null;
    if (includedCovariateKeys.size() > 0) {
      studyLevelCovariates = new HashMap<>(convertedTrialDataStudies.size());
      Map<String, Covariate> covariatesByKey = projectCovariates
              .stream()
              .collect(Collectors.toMap(Covariate::getDefinitionKey, Function.identity()));
      for (TrialDataStudy trialDataStudy : convertedTrialDataStudies) {
        Map<String, Double> covariateNodes = new HashMap<>();
        for (CovariateStudyValue covariateStudyValue : trialDataStudy.getCovariateValues()) {
          Covariate covariate = covariatesByKey.get(covariateStudyValue.getCovariateKey());
          covariateNodes.put(covariate.getName(), covariateStudyValue.getValue());
        }
        studyLevelCovariates.put(trialDataStudy.getName(), covariateNodes);
      }
    }

    return new NetworkMetaAnalysisProblem(entries, treatments, studyLevelCovariates);
  }

  private List<TrialDataArm> filterExcludedArms(List<TrialDataArm> trialDataArms, NetworkMetaAnalysis analysis) {
    List<TrialDataArm> filteredTrialDataArms = new ArrayList<>();
    List<ArmExclusion> armExclusions = analysis.getExcludedArms();
    List<String> armExclusionTrialverseIds = new ArrayList<>(armExclusions.size());

    for (ArmExclusion armExclusion : armExclusions) {
      armExclusionTrialverseIds.add(armExclusion.getTrialverseUid());
    }

    for (TrialDataArm trialDataArm : trialDataArms) {
      if (!armExclusionTrialverseIds.contains(trialDataArm.getUid())) {
        filteredTrialDataArms.add(trialDataArm);
      }
    }

    return filteredTrialDataArms;
  }

  private AbstractNetworkMetaAnalysisProblemEntry buildEntry(String studyName, Integer treatmentId, Measurement measurement) {
    Long sampleSize = measurement.getSampleSize();
    if (measurement.getMean() != null) {
      Double mu = measurement.getMean();
      Double sigma = measurement.getStdDev();
      return new ContinuousNetworkMetaAnalysisProblemEntry(studyName, treatmentId, sampleSize, mu, sigma);
    } else if (measurement.getRate() != null) {
      Long rate = measurement.getRate();
      return new RateNetworkMetaAnalysisProblemEntry(studyName, treatmentId, sampleSize, rate);
    }
    throw new RuntimeException("unknown measurement type");
  }

  private Map<String, TrialDataIntervention> createInterventionByDrugIdMap(List<TrialDataStudy> trialDataStudies) {
    Map<String, TrialDataIntervention> interventionByDrugIdMap = new HashMap<>();
    for (TrialDataStudy study : trialDataStudies) {

      for (TrialDataIntervention intervention : study.getTrialDataInterventions()) {
        interventionByDrugIdMap.put(intervention.getDrugInstanceUid(), intervention);
      }
    }
    return interventionByDrugIdMap;
  }

  private List<Intervention> filterExcludedInterventions(List<Intervention> interventions, List<InterventionInclusion> inclusions) {
    List<Intervention> filteredInterventions = new ArrayList<>();

    Map<Integer, InterventionInclusion> inclusionMap = new HashMap<>(inclusions.size());
    for (InterventionInclusion interventionInclusion : inclusions) {
      inclusionMap.put(interventionInclusion.getInterventionId(), interventionInclusion);
    }

    for (Intervention intervention : interventions) {
      if (inclusionMap.get(intervention.getId()) != null) {
        filteredInterventions.add(intervention);
      }
    }

    return filteredInterventions;
  }

  private List<TrialDataArm> filterUnmatchedArms(TrialDataStudy study, Map<String, Integer> interventionByIdMap) {
    List<TrialDataArm> filteredArms = new ArrayList<>();

    for (TrialDataArm arm : study.getTrialDataArms()) {
      if (isMatched(arm, interventionByIdMap)) {
        filteredArms.add(arm);
      }
    }

    return filteredArms;
  }

  private boolean isMatched(TrialDataArm arm, Map<String, Integer> interventionByIdMap) {
    return interventionByIdMap.get(arm.getDrugConceptUid()) != null;
  }

  private SingleStudyBenefitRiskProblem getSingleStudyBenefitRiskProblem(Project project, SingleStudyBenefitRiskAnalysis analysis) throws ResourceDoesNotExistException, URISyntaxException {
    List<String> outcomeUids = new ArrayList<>();
    for (Outcome outcome : analysis.getSelectedOutcomes()) {
      outcomeUids.add(outcome.getSemanticOutcomeUri());
    }
    List<String> alternativeUids = new ArrayList<>();
    for (Intervention intervention : analysis.getSelectedInterventions()) {
      alternativeUids.add(intervention.getSemanticInterventionUri());
    }
    String versionedUuid = mappingService.getVersionedUuid(project.getNamespaceUid());
    List<TriplestoreServiceImpl.SingleStudyBenefitRiskMeasurementRow> measurementNodes =
            triplestoreService.getSingleStudyMeasurements(versionedUuid, analysis.getStudyGraphUid(), project.getDatasetVersion(), outcomeUids, alternativeUids);

    Map<String, AlternativeEntry> alternatives = new HashMap<>();
    Map<String, CriterionEntry> criteria = new HashMap<>();
    for (TriplestoreServiceImpl.SingleStudyBenefitRiskMeasurementRow measurementRow : measurementNodes) {
      alternatives.put(measurementRow.getAlternativeUid(), new AlternativeEntry(measurementRow.getAlternativeUid(), measurementRow.getAlternativeLabel()));
      CriterionEntry criterionEntry = createCriterionEntry(measurementRow);
      criteria.put(measurementRow.getOutcomeUid(), criterionEntry);
    }

    List<AbstractMeasurementEntry> performanceTable = performanceTableBuilder.build(measurementNodes);
    return new SingleStudyBenefitRiskProblem(analysis.getTitle(), alternatives, criteria, performanceTable);
  }

  private CriterionEntry createCriterionEntry(TriplestoreServiceImpl.SingleStudyBenefitRiskMeasurementRow measurementRow) throws EnumConstantNotPresentException {
    List<Double> scale;
    if (measurementRow.getRate() != null) { // rate measurement
      scale = Arrays.asList(0.0, 1.0);
    } else if (measurementRow.getMean() != null) { // continuous measurement
      scale = Arrays.asList(null, null);
    } else {
      throw new RuntimeException("Invalid measurement");
    }
    // NB: partialvaluefunctions to be filled in by MCDA component, left null here
    return new CriterionEntry(measurementRow.getOutcomeUid(), measurementRow.getOutcomeLabel(), scale, null);
  }


}
