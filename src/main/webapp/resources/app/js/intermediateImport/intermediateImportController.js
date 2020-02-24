'use strict';
define(['../util/transformJsonLd'],
  function(transformStudyJsonLd) {
    var dependencies = [
      '$scope',
      '$stateParams',
      '$filter',
      'StudyService',
      'IntermediateImportResource',
      'DataModelService',
      '$window'

    ];
    var IntermediateImportController = function(
      $scope,
      $stateParams,
      $filter,
      StudyService,
      IntermediateImportResource,
      DataModelService,
      $window
    ) {

      $scope.navSettings = {
        isCompact: false,
        isHidden: false
      };
      
      loadStudy();

      function loadStudy() {
        StudyService.loadJson(getIntermediateStudyJsonPromise())
          .then(StudyService.getStudy)
          .then(function(study) {
            fillView(study);
          });
      }

      //Fixed scrolling
      var navbar = document.getElementsByClassName('side-nav');
      angular.element($window).bind('scroll', function() {
        angular.element(navbar[0]).css('margin-top', (this.pageYOffset - 20) + 'px');
        $scope.$apply();
      });


      // check if the menu still fits on resize
      angular.element($window).bind('resize', function() {
        $scope.$apply(calculateNavSettings());
      });

      // initial setup
      calculateNavSettings();

      function calculateNavSettings() {
        var windowHeight = $window.innerHeight;
        $scope.navSettings.isCompact = windowHeight < 1022;
        $scope.navSettings.isHidden = windowHeight < 799;
      }

      //nctid
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