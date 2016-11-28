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

    function getSuccessAudio(id) {
      return MAIN_PATH + id + "/audio/feedback/success/";
    }

    function getFailureAudio(id) {
      return MAIN_PATH + id + "/audio/feedback/failure/";
    }

    function getImgs(id) {
      return ASSETS_RELATIVE_PATH + id + "/";
    }
  }
})();
