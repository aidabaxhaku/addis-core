'use strict';
define([], function() {

  var dependencies = ['$resource'];
  var IntermediateImportResource = function($resource) {

    return $resource(
      '/users/:userUid/datasets/:datasetUuid/intermediateImport/:intermediateImportId', {
        userUid: '@userUid',
        datasetUuid: '@datasetUuid',
        intermediateImportId: '@intermediateImportId'
      }, {
        import: {
          method: 'post'
        }
      }
    );
  };
  return dependencies.concat(IntermediateImportResource);
});