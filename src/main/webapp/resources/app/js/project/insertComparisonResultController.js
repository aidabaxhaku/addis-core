'use strict';
define(['lodash'], function(_) {
  var dependencies = ['$scope', '$q', '$stateParams', '$modalInstance', 'AnalysisResource', 'ModelResource',
    'ReportDirectiveService', 'PataviService', 'InterventionResource', 'callback'
  ];
  var InsertComparisonResultController = function($scope, $q, $stateParams, $modalInstance, AnalysisResource, ModelResource,
    ReportDirectiveService, PataviService, InterventionResource, callback) {

    $scope.selections = {};
    $scope.loading = {
      loaded: false
    };
    $scope.insertComparisonResult = insertComparisonResult;
    $scope.selectedAnalysisChanged = selectedAnalysisChanged;
    $scope.selectedModelChanged = selectedModelChanged;
    $scope.treatmentSelectionChanged = treatmentSelectionChanged;

    var analysesPromise = AnalysisResource.query($stateParams).$promise;
    var modelsPromise = ModelResource.getConsistencyModels($stateParams).$promise;
    var interventionPromise = InterventionResource.query($stateParams).$promise;

    $q.all([analysesPromise, modelsPromise, interventionPromise]).then(function(values) {
      var analyses = values[0];
      var models = values[1];
      $scope.interventions = _.sortBy(values[2], 'name');
      var interventionsById = _.keyBy($scope.interventions, 'id');
      var modelResultsPromises = [];

      $scope.analyses = _.filter(analyses, ['analysisType', 'Evidence synthesis']);
      if ($scope.analyses.length) {
        $scope.selections.analysis = $scope.analyses[0];
      }

      models = _.filter(models, ['modelType.type', 'network']);

      models = _.map(models, function(model) {
        if (model.taskUrl) {
          var resultsPromise = PataviService.listen(model.taskUrl);
          modelResultsPromises.push(resultsPromise);
          resultsPromise.then(function(modelResults) {
            model.comparisons = _.map(modelResults.relativeEffects.centering, function(comparison) {
              return {
                label: interventionsById[comparison.t1].name + ' - ' + interventionsById[comparison.t2].name,
                t1: comparison.t1,
                t2: comparison.t2
              };
            });
          });
        }
        return model;
      });

      $q.all(modelResultsPromises).then(function() {
        models = _.filter(models, function(model) {
          return model.comparisons && model.comparisons.length;
        });
        $scope.analyses = _.map($scope.analyses, function(analysis) {
          analysis.models = _.filter(models, ['analysisId', analysis.id]);
          return analysis;
        });
        $scope.analyses = _.filter($scope.analyses, function(analysis) {
          return analysis.models.length > 0;
        });
        $scope.selectedAnalysisChanged();
        $scope.loading.loaded = true;
      });
    });

    function selectedAnalysisChanged() {
      if ($scope.selections.analysis.primaryModel) {
        $scope.selections.model = _.find($scope.selections.analysis.models, ['id', $scope.selections.analysis.primaryModel]);
      } else {
        $scope.selections.model = $scope.selections.analysis.models[0];
      }
      $scope.selectedModelChanged();
    }

    function selectedModelChanged() {
      if (!$scope.selections.model || !$scope.selections.model.comparisons) {
        return;
      }
      $scope.selections.t1 = $scope.interventions[0];
      treatmentSelectionChanged();
    }


    function insertComparisonResult() {
      callback(ReportDirectiveService.getDirectiveBuilder('result-comparison')($scope.selections.analysis.id,
        $scope.selections.model.id, $scope.selections.t1.id, $scope.selections.t2.id));
      $modalInstance.close();
    }

    function treatmentSelectionChanged() {
      $scope.secondInterventionOptions = _.reject($scope.interventions, ['id', $scope.selections.t1.id]);
      $scope.selections.t2 = $scope.secondInterventionOptions[0];
    }

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };
  return dependencies.concat(InsertComparisonResultController);
});