package org.drugis.addis.models.repository.impl;

import org.drugis.addis.models.Model;
import org.drugis.addis.models.repository.ModelRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.orm.ObjectRetrievalFailureException;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.io.IOException;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Set;

/**
 * Created by connor on 23-5-14.
 */
@Repository
public class ModelRepositoryImpl implements ModelRepository {

  @Qualifier("emAddisCore")
  @PersistenceContext(unitName = "addisCore")
  EntityManager em;

  @Override
  public Model persist(Model model) {
    em.persist(model);
    return model;
  }

  @Override
  public Model find(Integer modelId) {
    return em.find(Model.class, modelId);
  }

  @Override
  public Model get(Integer modelId) throws IOException {
    Model model = find(modelId);
    if (model == null) {
      throw new ObjectRetrievalFailureException("model not found", modelId);
    }
    return model;
  }

  @Override
  public List<Model> get(Set<Integer> modelIds) {
    if(modelIds.isEmpty()) {
      return Collections.emptyList();
    }

    TypedQuery<Model> query = em.createQuery("FROM Model WHERE id IN :modelIds", Model.class);
    query.setParameter("modelIds", modelIds);
    return query.getResultList();
  }

  @Override
  public List<Model> findByAnalysis(Integer networkMetaAnalysisId) {
    TypedQuery<Model> query = em.createQuery("FROM Model m WHERE m.analysisId = :analysisId", Model.class);
    query.setParameter("analysisId", networkMetaAnalysisId);
    return query.getResultList();
  }

  @Override
  public List<Model> findModelsByProject(Integer projectId) {
    TypedQuery<Model> query = em.createQuery("SELECT m FROM Model m, NetworkMetaAnalysis a WHERE " +
            "m.analysisId = a.id AND a.projectId = :projectId", Model.class);
    query.setParameter("projectId", projectId);
    return query.getResultList();
  }

  @Override
  public void setArchived(Integer modelId, Boolean archived) {
    Model model = em.find(Model.class, modelId);
    model.setArchived(archived);
    model.setArchivedOn( archived ? new Date(): null);
  }

  @Override
  public void setTitle(Integer modelId, String title) {
    Model model = em.find(Model.class, modelId);
    model.setTitle(title);
  }
}
