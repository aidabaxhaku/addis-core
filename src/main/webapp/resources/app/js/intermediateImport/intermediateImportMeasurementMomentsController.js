'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    '$filter',
    'MeasurementMomentService',
    'GraphResource',
    'StudyService',
    'UserResource'
  ];
  var IntermediateImportMeasurementMomentsController = function(
    $scope,
    $stateParams,
    $state,
    $modal,
    $filter,
    MeasurementMomentService,
    GraphResource,
    StudyService,
    UserResource
  ) {
    //init
    $scope.measurementMoments = [];
    $scope.study = {};
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.alert = '';

    //functions
    $scope.next = next;
    $scope.previous = previous;
    $scope.addMeasurementMoment = addMeasurementMoment;
    $scope.deleteMeasurementMoment = deleteMeasurementMoment;
    $scope.mergeMeasurementMoment = mergeMeasurementMoment;
    $scope.editMeasurementMoment = editMeasurementMoment;

    function next() {
      $state.go('dataset.study', $stateParams);
    }

    function previous() {
      $state.go('intermediate-activity', $stateParams);
    }

    function addMeasurementMoment(measurementMoment) {
      $modal.open({
        scope: $scope,
        templateUrl: '../measurementMoment/editMeasurementMoment.html',
        controller: 'MeasurementMomentController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          actionType: function() {
            return 'Add';
          },
          item: function() {
            return measurementMoment;
          }
        }
      });
    }

    function deleteMeasurementMoment(measurementMoment) {
      return MeasurementMomentService.deleteItem(measurementMoment).then(function() {
        reloadStudyModel();
      });
    }

    function mergeMeasurementMoment(measurementMoment) {
      $modal.open({
        scope: $scope,
        templateUrl: '../measurementMoment/repairMeasurementMoment.html',
        controller: 'MeasurementMomentController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          actionType: function() {
            return 'Merge';
          },
          item: function() {
            return measurementMoment;
          }
        }
      });
    }

    function editMeasurementMoment() {
      $modal.open({
        scope: $scope,
        templateUrl: '../measurementMoment/editMeasurementMoment.html',
        controller: 'MeasurementMomentController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          actionType: function() {
            return 'Edit';
          },
          item: function() {
            return {};
          }
        }
      });
    }

    reloadStudyModel();

    function reloadStudyModel() {
      MeasurementMomentService.queryItems().then(function(measurementMoments) {
        $scope.measurementMoments = measurementMoments;
        //     console.log('measurementMoments ' + measurementMoments)
      });
    }
  };
  return dependencies.concat(IntermediateImportMeasurementMomentsController);
});