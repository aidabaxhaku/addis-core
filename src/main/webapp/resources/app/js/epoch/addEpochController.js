'use strict';
define([],
  function() {
    var dependencies = [
    '$scope', 
    '$modalInstance', 
    'EpochService', 
    'callback', 
    'DurationService',
    'item'
    ];
    var addEpochController = function(
      $scope, 
      $modalInstance, 
      EpochService, 
      callback, 
      DurationService,
      item ) {
      // functions
      $scope.addItem = addItem;
      $scope.cancel = cancel;
      $scope.changeToInstantaneous = changeToInstantaneous;
      $scope.item = item;

      // init
      $scope.periodTypeOptions = [{
        value: 'H',
        type: 'time',
        label: 'hour(s)'
      }, {
        value: 'D',
        type: 'day',
        label: 'day(s)'
      }, {
        value: 'W',
        type: 'day',
        label: 'week(s)'
      }];

      $scope.item = {
        duration: {
          numberOfPeriods: 1,
          periodType: $scope.periodTypeOptions[0]
        }
      };

      $scope.isValidDuration = DurationService.isValidDuration;

      function addItem() {
        EpochService.addItem($scope.item)
          .then(function() {
              callback();
              $modalInstance.close();
            },
            function() {
              console.error('failed to create epoch');
              $modalInstance.close();
            });
      }

      function cancel() {
        $modalInstance.close();
      }

      function changeToInstantaneous() {
        $scope.item.duration = 'PT0S';
      }
    };
    return dependencies.concat(addEpochController);
  });