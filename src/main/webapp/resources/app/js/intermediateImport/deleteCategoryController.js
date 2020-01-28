'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'callback',
    'ArmService'
  ];
  var DeleteCategoryController = function(
    $scope,
    $modalInstance,
    callback,
    ArmService) {

    // functions 
    $scope.deleteCategory = deleteCategory;
    $scope.cancel = cancel;
    $scope.category = {};

    function deleteCategory() {
      // return ArmService.deleteItem(group).then(function() {
      delete(category).$promise.then(function() {
        callback();
        $modalInstance.close();
      });
    }

    function cancel() {
      $modalInstance.close();
    }
  };

  return dependencies.concat(DeleteCategoryController);

});