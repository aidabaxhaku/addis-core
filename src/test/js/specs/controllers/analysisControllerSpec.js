define(['angular', 'angular-mocks', 'controllers'], function() {  describe("The analysisController", function() {    var scope,      mockWindow,      currentAnalysis,      projectsResource,      outcomeResource,      select2UtilService,      interventionResource,      trialverseStudyResource,      problemResource,      analysisService,      mockOutcome1,      mockOutcome2,      mockIntervention1,      mockIntervention2,      mockAnalysis,      mockProject,      mockStudy1,      mockStudy2,      mockStudies,      mockOutcomes,      mockInterventions,      mockProblem,      projectDeferred,      analysisDeferred,      scenarioDeferred,      ctrl,      state,      problemDeferred,      DEFAULT_VIEW = 'DEFAULT_VIEW  ';    beforeEach(module('addis.controllers'));    beforeEach(inject(function($controller, $q, $rootScope) {      mockOutcome1 = {        id: 1,        name: 'mockOutcome1',        semanticOutcome: 'mockSemantic1'      };      mockOutcome2 = {        id: 2,        name: 'mockOutcome2',        semanticOutcome: 'mockSemantic2'      };      mockIntervention1 = {        id: 1,        name: 'mockIntervention1',        semanticIntervention: 'mockSemantic1'      };      mockIntervention2 = {        id: 2,        name: 'mockIntervention2',        semanticIntervention: 'mockSemantic2'      };      mockAnalysis = {        name: 'analysisName',        type: 'Single-study Benefit-Risk',        study: null,        selectedOutcomes: [mockOutcome1],        selectedInterventions: [mockIntervention1],        $save: function() {}      };      mockProject = {        id: 1,        name: 'projectName',        owner: {          id: 1        }      };      mockStudy1 = {        id: 1      };      mockStudy2 = {        id: 2      };      mockProblem = {        alternatives: []      };      mockStudies = [mockStudy1, mockStudy2];      mockOutcomes = [mockOutcome1, mockOutcome2];      mockInterventions = [mockIntervention1, mockIntervention2];      var mockStateParams = {        projectId: mockProject.id,        analysisId: mockAnalysis.id      };      scope = $rootScope;      scope.$parent = {};      state = jasmine.createSpyObj('state', ['go']);      projectsResource = jasmine.createSpyObj('projectResource', ['get']);      projectsResource.get.and.returnValue(mockProject);      outcomeResource = jasmine.createSpyObj('outcomeResource', ['query']);      outcomeResource.query.and.returnValue(mockOutcomes);      interventionResource = jasmine.createSpyObj('interventionResource', ['query']);      interventionResource.query.and.returnValue(mockInterventions);      select2UtilService = jasmine.createSpyObj('select2UtilService', ['idsToObjects', 'objectsToIds']);      select2UtilService.objectsToIds.and.returnValue(['1']);      trialverseStudyResource = jasmine.createSpyObj('trialverseStudyResource', ['query', 'get']);      trialverseStudyResource.query.and.returnValue(mockStudies);      problemResource = jasmine.createSpyObj('problemResource', ['get']);      problemResource.get.and.returnValue(mockProblem);      analysisService = jasmine.createSpyObj('analysisService', ['createProblem', 'getDefaultScenario']);      scenarioDeferred = $q.defer();      analysisService.getDefaultScenario.and.returnValue(scenarioDeferred.promise);      analysisService.createProblem.and.returnValue(scenarioDeferred.promise);      projectDeferred = $q.defer();      mockProject.$promise = projectDeferred.promise;      analysisDeferred = $q.defer();      mockAnalysis.$promise = analysisDeferred.promise;      problemDeferred = $q.defer();      mockProblem.$promise = problemDeferred.promise;      mockWindow = {        config: {          user: {            id: 1          }        }      };      currentAnalysis = mockAnalysis;      spyOn(mockAnalysis, '$save');      ctrl = $controller('AnalysisController', {        $scope: scope,        $stateParams: mockStateParams,        $state: state,        $q: $q,        $window: mockWindow,        'ProjectsResource': projectsResource,        'OutcomeResource': outcomeResource,        'InterventionResource': interventionResource,        'Select2UtilService': select2UtilService,        'TrialverseStudyResource': trialverseStudyResource,        'ProblemResource': problemResource,        'AnalysisService': analysisService,        'DEFAULT_VIEW' : DEFAULT_VIEW,        'currentAnalysis' : currentAnalysis      });    }));    it('should only make loading.loaded true when both project and analysis are loaded', function() {      expect(scope.$parent.loading.loaded).toBeFalsy();      projectDeferred.resolve();      scope.$apply();      expect(scope.$parent.loading.loaded).toBeFalsy();      analysisDeferred.resolve();      scope.$apply();      expect(scope.$parent.loading.loaded).toBeTruthy();    });    it('should set isProblemDefined to be false when the controller is initialized ', function() {      expect(scope.isProblemDefined).toBeFalsy();    });    it('should set isProblemDefined to be false when the project and analysis have been loaded, but the analysis has no problem defined',     function() {      mockAnalysis.problem = null;      projectDeferred.resolve();      analysisDeferred.resolve();      scope.$apply();      expect(scope.isProblemDefined).toBeFalsy();    });    it('should set isProblemDefined to be true when the project and analysis have been loaded, and the analysis has a problem defined',     function() {      mockAnalysis.problem = {mock: 'problem'};      projectDeferred.resolve();      analysisDeferred.resolve();      scope.$apply();      expect(scope.isProblemDefined).toBeTruthy();    });    it('should place a list of outcomes on the scope when it is loaded', function() {      expect(scope.outcomes).toEqual(mockOutcomes);    });    it('should place a list of interventions on the scope when it is loaded', function() {      expect(scope.interventions).toEqual(mockInterventions);    });    it('should not set project and analysis information before they are loaded', function() {      expect(scope.selectedOutcomeIds).toEqual([]);      expect(scope.selectedInterventionIds).toEqual([]);    });    it('should place project information on the scope', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.project).toEqual(mockProject);    });    it('should place analysis information on the scope', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.analysis).toEqual(mockAnalysis);    });    it('should place selectedOutcomeId information on the scope', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.selectedOutcomeIds).toEqual(['1']);    });    it('should place selectedOutcomeId information on the scope', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.selectedInterventionIds).toEqual(['1']);    });    it('should place a list of studies on the scope when the project is loaded', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.studies).toEqual(mockStudies);    });    it('should save the analysis when the selected outcomes change', function() {      select2UtilService.idsToObjects.and.returnValue([mockOutcome1, mockOutcome2]);      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      scope.selectedOutcomeIds = ['1', '2'];      scope.$apply();      scope.dirty = true;      expect(scope.analysis.selectedOutcomes).toEqual([mockOutcome1, mockOutcome2]);      expect(scope.analysis.$save).toHaveBeenCalled();    });    it('should save the analysis when the selected interventions change', function() {      select2UtilService.idsToObjects.and.returnValue([mockIntervention1, mockIntervention2]);      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      scope.selectedInterventionIds = ['1', '2'];      scope.$apply();      expect(scope.analysis.selectedInterventions).toEqual([mockIntervention1, mockIntervention2]);      expect(scope.analysis.$save).toHaveBeenCalled();    });    it('should save the analysis when the selected study changes', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      scope.analysis.studyId = 1;      scope.$apply();      expect(scope.analysis.$save).toHaveBeenCalled();    });    it('should allow editing owned analyses', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.project.owner.id).toEqual(mockWindow.config.user.id);      expect(scope.editMode.disableEditing).toBeFalsy();    });    it('should not allow editing of non-owned analyses', function() {      mockProject.owner = {        id: 2      };      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.editMode.disableEditing).toBeTruthy();    });    it('should not allow editing of an analysis with a defined problem', function() {      mockAnalysis.problem = {        foo: 'bar'      };      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.editMode.disableEditing).toBeTruthy();    });    it('should make createProblem accessible once the analysis and project are available.', function() {      expect(scope.createProblem).toBeUndefined();      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      expect(scope.createProblem).toBeDefined();    });    it('should call the analysisService.createProblem when createProblem is called', function() {      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      scope.createProblem(mockAnalysis);      expect(analysisService.createProblem).toHaveBeenCalledWith(mockAnalysis);    });    it('should go to the default view when goToOverView is called', function() {      var mockScenario = {scenarioId: 1};      analysisDeferred.resolve();      projectDeferred.resolve();      scope.$apply();      scope.goToDefaultScenarioView();      scenarioDeferred.resolve(mockScenario);      scope.$apply();      expect(analysisService.getDefaultScenario).toHaveBeenCalled();      expect(state.go).toHaveBeenCalledWith(DEFAULT_VIEW, {scenarioId: mockScenario.id});    });  });});