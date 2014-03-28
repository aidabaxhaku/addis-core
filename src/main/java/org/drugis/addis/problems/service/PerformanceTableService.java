package org.drugis.addis.problems.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.drugis.addis.analyses.Analysis;
import org.drugis.addis.outcomes.Outcome;
import org.drugis.addis.problems.model.AlternativeEntry;
import org.drugis.addis.problems.model.CriterionEntry;
import org.drugis.addis.problems.model.Measurement;
import org.drugis.addis.problems.service.impl.PerformanceTableBuilder;
import org.drugis.addis.problems.service.model.AbstractMeasurementEntry;
import org.drugis.addis.projects.Project;
import org.drugis.addis.trialverse.service.TrialverseService;
import org.drugis.addis.trialverse.service.TriplestoreService;
import org.springframework.stereotype.Service;

import javax.inject.Inject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by connor on 28/03/14.
 */
@Service
public class PerformanceTableService {

  @Inject
  private TriplestoreService triplestoreService;

  @Inject
  private TrialverseService trialverseService;

  private ObjectMapper mapper = new ObjectMapper();

  public List<AbstractMeasurementEntry> createPerformaceTable(Project project, Analysis analysis, Map<Long, AlternativeEntry> alternativesCache, Map<Long, CriterionEntry> criteriaCache) {
    Map<String, Outcome> outcomesByUri = new HashMap<>();

    for (Outcome outcome : analysis.getSelectedOutcomes()) {
      outcomesByUri.put(outcome.getSemanticOutcomeUri(), outcome);
    }
    Map<Long, String> trialverseVariables = triplestoreService.getTrialverseVariables(project.getTrialverseId(), analysis.getStudyId(), outcomesByUri.keySet());
    List<ObjectNode> jsonMeasurements = trialverseService.getOrderedMeasurements(analysis.getStudyId(), trialverseVariables.keySet(), alternativesCache.keySet());
    List<Measurement> measurements = new ArrayList<>(jsonMeasurements.size());
    System.out.println("DEBUG jsonMeasurements : " + jsonMeasurements);
    for (ObjectNode measurementJSONNode : jsonMeasurements) {
      Measurement measurement = mapper.convertValue(measurementJSONNode, Measurement.class);
      measurements.add(measurement);
    }

    PerformanceTableBuilder builder = new PerformanceTableBuilder(criteriaCache, alternativesCache, measurements);

    return builder.build();
  }
}
