'use strict';
define(['angular-mocks'], function() {
  describe('the project service', function() {
    var projectService;

    beforeEach(module('addis.project'));

    beforeEach(inject(function(ProjectService) {
      projectService = ProjectService;
    }));
    describe('checkforDuplicateName', function() {
      it('should check for duplicate names', function() {
        var itemList = [{
          name: 'item1',
          id: '12'
        }, {
          name: 'item2',
          id: '34'
        }];
        var itemToCheck = {
          name: 'item2',
          id: '56'
        };

        var result = projectService.checkforDuplicateName(itemList, itemToCheck);
        expect(result).toBeTruthy();
      });
      it('should return false when no duplicate is found', function() {
        var itemList = [{
          name: 'item1',
          id: '12'
        }, {
          name: 'item2',
          id: '34'
        }];
        var itemToCheck = {
          name: 'item3',
          id: '56'
        };
        var result = projectService.checkforDuplicateName(itemList, itemToCheck);
        expect(result).toBeFalsy();
      });
      it('should return false there is no duplicate name, but the id already exists', function() {
        var itemList = [{
          name: 'item1',
          id: '12'
        }, {
          name: 'item2',
          id: '34'
        }];
        var itemToCheck = {
          name: 'item3',
          id: '12'
        };
        var result = projectService.checkforDuplicateName(itemList, itemToCheck);
        expect(result).toBeFalsy();
      });
    });

    describe('buildCovariateUsage', function() {
      it('should build a map keyed by covariate ID where the values are a list of analyses including that covariate', function() {
        var analyses = [{
          title: 'analysis 1',
          includedCovariates: [{
            covariateId: 37
          }]
        }, {
          title: 'analysis 2',
          includedCovariates: [{
            covariateId: 42
          }]
        }, {
          includedCovariates: []
        }];
        var covariates = [{
          id: 37
        }, {
          id: 42
        }, {
          id: 1337
        }];
        var expectedResult = {
          37: ['analysis 1'],
          42: ['analysis 2'],
          1337: []
        };

        var result = projectService.buildCovariateUsage(analyses, covariates);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('buildInterventionUsage', function() {
      it('should build a usage map of the interventions', function() {
        var intervention1 = {
          id: 1
        };
        var intervention2 = {
          id: 2
        };
        var intervention3 = {
          id: 3
        };
        var interventions = [intervention1, intervention2, intervention3];
        var analyses = [{
          title: 'analysis 1',
          interventionInclusions: [{
            interventionId: intervention1.id
          }]
        }, {
          title: 'analysis 2',
          interventionInclusions: [{
            interventionId: intervention1.id,
          }, {
            interventionId: intervention2.id,
          }]
        }];

        var expectedResult = {
          1: ['analysis 1', 'analysis 2'],
          2: ['analysis 2'],
          3: []
        };

        var result = projectService.buildInterventionUsage(analyses, interventions);

        expect(result).toEqual(expectedResult);
      });
    });

    describe('buildOutcomeUsage', function() {
      it('should build a usage map of the outcomes', function() {
        var outcome1 = {
          id: 1
        };
        var outcome2 = {
          id: 2
        };
        var outcome3 = {
          id: 3
        };
        var outcome4 = {
          id: 4
        }
        var outcomes = [outcome1, outcome2, outcome3, outcome4];
        var analyses = [{
          analysisType: 'Evidence synthesis',
          title: 'nma',
          outcome: {
            id: outcome1.id
          }
        }, {
          analysisType: 'Benefit-risk analysis based on a single study',
          title: 'ssbr',
          selectedOutcomes: [outcome1, outcome2]
        }, {
          analysisType: 'Benefit-risk analysis based on meta-analyses',
          title: 'metabr',
          mbrOutcomeInclusions: [{
            outcomeId: 3
          }]
        }];

        var expectedResult = {
          1: ['nma', 'ssbr'],
          2: ['ssbr'],
          3: ['metabr'],
          4: []
        };

        var result = projectService.buildOutcomeUsage(analyses, outcomes);

        expect(result).toEqual(expectedResult);
      });
    });

  });
});
