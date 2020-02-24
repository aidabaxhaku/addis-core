'use strict';
define([],
  function() {
    var dependencies = [
      '$stateParams',
      '$scope',
      '$state',
      'ResultsService',
      'StudyDesignService'
    ];
    var IntermediateImportDesignTableController = function(
      $stateParams,
      $scope,
      $state,
      ResultsService,
      StudyDesignService
    ) {

      //functions
      $scope.previous = previous;
      $scope.next = next;

      $scope.$on('updateStudyDesign', function() {
        ResultsService.cleanupMeasurements().then(function() {
          $scope.$broadcast('refreshResults');
        });
        StudyDesignService.cleanupCoordinates($stateParams.studyUUID).then(function() {
          $scope.$broadcast('refreshStudyDesign');
        });
      });

      function next() {
        $state.go('intermediate-measurementMoment', $stateParams);
      }

      function previous() {
        $state.go('intermediate-activity', $stateParams);
      }


      reloadDesignTable();

      function reloadDesignTable() {

      }
    };
    return dependencies.concat(IntermediateImportDesignTableController);
  });