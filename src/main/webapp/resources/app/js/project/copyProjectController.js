'use strict';
define([], function() {
  var dependencies = ['$scope', '$stateParams', '$modalInstance', 'ProjectResource', 'callback'];
  var CopyProjectController = function($scope, $stateParams, $modalInstance, ProjectResource, callback) {
    $scope.copyProject = copyProject;
    $scope.cancel = cancel;

    $scope.isCopying = false;

    function copyProject(newTitle) {
      $scope.isCopying = true;
      ProjectResource.copy({
        projectId: $scope.project.id
      }, {
        newTitle: newTitle
      }, function(response) {
        callback(response.newProjectId);
        $modalInstance.close();
      });
    }

    function cancel() {
      $modalInstance.dismiss('cancel');
    }
  };
  return dependencies.concat(CopyProjectController);
});