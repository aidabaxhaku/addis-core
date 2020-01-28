'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    '$filter',
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
    $filter,
    ActivityService,
    GraphResource,
    StudyService,
    UserResource
  ) {
    //init
    $scope.activities = [];
    $scope.study = {};
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

    $scope.selectTab = selectTab;

    if (!$scope.activetab) {
      $scope.activetab = $state.current.name;
    }

    function selectTab(tab) {
      if ($state.current.name !== tab) {
        $scope.activetab = tab;
        $state.go(tab, {
          userUid: $stateParams.userUid
        });
      }
    }

    function fillView(study) {
      $scope.studyUuid = $filter('stripFrontFilter')(study['@id'], 'http://trials.drugis.org/studies/');
      $scope.study = {
        id: $scope.studyUuid,
        label: study.label,
        comment: study.comment,
      };
      if (study.has_publication && study.has_publication.length === 1) {
        $scope.study.nctId = study.has_publication[0].registration_id;
        $scope.study.nctUri = study.has_publication[0].uri;
      }
    }

    function next() {
      if ($scope.activities.length > 0)
        $state.go('intermediate-designTable', $stateParams);
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

    reloadStudyModel();

    function reloadStudyModel() {
      StudyService.getStudy().then(function(study) {
        fillView(study);
      });
      ActivityService.queryItems().then(function(activities) {
        $scope.activities = activities;

        console.log('activities' + activities)
      });
    }
    
  };
  return dependencies.concat(IntermediateImportActivitiesController);
});