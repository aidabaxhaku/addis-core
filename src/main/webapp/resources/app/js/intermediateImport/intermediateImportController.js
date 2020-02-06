'use strict';
define(['../util/transformJsonLd'],
  function(transformStudyJsonLd) {
    var dependencies = [
      '$scope',
      '$stateParams',
      '$filter',
      'StudyService',
      'IntermediateImportResource',
      'DataModelService'

    ];
    var IntermediateImportController = function(
      $scope,
      $stateParams,
      $filter,
      StudyService,
      IntermediateImportResource,
      DataModelService
    ) {

      loadStudy();

      function loadStudy() {
        StudyService.loadJson(getIntermediateStudyJsonPromise())
          .then(StudyService.getStudy)
          .then(function(study) {
            fillView(study);
          });
      }

      function fillView(study) {
        $scope.studyUuid = $filter('stripFrontFilter')(study['@id'], 'http://trials.drugis.org/studies/');
        $scope.study = {
          id: $scope.studyUuid,
          label: study.label,
          comment: study.comment, 
        };
        if (study.has_publication && study.has_publication.length === 1) {
          $scope.study.nctId = study.has_publication[0].registration_id;
          $scope.study.nctUri = study.has_publication[0].uri;
        }
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