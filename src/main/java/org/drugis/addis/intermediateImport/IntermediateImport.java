package org.drugis.addis.intermediateImport;

import com.fasterxml.jackson.annotation.JsonFormat;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.util.Date;
import java.util.Objects;

@Entity
public class IntermediateImport {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;
  private String title;

  @org.hibernate.annotations.Type(type = "date")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private Date lastModified;
  private String studyInProgress;
  private String datasetUuid;

  public IntermediateImport() {
  }

  public IntermediateImport(Integer id, String title, Date lastModified, String studyInProgress, String datasetUuid) {
    this.id = id;
    this.title = title;
    this.lastModified = lastModified;
    this.studyInProgress = studyInProgress;
    this.datasetUuid = datasetUuid;
  }

  public IntermediateImport(String title, Date lastModified, String studyInProgress, String datasetUuid) {
    this(null, title, lastModified, studyInProgress, datasetUuid);
  }

  public Integer getId() {
    return id;
  }

  public String getTitle() {
    return title;
  }

  public Date getLastModified() {
    return lastModified;
  }

  public String getStudyInProgress() {
    return studyInProgress;
  }

  public String getDatasetUuid() {
    return datasetUuid;
  }

  public void setLastModified(Date lastModified) {
    this.lastModified = lastModified;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) return true;
    if (o == null || getClass() != o.getClass()) return false;
    IntermediateImport that = (IntermediateImport) o;
    return Objects.equals(id, that.id) &&
            title.equals(that.title) &&
            lastModified.equals(that.lastModified) &&
            studyInProgress.equals(that.studyInProgress) &&
            datasetUuid.equals(that.datasetUuid);
  }

  @Override
  public int hashCode() {
    return Objects.hash(id, title, lastModified, studyInProgress, datasetUuid);
  }
}
