package org.drugis.trialverse.graph.controller.model;

import java.util.Objects;

public class IntermediateImportMessage {
  private Integer intermediateImportId;

  public IntermediateImportMessage(Integer intermediateImportId) {
    this.intermediateImportId = intermediateImportId;
  }

  public Integer getIntermediateImportId() {
    return intermediateImportId;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    IntermediateImportMessage that = (IntermediateImportMessage) o;
    return Objects.equals(intermediateImportId, that.intermediateImportId);
  }

  @Override
  public int hashCode() {
    return Objects.hash(intermediateImportId);
  }
}
