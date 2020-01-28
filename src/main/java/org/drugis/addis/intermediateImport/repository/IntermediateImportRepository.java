package org.drugis.addis.intermediateImport.repository;

import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.intermediateImport.IntermediateImport;

import java.util.Date;
import java.util.List;

public interface IntermediateImportRepository {

  IntermediateImport create(String title, Date last_modified, String studyInProgress, String datasetUuid);

  List<IntermediateImport> query(String datasetUuid);

  IntermediateImport get(Integer intermediateImportId) throws ResourceDoesNotExistException;

  IntermediateImport update(IntermediateImport intermediateImport);

  void delete(Integer intermediateImportId) throws ResourceDoesNotExistException;
}
