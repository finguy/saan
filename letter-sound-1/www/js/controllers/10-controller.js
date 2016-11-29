(function() {
  'use strict';
  angular.module('saan.controllers')
    .controller('10Ctrl', function($scope, $log, $state, $timeout, RandomWordTen, TTSService,
      Util, Animations, Score, ActividadesFinalizadasService, AssetsPath) {
      $scope.activityId = 10;
      $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
      $scope.word = [];
      $scope.wordStr = "";
      $scope.rimes = [];
      $scope.selectedRimeLetters = [];
      $scope.words = [];
      $scope.img = "";
      $scope.playedWords = [];
      $scope.level = null;
      $scope.totalLevels = 1;
      $scope.activityProgress = 0;
      $scope.score = 0;
      $scope.draggedWord = false;
      $scope.imgsDragged = [];
      $scope.isWordOk = false;
      $scope.showText = false;
      $scope.textSpeech = "";
      $scope.speak = TTSService.speak;

      var Ctrl10 = Ctrl10 || {};
      Ctrl10.instructionsPlayer;

      Ctrl10.setUpLevel = function() {
        if (!$scope.level) {
          $scope.level = Util.getLevel($scope.activityId);
        }
      };

      Ctrl10.setUpScore = function() {
        $scope.score = Util.getScore($scope.activityId);

      };

      Ctrl10.setUpStatus = function() {
        $scope.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
      };

      Ctrl10.successFeedback = function() {
        var successFeedback = RandomWordTen.getSuccessAudio();
        $scope.textSpeech = successFeedback.text;
        $scope.showText = true;
        var successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function success() {
            successPlayer.release();
            $scope.showText = false;
          },
          function error(err) {
            $log.error(err);
            successPlayer.release();
            $scope.showText = false;
            $scope.checkingWord = false;
          }
        );
        successPlayer.play();
      };

      Ctrl10.errorFeedback = function() {
        var failureFeedback = RandomWordTen.getFailureAudio();
        $scope.textSpeech = failureFeedback.text;
        $scope.showText = true;
        var failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
          function success() {
            failurePlayer.release();
            $scope.showText = false;
            $scope.$apply();
          },
          function error(err) {
            $log.error(err);
            failurePlayer.release();
            $scope.showText = false;
          });
        failurePlayer.play();
      };

      Ctrl10.showDashboard = function(readInstructions) {
        Ctrl10.setUpLevel();
        Ctrl10.setUpScore();
        Ctrl10.setUpStatus();

        RandomWordTen.word($scope.level, $scope.playedWords).then(
          function success(data) {
            Ctrl10.setUpContextVariables(data);
            var readWordTimeout = (readInstructions) ? 2000 : 1000;
            $timeout(function() {
              if (readInstructions) {
                Ctrl10.instructionsPlayer.play();
                $timeout(function() {
                  $scope.speak($scope.wordStr);
                }, 3000);
              } else {
                $scope.speak($scope.wordStr);
              }
            }, readWordTimeout);

          },
          function error(error) {
            $log.error(error);
          }
        );
      };
      Ctrl10.setUpContextVariables = function(data) {
        var wordJson = data.wordJson;
        $scope.playedWords.push(wordJson.word);
        $scope.wordStr = wordJson.word;
        $scope.word = wordJson.word.split("");
        $scope.rimesStr = wordJson.rimes.join(",");
        var index = Util.getRandomNumber(wordJson.rimes.length);
        var rime = wordJson.rimes[index];
        $scope.selectedRimeLetters = rime.split("");
        $scope.isWordOk = false;
        var wordsToPlay = [];

        for (var j in data.allWords) {
          if (data.allWords[j]) {
            var ER = new RegExp(data.allWords[j], "i");
            if (!ER.test($scope.rimesStr)) {
              wordsToPlay.push({
                "letters": data.allWords[j].split(""),
                "word": data.allWords[j]
              });
            }
          }
        }

        wordsToPlay.length = 3;
        wordsToPlay.push({
          "word": rime,
          "letters": rime.split("")
        });
        $scope.words = _.shuffle(wordsToPlay);

        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        var imageIndex = Util.getRandomNumber(wordJson.imgs.length);
        $scope.img = wordJson.imgs[imageIndex];
        $scope.addScore = data.scoreSetUp.add;
        $scope.substractScore = data.scoreSetUp.substract;
        $scope.totalLevels = data.totalLevels;
        $scope.checkingNumber = false;
        Ctrl10.finalizationLevel = data.finalizationLevel;
        Ctrl10.initialLevel = 1;
        if ($scope.finished) {
          $scope.activityProgress = 100;
        } else {
          $scope.activityProgress = 100 * ($scope.level - 1) / $scope.totalLevels;
        }

        Ctrl10.instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + data.instructionsPath,
          function success() {
            Ctrl10.instructionsPlayer.release();
          },
          function error(err) {
            $log.error(err);
            Ctrl10.instructionsPlayer.release();
          }
        );
      };

      Ctrl10.success = function() {
        $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
        Ctrl10.successFeedback();
        $timeout(function() {
          $scope.draggedWord = false;
          Ctrl10.levelUp();
          if (!$scope.finished) {
            $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
            $scope.finished = $scope.level >= Ctrl10.finalizationLevel;
            if ($scope.finished) {
              ActividadesFinalizadasService.add($scope.activityId);
              $state.go('lobby');
            } else {
              Ctrl10.showDashboard(true);
            }
          } else if ($scope.level <= $scope.totalLevels) {
            Ctrl10.showDashboard(true);
          } else {
            $scope.level = Ctrl10.initialLevel;
            $state.go('lobby');
          }
        }, 1000);
      };

      Ctrl10.error = function() {
        if (!$scope.finished) {
          $scope.score = Score.update(-$scope.substractScore, $scope.activityId, $scope.finished);
        }
        Ctrl10.errorFeedback();
      };

      $scope.handleProgress = function(isWordOk) {
        $scope.isWordOk = isWordOk;
        if (isWordOk) {
          Ctrl10.success();
        } else {
          Ctrl10.error();
        }
      };

      Ctrl10.levelUp = function() {
        $scope.level++;
      };

      Ctrl10.levelDown = function() {
        $scope.level = (level > 1) ? (level - 1) : 1;
      };

      //*************** ACTIONS **************************/
      $scope.$on('$ionicView.beforeEnter', function() {
        Ctrl10.showDashboard(true);
      });
      $scope.$on('$ionicView.beforeLeave', function() {
        Util.saveLevel($scope.activityId, $scope.level);
      });
    });
})();
