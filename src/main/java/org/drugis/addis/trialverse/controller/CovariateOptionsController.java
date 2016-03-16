package org.drugis.addis.trialverse.controller;

import org.drugis.addis.base.AbstractAddisCoreController;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.outcomes.Outcome;
import org.drugis.addis.outcomes.repository.OutcomeRepository;
import org.drugis.addis.projects.Project;
import org.drugis.addis.projects.repository.ProjectRepository;
import org.drugis.addis.trialverse.model.SemanticVariable;
import org.drugis.addis.trialverse.model.emun.CovariateOption;
import org.drugis.addis.trialverse.service.MappingService;
import org.drugis.addis.trialverse.service.TriplestoreService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.inject.Inject;
import java.net.URISyntaxException;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Created by connor on 12/1/15.
 */
@Controller
public class CovariateOptionsController extends AbstractAddisCoreController {
  @Inject
  OutcomeRepository outcomeRepository;

  @Inject
  ProjectRepository projectRepository;

  @Inject
  TriplestoreService triplestoreService;

  @Inject
  MappingService mappingService;

  @RequestMapping(value = "/covariate-options", method = RequestMethod.GET)
  @ResponseBody
  public List<CovariateViewAdapter> getCovariateOptions() {
    CovariateOption[] studyCovariates = CovariateOption.values();
    List<CovariateViewAdapter> covariateOptions = Arrays.stream(studyCovariates).map(CovariateViewAdapter::new).collect(Collectors.toList());

    return covariateOptions;
  }

  @RequestMapping(value = "/projects/{projectId}/covariate-options", method = RequestMethod.GET)
  @ResponseBody
  public List<CovariateViewAdapter> getFixedOptionsPlusPopulationCharacteristics(@PathVariable Integer projectId) throws ResourceDoesNotExistException, URISyntaxException {
    CovariateOption[] studyCovariates = CovariateOption.values();
    List<CovariateViewAdapter> covariateOptions = Arrays.stream(studyCovariates).map(CovariateViewAdapter::new).collect(Collectors.toList());
    Project project = projectRepository.get(projectId);
    String version = project.getDatasetVersion();
    List<SemanticVariable> populationCharacteristics = triplestoreService.getPopulationCharacteristics(mappingService.getVersionedUuid(project.getNamespaceUid()), version);
    List<CovariateViewAdapter> popCharAdapters = populationCharacteristics.stream().map(CovariateViewAdapter::new).collect(Collectors.toList());
    covariateOptions.addAll(popCharAdapters);
    return covariateOptions;
  }

}
