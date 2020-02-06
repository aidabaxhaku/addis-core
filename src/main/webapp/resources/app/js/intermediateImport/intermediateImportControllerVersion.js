'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    'StudyService',
    'ArmService',
    'GroupService',
    'EpochService',
    'ActivityService',
    'MeasurementMomentService',
    'GraphResource'
  ];
  var IntermediateImportController = function(
    $scope,
    $stateParams,
    $state,
    StudyService,
    ArmService,
    GroupService,
    EpochService,
    ActivityService,
    MeasurementMomentService,
    GraphResource
  ) {
    //functions
    $scope.next = next;
    $scope.arms = [];
    $scope.otherGroups = [];
    $scope.epochs = [];
    $scope.activities = [];
    $scope.measurementMoments = [];

    function next() {

      $state.go('dataset.study', {
        userUid: $stateParams.userUid,
        datasetUuid: $stateParams.datasetUuid,
        studyGraphUuid: $stateParams.studyGraphUuid
      });
    }

    reloadStudyModel();

    function reloadStudyModel() {
      loadStudy();
      ArmService.queryItems().then(function(arms) {
        $scope.arms = arms;

        console.log(arms)
      });
       GroupService.queryItems().then(function(otherGroups) {
        $scope.otherGroups = otherGroups;

        console.log(otherGroups)
      });
       EpochService.queryItems().then(function(epochs) {
        $scope.epochs = epochs;

        console.log(epochs)
       });
       ActivityService.queryItems().then(function(activities) {
        $scope.activities = activities;

        console.log(activities)
       });
        MeasurementMomentService.queryItems().then(function(measurementMoments) {
        $scope.measurementMoments = measurementMoments;

        console.log(measurementMoments)
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
  return dependencies.concat(IntermediateImportController);
});