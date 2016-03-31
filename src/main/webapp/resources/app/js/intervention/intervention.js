'use strict';

define(function (require) {
  var angular = require('angular');
  var dependencies = ['ngResource'];

  return angular.module('addis.interventions',
    dependencies)
    // controllers
    .controller('AddInterventionController', require('intervention/addInterventionController'))

    //services
    .factory('UnitNamesService', require('intervention/unitNamesService'))

    //directives
    .directive('constraint', require('intervention/constraintDirective'))

    ;
});
