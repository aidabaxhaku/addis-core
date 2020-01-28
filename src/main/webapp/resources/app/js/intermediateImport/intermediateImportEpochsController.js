'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    '$filter',
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
    $filter,
    EpochService,
    GraphResource,
    StudyService,
    UserResource,
    DurationService
  ) {

    //init
    $scope.epochs = [];
    $scope.study = {};
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.alert = "";
    $scope.screening = {
      duration: "PT0S",
      label: "Screening"
    }
    //functions    
    $scope.nextActivity = nextActivity;
    $scope.previous = previous;
    $scope.addEpoch = addEpoch;
    $scope.editEpoch = editEpoch;
    $scope.deleteEpoch = deleteEpoch;
    $scope.isValidDuration = DurationService.isValidDuration;


    reloadStudyModel();

    function nextActivity() {
      if ($scope.epochs.length > 0)
        $state.go('intermediate-activity', $stateParams);
      //    console.log($stateParams)
      else {
        $scope.alert = "*Please add epochs";
      }
    }

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
      StudyService.getStudy().then(function(study) {
        fillView(study);
      });
      EpochService.queryItems().then(function(epochs) {
        $scope.epochs = epochs;
        console.log('epochs: ' + epochs)
      });
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

  };
  return dependencies.concat(IntermediateImportEpochsController);
});