(function() {
  'use strict';
  angular.module('saan.controllers')
    .controller('10Ctrl', function($scope, $log, $state, $timeout, RandomWordTen,
      Util, Animations, Score, ActividadesFinalizadasService, AssetsPath, AppSounds) {
      $scope.activityId = 10;
      $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
      $scope.word = "";
      $scope.rimes = [];
      $scope.words = [];
      $scope.playedWords = [];
      $scope.rimesDragged = [];
      $scope.isWordOk = false;
      $scope.showText = false;
      $scope.speaking = false;
      $scope.textSpeech = "";
      $scope.introText = "";
      $scope.helpText = "";
      $scope.endText = "";
      $scope.speaking = true;
      var successPlayer;
      var failurePlayer;
      var dragChecked = false;
      var Ctrl10 = Ctrl10 || {};
      Ctrl10.instructionsPlayer;

      Ctrl10.setUpLevel = function() {
       if (!Ctrl10.level) {
           Ctrl10.level = Util.getLevel($scope.activityId);
       }
      };

      Ctrl10.setUpStatus = function() {
        Ctrl10.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
      };

      Ctrl10.setUpScore = function() {
        Ctrl10.score = Util.getScore($scope.activityId);
      };

      Ctrl10.successFeedback = function() {
       //Success player
       if (successPlayer) {
        successPlayer.release();
       }
       var successFeedback = RandomWordTen.getSuccessAudio();
       successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
         function success() {
           successPlayer.release();
           $scope.showText = false;
           $scope.speaking = false;
           $scope.$apply();
         },
         function error(err) {
           $log.error(err);
           successPlayer.release();
           $scope.showText = false;
           $scope.checkingWord = false;
         }
       );

         //Rime player
         if (Ctrl10.rimeWordPlayer) {
          Ctrl10.rimeWordPlayer.release();
         }
         Ctrl10.rimeWordPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + "words/" + $scope.rimesDragged[0].word + ".mp3",
           function success() {
             Ctrl10.rimeWordPlayer.release();
             //$scope.speaking = false;
             $scope.textSpeech = successFeedback.text;
             $scope.showText = true;
             successPlayer.play();
             $scope.$apply();
           },
           function error(err) {
             $log.error(err);
             Ctrl10.rimeWordPlayer.release();
             Ctrl10.speaking = false;
           }
         );


          $scope.speaking = true;
          Ctrl10.wordPlayer.play();
          $timeout(function () {
             $scope.speaking = true;
             Ctrl10.rimeWordPlayer.play();
          },1000);
      };

      Ctrl10.errorFeedback = function() {
        var failureFeedback = RandomWordTen.getFailureAudio();
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
          });
        $scope.speaking = true;
        failurePlayer.play();
      };

      Ctrl10.setUpStatus();
      Ctrl10.setUpLevel();
      Ctrl10.setUpScore();

      Ctrl10.showDashboard = function(readInstructions) {

        RandomWordTen.word(Ctrl10.level, $scope.playedWords).then(
          function success(data) {
            Ctrl10.setUpContextVariables(data);
            var readWordTimeout = (readInstructions) ? 2000 : 1000;
            $timeout(function() {
              if (!Ctrl10.beforeLeave){
                if (readInstructions) {
                  $scope.speaking = true;
                  $scope.showText = true;
                  $scope.textSpeech = $scope.introText;
                  Ctrl10.instructionsPlayer.play();
                } else {
                 // $scope.speaking = true;
                  Ctrl10.wordPlayer.play();
                }
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
        $scope.rimesDragged = [];
        $scope.word = wordJson.word;
        $scope.wordAudio = wordJson.audio;
        $scope.rimesStr = wordJson.rimes.join(",");
        var index = Util.getRandomNumber(wordJson.rimes.length);
        $scope.selectedRime = wordJson.rimes[index];
        $scope.isWordOk = false;
        var wordsToPlay = [];
        for (var j in data.allWords) {
          if (data.allWords[j]) {
            var ER = new RegExp(data.allWords[j], "i");
            if (!ER.test($scope.rimesStr) && data.allWords[j] !== $scope.word) {
              wordsToPlay.push({
                "word": data.allWords[j]
              });
            }
          }
        }

        wordsToPlay.length = 3;
        wordsToPlay.push({
          "word": $scope.selectedRime
        });
        $scope.words = _.shuffle(wordsToPlay);

        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        $scope.addScore = data.scoreSetUp.add;
        $scope.substractScore = data.scoreSetUp.substract;
        Ctrl10.totalLevels = data.totalLevels;
        $scope.checkingNumber = false;
        Ctrl10.finalizationLevel = data.finalizationLevel;
        Ctrl10.initialLevel = 1;
        $scope.introText = data.instructionsPath.intro.text;

        //Initial instructions player
        if (!Ctrl10.instructionsPlayer) {
          Ctrl10.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
            function success() {
              Ctrl10.instructionsPlayer.release();
             if (!Ctrl10.beforeLeave) {
                $timeout(function() {
                  Ctrl10.wordPlayer.play();
                },500);
              }

              $scope.showText = false;
              $scope.speaking = false;
              $scope.$apply();
            },
            function error(err) {
              $log.error(err);
              Ctrl10.instructionsPlayer.release();
              $scope.showText = false;
              $scope.speaking = false;
            }
          );
        }

        //Tap player
        if (!Ctrl10.tapInstructionsPlayer) {
          $scope.helpText = data.instructionsPath.tap.text;
          Ctrl10.tapInstructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.tap.path,
            function success() {
              Ctrl10.tapInstructionsPlayer.release();
              $scope.showText = false;
              $scope.speaking = false;
              $scope.$apply();
            },
            function error(err) {
              $log.error(err);
              Ctrl10.tapInstructionsPlayer.release();
              $scope.showText = false;
              $scope.speaking = false;
            }
          );
        }

        //End player
        if (!Ctrl10.finished) {
         if (Ctrl10.endPlayer) {
          Ctrl10.endPlayer.release();
         }
        var endingFeedback = RandomWordTen.getEndingAudio(0);
        $scope.endText = endingFeedback.text;
        Ctrl10.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path ,
          function success() {
            Ctrl10.endPlayer.release();
            $scope.speaking = false;
            $scope.$apply();
            $state.go('lobby');
          },
          function error(err) {
            $log.error(err);
            Ctrl10.endPlayer.release();
            Ctrl10.speaking = false;
          }
        );
       } else {
          endingFeedback = RandomWordTen.getEndingAudio(1);
          $scope.endText = endingFeedback.text;
          if (Ctrl10.endPlayer) {
           Ctrl10.endPlayer.release();
          }
          Ctrl10.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
            function success() {
              Ctrl10.endPlayer.release();
              $scope.speaking = false;
              $scope.$apply();
              $state.go('lobby');
            },
            function error(err) {
              $log.error(err);
              Ctrl10.endPlayer.release();
              Ctrl10.speaking = false;
            }
          );
       }

       //Word player
       if (Ctrl10.wordPlayer) {
        Ctrl10.wordPlayer.release();
       }
       Ctrl10.wordPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + "words/" + $scope.wordAudio,
         function success() {
           Ctrl10.wordPlayer.release();
           //$scope.speaking = false;
           $scope.$apply();
         },
         function error(err) {
           $log.error(err);
          // Ctrl10.wordPlayer.release();
           Ctrl10.speaking = false;
         }
       );
     };

      Ctrl10.success = function() {
        Ctrl10.successFeedback();
        $timeout(function() {
          if (!Ctrl10.finished) {
            Ctrl10.levelUp();
            Ctrl10.finished = Ctrl10.level > Ctrl10.finalizationLevel;
            Ctrl10.score = Score.update($scope.addScore, $scope.activityId, Ctrl10.finished);
            if (Ctrl10.finished) {
              ActividadesFinalizadasService.add($scope.activityId);
              $scope.speaking = true;
              $scope.showText = true;
              $scope.textSpeech = $scope.endText;
              Ctrl10.endPlayer.play();
            } else {
              Ctrl10.showDashboard(false);
            }
          } else if (Ctrl10.level < (Ctrl10.totalLevels -1 )) {
            Ctrl10.levelUp();
            Ctrl10.showDashboard(false);
          } else {
            Ctrl10.level = Ctrl10.initialLevel;
            $scope.speaking = true;
            $scope.showText = true;
            $scope.textSpeech = $scope.endText;
            Ctrl10.endPlayer.play();
          }
        }, 4000);
      };

      Ctrl10.error = function() {
        if (!Ctrl10.finished) {
          Ctrl10.finished = Score.update(-$scope.substractScore, $scope.activityId, Ctrl10.finished);
        }
        Ctrl10.errorFeedback();
      };

      $scope.handleProgress = function(isWordOk) {
        $scope.isWordOk = isWordOk;
        if (isWordOk) {
          AppSounds.playTap();
          Ctrl10.success();
        } else {
          Ctrl10.error();
        }
      };

      Ctrl10.levelUp = function() {
        Ctrl10.level = (Ctrl10.level + 1 ) % Ctrl10.totalLevels;
        if (Ctrl10.level === 0) {
          Ctrl10.level = 1;
        }
      };

      Ctrl10.levelDown = function() {
        Ctrl10.level = (Ctrl10.level > 1) ? (level - 1) : 0;
      };

      //Drag
      $scope.sortableSourceOptions = {
        containment: '.activity10',
        containerPositioning: 'relative',
        clone: false,
        dragEnd: function(eventObj) {
          if (dragChecked && !$scope.sortableTargetOptions.accept(eventObj.source.itemScope, eventObj.dest.sortableScope)){
            $scope.handleProgress(false);
          }
          dragChecked = false;
        },
        itemMoved: function (eventObj) {
          $scope.handleProgress(true);
        },
        accept: function(sourceItemHandleScope, destSortableScope){
          return false;
        }
      };

      //Drop
      $scope.sortableTargetOptions = {
        accept: function(sourceItemHandleScope, destSortableScope){
          dragChecked = true;
          var ER = new RegExp(sourceItemHandleScope.modelValue.word,"i");
          return ER.test($scope.rimesStr);
        },
      };

      $scope.tapInstructions = function() {
       if (!$scope.speaking) {
        $scope.speaking = true;
        $scope.showText = true;
        $scope.textSpeech = $scope.helpText;
        Ctrl10.tapInstructionsPlayer.play();
       }
      };

      $scope.readWord = function() {
       if (!$scope.speaking) {         
         Ctrl10.wordPlayer.play();
       }
      }

      Ctrl10.releasePlayer = function (player) {
        if (player) {
          player.release();
        }
      };

      //*************** ACTIONS **************************/
      $scope.$on('$ionicView.beforeEnter', function() {
        Ctrl10.showDashboard(true);
      });
      $scope.$on('$ionicView.beforeLeave', function() {
        Ctrl10.beforeLeave = true;
        Util.saveLevel($scope.activityId, Ctrl10.level);
        Ctrl10.releasePlayer(Ctrl10.wordPlayer);
        Ctrl10.releasePlayer(Ctrl10.rimeWordPlayer);
        Ctrl10.releasePlayer(Ctrl10.instructionsPlayer);
        Ctrl10.releasePlayer(Ctrl10.tapInstructionsPlayer);
        Ctrl10.releasePlayer(Ctrl10.endPlayer);
        Ctrl10.releasePlayer(successPlayer);
        Ctrl10.releasePlayer(failurePlayer);
      });
    });
})();
