'use strict';
define([],
  function() {
  	var dependencies = [
  	'$stateParams',
    '$scope'
    	];
  	var IntermediateImportDesignTableController = function(
  		$stateParams,	
      $scope
  		){

      //functions
      $scope.previous = previous;
      $scope.next = next;
  //    $scope.isEditingAllowed = true;

      function next() {
      if ($scope.activities.length > 0)
        $state.go('intermediate-measurementMoment', $stateParams);
      // console.log($stateParams)
      else
        $scope.alert = "*Please add activities.";
    }

    function previous() {
      
    }


    reloadStudyModel();

    function reloadStudyModel() {

    }  	
    };
	return dependencies.concat(IntermediateImportDesignTableController);
  });