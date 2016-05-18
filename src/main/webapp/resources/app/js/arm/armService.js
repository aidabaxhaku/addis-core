'use strict';
define(['lodash'], function(_) {
    var dependencies = ['StudyService', 'UUIDService'];
    var ArmService = function(StudyService, UUIDService) {

      function toFrontEnd(backEndArm) {
        var frontEndArm = {
          armURI: backEndArm['@id'],
          label: backEndArm.label,
        };

        if (backEndArm.comment) {
          frontEndArm.comment = backEndArm.comment;
        }

        return frontEndArm;
      }

      function toBackEnd(frontEndArm) {
        var backEndArm = {
          '@id': frontEndArm.armURI,
          label: frontEndArm.label,
        };

        if (frontEndArm.comment) {
          backEndArm.comment = frontEndArm.comment;
        }

        return backEndArm;
      }

      function queryItems() {
        return StudyService.getStudy().then(function(study) {
          return study.has_arm.map(toFrontEnd);
        });
      }

      function addItem(item) {
        return StudyService.getStudy().then(function(study) {
          var newArm = {
            '@id': 'http://trials.drugis.org/instances/' + UUIDService.generate(),
            '@type': 'ontology:Arm',
            label: item.label
          };

          if(item.comment) {
            newArm.comment = item.comment;
          }

          study.has_arm.push(newArm);
          return StudyService.save(study);
        });
      }

      function editItem(editArm) {
        return StudyService.getStudy().then(function(study) {
          study.has_arm = _.map(study.has_arm, function(arm) {
            if (arm['@id'] === editArm.armURI) {
              return toBackEnd(editArm);
            }
            return arm;
          });
          return StudyService.save(study);
        });
      }

      function reclassifyAsGroup(repairItem) {
        return StudyService.getStudy().then(function(study) {
          var armRemoved = _.remove(study.has_arm, function(arm) {
            return arm['@id'] === repairItem.armURI;
          })[0];

          armRemoved['@type'] = 'ontology:Group';

          study.has_group.push(armRemoved);

          return StudyService.save(study);
        });
      }

      function deleteItem(removeArm) {
        return StudyService.getStudy().then(function(study) {
          _.remove(study.has_arm, function(arm) {
            return arm['@id'] === removeArm.armURI;
          });
          return StudyService.save(study);
        });
      }

      return {
        queryItems: queryItems,
        addItem: addItem,
        editItem: editItem,
        reclassifyAsGroup: reclassifyAsGroup,
        deleteItem: deleteItem,
      };
    };

    return dependencies.concat(ArmService);
  });
