'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    'MeasurementMomentService',
    'GraphResource',
    'StudyService',
    'UserResource',
    'DurationService',
    'EpochService'
  ];
  var IntermediateImportMeasurementMomentsController = function(
    $scope,
    $stateParams,
    $state,
    $modal,
    MeasurementMomentService,
    GraphResource,
    StudyService,
    UserResource,
    DurationService,
    EpochService
  ) {
    //init
    $scope.measurementMoments = [];
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.alert = "";

    //functions
    $scope.next = next;
    $scope.previous = previous;
    $scope.addMeasurementMoment = addMeasurementMoment;
    $scope.deleteMeasurementMoment = deleteMeasurementMoment;
    $scope.mergeMeasurementMoment = mergeMeasurementMoment;
    $scope.editMeasurementMoment = editMeasurementMoment;

    function next() {
      $state.go('dataset.study', {
        userUid: $stateParams.userUid,
        datasetUuid: $stateParams.datasetUuid,
        studyGraphUuid: $stateParams.studyGraphUuid
      });
    }

    function previous(){
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

    loadStudy();

    reloadStudyModel();

    function reloadStudyModel() {
      MeasurementMomentService.queryItems().then(function(measurementMoments) {
        $scope.measurementMoments = measurementMoments;
        console.log('measurementMoments ' + measurementMoments)
      });
    }

    function loadStudy() {
      StudyService.loadJson(getHeadGraph());
    }

    function getHeadGraph() {
      return GraphResource.getJson({
        userUid: $stateParams.userUid,
        datasetUuid: $stateParams.datasetUuid,
        graphUuid: $stateParams.studyGraphUuid
      }).$promise;
    }
  };
  return dependencies.concat(IntermediateImportMeasurementMomentsController);
});