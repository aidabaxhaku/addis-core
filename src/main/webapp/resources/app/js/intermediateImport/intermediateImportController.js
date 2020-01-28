'use strict';
define(['../util/transformJsonLd'],
  function(transformStudyJsonLd) {
  	var dependencies = [
  	'$stateParams',
  	'StudyService', 
  	'IntermediateImportResource',
  	'DataModelService'

  	];
  	var IntermediateImportController = function(
  		$stateParams,
  		StudyService,
  		IntermediateImportResource,
  		DataModelService
  		){

   loadStudy();

	function loadStudy() {
      StudyService.loadJson(getIntermediateStudyJsonPromise());
    }

   function getIntermediateStudyJsonPromise() {
      return IntermediateImportResource.get({
        userUid: $stateParams.userUid,
        datasetUuid: $stateParams.datasetUuid,
        intermediateImportId: $stateParams.intermediateImportId
      }).$promise.then(function(intermediateImport) {
          var intermediateImportData = JSON.parse(intermediateImport.studyInProgress);
          var correctedIntermediateImportData = DataModelService.applyOnLoadCorrections(intermediateImportData);
          return transformStudyJsonLd(correctedIntermediateImportData);
      });
    }
  	};
	return dependencies.concat(IntermediateImportController);
  });