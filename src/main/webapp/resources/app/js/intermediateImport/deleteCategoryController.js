'use strict';
define([], function() {
  var dependencies = [
    '$scope',
    '$modalInstance',
    'callback'
  ];
  var DeleteCategoryController = function(
    $scope,
    $modalInstance,
    callback) {

    // functions 
    $scope.deleteCategory = deleteCategory;
    $scope.cancel = cancel;

    function deleteCategory(category) {
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