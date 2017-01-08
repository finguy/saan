(function() {
  'use strict';
  angular.module('saan.services')
  .factory('AppSounds', AppSounds);

  function AppSounds($log, AssetsPath) {
    var tapPlayer;
    return {
      playTap: playTap
    };

    function playTap() {
      tapPlayer = tapPlayer || new Media(AssetsPath.getGeneralAudio()+"tap.wav");
      tapPlayer.play();
    }
  }
})();
