'use strict';
define(['./intermediateImportArmsController',
        './intermediateImportEpochsController',
        './intermediateImportActivitiesController',
        './intermediateImportMeasurementMomentsController',
        'angular'
    ],
    function(
        IntermediateImportArmsController,
        IntermediateImportEpochsController,
        IntermediateImportActivitiesController,
        IntermediateImportMeasurementMomentsController,
        angular
    ) {
        var dependencies = [];
        return angular.module('addis.intermediateImport', dependencies)
            .controller('IntermediateImportArmsController', IntermediateImportArmsController)
            .controller('IntermediateImportEpochsController', IntermediateImportEpochsController)
            .controller('IntermediateImportActivitiesController', IntermediateImportActivitiesController)
            .controller('IntermediateImportMeasurementMomentsController', IntermediateImportMeasurementMomentsController)
        ;
    });