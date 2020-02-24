'use strict';
define(['jquery', 'lodash'], function($, _) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    '$filter',
    'ActivityService',
    'GraphResource',
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
    UserResource
  ) {
    //init
    $scope.activities = [];
    $scope.study = {};
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.item = {};
    $scope.alert = '';
    $scope.suggestedActivities = _.map(ActivityService.ACTIVITY_TYPE_OPTIONS, function(activityType) {
      return {
        label: activityType.label,
        activityType: activityType
      }
    });

    //functions
    $scope.next = next;
    $scope.previous = previous;
    $scope.editActivity = editActivity;
    $scope.addActivity = addActivity;
    $scope.deleteActivity = deleteActivity;
    $scope.reject = reject;
    $scope.accept = accept;

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

    function next() {
      if ($scope.activities.length > 0) {
        $state.go('intermediate-designTable', $stateParams);
      }
      // console.log($stateParams)
      else {
        $scope.alert = '*Please add activities.';
      }
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
            return reloadActivities;
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
            return reloadActivities;
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
        reloadActivities();
      });
    }

    reloadActivities();

    function reloadActivities() {
      ActivityService.queryItems().then(function(activities) {
        $scope.activities = activities;
        //console.log('activities' + activities)
      });
    }

    function accept(suggestion) {
      $modal.open({
        scope: $scope,
        templateUrl: '../activity/editActivity.html',
        controller: 'ActivityController',
        resolve: {
          callback: function() {
            return function() {
              reject(suggestion);
              reloadActivities();
            }
          },
          itemService: function() {
            return ActivityService;
          },
          item: function() {
            return suggestion;
          },
          actionType: function() {
            return 'AddWithSuggestion';
          }
        },
      });
    }

    function reject(suggestion) {
      $scope.suggestedActivities = _.reject($scope.suggestedActivities,
        ['label', suggestion.label]);
    }

  };
  return dependencies.concat(IntermediateImportActivitiesController);
});