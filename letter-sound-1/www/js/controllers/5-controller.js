angular.module('saan.controllers')
  .controller('5Ctrl', function($scope, $timeout, $state, $log, RandomLetter,
    Util, Score, ActividadesFinalizadasService, AssetsPath) {
    $scope.activityId = 5; // Activity Id
    $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
    $scope.letter = ""; // Letter to play in level
    $scope.letterSrc = "";
    $scope.imgs = [];
    $scope.checkingLetter = false;
    $scope.checkingWord = false;
    $scope.showText = false;
    $scope.textSpeech = "";
    $scope.isSayingLetter = false;
    $scope.introText = "";
    $scope.endText = "";
    var Ctrl5 = Ctrl5 || {};
    Ctrl5.selectedObject = ""; // Collects letters the user selects
    Ctrl5.playedLetters = []; // Collects words the user played
    Ctrl5.level = null; // Indicates activity level
    Ctrl5.score = 0;
    Ctrl5.instructionsPlayer;
    Ctrl5.speaking = false;

    var successPlayer;
    var failurePlayer;
    var endingFeedback;
    Ctrl5.showDashboard = function(readInstructions) {
      $scope.checkingWord = false;
      Ctrl5.setUpLevel();
      Ctrl5.setUpScore();
      Ctrl5.setUpStatus();

      RandomLetter.letter(Ctrl5.level, Ctrl5.playedLetters).then(
        function success(data) {
         $timeout(function loadUI() {
          Ctrl5.setUpContextVariables(data);
          if (readInstructions) {
            $scope.showText = true;
            $scope.textSpeech = $scope.introText;
            Ctrl5.instructionsPlayer.play();
            Ctrl5.speaking = true;
          } else {
            $scope.isSayingLetter = true;
            $scope.textSpeech = $scope.letter;
            $scope.showText = true;
            Ctrl5.letterPlayer.play();
            Ctrl5.speaking = false;
          }
         },1000);
        },
        function error(error) {
          $log.error(error);
        }
      );
    };

    Ctrl5.setUpLevel = function() {
      if (!Ctrl5.level) {
        Ctrl5.level = Util.getLevel($scope.activityId);
      }
    };

    Ctrl5.setUpScore = function() {
      Ctrl5.score = Util.getScore($scope.activityId);
    };

    Ctrl5.setUpStatus = function() {
      Ctrl5.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
    };

    Ctrl5.successFeedback = function() {
      if (!Ctrl5.speaking) {
        var successFeedback = RandomLetter.getSuccessAudio();
        $scope.textSpeech = successFeedback.text;
        $scope.showText = true;
        Ctrl5.speaking = true;
        successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function success() {
            successPlayer.release();
          },
          function error(err) {
            $log.error(err);
            successPlayer.release();
            $scope.showText = false;
            $scope.checkingWord = false;
            Ctrl5.speaking = false;
          }
        );
        Ctrl5.speaking = true;
        successPlayer.play();
      }
    };

    Ctrl5.errorFeedback = function() {
      if (!Ctrl5.speaking) {
        var failureFeedback = RandomLetter.getFailureAudio();
        $scope.textSpeech = failureFeedback.text;
        $scope.showText = true;
        Ctrl5.speaking = true;
        failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
          function success() {
            $scope.showText = false;
            Ctrl5.speaking = false;
            $scope.$apply();
            failurePlayer.release();
          },
          function error(err) {
            $log.error(err);
            failurePlayer.release();
            $scope.showText = false;
            Ctrl5.speaking = false;
          });
        Ctrl5.speaking = true;
        failurePlayer.play();
      }
    };

    Ctrl5.setUpContextVariables = function(data) {
      var letterJson = data.letter;
      $scope.letterSrc = letterJson.letterSrc;
      $scope.letter = letterJson.letter;
      Ctrl5.letterTutorial = $scope.letter.toUpperCase() + ".mp3";
      Ctrl5.addScore = data.scoreSetUp.add;
      Ctrl5.substractScore = data.scoreSetUp.substract;
      Ctrl5.finalizationLevel = data.finalizationLevel;
      Ctrl5.totalLevels = data.totalLevels;
      Ctrl5.initialLevel = 1;


      $scope.imgs = [];
      for (var i in letterJson.imgs) {
        if (letterJson.imgs[i]) {
          var img = {};
          img.name = letterJson.imgs[i].name;
          img.src = Util.getRandomElemFromArray(letterJson.imgs[i].src);
          $scope.imgs.push(img);
        }
      }

      if (!Ctrl5.finished) {
        $scope.activityProgress = 100;
        endingFeedback = RandomLetter.getEndingAudio(0);
        $scope.endText = endingFeedback.text;
        Ctrl5.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
          function success() {
            Ctrl5.endPlayer.release();
            Ctrl5.speaking = false;
            $state.go('lobby');
          },
          function error(err) {
            $log.error(err);
            Ctrl5.endPlayer.release();
            Ctrl5.speaking = false;
          }
        );
      } else {
        endingFeedback = RandomLetter.getEndingAudio(1);
        $scope.endText = endingFeedback.text;
        $scope.textSpeech = endingFeedback.text;
        Ctrl5.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
          function success() {
            Ctrl5.endPlayer.release();
            Ctrl5.speaking = false;
            $state.go('lobby');
          },
          function error(err) {
            $log.error(err);
            Ctrl5.endPlayer.release();
            Ctrl5.speaking = false;
          }
        );
      }
      $scope.introText = data.instructionsPath.intro.text;
      Ctrl5.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
        function success() {
          Ctrl5.instructionsPlayer.release();
          Ctrl5.speaking = false;
          $timeout(function() {
            $scope.showText = true;
            $scope.textSpeech = $scope.letter;
            $scope.isSayingLetter = true;
            $scope.$apply();
            if (!$scope.beforeLeave) {
              Ctrl5.letterPlayer.play();
            }
          }, 500);
        },
        function error(err) {
          $log.error(err);
          Ctrl5.instructionsPlayer.release();
          Ctrl5.speaking = false;
        }
      );

      Ctrl5.letterPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.action.path + Ctrl5.letterTutorial,
        function success() {
          Ctrl5.letterPlayer.release();
          Ctrl5.speaking = false;
          $scope.showText = false;
          $scope.isSayingLetter = false;
        },
        function error(err) {
          $log.error(err);
          Ctrl5.letterPlayer.release();
          Ctrl5.speaking = false;
        }
      );
    };

    Ctrl5.success = function() {
      Ctrl5.playedLetters.push($scope.letter.toLowerCase());
      Ctrl5.successFeedback();
      $timeout(function(){
       Ctrl5.levelUp();
       if (!Ctrl5.finished) {
         Ctrl5.score = Score.update(Ctrl5.addScore, $scope.activityId, Ctrl5.finished);
         Ctrl5.finished = Ctrl5.level >= Ctrl5.finalizationLevel;
         if (Ctrl5.finished) {
           ActividadesFinalizadasService.add($scope.activityId);
           $scope.showText = true;
           $scope.textSpeech = $scope.endText;
           Ctrl5.speaking = true;
           Ctrl5.endPlayer.play();
         } else {
           Ctrl5.showDashboard(false);
         }
       } else if (Ctrl5.level <= Ctrl5.totalLevels) {
         Ctrl5.showDashboard(false);
       } else {
         ActividadesFinalizadasService.addMax($scope.activityId);
         Ctrl5.level = Ctrl5.initialLevel;
         $scope.showText = true;
         $scope.textSpeech = $scope.endText;
         Ctrl5.speaking = true;
         Ctrl5.endPlayer.play();
       }
      },1500);
    };

    Ctrl5.error = function() {
      $scope.checkingWord = false;
      Ctrl5.errorFeedback();
      Ctrl5.score = Score.update(-Ctrl5.substractScore, Ctrl5.score);
      Util.saveScore($scope.activityId, Ctrl5.score);
    };

    Ctrl5.handleProgress = function(selectedObject) {
      $scope.checkingWord = true;
      var ER = new RegExp($scope.letter, "i");
      var name = selectedObject.toLowerCase();
      if (ER.test(name)) {
        Ctrl5.success();
      } else {
        Ctrl5.error();
      }
    };

    Ctrl5.levelUp = function() {
      Ctrl5.level++;
    };

    Ctrl5.levelDown = function() {
      Ctrl5.level = (level > 1) ? (level - 1) : 1;
    };

    Ctrl5.releasePlayer = function(player) {
      if (player) {
        player.release();
      }
    };

    $scope.selectLetter = function(name, objectNameSrc) {
      if (!$scope.checkingLetter && !$scope.checkingWord && !Ctrl5.speaking) {
        Ctrl5.selectedObject = name;
        Ctrl5.handleProgress(name);
        $scope.checkingLetter = false;
      }
    };

    $scope.readTapInstruction = function() {
      if (!Ctrl5.speaking) {
        $scope.isSayingLetter = true;
        $scope.textSpeech = $scope.letter;
        $scope.showText = true;
        Ctrl5.speaking = true;
        Ctrl5.letterPlayer.play();
      }
    };
    //*************** ACTIONS **************************/
    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl5.showDashboard(true);
    });
    $scope.$on('$ionicView.beforeLeave', function() {
      $scope.beforeLeave = true;
      Util.saveLevel($scope.activityId, Ctrl5.level);
      Ctrl5.releasePlayer(Ctrl5.instructionsPlayer);
      Ctrl5.releasePlayer(Ctrl5.endPlayer);
      Ctrl5.releasePlayer(Ctrl5.letterPlayer);
      Ctrl5.releasePlayer(failurePlayer);
    });

  });
