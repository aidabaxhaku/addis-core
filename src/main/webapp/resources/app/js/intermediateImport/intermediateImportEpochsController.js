'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    '$filter',
    'EpochService'

  ];
  var IntermediateImportEpochsController = function(
    $scope,
    $stateParams,
    $state,
    $modal,
    $filter,
    EpochService
  ) {

    //init
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.alert = '';

    var durationPeriod = 'PT0S';
    // var durationMainPhase = {}

    $scope.suggestedEpochs = [{
      duration: durationPeriod,
      label: 'Screening'
    }, {
      duration: durationPeriod,
      label: 'Randomization'
    }, {
      duration: durationPeriod,
      label: 'Washout'
    }];

    //functions    
    $scope.nextActivity = nextActivity;
    $scope.previous = previous;
    $scope.addEpoch = addEpoch;
    $scope.editEpoch = editEpoch;
    $scope.deleteEpoch = deleteEpoch;
    $scope.accept = accept;
    $scope.reject = reject;

    reloadEpochs();

    function nextActivity() {
      if ($scope.epochs.length > 0) {
        $state.go('intermediate-activity', $stateParams);
      } else {
        $scope.alert = '*Please add epochs';
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
            return reloadEpochs;
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
            return reloadEpochs;
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
        reloadEpochs();
      });
    }

    function reloadEpochs() {
      EpochService.queryItems().then(function(epochs) {
        $scope.epochs = epochs;
        console.log('epochs: ' + epochs);
      });
    }

    function accept(suggestion) {
      $modal.open({
        scope: $scope,
        templateUrl: '../epoch/addEpoch.html',
        controller: 'AddEpochController',
        resolve: {
          callback: function() {
            return function() {
              reject(suggestion);
              reloadEpochs();
            }
          },
          itemService: function() {
            return EpochService;
          },
          item: function() {
            return suggestion;
          }
        },
      });
    }

    function reject(suggestion) {
      $scope.suggestedEpochs = _.reject($scope.suggestedEpochs,
        ['label', suggestion.label]);
    }

  };
  return dependencies.concat(IntermediateImportEpochsController);
});