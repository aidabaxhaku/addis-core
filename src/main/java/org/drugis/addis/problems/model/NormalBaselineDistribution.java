package org.drugis.addis.problems.model;

/**
 * Created by connor on 8-3-16.
 */
public class NormalBaselineDistribution extends AbstractBaselineDistribution {
  private String scale;
  private Double mu;
  private Double sigma;

  public NormalBaselineDistribution() {
    super();
  }

  public NormalBaselineDistribution(String scale, Double mu, Double sigma, String name, String type) {
    super(name, type);
    this.scale = scale;
    this.mu = mu;
    this.sigma = sigma;
  }

  public String getScale() {
    return scale;
  }

  public Double getMu() {
    return mu;
  }

  public Double getSigma() {
    return sigma;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    if (!super.equals(o)) return false;

    NormalBaselineDistribution that = (NormalBaselineDistribution) o;

    if (!scale.equals(that.scale)) return false;
    if (!mu.equals(that.mu)) return false;
    return sigma.equals(that.sigma);
  }

  @Override
  public int hashCode() {
    int result = super.hashCode();
    result = 31 * result + scale.hashCode();
    result = 31 * result + mu.hashCode();
    result = 31 * result + sigma.hashCode();
    return result;
  }
}
