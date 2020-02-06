'use strict';
define(['./intermediateImportArmsController',
        './intermediateImportEpochsController',
        './intermediateImportActivitiesController',
        './intermediateImportDesignTableController',
        './intermediateImportMeasurementMomentsController',
        './deleteCategoryController',
        'angular',
        './intermediateImportResource',
        './intermediateImportController'
    ],
    function(
        IntermediateImportArmsController,
        IntermediateImportEpochsController,
        IntermediateImportActivitiesController,
        IntermediateImportDesignTableController,
        IntermediateImportMeasurementMomentsController,
        DeleteCategoryController,
        angular,
        IntermediateImportResource,
        IntermediateImportController
    ) {
        var dependencies = [];
        return angular.module('addis.intermediateImport', dependencies)
            .controller('IntermediateImportArmsController', IntermediateImportArmsController)
            .controller('IntermediateImportEpochsController', IntermediateImportEpochsController)
            .controller('IntermediateImportActivitiesController', IntermediateImportActivitiesController)
            .controller('IntermediateImportDesignTableController', IntermediateImportDesignTableController)
            .controller('IntermediateImportMeasurementMomentsController', IntermediateImportMeasurementMomentsController)
            .controller('DeleteCategoryController', DeleteCategoryController)
            .controller('IntermediateImportController', IntermediateImportController)
            //resources
            .factory('IntermediateImportResource', IntermediateImportResource)

        ;
    });