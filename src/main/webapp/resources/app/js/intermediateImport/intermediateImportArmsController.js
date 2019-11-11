'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    'ArmService',
    'GroupService',
    'GraphResource',
    'StudyService',
    'UserResource',
    'STUDY_CATEGORY_SETTINGS'
  ]; 
  var IntermediateImportArmsController = function(
    $scope,
    $stateParams,
    $state,
    $modal,
    ArmService,
    GroupService,
    GraphResource,
    StudyService,
    UserResource,
    STUDY_CATEGORY_SETTINGS
  ) {

    //init
    $scope.arms = [];
    $scope.groups = [];
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.categorySettings = STUDY_CATEGORY_SETTINGS;
    $scope.isEditingAllowed = true;
    $scope.alert = "";
    //functions   
    $scope.nextEpoch = nextEpoch;
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

    loadStudy();

    reloadStudyModel();

    function reloadStudyModel() {
      ArmService.queryItems().then(function(arms) {
        $scope.arms = arms;

        console.log(arms)
      });
      GroupService.queryItems().then(function(groups) {
        $scope.groups = groups;

        console.log(groups)
      });
    }

    function previous() {
      $state.go('dataset', $stateParams);
    }

    function nextEpoch() {
      if ($scope.arms.length > 0)
        $state.go('intermediate-epoch', $stateParams);
      //console.log($stateParams)
      else {
        $scope.alert = "*Please add arms";
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
      console.log(group)
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
  return dependencies.concat(IntermediateImportArmsController);
});