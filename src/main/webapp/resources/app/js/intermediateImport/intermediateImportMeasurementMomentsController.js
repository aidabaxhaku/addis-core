'use strict';
define(['jquery'], function($) {
  var dependencies = [
    '$scope',
    '$stateParams',
    '$state',
    '$modal',
    '$filter',
    'MeasurementMomentService',
    'GraphResource',
    'StudyService',
    'UserResource',
    'DurationService',
    'EpochService'
  ];
  var IntermediateImportMeasurementMomentsController = function(
    $scope,
    $stateParams,
    $state,
    $modal,
    $filter,
    MeasurementMomentService,
    GraphResource,
    StudyService,
    UserResource,
    DurationService,
    EpochService
  ) {
    //init
    $scope.measurementMoments = [];
    $scope.study = {};
    $scope.user = UserResource.get($stateParams);
    $scope.studyGraphUuid = $stateParams.studyGraphUuid;
    $scope.alert = "";

    //functions
    $scope.next = next;
    $scope.previous = previous;
    $scope.addMeasurementMoment = addMeasurementMoment;
    $scope.deleteMeasurementMoment = deleteMeasurementMoment;
    $scope.mergeMeasurementMoment = mergeMeasurementMoment;
    $scope.editMeasurementMoment = editMeasurementMoment;

    function next() {
      $state.go('dataset.study', {
        userUid: $stateParams.userUid,
        datasetUuid: $stateParams.datasetUuid,
        studyGraphUuid: $stateParams.studyGraphUuid
      });
    }

    function previous() {
      $state.go('intermediate-activity', $stateParams);
    }

    function addMeasurementMoment(measurementMoment) {
      $modal.open({
        scope: $scope,
        templateUrl: '../measurementMoment/editMeasurementMoment.html',
        controller: 'MeasurementMomentController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          actionType: function() {
            return 'Add';
          },
          item: function() {
            return measurementMoment;
          }
        }
      });
    }

    function deleteMeasurementMoment(measurementMoment) {
      return MeasurementMomentService.deleteItem(measurementMoment).then(function() {
        reloadStudyModel();
      });
    }

    function mergeMeasurementMoment(measurementMoment) {
      $modal.open({
        scope: $scope,
        templateUrl: '../measurementMoment/repairMeasurementMoment.html',
        controller: 'MeasurementMomentController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          actionType: function() {
            return 'Merge';
          },
          item: function() {
            return measurementMoment;
          }
        }
      });
    }

    function editMeasurementMoment() {
      $modal.open({
        scope: $scope,
        templateUrl: '../measurementMoment/editMeasurementMoment.html',
        controller: 'MeasurementMomentController',
        resolve: {
          callback: function() {
            return reloadStudyModel;
          },
          actionType: function() {
            return 'Edit';
          },
          item: function() {
            return {};
          }
        }
      });
    }

    reloadStudyModel();

    function reloadStudyModel() {
      StudyService.getStudy().then(function(study) {
        fillView(study);
      });
      MeasurementMomentService.queryItems().then(function(measurementMoments) {
        $scope.measurementMoments = measurementMoments;
        console.log('measurementMoments ' + measurementMoments)
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
  };
  return dependencies.concat(IntermediateImportMeasurementMomentsController);
});