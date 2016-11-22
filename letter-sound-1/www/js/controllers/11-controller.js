(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('11Ctrl', ['$scope', '$log', '$state', '$timeout', 'Listening',
  'AssetsPath','ActividadesFinalizadasService', 'Util',
  function($scope, $log, $state, $timeout, Listening, AssetsPath,
    ActividadesFinalizadasService, Util) {
    $scope.activityId = 11;

    var Ctrl11 = Ctrl11 || {};

    var config;
    var stageNumber;
    var stageData;
    var level;

    //media players
    var instructionsPlayer;
    var storyPlayer;
    var questionPlayer;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1;
      level = Util.getLevel($scope.activityId) || 1;
      Ctrl11.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);
    });

    Ctrl11.getConfiguration = function (level){
      Listening.getConfig(level).then(function(data){
        config = data;

        //play instructions of activity
        instructionsPlayer = new Media(AssetsPath.sounds(config.instructionsPath),
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
      storyPlayer = new Media(AssetsPath.sounds(stageData.textSoundPath),
        function(){
          Ctrl11.readQuestion();
        },
        function(err){ $log.error(err); }
      );

      storyPlayer.play();
      $log.debug("playing story audio");
    };

    Ctrl11.setStage = function(stageNumber){
      if (stageNumber >= 1){
        stageData = config.stories[stageNumber-1];
      }else{
        $log.error("Invalid stage number");
      }
    };

    Ctrl11.readQuestion = function(){
      questionPlayer = new Media(AssetsPath.sounds(stageData.questionSoundPath),
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
      $scope.options = _.shuffle(stageData.options);
    };

    $scope.checkAnswer = function(value){
      if (value === stageData.answer){
        if (stageNumber < config.problems.length){
          stageNumber++;
          $timeout(function(){
            $scope.$apply(Ctrl11.setActivity());
          }, 1000);
        }
        else {
          if (level == Listening.getMinLevel() &&
            !ActividadesFinalizadasService.finalizada($scope.activityId)){
            // if player reached minimum for setting activity as finished
            ActividadesFinalizadasService.add($scope.activityId);
            level++;
            $state.go('lobby');
          }
          else {
            if (level == Listening.getMaxLevel()){
              level = 1;
              $state.go('lobby');
            }
            else {
              stageNumber = 1;
              Util.saveLevel($scope.activityId, ++level);
              Ctrl11.getConfiguration(level);
            }
          }
        }
      }
    };
  }]);

})();
