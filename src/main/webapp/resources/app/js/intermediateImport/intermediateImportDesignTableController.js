'use strict';
define([],
  function() {
    var dependencies = [
      '$stateParams',
      '$scope',
      '$state'
    ];
    var IntermediateImportDesignTableController = function(
      $stateParams,
      $scope,
      $state
    ) {

      //functions
      $scope.previous = previous;
      $scope.next = next;

      function next() {
       // if ($scope.activities.length > 0) {
          $state.go('intermediate-measurementMoment', $stateParams);
     //   }
        // console.log($stateParams)
       // else {
          $scope.alert = '*Please add activities.';
       // }
      }

      function previous() {
        $state.go('intermediate-activity', $stateParams);
      }


      reloadStudyModel();

      function reloadStudyModel() {

      }
    };
    return dependencies.concat(IntermediateImportDesignTableController);
  });