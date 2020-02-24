'use strict';
define(['jquery', '../util/context'], function($, externalContext) {
  var dependencies = [
    '$q',
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    '$filter',
    'MeasurementMomentService',
    'GraphResource',
    'StudyService',
    'UserResource',
    'UUIDService'
  ];
  var IntermediateImportMeasurementMomentsController = function(
    $q,
    $scope,
    $stateParams,
    $state,
    $modal,
    $filter,
    MeasurementMomentService,
    GraphResource,
    StudyService,
    UserResource,
    UUIDService
  ) {
    //init
    $scope.measurementMoments = [];
    $scope.user = UserResource.get($stateParams);
    $scope.alert = '';

    //functions
    $scope.next = next;
    $scope.previous = previous;
    $scope.addMeasurementMoment = addMeasurementMoment;
    $scope.deleteMeasurementMoment = deleteMeasurementMoment;
    $scope.mergeMeasurementMoment = mergeMeasurementMoment;
    $scope.editMeasurementMoment = editMeasurementMoment;


    function next() {
      var uuid = UUIDService.generate();
      StudyService.getGraphAndContext().then(function(graphAndContext) {
        GraphResource.putJson({
          userUid: $stateParams.userUid,
          datasetUuid: $stateParams.datasetUuid,
          graphUuid: uuid,
          commitTitle: 'Initial study creation: ' // + study.label
        }, graphAndContext, function() {
          $state.go('dataset.study', {
            userUid: $stateParams.userUid,
            datasetUuid: $stateParams.datasetUuid,
            studyGraphUuid: uuid
          });
        });
      });
    }
  
  function errorCallback(error) {
    console.error('error' + error);
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
          return reloadMeasurementMoments;
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
      reloadMeasurementMoments();
    });
  }

  function mergeMeasurementMoment(measurementMoment) {
    $modal.open({
      scope: $scope,
      templateUrl: '../measurementMoment/repairMeasurementMoment.html',
      controller: 'MeasurementMomentController',
      resolve: {
        callback: function() {
          return reloadMeasurementMoments;
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
          return reloadMeasurementMoments;
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

  reloadMeasurementMoments();

  function reloadMeasurementMoments() {
    MeasurementMomentService.queryItems().then(function(measurementMoments) {
      $scope.measurementMoments = measurementMoments;
      //     console.log('measurementMoments ' + measurementMoments)
    });
  }
};
return dependencies.concat(IntermediateImportMeasurementMomentsController);
});