(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('11Ctrl', ['$scope', '$log', '$state', '$timeout', 'Listening',
  'AssetsPath','ActividadesFinalizadasService', 'Util',
  function($scope, $log, $state, $timeout, Listening, AssetsPath,
    ActividadesFinalizadasService, Util) {

    var STORY_TIMEOUT = 1000;

    $scope.activityId = 11;
    $scope.showQuestion = false;
    $scope.questionText = '';
    $scope.imgPath = AssetsPath.getImgs($scope.activityId);

    var Ctrl11 = Ctrl11 || {};
    var config;
    var level;
    var readInstructions;
    var storyRead;

    var instructionsPlayer;
    var storyPlayer;
    var questionPlayer;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var storyPath;
    var tapEnabled = true;
    var leaving = false;


    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true; //TODO set this to true
      $scope.coloredThioye = ActividadesFinalizadasService.finalizada(2);
      Ctrl11.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      leaving = true;
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
        storyRead = false;
        $scope.showQuestion = false;

        if (readInstructions){
          $timeout(function() {
            if (!leaving){
              readInstructions = false;
              var intro = config.instructions;
              //play instructions of activity
              instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + intro.path,
                function(){
                  instructionsPlayer.release();
                  $scope.showText = false;
                  Ctrl11.setActivity();
                },
                function(err){
                  $log.error(err);
                  instructionsPlayer.release();
                  $scope.showText = false;
                  Ctrl11.setActivity();
                }
              );

              $scope.textSpeech = intro.text;
              $scope.showText = true;
              instructionsPlayer.play();
            }
          }, STORY_TIMEOUT);
        }
        else {
          Ctrl11.setActivity();
        }
      });
    };

    Ctrl11.setActivity = function(){

        $scope.options = [];
        storyPath = AssetsPath.getActivityAudio($scope.activityId) + config.level.storyPath;
        $scope.questionText = config.level.questionText;
        $scope.options = _.shuffle(config.level.options);

        storyPlayer = new Media(storyPath,
          function(){
            if (!leaving){
              storyRead = true;
              $scope.showText = false;
              $scope.showQuestion = true;
              storyPlayer.release();
              $scope.$apply();
            }
          },
          function(err){
            if (!leaving){
              $log.error(err);
              storyRead = true;
              $scope.showText = false;
              storyPlayer.release();
              $scope.showQuestion = true;
              $scope.$apply();
            }
          }
        );

        $timeout(function(){
          if (!leaving){
            $scope.textSpeech = config.level.readingText;
            $scope.showText = true;
            storyPlayer.play();
          }
        }, STORY_TIMEOUT);
    };

    $scope.readQuestion = function(){
      if (tapEnabled){
        tapEnabled = false;
        questionPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId)+config.level.questionPath,
          function(){
            questionPlayer.release();
            $scope.showText = false;
            $scope.$apply();
            tapEnabled = true;
          },
          function(err){
            $log.error(err);
            questionPlayer.release();
            $scope.showText = false;
            $scope.$apply();
            tapEnabled = true;
          }
        );

        $scope.textSpeech = config.level.readingText;
        $scope.showText = true;
        questionPlayer.play();
      }
    };

    $scope.checkAnswer = function(value){
      if (tapEnabled){
        tapEnabled = false;
        if (value === config.level.answer){
          var successFeedback = Listening.getSuccessAudio();

          successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
            function(){
              tapEnabled = true;
              successPlayer.release();
              $scope.showText = false;
              $scope.$apply();

              if (level == Listening.getMinLevel() &&
                !ActividadesFinalizadasService.finalizada($scope.activityId)){
                Ctrl11.minReached();
              }
              else {
                if (level == Listening.getMaxLevel()){
                  Ctrl11.maxReached();
                }
                else {
                  level++;
                  Util.saveLevel($scope.activityId, level);
                  Ctrl11.getConfiguration(level);
                }
              }
            },
            function (err){
              $log.error(err);
              successPlayer.release();
              $scope.showText = false;
              tapEnabled = true;
              $scope.$apply();
            }
          );

          $scope.textSpeech = successFeedback.text;
          $scope.showText = true;
          successPlayer.play();
        }
        else {
          var failureFeedback = Listening.getFailureAudio();

          failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
            function(){
              failurePlayer.release();
              $scope.showText = false;
              tapEnabled = true;
              $scope.$apply();
            },
            function(err){
              failurePlayer.release();
              $log.error(err);
              $scope.showText = false;
              tapEnabled = true;
              $scope.$apply();
            }
          );

          $scope.textSpeech = failureFeedback.text;
          $scope.showText = true;
          failurePlayer.play();
        }
      }
    };

    $scope.tapInstruction = function() {
      if (storyRead && tapEnabled){
        tapEnabled = false;
        storyPlayer = new Media(storyPath,
          function(){
            storyPlayer.release();
            $scope.showText = false;
            $scope.$apply();
            tapEnabled = true;
          },
          function(err){
            $log.error(err);
            storyPlayer.release();
            $scope.showText = false;
            $scope.$apply();
            tapEnabled = true;
          }
        );

        $scope.textSpeech = config.level.readingText;
        $scope.showText = true;
        storyPlayer.play();
      }
    };

    Ctrl11.minReached = function(){
      tapEnabled = false;
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);

      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
        function(){
          level++;
          endPlayer.release();
          $state.go('lobby');
        },
        function(err){
          $log.error(err);
          endPlayer.release();
          $state.go('lobby');
        }
      );

      $scope.textSpeech = config.ending[0].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

    Ctrl11.maxReached = function(){
      ActividadesFinalizadasService.addMax($scope.activityId);
      tapEnabled = false;
      level = 1;
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
        function(){
          endPlayer.release();
          $state.go('lobby');
        },
        function(err){
          $log.error(err);
          endPlayer.release();
          $state.go('lobby');}
      );

      $scope.textSpeech = config.ending[1].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };
  }]);

})();
