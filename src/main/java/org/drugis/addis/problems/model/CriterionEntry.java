package org.drugis.addis.problems.model;

import java.net.URI;
import java.util.List;

/**
 * Created by connor on 25-3-14.
 */
public class CriterionEntry {
  private URI criterionUri;
  private List<Double> scale;
  private PartialValueFunction pvf;

  public CriterionEntry(URI criterionUri) {
    this.criterionUri = criterionUri;
  }

  public CriterionEntry(URI criterionUri, List<Double> scale, PartialValueFunction partialValueFunction) {
    this.criterionUri = criterionUri;
    this.scale = scale;
    this.pvf = partialValueFunction;
  }

  public URI getCriterionUri() {
    return criterionUri;
  }

  public List<Double> getScale() {
    return scale;
  }

  public PartialValueFunction getPvf() {
    return pvf;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;

    CriterionEntry that = (CriterionEntry) o;

    if (!criterionUri.equals(that.criterionUri)) return false;
    if (pvf != null ? !pvf.equals(that.pvf) : that.pvf != null) return false;
    if (scale != null ? !scale.equals(that.scale) : that.scale != null) return false;

    return true;
  }

  @Override
  public int hashCode() {
    int result = criterionUri.hashCode();
    result = 31 * result + (scale != null ? scale.hashCode() : 0);
    result = 31 * result + (pvf != null ? pvf.hashCode() : 0);
    return result;
  }
}
