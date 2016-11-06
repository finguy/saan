angular.module('saan.services')

.service('AssetsPath', function() {
  var MAIN_PATH = "/android_asset/www/";

    return {
      sounds: function(src) {
        return MAIN_PATH + "sounds/" + src;
      }
  };
});
