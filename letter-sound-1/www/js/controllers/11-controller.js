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
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var readInstructions;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1;
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = false; //TODO set this to true
      Ctrl11.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);

      if (!angular.isUndefined(instructionsPlayer))
          instructionsPlayer.release();

      if (!angular.isUndefined(storyPlayer))
        storyPlayer.release();

      if (!angular.isUndefined(questionPlayer))
        questionPlayer.release();

      if (!angular.isUndefined(successPlayer))
        successPlayer.release();

      if (!angular.isUndefined(failurePlayer))
        failurePlayer.release();

      if (!angular.isUndefined(tapPlayer))
        tapPlayer.release();

      if (!angular.isUndefined(endPlayer))
        endPlayer.release();

    });

    Ctrl11.getConfiguration = function (level){
      Listening.getConfig(level).then(function(data){
        config = data;

        if (readInstructions){
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
        }
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
            Ctrl11.minReached();
          }
          else {
            if (level == Listening.getMaxLevel()){
              Ctrl11.maxReached();
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

    $scope.tapInstruction = function() {
      tapPlayer.play();
    };

    Ctrl11.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      $scope.$apply();
      level++;
      //TODO uncomment this after getting media assets
      // endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
      //   function(){
      //     endPlayer.release();
      //     $state.go('lobby');
      //   }, function(err){ $log.error(err);}
      // );
      //
      // endPlayer.play();
    };

    Ctrl11.maxReached = function(){
      level = 1;
      $state.go('lobby'); // TODO remove this line after getting media assets
      //TODO uncomment this after getting media assets
      // endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
      //   function(){ endPlayer.release(); $state.go('lobby'); },
      //   function(err){ $log.error(err);}
      // );
      //
      // endPlayer.play();
    };
  }]);

})();
