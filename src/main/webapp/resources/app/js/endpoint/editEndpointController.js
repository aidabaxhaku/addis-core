'use strict';
define([],
  function() {
    var dependencies = ['$scope', '$state', '$modalInstance', 'itemService', 'MeasurementMomentService', 'callback', 'item'];
    var EditItemController = function($scope, $state, $modalInstance, itemService, MeasurementMomentService, callback, item) {

      $scope.isEditing = false;
      $scope.item = item;
      $scope.measurementMoments = MeasurementMomentService.queryItems();

      $scope.editItem = function() {
        $scope.isEditing = false;
        itemService.editItem($scope.item).then(function() {
            callback();
            $modalInstance.close();
          },
          function() {
            $modalInstance.dismiss('cancel');
          });
      };

      $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
      };
    };
    return dependencies.concat(EditItemController);
  });
