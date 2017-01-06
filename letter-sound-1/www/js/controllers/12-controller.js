(function() {
  'use strict';
  angular.module('saan.controllers')
    .controller('12Ctrl', function($scope,$sce, $state, $log, $timeout, RandomText,
      Util, Animations, Score, ActividadesFinalizadasService, AssetsPath) {
      $scope.activityId = 12;
      $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
      $scope.img = "";
      $scope.playedTexts = [];
      $scope.text = "";
      $scope.introText = "";
      $scope.helpText = "";
      $scope.endText = "";
      $scope.showReading = false;
      $scope.showQuestion = false;
      $scope.showOptions = false;
      $scope.showText = false;
      $scope.textSpeech = "";
      $scope.activityProgress = 0;
      $scope.checkingAnswer = false;


      var successPlayer;
      var failurePlayer;
      var Ctrl12 = Ctrl12 || {};
      Ctrl12.instructionsPlayer;
      Ctrl12.setUpLevel = function() {
        if (!Ctrl12.level) {
          Ctrl12.level = Util.getLevel($scope.activityId);
        }
      };

      Ctrl12.setUpScore = function() {
        Ctrl12.score = Util.getScore($scope.activityId);
      };

      Ctrl12.setUpStatus = function() {
        Ctrl12.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
      };

      Ctrl12.successFeedback = function() {
       if (!Ctrl12.speaking) {
          var successFeedback = RandomText.getSuccessAudio();
          $scope.textSpeech = successFeedback.text;
          $scope.showText = true;
          successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
            function success() {
              successPlayer.release();
             // $scope.showText = false;
             // $scope.speaking = false;
            },
            function error(err) {
              $log.error(err);
              successPlayer.release();
              $scope.showText = false;
              $scope.speaking = false;
              $scope.checkingWord = false;
            }
          );
          $scope.speaking = true;
          successPlayer.play();
       }
      }

      Ctrl12.errorFeedback = function() {
       if (!Ctrl12.speaking) {
          var failureFeedback = RandomText.getFailureAudio();
          $scope.textSpeech = failureFeedback.text;
          $scope.showText = true;
          failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
            function success() {
              failurePlayer.release();
              $scope.showText = false;
              $scope.speaking = false;
              $scope.$apply();
            },
            function error(err) {
              $log.error(err);
              failurePlayer.release();
              $scope.showText = false;
              $scope.speaking = false;
            });
          $scope.speaking = true;
          failurePlayer.play();
       }
      }

      Ctrl12.showDashboard = function(readInstructions) {
        Ctrl12.setUpLevel();
        Ctrl12.setUpScore();
        Ctrl12.setUpStatus();
        RandomText.text(Ctrl12.level, $scope.playedTexts).then(
          function success(data) {
            Ctrl12.setUpContextVariables(data);
            $timeout(function() {
              if (readInstructions) {
                $scope.showText = true;
                $scope.textSpeech = $scope.introText;
                $scope.speaking = true;
                Ctrl12.instructionsPlayer.play();
              } else {
                $scope.showText = false;
                $scope.speaking = false;
              }
            }, 1000);

          },
          function error(error) {
            $log.error(error);
          }
        );
      };

      Ctrl12.setUpContextVariables = function(data) {
        var textJson = data.textJson;
        var position = Util.getRandomNumber(textJson.questions.length);
        $scope.playedTexts.push(textJson.id);
        $scope.text = $sce.trustAsHtml(textJson.text);
        $scope.question = textJson.questions[position].question;
        $scope.answer = parseInt(textJson.questions[position].answer, 10);
        $scope.options = _.shuffle(textJson.questions[position].options);

        $scope.addScore = data.scoreSetUp.add;
        $scope.substractScore = data.scoreSetUp.substract;
        $scope.minScore = data.scoreSetUp.minScore;
        $scope.totalLevels = data.totalLevels;
        Ctrl12.finalizationLevel = data.finalizationLevel;
        Ctrl12.initialLevel = 1;
        $scope.checkingAnswer = false;

        $scope.helpText = data.instructionsPath.tap.text;
        Ctrl12.tapInstructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.tap.path,
          function success() {
            Ctrl12.tapInstructionsPlayer.release();
            $scope.showText = false;
            $scope.speaking = false;
            $scope.$apply();
          },
          function error(err) {
            $log.error(err);
            Ctrl12.tapInstructionsPlayer.release();
            $scope.showText = false;
            $scope.speaking = false;
          }
        );

        $scope.introText = data.instructionsPath.intro.text;
        Ctrl12.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
          function success() {
            Ctrl12.instructionsPlayer.release();
            $scope.showText = false;
            $scope.speaking = false;
            $scope.$apply();
          },
          function error(err) {
            $log.error(err);
            Ctrl12.instructionsPlayer.release();
          }
        );

        if (!Ctrl12.finished) {
        var endingFeedback = RandomText.getEndingAudio(0);
        $scope.endText = endingFeedback.text;
        Ctrl12.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path ,
          function success() {
            Ctrl12.endPlayer.release();
            //$scope.showText = false;
            //$scope.speaking = false;
            //$scope.$apply();
            $state.go('lobby');
          },
          function error(err) {
            $log.error(err);
            Ctrl12.endPlayer.release();
            Ctrl12.speaking = false;
          }
        );
       } else {
          endingFeedback = RandomText.getEndingAudio(1);
          $scope.endText = endingFeedback.text;
          Ctrl12.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
            function success() {
              Ctrl12.endPlayer.release();
              $scope.showText = false;
              $scope.speaking = false;
              $scope.$apply();
              $state.go('lobby');
            },
            function error(err) {
              $log.error(err);
              Ctrl12.endPlayer.release();
              Ctrl12.speaking = false;
            }
          );
        }
      };

      Ctrl12.success = function() {
        $scope.checkingAnswer = true;
        Ctrl12.successFeedback();
        $timeout(function() {
          Ctrl12.levelUp();
          if (!Ctrl12.finished) {
            Ctrl12.score = Score.update($scope.addScore, $scope.activityId, Ctrl12.finished);
            Ctrl12.finished = Ctrl12.level >= Ctrl12.finalizationLevel;
            if (Ctrl12.finished) {
              ActividadesFinalizadasService.add($scope.activityId);
              $scope.speaking = true;
              $scope.showText = true;
              $scope.textSpeech = $scope.endText;
              Ctrl12.endPlayer.play();
            } else {
              Ctrl12.showDashboard(false);
            }
          } else if (Ctrl12.level <= $scope.totalLevels) {
            Ctrl12.showDashboard(false);
          } else {
            Ctrl12.level = Ctrl12.initialLevel;
            $scope.speaking = true;
            $scope.showText = true;
            $scope.textSpeech = $scope.endText;
            Ctrl12.endPlayer.play();
          }
        }, 1500);
      };

      Ctrl12.error = function() {
        if (!Ctrl12.finished) {
          Ctrl12.score = Score.update(-$scope.substractScore, $scope.activityId, Ctrl12.finished);
        }
        Ctrl12.errorFeedback();
        $timeout(function() {
          $scope.checkingAnswer = false;
        }, 1000);
      };
      $scope.handleProgress = function(answer) {
        var isAnswerOk = $scope.answer === parseInt(answer, 10);
        console.log("isAnswerOk: ");
        console.log(isAnswerOk);
        if (isAnswerOk) {
          Ctrl12.success();
        } else {
          Ctrl12.error();

        }
      };

      Ctrl12.levelUp = function() {
        Ctrl12.level++;
      };

      Ctrl12.levelDown = function() {
        Ctrl12.level = (level > 1) ? (level - 1) : 1;
      };

      Ctrl12.releasePlayer = function (player) {
        if (player) {
          player.release();
        }
      };

      $scope.selectAnswer = function(id, name) {
        if (!$scope.checkingAnswer && !$scope.speaking){
          $scope.selectedObject = id;
          $scope.handleProgress(id);
        }
      };

      $scope.tapInstruction = function() {
       if (!$scope.speaking){
         $scope.speaking = true;
         $scope.textSpeech = $scope.helpText;
         $scope.showText = true;
         Ctrl12.tapInstructionsPlayer.play();
       }
      }

      //*************** ACTIONS **************************/
      $scope.$on('$ionicView.beforeEnter', function() {
        Ctrl12.showDashboard(true);
      });
      $scope.$on('$ionicView.beforeLeave', function() {
        Util.saveLevel($scope.activityId, Ctrl12.level);
        Ctrl12.releasePlayer(failurePlayer);
        Ctrl12.releasePlayer(successPlayer);
        Ctrl12.releasePlayer(Ctrl12.tapInstructionsPlayer);
        Ctrl12.releasePlayer(Ctrl12.instructionsPlayer);
        Ctrl12.releasePlayer(Ctrl12.endPlayer);
        Ctrl12.releasePlayer(Ctrl12.tapInstructionsPlayer);
      });
    });
})();
