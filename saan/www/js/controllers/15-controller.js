(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('15Ctrl', ['$scope', '$log', '$state', '$timeout', 'MathOralProblems',
  'AssetsPath', 'ActividadesFinalizadasService', 'Util',
  function ($scope, $log, $state, $timeout, MathOralProblems, AssetsPath,
    ActividadesFinalizadasService, Util) {

    var PROBLEM_TIMEOUT = 1000;

    $scope.activityId = 15;
    $scope.showQuestion = false;
    $scope.questionText = '';
    $scope.imgPath = AssetsPath.getImgs($scope.activityId);

    var Ctrl15 = Ctrl15 || {};
    var config;
    var level;
    var readInstructions;
    var problemRead;
    var instructionsPlayer;
    var problemPlayer;
    var questionPlayer;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var problemPath;
    var tapEnabled = true;
    var leaving = false;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
      $scope.coloredThioye = ActividadesFinalizadasService.finalizada(2);
      Ctrl15.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      leaving = true;
      Util.saveLevel($scope.activityId, level);

      if (!angular.isUndefined(instructionsPlayer))
        instructionsPlayer.release();

      if (!angular.isUndefined(problemPlayer))
        problemPlayer.release();

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

    Ctrl15.getConfiguration = function (level){
      MathOralProblems.getConfig(level).then(function(data){
        config = data;
        problemRead = false;
        $scope.showQuestion = false;

        if (readInstructions){
          $timeout(function() {
            readInstructions = false;
            var intro = config.instructions;
            //play instructions of activity
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + intro.path,
              function(){
                instructionsPlayer.release();
                $scope.showText = false;
                $timeout(function(){Ctrl15.setActivity();}, PROBLEM_TIMEOUT);
              },
              function(err){
                $log.error(err);
                instructionsPlayer.release();
                $scope.showText = false;
                $timeout(function(){Ctrl15.setActivity();}, PROBLEM_TIMEOUT);
              }
            );

            $scope.textSpeech = intro.text;
            $scope.showText = true;
            if (!leaving){
              instructionsPlayer.play();
            }
          }, PROBLEM_TIMEOUT);
        }
        else {
          $timeout(function(){Ctrl15.setActivity();}, 1500);
        }
      });
    };

    Ctrl15.setActivity = function(){
      $scope.options = [];
      problemPath = AssetsPath.getActivityAudio($scope.activityId) + config.level.problemPath;
      $scope.questionText = config.level.questionText;
      Ctrl15.showOptions();

      problemPlayer = new Media(problemPath,
        function(){
          if (!leaving){
            problemRead = true;
            $scope.showText = false;
            $scope.showQuestion = true;
            problemPlayer.release();
            $scope.$apply();
          }
        },
        function(err){
          $log.error(err);
          if (!leaving){
            problemRead = true;
            $scope.showText = false;
            problemPlayer.release();
            $scope.showQuestion = true;
            $scope.$apply();
          }
        }
      );

      $timeout(function(){
        if (!leaving){
          $scope.textSpeech = config.level.readingText;
          $scope.showText = true;
          problemPlayer.play();
        }
      }, PROBLEM_TIMEOUT);
    };

    Ctrl15.showOptions = function(){
      var options = [];
      options.push(config.level.answer);
      var number;
      var index;
      for (var i = 1; i < config.options; i++){
        var valid = false;
        while (!valid){
          number = Math.floor(Math.random() * 10);
          index = _.findIndex(options, function(option){return option === number;}, number);
          valid = (number !== 0 && index === -1);
        }
        options.push(number);
      }
      $scope.options = _.shuffle(options);
    };

    $scope.readQuestion = function(){
      if (tapEnabled){
        tapEnabled = false;
        questionPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId)+config.level.questionPath,
          function(){
            questionPlayer.release();
            $scope.showText = false;
            tapEnabled = true;
            $scope.$apply();
          },
          function(err){
            $log.error(err);
            questionPlayer.release();
            $scope.showText = false;
            tapEnabled = true;
            $scope.$apply();
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
          var successFeedback = MathOralProblems.getSuccessAudio();

          successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
            function(){
              tapEnabled = true;
              successPlayer.release();
              $scope.showText = false;
              $scope.$apply();

              if (level == MathOralProblems.getMinLevel() &&
                !ActividadesFinalizadasService.finalizada($scope.activityId)){
                Ctrl15.minReached();
              }
              else {
                if (level == MathOralProblems.getMaxLevel()){
                  Ctrl15.maxReached();
                }
                else {
                  level++;
                  Util.saveLevel($scope.activityId, level);
                  Ctrl15.getConfiguration(level);
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
          var failureFeedback = MathOralProblems.getFailureAudio();

          failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
            function(){
              failurePlayer.release();
              tapEnabled = true;
              $scope.showText = false;
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
      if (problemRead && tapEnabled){
        tapEnabled = false;
        problemPlayer = new Media(problemPath,
          function(){
            problemPlayer.release();
            $scope.showText = false;
            tapEnabled = true;
            $scope.$apply();
          },
          function(err){
            $log.error(err);
            problemPlayer.release();
            $scope.showText = false;
            tapEnabled = true;
            $scope.$apply();
          }
        );

        $scope.textSpeech = config.level.readingText;
        $scope.showText = true;
        problemPlayer.play();
      }
    };

    Ctrl15.minReached = function(){
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

    Ctrl15.maxReached = function(){
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
