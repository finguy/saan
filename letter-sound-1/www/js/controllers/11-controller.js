(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('11Ctrl', ['$scope', '$log', '$state', 'Listening', 'AssetsPath',
  function($scope, $log, $state, Listening, AssetsPath) {
    $scope.activityId = '11';
    var Ctrl11 = Ctrl11 || {};

    var config;
    var stageNumber;
    var stageData;
    var level;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = 1; //TODO: retrieve and load from local storage
      Ctrl11.getConfiguration(level);
    });

    Ctrl11.getConfiguration = function (level){
      Listening.getConfig(level).then(function(data){
        config = data;

        //play instructions of activity
        var instructionsPlayer = new Media(AssetsPath.sounds(config.instructionsPath),
          function(){
            Ctrl11.setActivity();
            instructionsPlayer.release();
          },
          function(err){ $log.error(err); }
        );

        instructionsPlayer.play();
        $log.debug("playing instructions");

      });
    };

    Ctrl11.setActivity = function(){
      $scope.options = [];

      Ctrl11.setStage(stageNumber);
      var storyPlayer = new Media(AssetsPath.sounds(stageData.textSoundPath),
        function(){
          Ctrl11.readQuestion();
        },
        function(err){ $log.error(err); }
      );

      storyPlayer.play();
      $log.debug("playing story audio");
    };

    Ctrl11.setStage = function(stageNumber){
      stageData = config.stories[stageNumber-1];
    };

    Ctrl11.readQuestion = function(){
      var questionPlayer = new Media(AssetsPath.sounds(stageData.questionSoundPath),
        function(){
          $scope.$apply(Ctrl11.showOptions());
          questionPlayer.release();
        },
        function(err){ $log.error(err); }
      );


      questionPlayer.play();
      $log.debug("playing question");
    };

    Ctrl11.showOptions = function(){
      //TODO use similar method to activity 12
    };
  }]);

})();
