(function() {
  'use strict';
  angular.module('saan.services')
  .factory('AssetsPath', AssetsPath);

  function AssetsPath($http, $log) {
    var MAIN_PATH = "/android_asset/www/assets/";
    var ASSETS_RELATIVE_PATH =  "assets/";
    return {
      getActivityAudio: getActivityAudio,
      getMainPath: getMainPath,
      getGeneralAudio: getGeneralAudio,
      getSuccessAudio: getSuccessAudio,
      getFailureAudio: getFailureAudio,
      getInstructionsAudio: getInstructionsAudio,
      getEndingAudio: getEndingAudio,
      getImgs: getImgs
    };

    function getActivityAudio(id) {
      return MAIN_PATH + id + "/audio/";
    }

    function getMainPath() {
      return MAIN_PATH;
    }

    function getGeneralAudio() {
      return MAIN_PATH + "audio/";
    }

    function getInstructionsAudio(id) {
      return getActivityAudio(id) + "instructions/";
    }

    function getSuccessAudio(id) {
      return getActivityAudio(id) + "feedback/success/";
    }

    function getFailureAudio(id) {
      return getActivityAudio(id) + "feedback/failure/";
    }

    function getEndingAudio(id) {
      return getActivityAudio(id) + "end/";
    }

    function getImgs(id) {
      return ASSETS_RELATIVE_PATH + id + "/";
    }
  }
})();
