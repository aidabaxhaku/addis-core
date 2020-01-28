package org.drugis.addis.intermediateImport;

import java.util.Objects;

public class IntermediateImportCommand {
  private String nctId;
  private String title;

  public IntermediateImportCommand(){}

  public IntermediateImportCommand(String nctId, String title) {
    this.nctId = nctId;
    this.title = title;
  }

  public String getNctId() {return nctId;}

  public String getTitle() {return title;}

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    IntermediateImportCommand that = (IntermediateImportCommand) o;
    return Objects.equals(nctId, that.nctId) &&
            Objects.equals(title, that.title);
  }

  @Override
  public int hashCode() {
    return Objects.hash(nctId, title);
  }
}
