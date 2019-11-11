'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    'ActivityService',
    'GraphResource',
    'StudyService',
    'UserResource'
  ];
  var IntermediateImportActivitiesController = function(
    $scope,
    $stateParams,
    $state,
    $modal,
    ActivityService,
    GraphResource,
    StudyService,
    UserResource
  ) {
    //init
    $scope.activities = [];
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.item = {};
    $scope.alert = "";
    //functions
    $scope.next = next;
    $scope.previous = previous;
    $scope.editActivity = editActivity;
    $scope.addActivity = addActivity;
    $scope.deleteActivity = deleteActivity;

    function next() {
      if ($scope.activities.length > 0)
        $state.go('intermediate-measurementMoment', $stateParams);
     // console.log($stateParams)
      else 
        $scope.alert = "*Please add activities.";
    }

    function previous() {
      $state.go('intermediate-epoch', $stateParams);
    }

    function addActivity() {
      $modal.open({
        scope: $scope,
        templateUrl: '../activity/editActivity.html',
        controller: 'ActivityController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return ActivityService;
          },
          actionType: function() {
            return 'Add';
          },
          item: function() {
            return {};
          }
        }
      });
    }

    function editActivity(activity) {
      $modal.open({
        scope: $scope,
        templateUrl: '../activity/editActivity.html',
        controller: 'ActivityController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return ActivityService;
          },
          item: function() {
            return activity;
          },
          actionType: function() {
            return 'Edit';
          }
        }
      });
    }

    function deleteActivity(activity) {
      return ActivityService.deleteItem(activity).then(function() {
        reloadStudyModel();
      });
      console.log(activity)
    }

    loadStudy();

    reloadStudyModel();

    function reloadStudyModel() {
      ActivityService.queryItems().then(function(activities) {
        $scope.activities = activities;

        console.log('activities' + activities)
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
  return dependencies.concat(IntermediateImportActivitiesController);
});