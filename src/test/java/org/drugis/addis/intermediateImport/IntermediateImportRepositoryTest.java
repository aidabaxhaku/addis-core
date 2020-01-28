package intermediateImport;

import org.drugis.addis.config.JpaRepositoryTestConfig;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.intermediateImport.IntermediateImport;
import org.drugis.addis.intermediateImport.repository.IntermediateImportRepository;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

@RunWith(SpringJUnit4ClassRunner.class)
@Transactional
@ContextConfiguration(classes = {JpaRepositoryTestConfig.class})
public class IntermediateImportRepositoryTest {
  @Inject
  private IntermediateImportRepository intermediateImportRepository;

  @PersistenceContext(unitName = "addisCore")
  private EntityManager em;
  private String datasetUuid = "datasetUuid";

  @Test
  public void testCreate() {
    IntermediateImport intermediateImport = new IntermediateImport(21, "title", new Date(),
            "Study in Progress", datasetUuid);
    intermediateImportRepository.create(intermediateImport.getTitle(),
            intermediateImport.getLastModified(), intermediateImport.getStudyInProgress(),
            intermediateImport.getDatasetUuid());
    List<IntermediateImport> intermediateImports = intermediateImportRepository
            .query(datasetUuid);
    assertEquals(1, intermediateImports.size());
    assertEquals(intermediateImport, intermediateImports.get(0));
  }

  @Test
  public void testQuery() throws ParseException {
    List<IntermediateImport> result = intermediateImportRepository.
            query("someDatasetUuid");
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
    Date date1 = format.parse("2020-01-12");
    Date date2 = format.parse("2019-10-11");
    IntermediateImport intermediateImport1 = new IntermediateImport(10,
            "Efficacy and Safety of Semaglutide", date2, "Study in progress", "someDatasetUuid");
    IntermediateImport intermediateImport2 = new IntermediateImport(20,
            "Efficacy and Safety of Medicine123", date1, "Study in progress", "someDatasetUuid");
    assertEquals(2, result.size());
    List<IntermediateImport> expectedResult = Arrays.asList(intermediateImport1, intermediateImport2);
    assertEquals(expectedResult, result);
  }

  @Test
  public void testGet() throws ResourceDoesNotExistException {
    Integer intermediateImportId = 10;
    IntermediateImport result = intermediateImportRepository.get(intermediateImportId);
    IntermediateImport independentResult = em.find(IntermediateImport.class, intermediateImportId);
    assertEquals(independentResult, result);
  }

  @Test
  public void testUpdate() throws ParseException {
    SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd");
    Date date = format.parse("2020-01-12");
    IntermediateImport intermediateImport = new IntermediateImport(20,
            "Efficacy and Safety of Medicine123", date, "Study in progress", "someDatasetUuid");
    IntermediateImport updatedIntermediateImport = intermediateImportRepository.update(intermediateImport);
    assertEquals(intermediateImport, updatedIntermediateImport);
  }

  @Test
  public void testDelete() throws ResourceDoesNotExistException {
    intermediateImportRepository.delete(10);
    assertNull(intermediateImportRepository.get(10));
  }
}
