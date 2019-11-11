'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    'EpochService',
    'GraphResource',
    'StudyService',
    'UserResource',
    'DurationService'
  ];
  var IntermediateImportEpochsController = function(
    $scope,
    $stateParams,
    $state,
    $modal,
    EpochService,
    GraphResource,
    StudyService,
    UserResource,
    DurationService
  ) {

    //init
    $scope.epochs = [];
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.alert =  "";
    
    //functions    
    $scope.nextActivity = nextActivity;
    $scope.previous = previous;
    $scope.addEpoch = addEpoch;
    $scope.editEpoch = editEpoch;
    $scope.deleteEpoch = deleteEpoch;
    $scope.isValidDuration = DurationService.isValidDuration;
  //  $scope.acceptEpoch = acceptEpoch;
    
    loadStudy();

    reloadStudyModel();

    function nextActivity() {
      if ($scope.epochs.length > 0)
        $state.go('intermediate-activity', $stateParams);
  //    console.log($stateParams)
      else {
        $scope.alert = "*Please add epochs";
      }
    }

    // function acceptEpoch(epoch) {
    //     $modal.open({
    //     scope: $scope,
    //     templateUrl: '../epoch/editEpoch.html',
    //     controller: 'EditEpochController',
    //     resolve: {
    //       callback: function() {
    //         return reloadStudyModel;
    //       },
    //       itemService: function() {
    //         return EpochService;
    //       },
    //       item: function() {
    //         return epoch;
    //       }
    //     }
    //   });
    // }

    function previous() {
      $state.go('intermediate-arm', $stateParams);
    }

    function addEpoch(epoch) {
      $modal.open({
        scope: $scope,
        templateUrl: '../epoch/addEpoch.html',
        controller: 'AddEpochController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return EpochService;
          },
          item: function() {
            return epoch;
          }
        },
      });
    }

    function editEpoch(epoch) {
      $modal.open({
        scope: $scope,
        templateUrl: '../epoch/editEpoch.html',
        controller: 'EditEpochController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          itemService: function() {
            return EpochService;
          },
          item: function() {
            return epoch;
          }
        }
      });
    }

    function deleteEpoch(epoch) {
      return EpochService.deleteItem(epoch).then(function() {
        reloadStudyModel();
      });
      console.log(epoch)
    }

    function reloadStudyModel() {
      EpochService.queryItems().then(function(epochs) {
        $scope.epochs = epochs;
        console.log('epochs: ' + epochs)
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
  return dependencies.concat(IntermediateImportEpochsController);
});