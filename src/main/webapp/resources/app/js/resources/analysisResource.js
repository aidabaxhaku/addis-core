'use strict';
define([], function() {
  var dependencies = ['$resource'];
  var AnalysisResource = function($resource) {
    return $resource('/projects/:projectId/analyses/:analysisId', {
      projectId: '@projectId',
      analysisId: '@id'
      }, {
      setPrimaryModel: {
        url: '/projects/:projectId/analyses/:analysisId/setPrimaryModel',
        method: 'POST'
      },
      setArchived: {
        url: '/projects/:projectId/analyses/:analysisId/setArchivedStatus',
        method: 'POST'
      }
    });
  };
  return dependencies.concat(AnalysisResource);
});
