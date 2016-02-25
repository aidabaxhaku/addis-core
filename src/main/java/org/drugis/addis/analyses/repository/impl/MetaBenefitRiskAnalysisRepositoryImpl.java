package org.drugis.addis.analyses.repository.impl;

import org.drugis.addis.analyses.AnalysisCommand;
import org.drugis.addis.analyses.MetaBenefitRiskAnalysis;
import org.drugis.addis.analyses.repository.MetaBenefitRiskAnalysisRepository;
import org.drugis.addis.analyses.service.AnalysisService;
import org.drugis.addis.exception.MethodNotAllowedException;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.projects.service.ProjectService;
import org.drugis.addis.security.Account;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.Collection;

/**
 * Created by daan on 25-2-16.
 */
@Repository
public class MetaBenefitRiskAnalysisRepositoryImpl implements MetaBenefitRiskAnalysisRepository {
  @Qualifier("emAddisCore")
  @PersistenceContext(unitName = "addisCore")
  EntityManager em;

  @Inject
  AnalysisService analysisService;

  @Inject
  ProjectService projectService;

  @Override
  public Collection<MetaBenefitRiskAnalysis> queryByProject(Integer projectId) {
    TypedQuery<MetaBenefitRiskAnalysis> query = em.createQuery("FROM MetaBenefitRiskAnalysis " +
            "a WHERE a.projectId = :projectId", MetaBenefitRiskAnalysis.class);
    query.setParameter("projectId", projectId);
    return query.getResultList();
  }

  @Override
  public MetaBenefitRiskAnalysis create(Account user, AnalysisCommand analysisCommand) throws ResourceDoesNotExistException, MethodNotAllowedException {
    projectService.checkProjectExistsAndModifiable(user, analysisCommand.getProjectId());
    MetaBenefitRiskAnalysis metaBenefitRiskAnalysis = new MetaBenefitRiskAnalysis(analysisCommand.getProjectId(), analysisCommand.getTitle());
    em.persist(metaBenefitRiskAnalysis);
    return metaBenefitRiskAnalysis;
  }

  @Override
  public MetaBenefitRiskAnalysis update(Account user, MetaBenefitRiskAnalysis analysis) throws ResourceDoesNotExistException, MethodNotAllowedException {
    analysisService.checkMetaBenefitRiskAnalysis(user, analysis);
    return em.merge(analysis);
  }
}