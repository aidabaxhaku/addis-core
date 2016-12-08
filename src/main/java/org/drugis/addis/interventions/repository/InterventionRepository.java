package org.drugis.addis.interventions.repository;

import org.drugis.addis.exception.MethodNotAllowedException;
import org.drugis.addis.exception.ResourceDoesNotExistException;
import org.drugis.addis.interventions.controller.command.AbstractInterventionCommand;
import org.drugis.addis.interventions.model.AbstractIntervention;
import org.drugis.addis.interventions.model.InvalidConstraintException;
import org.drugis.addis.interventions.model.SingleIntervention;
import org.drugis.addis.security.Account;

import java.util.List;
import java.util.Set;

/**
 * Created by daan on 3/7/14.
 */
public interface InterventionRepository {
  Set<AbstractIntervention> query(Integer projectId);

  List<SingleIntervention> querySingleInterventions(Integer projectId);

  AbstractIntervention get(Integer interventionId) throws ResourceDoesNotExistException;

  AbstractIntervention get(Integer projectId, Integer interventionId) throws ResourceDoesNotExistException;

  AbstractIntervention getByProjectIdAndName(Integer projectId, String name);

  AbstractIntervention create(Account user, AbstractInterventionCommand interventionCommand) throws MethodNotAllowedException, ResourceDoesNotExistException, InvalidConstraintException;

  boolean isExistingInterventionName(Integer interventionId, String name);

  void delete(Integer interventionId) throws ResourceDoesNotExistException;
}
