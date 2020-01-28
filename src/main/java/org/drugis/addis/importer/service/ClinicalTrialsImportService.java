package org.drugis.addis.importer.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.http.Header;
import org.drugis.addis.importer.service.impl.ClinicalTrialsImportError;

import javax.servlet.ServletInputStream;
import java.io.IOException;

public interface ClinicalTrialsImportService {

  JsonNode fetchInfo(String nctId) throws ClinicalTrialsImportError;

  Header importStudy(String commitTitle,
                     String commitDescription,
                     String datasetUuid,
                     String graphUuid, String importStudyRef) throws ClinicalTrialsImportError;

  Header importEudract(String versionedDatasetUrl,
                       String graphUuid,
                       ServletInputStream postedXml) throws IOException;

  Integer intermediateImport(String nctId,
                                        String datasetUuid,
                                        String title) throws IOException;
}
