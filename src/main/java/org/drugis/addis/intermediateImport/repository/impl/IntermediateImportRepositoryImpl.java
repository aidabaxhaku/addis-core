package org.drugis.addis.intermediateImport.repository.impl;

import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.intermediateImport.IntermediateImport;
import org.drugis.addis.intermediateImport.repository.IntermediateImportRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Repository;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import javax.persistence.TypedQuery;
import java.util.Date;
import java.util.List;

@Repository
public class IntermediateImportRepositoryImpl implements IntermediateImportRepository {
  @Qualifier("emAddisCore")
  @PersistenceContext(unitName = "addisCore")
  EntityManager em;

  @Override
  public IntermediateImport
  create(String title, Date lastModified, String studyInProgress, String datasetUuid) {
    IntermediateImport intermediateImport = new
            IntermediateImport(title, lastModified, studyInProgress, datasetUuid);
    em.persist(intermediateImport);
    em.flush();
    return intermediateImport;
  }

  @Override
  public List<IntermediateImport> query(String datasetUuid) {
    TypedQuery<IntermediateImport> query = em
            .createQuery("FROM IntermediateImport ii " +
                            " WHERE  " + " ii.datasetUuid = :datasetUuid",
                    IntermediateImport.class);
    query.setParameter("datasetUuid", datasetUuid);
    return query.getResultList();
  }

  @Override
  public IntermediateImport get(Integer intermediateImportId) throws ResourceDoesNotExistException {
    return em.find(IntermediateImport.class, intermediateImportId);
  }

  @Override
  public IntermediateImport update(IntermediateImport intermediateImport) {
    Date rightNow = new Date();
    intermediateImport.setLastModified(rightNow);
    return em.merge(intermediateImport);
  }

  @Override
  public void delete(Integer intermediateImportId) throws ResourceDoesNotExistException {
    IntermediateImport intermediateImport = em.find(IntermediateImport.class, intermediateImportId);
    if (intermediateImport == null) {
      throw new ResourceDoesNotExistException("No outcome with id " + intermediateImportId);
    }
    em.remove(intermediateImport);
  }

}
