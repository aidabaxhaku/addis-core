package org.drugis.addis.trialverse.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.apache.http.Header;
import org.drugis.addis.trialverse.service.impl.ClinicalTrialsImportError;

import java.net.URI;

/**
 * Created by connor on 12-5-16.
 */
public interface ClinicalTrialsImportService {
   JsonNode fetchInfo(String nctId) throws ClinicalTrialsImportError;
   Header importStudy(String commitTitle,
                      String commitDescription,
                      String datasetUuid,
                      String graphUuid, URI importUrl) throws ClinicalTrialsImportError;
}
