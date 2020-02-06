'use strict';
define([], function() {
  var dependencies = [
    '$q',
    '$modal',
    '$scope',
    '$state',
    '$filter',
    '$resource',
    '$stateParams',
    'ArmService',
    'GroupService',
    'StudyService',
    'ResultsService',
    'DataModelService',
    'GraphResource',
    'UserResource',
    'IntermediateImportResource',
    'STUDY_CATEGORY_SETTINGS'
  ];
  var IntermediateImportArmsController = function(
    $q,
    $modal,
    $scope,
    $state,
    $filter,
    $resource,
    $stateParams,
    ArmService,
    GroupService,
    StudyService,
    ResultsService,
    DataModelService,
    GraphResource,
    UserResource,
    IntermediateImportResource,
    STUDY_CATEGORY_SETTINGS
  ) {

    //init
    $scope.arms = [];
    $scope.groups = [];
    $scope.measurementMoments = [];
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.categorySettings = STUDY_CATEGORY_SETTINGS;
    $scope.isEditingAllowed = true;
    $scope.alert = '';
    $scope.noData = '';

    //functions   
    $scope.next = next;
    $scope.editGroup = editGroup;
    $scope.editArm = editArm;
    $scope.addGroup = addGroup;
    $scope.addArm = addArm;
    $scope.deleteGroup = deleteGroup;
    $scope.deleteArm = deleteArm;
    $scope.reclassifyGroup = reclassifyGroup;
    $scope.reclassifyArm = reclassifyArm;
    $scope.mergeGroup = mergeGroup;
    $scope.mergeArm = mergeArm;
    $scope.previous = previous;

    reloadStudyModel();

    function reloadStudyModel() {
      ArmService.queryItems().then(function(arms) {
        $scope.arms = arms;
       return arms.map(function(arm) {
         addResultsToArm(arm);
       });
      });
      GroupService.queryItems().then(function(groups) {
        $scope.groups = groups;
        return groups.map(function(group) {
          addResultsToGroup(group);
        });
      });
    }

    function addResultsToGroup(group) {
      return ResultsService.queryResultsByGroup(group.groupUri).then(function(results) {
        group.results = results; 
        console.log('Results:' + results);
      });
    }

    function addResultsToArm(arm) {
      return ResultsService.queryResultsByGroup(arm.armUri).then(function(results) {
        arm.results = results;
      });
    }

    function previous() {
      $state.go('dataset', $stateParams);
    }

    function next() {
      if ($scope.arms.length > 0){
        $state.go('intermediate-epoch', $stateParams);
      }
      //console.log($stateParams)
      else {
        $scope.alert = '*Please add arms';
      }
    }

    function addGroup() {
      $modal.open({
        scope: $scope,
        templateUrl: '../group/addGroup.html',
        controller: 'CreateGroupController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return GroupService;
          }
        }
      });
    }

    function addArm() {
      $modal.open({
        scope: $scope,
        templateUrl: '../arm/addArm.html',
        controller: 'CreateArmController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return ArmService;
          }
        },
      });
    }

    function editGroup(group) {
      $modal.open({
        scope: $scope,
        templateUrl: '../group/editGroup.html',
        controller: 'EditGroupController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return GroupService;
          },
          item: function() {
            return group;
          }
        }
      });
    }

    function editArm(arm) {
      $modal.open({
        scope: $scope,
        templateUrl: '../arm/editArm.html',
        controller: 'EditArmController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return ArmService;
          },
          item: function() {
            return arm;
          }
        }
      });
    }

    function deleteGroup(group) {
      return GroupService.deleteItem(group).then(function() {
        reloadStudyModel();
      });
    }

    function deleteArm(arm) {
      return ArmService.deleteItem(arm).then(function() {
        reloadStudyModel();
      });
    }

    function reclassifyGroup(group) {
      return GroupService.reclassifyAsArm(group).then(function() {
        reloadStudyModel();
      });
    }

    function reclassifyArm(arm) {
      return ArmService.reclassifyAsGroup(arm).then(function() {
        reloadStudyModel();
      });
    }

    function mergeGroup(group) {
      $modal.open({
        scope: $scope,
        templateUrl: '../group/mergeGroup.html',
        controller: 'EditGroupController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return GroupService;
          },
          item: function() {
            return group;
          }
        }
      });
    }

    function mergeArm(arm) {
      $modal.open({
        scope: $scope,
        templateUrl: '../arm/mergeArm.html',
        controller: 'EditArmController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return ArmService;
          },
          item: function() {
            return arm;
          }
        }
      });
    }

  };
  return dependencies.concat(IntermediateImportArmsController);
});