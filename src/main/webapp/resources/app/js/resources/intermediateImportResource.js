'use strict';
define([], function () {
    var dependencies = ['$resource'];
    var IntermediateImportResource = function ($resource) {
        return $resource('/projects/:projectId/analyses/:analysisId'); //fix it
    };
    return dependencies.concat(IntermediateImportResource);
});