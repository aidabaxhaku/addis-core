package org.drugis.addis.analyses.repository;

import org.drugis.addis.analyses.model.AbstractAnalysis;
import org.drugis.addis.exception.ResourceDoesNotExistException;

import java.util.List;

/**
 * Created by daan on 7-5-14.
 */
public interface AnalysisRepository {
  AbstractAnalysis get(Integer analysisId) throws ResourceDoesNotExistException;

  List<AbstractAnalysis> query(Integer projectId);

  void setArchived(Integer projectId, Boolean isArchived) throws ResourceDoesNotExistException;
}
