'use strict';
define([
  'lodash',
  'angular-mocks',
  './results',
  '../util/resultsConstants'
], function(_) {
  describe('the resultsService service', function() {
    var rootScope, q;
    var studyServiceMock = jasmine.createSpyObj('StudyServiceMock', ['getJsonGraph', 'saveJsonGraph']);
    var uuidServiceMock = jasmine.createSpyObj('UUIDService', ['generate']);
    uuidServiceMock.generate.and.returnValue('newUuid');
    var resultsService;

    var ARM_LEVEL = 'ontology:arm_level_data';
    var CONTRAST = 'ontology:contrast_data';
    var CONTINUOUS = 'ontology:continuous';

    beforeEach(function() {
      angular.mock.module('trialverse.results', function($provide) {
        $provide.value('StudyService', studyServiceMock);
        $provide.value('UUIDService', uuidServiceMock);
      });
    });

    beforeEach(inject(function(
      $q,
      $rootScope,
      ResultsService
    ) {
      q = $q;
      rootScope = $rootScope;
      resultsService = ResultsService;
      rootScope.$digest();
    }));

    describe('query results', function() {
      var graphJsonObject = [{
        '@id': 'http://trials.drugis.org/instances/result1',
        count: 24,
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
        sample_size: 70,
        arm_or_contrast: ARM_LEVEL
      }, {
        '@id': 'http://trials.drugis.org/instances/result2',
        standard_deviation: 2,
        mean: 5,
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
        sample_size: 33,
        arm_or_contrast: ARM_LEVEL
      }, {
        '@id': 'http://trials.drugis.org/instances/result3',
        count: 3,
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome2',
        sample_size: 33,
        arm_or_contrast: ARM_LEVEL
      }, {
        '@id': 'http://trials.drugis.org/instances/result4',
        standard_error: 37.2,
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome3',
        odds_ratio: 0.5,
        arm_or_contrast: CONTRAST
      }, {
        '@id': 'http://trials.drugis.org/instances/result5',
        standard_error: 15.2,
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome3',
        odds_ratio: 2.2,
        arm_or_contrast: CONTRAST
      }];

      describe('for an arm-level variable', () => {
        var queryOutcome = 'http://trials.drugis.org/instances/outcome1';

        beforeEach(function() {
          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve(graphJsonObject);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        });

        it('should return the results for a given arm-level variable', function(done) {
          resultsService.queryResults(queryOutcome).then(function(actualResults) {
            expect(actualResults.length).toEqual(5);
            expect(actualResults[0].instance).toEqual('http://trials.drugis.org/instances/result1');
            expect(actualResults[0].armUri).toEqual('http://trials.drugis.org/instances/arm1');
            expect(actualResults[0].momentUri).toEqual('http://trials.drugis.org/instances/moment1');
            expect(actualResults[0].outcomeUri).toEqual('http://trials.drugis.org/instances/outcome1');
            expect(actualResults[0].result_property).toEqual('sample_size');
            expect(actualResults[0].value).toEqual(70);

            expect(actualResults[1].instance).toEqual('http://trials.drugis.org/instances/result1');
            expect(actualResults[1].armUri).toEqual('http://trials.drugis.org/instances/arm1');
            expect(actualResults[1].momentUri).toEqual('http://trials.drugis.org/instances/moment1');
            expect(actualResults[1].outcomeUri).toEqual('http://trials.drugis.org/instances/outcome1');
            expect(actualResults[1].result_property).toEqual('count');
            expect(actualResults[1].value).toEqual(24);

            expect(actualResults[4].value).toEqual(2);
            done();
          });
          rootScope.$digest();
        });
      });
      describe('for a contrast variable', () => {
        var queryOutcome = 'http://trials.drugis.org/instances/outcome3';

        beforeEach(function() {
          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve(graphJsonObject);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        });

        it('should return the results', function(done) {
          resultsService.queryResults(queryOutcome).then(function(actualResults) {
            expect(actualResults.length).toEqual(4);
            expect(actualResults[0]).toEqual({
              instance: 'http://trials.drugis.org/instances/result4',
              armUri: 'http://trials.drugis.org/instances/arm1',
              momentUri: 'http://trials.drugis.org/instances/moment1',
              outcomeUri: queryOutcome,
              armOrContrast: CONTRAST,
              result_property: 'odds_ratio',
              value: 0.5
            });

            expect(actualResults[1]).toEqual({
              instance: 'http://trials.drugis.org/instances/result4',
              armUri: 'http://trials.drugis.org/instances/arm1',
              momentUri: 'http://trials.drugis.org/instances/moment1',
              outcomeUri: queryOutcome,
              armOrContrast: CONTRAST,
              result_property: 'standard_error',
              value: 37.2
            });
            done();
          });
          rootScope.$digest();
        });
      });
    });

    describe('query results by group', function() {
      var graphJsonObject = [{
        '@id': 'http://trials.drugis.org/instances/result1',
        count: 24,
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
        sample_size: 70,
        arm_or_contrast: ARM_LEVEL
      }, {
        '@id': 'http://trials.drugis.org/instances/result2',
        standard_deviation: 2,
        mean: 5,
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
        sample_size: 33,
        arm_or_contrast: ARM_LEVEL
      }, {
        '@id': 'http://trials.drugis.org/instances/result3',
        count: 3,
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome2',
        sample_size: 33,
        arm_or_contrast: ARM_LEVEL
      }];

      var groupUri = 'http://trials.drugis.org/instances/arm2';

      beforeEach(function() {
        var graphDefer = q.defer();
        var getGraphPromise = graphDefer.promise;
        graphDefer.resolve(graphJsonObject);
        studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
      });

      it('should return the results for a given group', function(done) {
        resultsService.queryResultsByGroup(groupUri).then(function(actualResults) {
          expect(actualResults.length).toEqual(5);
          expect(actualResults[0].instance).toEqual('http://trials.drugis.org/instances/result2');
          expect(actualResults[0].armUri).toEqual('http://trials.drugis.org/instances/arm2');
          expect(actualResults[0].momentUri).toEqual('http://trials.drugis.org/instances/moment1');
          expect(actualResults[0].outcomeUri).toEqual('http://trials.drugis.org/instances/outcome1');
          expect(actualResults[0].result_property).toEqual('sample_size');
          expect(actualResults[0].value).toEqual(33);

          expect(actualResults[1].instance).toEqual('http://trials.drugis.org/instances/result2');
          expect(actualResults[1].armUri).toEqual('http://trials.drugis.org/instances/arm2');
          expect(actualResults[1].momentUri).toEqual('http://trials.drugis.org/instances/moment1');
          expect(actualResults[1].outcomeUri).toEqual('http://trials.drugis.org/instances/outcome1');
          expect(actualResults[1].result_property).toEqual('mean');
          expect(actualResults[1].value).toEqual(5);

          expect(actualResults[4].value).toEqual(3);
          done();
        });
        rootScope.$digest();
      });
    });

    describe('updateResultValue', function() {
      describe('when there is not yet data in the graph', function() {
        beforeEach(function() {
          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve([]);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        });

        it('should add the value to the graph', function(done) {
          var row = {
            variable: {
              uri: 'http://trials.drugis.org/instances/outcome1'
            },
            group: {
              armURI: 'http://trials.drugis.org/instances/arm1'
            },
            measurementMoment: {
              uri: 'http://trials.drugis.org/instances/moment1'
            }
          };

          var inputColumn = {
            valueName: 'count',
            value: 123,
            resultProperty: 'http://trials.drugis.org/ontology#count',
          };

          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            var expectedGraph = [{
              '@id': 'http://trials.drugis.org/instances/newUuid',
              count: 123,
              of_group: 'http://trials.drugis.org/instances/arm1',
              of_moment: 'http://trials.drugis.org/instances/moment1',
              of_outcome: 'http://trials.drugis.org/instances/outcome1',
              arm_or_contrast: ARM_LEVEL
            }];
            expect(result).toBeTruthy();
            expect(result).toEqual(expectedGraph[0]['@id']);
            expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });

        it('should add the value to the graph (categorical)', function(done) {
          var row = {
            variable: {
              uri: 'http://trials.drugis.org/instances/outcome1'
            },
            group: {
              armURI: 'http://trials.drugis.org/instances/arm1'
            },
            measurementMoment: {
              uri: 'http://trials.drugis.org/instances/moment1'
            }
          };

          var maleCategory = {
            '@id': 'http://trials.drugis.org/maleCatId',
            label: 'Male'
          };

          var inputColumn = {
            isCategory: true,
            valueName: 'Male',
            value: 123,
            resultProperty: maleCategory,
          };

          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            var expectedGraph = [{
              '@id': 'http://trials.drugis.org/instances/newUuid',
              category_count: [{
                category: maleCategory['@id'],
                count: 123
              }],
              of_group: 'http://trials.drugis.org/instances/arm1',
              of_moment: 'http://trials.drugis.org/instances/moment1',
              of_outcome: 'http://trials.drugis.org/instances/outcome1',
            }];
            expect(result).toBeTruthy();
            expect(result).toEqual(expectedGraph[0]['@id']);
            expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });
      });

      describe('if there already is data in the graph, and the new value is a value', function() {
        var graphJsonObject = [{
          '@id': 'http://trials.drugis.org/instances/result1',
          count: 24,
          of_group: 'http://trials.drugis.org/instances/arm1',
          of_moment: 'http://trials.drugis.org/instances/moment1',
          of_outcome: 'http://trials.drugis.org/instances/outcome1',
          sample_size: 70
        }];

        beforeEach(function() {
          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve(graphJsonObject);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        });

        it('should save the value to the graph', function(done) {
          var row = {
            variable: {
              uri: 'http://trials.drugis.org/instances/outcome1',
              armOrContrast: ARM_LEVEL
            },
            arm: {
              armURI: 'http://trials.drugis.org/instances/arm1'
            },
            measurementMoment: {
              uri: 'http://trials.drugis.org/instances/moment1'
            },
            uri: 'http://trials.drugis.org/instances/result1'
          };

          var inputColumn = {
            value: 789,
            valueName: 'sample_size',
            resultProperty: 'http://trials.drugis.org/ontology#sample_size',
            armOrContrast: ARM_LEVEL
          };

          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            var expectedGraph = [{
              '@id': 'http://trials.drugis.org/instances/result1',
              count: 24,
              of_group: 'http://trials.drugis.org/instances/arm1',
              of_moment: 'http://trials.drugis.org/instances/moment1',
              of_outcome: 'http://trials.drugis.org/instances/outcome1',
              sample_size: 789
            }];
            expect(result).toBeTruthy();
            expect(result).toEqual(expectedGraph[0]['@id']);
            expect(result).toEqual(row.uri);
            expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });
      });

      describe('if there already is categorical data in the graph, and the new value is a value', function() {
        var femaleCategory = {
          '@id': 'http://trials.drugis.org/femaleCatId',
          label: 'Female'
        };
        beforeEach(function() {

          var graphJsonObject = [{
            '@id': 'http://trials.drugis.org/instances/result1',
            category_count: [{
              '@id': 'http://trials.drugis.org/blanknodes/1',
              category: femaleCategory['@id'],
              count: 24
            }],
            of_group: 'http://trials.drugis.org/instances/arm1',
            of_moment: 'http://trials.drugis.org/instances/moment1',
            of_outcome: 'http://trials.drugis.org/instances/outcome1'
          }];

          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve(graphJsonObject);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        });

        it('if the new value is of a new category the category_count should be expanded with the new category', function(done) {
          var maleCategory = {
            '@id': 'http://trials.drugis.org/maleCatId',
            label: 'Male'
          };
          var inputColumn = {
            isCategory: true,
            valueName: 'Male',
            value: 123,
            resultProperty: maleCategory,
          };
          var row = {
            variable: {
              uri: 'http://trials.drugis.org/instances/outcome1'
            },
            arm: {
              armURI: 'http://trials.drugis.org/instances/arm1'
            },
            measurementMoment: {
              uri: 'http://trials.drugis.org/instances/moment1'
            },
            uri: 'http://trials.drugis.org/instances/result1'
          };
          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            var expectedGraph = [{
              '@id': 'http://trials.drugis.org/instances/result1',
              category_count: [{
                '@id': 'http://trials.drugis.org/blanknodes/1',
                category: femaleCategory['@id'],
                count: 24
              }, {
                category: maleCategory['@id'],
                count: 123
              }],
              of_group: 'http://trials.drugis.org/instances/arm1',
              of_moment: 'http://trials.drugis.org/instances/moment1',
              of_outcome: 'http://trials.drugis.org/instances/outcome1'
            }];
            expect(result).toBeTruthy();
            expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });

        it('if the new value is of an existing category the category_count value should be updated', function(done) {
          var inputColumn = {
            isCategory: true,
            valueName: 'Female',
            value: 123,
            resultProperty: femaleCategory,
          };
          var row = {
            variable: {
              uri: 'http://trials.drugis.org/instances/outcome1'
            },
            arm: {
              armURI: 'http://trials.drugis.org/instances/arm1'
            },
            measurementMoment: {
              uri: 'http://trials.drugis.org/instances/moment1'
            },
            uri: 'http://trials.drugis.org/instances/result1'
          };
          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            var expectedGraph = [{
              '@id': 'http://trials.drugis.org/instances/result1',
              category_count: [{
                '@id': 'http://trials.drugis.org/blanknodes/1',
                category: femaleCategory['@id'],
                count: 123
              }],
              of_group: 'http://trials.drugis.org/instances/arm1',
              of_moment: 'http://trials.drugis.org/instances/moment1',
              of_outcome: 'http://trials.drugis.org/instances/outcome1'
            }];
            expect(result).toBeTruthy();
            expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });
        it('if the new value is null and there was an existing value for the category, its category count should be removed', function(done) {
          var inputColumn = {
            isCategory: true,
            valueName: 'Female',
            value: null,
            resultProperty: femaleCategory,
          };
          var row = {
            variable: {
              uri: 'http://trials.drugis.org/instances/outcome1'
            },
            arm: {
              armURI: 'http://trials.drugis.org/instances/arm1'
            },
            measurementMoment: {
              uri: 'http://trials.drugis.org/instances/moment1'
            },
            uri: 'http://trials.drugis.org/instances/result1'
          };
          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            var expectedGraph = [];
            expect(result).toBeFalsy();
            expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });
      });

      describe('if the new value is a null value and there is not already a value there', function() {

        var graphJsonObject = [];

        beforeEach(function() {
          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve(graphJsonObject);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        });

        it('should not save the value to the graph', function(done) {
          var row = {
            variable: {
              uri: 'http://trials.drugis.org/instances/outcome1',
              armOrContrast: ARM_LEVEL
            },
            arm: {
              armURI: 'http://trials.drugis.org/instances/arm1'
            },
            measurementMoment: {
              uri: 'http://trials.drugis.org/instances/moment1'
            }
          };

          var inputColumn = {
            value: null,
            valueName: 'sample_size',
            resultProperty: 'http://trials.drugis.org/ontology#sample_size',
            armOrContrast: ARM_LEVEL
          };

          studyServiceMock.saveJsonGraph.calls.reset();
          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            expect(result).toBeFalsy();
            expect(studyServiceMock.saveJsonGraph).not.toHaveBeenCalled();
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });
      });

      describe('if the new value is null and there is already a value there', function() {
        var row = {
          variable: {
            uri: 'http://trials.drugis.org/instances/outcome1',
            armOrContrast: ARM_LEVEL
          },
          arm: {
            armURI: 'http://trials.drugis.org/instances/arm1'
          },
          measurementMoment: {
            uri: 'http://trials.drugis.org/instances/moment1'
          },
          uri: 'http://trials.drugis.org/instances/result1'
        };

        var inputColumn = {
          value: null,
          valueName: 'sample_size',
          resultProperty: 'http://trials.drugis.org/ontology#sample_size',
          armOrContrast: ARM_LEVEL
        };

        var graphJsonObject = [{
          '@id': 'http://trials.drugis.org/instances/result1',
          count: 24,
          of_group: 'http://trials.drugis.org/instances/arm1',
          of_moment: 'http://trials.drugis.org/instances/moment1',
          of_outcome: 'http://trials.drugis.org/instances/outcome1',
          sample_size: 70
        }];

        beforeEach(function() {
          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve(graphJsonObject);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        });

        it('should delete the old value from the graph', function(done) {
          resultsService.updateResultValue(row, inputColumn).then(function(result) {
            var expectedGraph = [{
              '@id': 'http://trials.drugis.org/instances/result1',
              count: 24,
              of_group: 'http://trials.drugis.org/instances/arm1',
              of_moment: 'http://trials.drugis.org/instances/moment1',
              of_outcome: 'http://trials.drugis.org/instances/outcome1',
            }];
            expect(result).toBeTruthy();
            expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
            studyServiceMock.saveJsonGraph.calls.reset();
            studyServiceMock.getJsonGraph.calls.reset();
            done();
          });
          rootScope.$digest();
        });
      });
    }); // end describe updateResultValue

    describe('cleanupMeasurements for noncategoricals', function() {
      var arm1 = {
        '@id': 'http://trials.drugis.org/instances/a1',
        '@type': 'ontology:Arm',
        label: 'arm label'
      };

      var arm2 = {
        '@id': 'http://trials.drugis.org/instances/a2',
        '@type': 'ontology:Arm',
        label: 'arm label'
      };

      var outcome1 = {
        '@id': 'http://trials.drugis.org/instances/out1',
        '@type': 'ontology:OutcomeType',
        'has_result_property': [
          'http://trials.drugis.org/ontology#standard_deviation',
          'http://trials.drugis.org/ontology#mean',
          'http://trials.drugis.org/ontology#sample_size'
        ],
        is_measured_at: 'http://trials.drugis.org/instances/mm1',
        of_variable: [{
          '@id': 'http://fuseki-test.drugis.org:3030/.well-known/genid/var1',
          '@type': 'ontology:Variable',
          measurementType: CONTINUOUS,
          comment: [
            '',
            'years'
          ],
          label: 'Age'
        }],
        comment: '',
        label: 'Age'
      };

      var outcome2 = {
        '@id': 'http://trials.drugis.org/instances/out2',
        '@type': 'ontology:OutcomeType',
        'has_result_property': [
          'http://trials.drugis.org/ontology#count',
          'http://trials.drugis.org/ontology#sample_size'
        ],
        is_measured_at: 'http://trials.drugis.org/instances/mm1',
        of_variable: [{
          '@id': 'http://fuseki-test.drugis.org:3030/.well-known/genid/var2',
          '@type': 'ontology:Variable',
          measurementType: CONTINUOUS,
          comment: [
            '',
            'years'
          ],
          label: 'My variable'
        }],
        comment: '',
        label: 'My outcome'
      };

      var measurementMoment1 = {
        '@id': 'http://trials.drugis.org/instances/mm1',
        '@type': 'ontology:MeasurementMoment',
        'relative_to_anchor': 'ontology:anchorEpochStart',
        'relative_to_epoch': 'http://trials.drugis.org/instances/e1',
        'time_offset': 'PT0S',
        label: 'At start of epoch 1'
      };

      var measurementMoment2 = {
        '@id': 'http://trials.drugis.org/instances/mm2',
        '@type': 'ontology:MeasurementMoment',
        'relative_to_anchor': 'ontology:anchorEpochStart',
        'relative_to_epoch': 'http://trials.drugis.org/instances/e2',
        'time_offset': 'PT0S',
        label: 'At start of epoch 1'
      };

      var result1 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: arm1['@id'],
        of_moment: measurementMoment1['@id'],
        of_outcome: outcome1['@id'],
        sample_size: 70
      };

      var result2 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: arm2['@id'],
        of_moment: measurementMoment2['@id'],
        of_outcome: outcome2['@id'],
        count: 3
      };

      var resultNonConformant = {
        '@id': 'http://trials.drugis.org/instances/resultNonConformant',
        of_group: arm2['@id'],
        of_outcome: outcome2['@id'],
        count: 3,
        comment: 'comment'
      };

      var result3 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: 'non existent arm id',
        of_moment: measurementMoment2['@id'],
        of_outcome: outcome2['@id'],
        count: 6
      };

      var result4 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: arm1['@id'],
        of_moment: 'non existent moment id',
        of_outcome: outcome1['@id'],
        sample_size: 140
      };

      var result5 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: arm2['@id'],
        of_moment: measurementMoment2['@id'],
        of_outcome: 'non existent outcome id',
        count: 6
      };

      var result6 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: arm2['@id'],
        of_moment: measurementMoment1['@id'],
        of_outcome: outcome1['@id'],
        'standard_error': 6
      };

      var resultsToLeave = [result1, resultNonConformant];
      var resultsToBeCleaned = [result2, result3, result4, result5, result6];

      var study = {
        '@id': 'http://trials.drugis.org/studies/s1',
        '@type': 'ontology:Study',
        label: 'study 1',
        comment: 'my study',
        has_outcome: [outcome1, outcome2],
        has_arm: [arm1, arm2],
        has_group: [],
        has_activity: [],
        has_indication: [],
        has_objective: [],
        has_publication: [],
        has_eligibility_criteria: []
      };

      var graphJsonObject = [study, measurementMoment1, measurementMoment2].concat(resultsToLeave).concat(resultsToBeCleaned);
      var expectedGraph = [study, measurementMoment1, measurementMoment2].concat(resultsToLeave);

      beforeEach(function() {
        var graphDefer = q.defer();
        var getGraphPromise = graphDefer.promise;
        graphDefer.resolve(graphJsonObject);
        studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
      });

      it('should clean the graph', function(done) {
        resultsService.cleanupMeasurements().then(function() {
          expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
          studyServiceMock.saveJsonGraph.calls.reset();
          done();
        });
        rootScope.$digest();
      });
    });

    describe('cleanupMeasurements for categoricals', function() {
      var arm1 = {
        '@id': 'http://trials.drugis.org/instances/a1',
        '@type': 'ontology:Arm',
        label: 'arm label'
      };

      var arm2 = {
        '@id': 'http://trials.drugis.org/instances/a2',
        '@type': 'ontology:Arm',
        label: 'arm label'
      };

      var category1 = {
        '@id': 'http://trials.drugis.org/instances/cat1',
        type: 'ontology:Category',
        label: 'Young'
      };
      var categoryNode1 = {
        first: category1,
        rest: {
          '@id': 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil'
        }
      };

      var outcome1 = {
        '@id': 'http://trials.drugis.org/instances/out1',
        '@type': 'ontology:OutcomeType',
        is_measured_at: ['http://trials.drugis.org/instances/mm1', 'http://trials.drugis.org/instances/mm2'],
        of_variable: [{
          '@id': 'http://fuseki-test.drugis.org:3030/.well-known/genid/var1',
          '@type': 'ontology:Variable',
          measurementType: 'ontology:categorical',
          categoryList: categoryNode1,
          label: 'Age'
        }],
        comment: '',
        label: 'Age'
      };

      var measurementMoment1 = {
        '@id': 'http://trials.drugis.org/instances/mm1',
        '@type': 'ontology:MeasurementMoment',
        'relative_to_anchor': 'ontology:anchorEpochStart',
        'relative_to_epoch': 'http://trials.drugis.org/instances/e1',
        'time_offset': 'PT0S',
        label: 'At start of epoch 1'
      };

      var measurementMoment2 = {
        '@id': 'http://trials.drugis.org/instances/mm2',
        '@type': 'ontology:MeasurementMoment',
        'relative_to_anchor': 'ontology:anchorEpochStart',
        'relative_to_epoch': 'http://trials.drugis.org/instances/e2',
        'time_offset': 'PT0S',
        label: 'At start of epoch 1'
      };

      var result1 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: arm1['@id'],
        of_moment: measurementMoment1['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 1
        }, {
          category: 'http://nonexistentcategory.com/yo',
          count: 2
        }]
      };
      var result2 = {
        '@id': 'http://trials.drugis.org/instances/result2',
        of_group: arm1['@id'],
        of_moment: measurementMoment2['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 3
        }, {
          category: 'http://nonexistentcategory.com/yo',
          count: 4
        }]
      };
      var result3 = {
        '@id': 'http://trials.drugis.org/instances/result3',
        of_group: arm2['@id'],
        of_moment: measurementMoment1['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 4
        }, {
          category: 'http://nonexistentcategory.com/yo',
          count: 5
        }]
      };
      var result4 = {
        '@id': 'http://trials.drugis.org/instances/result4',
        of_group: arm2['@id'],
        of_moment: measurementMoment2['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 7
        }, {
          category: 'http://nonexistentcategory.com/yo',
          count: 8
        }]
      };

      var cleanedResult1 = {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: arm1['@id'],
        of_moment: measurementMoment1['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 1
        }]
      };
      var cleanedResult2 = {
        '@id': 'http://trials.drugis.org/instances/result2',
        of_group: arm1['@id'],
        of_moment: measurementMoment2['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 3
        }]
      };
      var cleanedResult3 = {
        '@id': 'http://trials.drugis.org/instances/result3',
        of_group: arm2['@id'],
        of_moment: measurementMoment1['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 4
        }]
      };
      var cleanedResult4 = {
        '@id': 'http://trials.drugis.org/instances/result4',
        of_group: arm2['@id'],
        of_moment: measurementMoment2['@id'],
        of_outcome: outcome1['@id'],
        category_count: [{
          category: category1['@id'],
          count: 7
        }]
      };

      var study = {
        '@id': 'http://trials.drugis.org/studies/s1',
        '@type': 'ontology:Study',
        label: 'study 1',
        comment: 'my study',
        has_outcome: [outcome1],
        has_arm: [arm1, arm2],
        has_group: [],
        has_activity: [],
        has_indication: [],
        has_objective: [],
        has_publication: [],
        has_eligibility_criteria: []
      };

      var graphJsonObject = [study, measurementMoment1, measurementMoment2, result1, result2, result3, result4];
      var expectedGraph = [study, measurementMoment1, measurementMoment2, cleanedResult1, cleanedResult2, cleanedResult3, cleanedResult4];

      beforeEach(function() {
        var graphDefer = q.defer();
        var getGraphPromise = graphDefer.promise;
        graphDefer.resolve(graphJsonObject);
        studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
      });

      it('should clean the graph', function(done) {
        resultsService.cleanupMeasurements().then(function() {
          expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedGraph);
          studyServiceMock.saveJsonGraph.calls.reset();
          done();
        });
        rootScope.$digest();
      });
    });

    describe('isExistingMeasurement', function() {
      var graphJsonObject = [{
        '@id': 'nonConfInstance1',
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
      }, {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_moment: 'mommentInstanceUri',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
      }];

      var measurementMomentUri = 'mommentInstanceUri';
      var measurementInstanceList = ['nonConfInstance1', 'nonConfInstance2'];

      var isExistingMeasurement;

      beforeEach(function(done) {
        var graphDefer = q.defer();
        var getGraphPromise = graphDefer.promise;
        graphDefer.resolve(graphJsonObject);
        studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        resultsService.isExistingMeasurement(measurementMomentUri, measurementInstanceList)
          .then(function(result) {
            isExistingMeasurement = result;
            done();
          });
        rootScope.$digest();
      });

      it('should return true when the nonConformantMeasurement already exists', function() {
        expect(isExistingMeasurement).toBe(true);
      });
    });

    describe('isExistingMeasurement', function() {
      var graphJsonObject = [{
        '@id': 'nonConfInstance1',
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
      }, {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_moment: 'http://trials.drugis.org/instances/moment1',
        of_outcome: 'http://trials.drugis.org/instances/outcome2',
      }, {
        '@id': 'http://trials.drugis.org/instances/result1',
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_moment: 'otherMoment',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
      }];

      var measurementMomentUri = 'mommentInstanceUri';
      var measurementInstanceList = ['nonConfInstance1', 'nonConfInstance2'];

      var isExistingMeasurement;

      beforeEach(function(done) {
        var graphDefer = q.defer();
        var getGraphPromise = graphDefer.promise;
        graphDefer.resolve(graphJsonObject);
        studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        resultsService.isExistingMeasurement(measurementMomentUri, measurementInstanceList)
          .then(function(result) {
            isExistingMeasurement = result;
            done();
          });
        rootScope.$digest();
      });

      it('should return false when the nonConformantMeasurement does not already exists', function() {
        expect(isExistingMeasurement).toBe(false);
      });
    });

    describe('setToMeasurementMoment', function() {
      var graphJsonObject = [{
        '@id': 'nonConfInstance1',
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
        comment: 'comment'
      }, {
        '@id': 'otherNode',
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_outcome: 'http://trials.drugis.org/instances/outcome2'
      }, {
        '@id': 'nonConfInstance2',
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_outcome: 'http://trials.drugis.org/instances/outcome2',
        comment: 'comment'
      }];

      var expectedSaveGraph = [{
        '@id': 'nonConfInstance1',
        of_group: 'http://trials.drugis.org/instances/arm1',
        of_moment: 'mommentInstanceUri',
        of_outcome: 'http://trials.drugis.org/instances/outcome1',
      }, {
        '@id': 'otherNode',
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_outcome: 'http://trials.drugis.org/instances/outcome2',
      }, {
        '@id': 'nonConfInstance2',
        of_group: 'http://trials.drugis.org/instances/arm2',
        of_moment: 'mommentInstanceUri',
        of_outcome: 'http://trials.drugis.org/instances/outcome2',
      }];

      var measurementMomentUri = 'mommentInstanceUri';
      var measurementInstanceList = ['nonConfInstance1', 'nonConfInstance2'];

      beforeEach(function(done) {
        var graphDefer = q.defer();
        var getGraphPromise = graphDefer.promise;
        graphDefer.resolve(graphJsonObject);
        studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        resultsService
          .setToMeasurementMoment(measurementMomentUri, measurementInstanceList)
          .then(done);
        rootScope.$digest();
      });

      it('should setToMeasurementMoment', function() {
        expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedSaveGraph);
        studyServiceMock.saveJsonGraph.calls.reset();
      });
    });

    describe('getResultPropertyDetails', function() {
      it('should also work for shortened urls', function() {
        expect(resultsService.getResultPropertyDetails('ontology:sample_size')).toBeDefined();
        expect(resultsService.getResultPropertyDetails('ontology:sample_size', CONTRAST)).not.toBeDefined();
        expect(resultsService.getResultPropertyDetails('ontology:odds_ratio', CONTRAST)).toBeDefined();
        expect(resultsService.getResultPropertyDetails('ontology:mean', ARM_LEVEL)).toBeDefined();
      });
    });

    describe('moveMeasurementMoment', function() {
      describe('if the target is another moment', function() {
        var fromUri = 'moment1InstanceUri';
        var toUri = 'moment2InstanceUri';
        var variableUri = 'variable1Uri';
        var graphJsonObject = [{
          id: 'sourceMeasurement',
          of_outcome: variableUri,
          of_moment: fromUri
        }, {
          id: 'someMeasurement',
          of_outcome: variableUri,
          of_moment: toUri
        }];

        var expectedSaveGraph = [{
          id: 'sourceMeasurement',
          of_outcome: variableUri,
          of_moment: toUri
        }];

        beforeEach(function(done) {
          var graphDefer = q.defer();
          var getGraphPromise = graphDefer.promise;
          graphDefer.resolve(graphJsonObject);
          studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
          resultsService
            .moveMeasurementMoment(fromUri, toUri, variableUri)
            .then(done);
          rootScope.$digest();
        });
        afterEach(function() {
          studyServiceMock.saveJsonGraph.calls.reset();
        });
        it('should move the values from the source, overwriting anything that was already there', function() {
          expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedSaveGraph);
        });
      });
    });

    describe('if the target is not a moment', function() {
      var fromUri = 'moment1InstanceUri';
      var toUri;
      var rowLabel = 'unassigned moment';
      var variableUri = 'variable1Uri';
      var graphJsonObject = [{
        id: 'sourceMeasurement',
        of_outcome: variableUri,
        of_moment: fromUri
      }];

      var expectedSaveGraph = [{
        id: 'sourceMeasurement',
        of_outcome: variableUri,
        comment: rowLabel
      }];

      beforeEach(function(done) {
        var graphDefer = q.defer();
        var getGraphPromise = graphDefer.promise;
        graphDefer.resolve(graphJsonObject);
        studyServiceMock.getJsonGraph.and.returnValue(getGraphPromise);
        resultsService
          .moveMeasurementMoment(fromUri, toUri, variableUri, rowLabel)
          .then(done);
        rootScope.$digest();
      });
      afterEach(function() {
        studyServiceMock.saveJsonGraph.calls.reset();
      });
      it('should move the values from the source, overwriting anything that was already there', function() {
        expect(studyServiceMock.saveJsonGraph).toHaveBeenCalledWith(expectedSaveGraph);
      });
    });
  });
});
