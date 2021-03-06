'use strict';
define(['lodash'], function(_) {
  var dependencies = [
    '$scope',
    '$q',
    '$stateParams',
    '$state',
    'AnalysisResource',
    'BenefitRiskService',
    'InterventionResource',
    'ModelResource',
    'OutcomeResource',
    'PageTitleService',
    'ProjectResource',
    'ProjectStudiesResource',
    'TrialverseResource',
    'UserService'
  ];
  var BenefitRiskController = function(
    $scope,
    $q,
    $stateParams,
    $state,
    AnalysisResource,
    BenefitRiskService,
    InterventionResource,
    ModelResource,
    OutcomeResource,
    PageTitleService,
    ProjectResource,
    ProjectStudiesResource,
    TrialverseResource,
    UserService
  ) {
    $scope.analysis = AnalysisResource.get($stateParams);
    $scope.alternatives = InterventionResource.query($stateParams);
    $scope.outcomes = OutcomeResource.query($stateParams);
    $scope.models = ModelResource.getConsistencyModels($stateParams);
    $scope.goToDefaultScenario = BenefitRiskService.goToDefaultScenario;
    $scope.goToModel = goToModel;
    $scope.userId = $stateParams.userUid;
    $scope.project = ProjectResource.get($stateParams);
    var studiesPromise = ProjectStudiesResource.query(_.pick($stateParams, ['projectId'])).$promise;

    $scope.editMode = {
      allowEditing: false
    };

    var promises = [
      $scope.analysis.$promise,
      $scope.alternatives.$promise,
      $scope.outcomes.$promise,
      $scope.models.$promise,
      $scope.project.$promise,
      studiesPromise
    ];

    $scope.loadingPromise = $q.all(promises).then(function(result) {
      var analysis = result[0];
      var alternatives = result[1];
      var outcomes = result[2];
      var models = result[3];
      var project = result[4];
      var studies = _.map(result[5], function(study) {
        return _.extend({}, study, {
          uuid: study.studyUri.split('/graphs/')[1]
        });
      });

      PageTitleService.setPageTitle('BenefitRiskController', analysis.title);
      UserService.isLoginUserId(project.owner.id).then(function(isUserOwner) {
        $scope.editMode.allowEditing = isUserOwner && !analysis.archived;
      });

      $scope.projectVersionUuid = project.datasetVersion.split('/versions/')[1];
      setDataSetOwner();

      var outcomeIds = _.map(outcomes, 'id');
      AnalysisResource.query({
        projectId: $stateParams.projectId,
        outcomeIds: outcomeIds
      }).$promise.then(function(networkMetaAnalyses) {
        networkMetaAnalyses = BenefitRiskService.addModels(networkMetaAnalyses, models, studies);
        outcomes = BenefitRiskService.buildOutcomes(analysis, outcomes, networkMetaAnalyses, studies);
        outcomes = _.partition(outcomes, ['dataType', 'network']);
        $scope.networkOWAs = outcomes[0];
        $scope.studyOutcomes = outcomes[1];
        $scope.isMissingBaseline = BenefitRiskService.hasMissingBaseline($scope.networkOWAs);
        $scope.hasNotRunModel = BenefitRiskService.hasNotRunModel($scope.networkOWAs);
      });

      $scope.alternatives = BenefitRiskService.getAlternativesWithInclusion(alternatives, analysis.interventionInclusions);
      $scope.analysis.interventionInclusions = BenefitRiskService.getIncludedAlternatives($scope.alternatives);
      $scope.outcomes = BenefitRiskService.getOutcomesWithInclusions(outcomes, analysis.benefitRiskNMAOutcomeInclusions);
    });

    function goToModel(model) {
      $state.go('model', {
        userUid: $scope.userId,
        projectId: $stateParams.projectId,
        analysisId: model.analysisId,
        modelId: model.id
      });
    }

    function setDataSetOwner() {
      TrialverseResource.get({
        namespaceUid: $scope.project.namespaceUid,
        version: $scope.project.datasetVersion
      }).$promise.then(function(dataset) {
        $scope.datasetOwnerId = dataset.ownerId;
      });
    }
  };
  return dependencies.concat(BenefitRiskController);
});
