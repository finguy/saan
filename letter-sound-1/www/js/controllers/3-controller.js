angular.module('saan.controllers')

.controller('3Ctrl', function($scope, $timeout, $log, $state, RandomLetterThree, TTSService,
  Util, Score, ActividadesFinalizadasService, AssetsPath) {
  $scope.letters = [];
  $scope.activityProgress = 0;
  $scope.showText = false;
  $scope.textSpeech = "";
  $scope.instructions = ""; // Instructions to read
  $scope.speak = TTSService.speak;
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.activityId = 3; // Activity Id
  $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
  $scope.introText = "";
  $scope.helpText = "";
  $scope.endText = "";
  var successPlayer;
  var failurePlayer;
  var endingFeedback;
  var Ctrl3 = Ctrl3 || {};
  Ctrl3.letter = ""; // Letter to play in level
  Ctrl3.letterTutorial = "";
  Ctrl3.instructionsPlayer;
  Ctrl3.successMessages = [];
  Ctrl3.errorMessages = [];
  Ctrl3.dashboard = []; // Dashboard letters
  Ctrl3.playedLetters = []; // Collects words the user played
  Ctrl3.level = null; // Indicates activity level
  Ctrl3.score = 0;
  Ctrl3.status = false;
  Ctrl3.srcAlphabetLetters = "";
  Ctrl3.letterPath = "";
  Ctrl3.speaking = false;
  Ctrl3.showDashboard = function(readInstructions) {

    Ctrl3.setUpLevel();
    Ctrl3.setUpScore();
    Ctrl3.setUpStatus();

    RandomLetterThree.letter(Ctrl3.level, Ctrl3.playedLetters).then(
      function success(data) {
        Ctrl3.setUpContextVariables(data);
        var instructionsTimeout = 1000;
        Ctrl3.speaking = true;
        $timeout(function loadUI() {
          if (!Ctrl3.beforeLeave) {
            if (readInstructions) {
              $scope.textSpeech = $scope.introText;
              $scope.showText = true;
              Ctrl3.instructionsPlayer.play();
            } else {
              $scope.textSpeech = $scope.helpText;
              $scope.showText = true;
              Ctrl3.instructionsPlayer2.play();
            }
          }

        }, instructionsTimeout);
      },
      function error(error) {
        $log.error(error);
      }
    );
  };

  $scope.readTapInstruction = function() {
    if (!Ctrl3.speaking) {
      Ctrl3.speaking = true;
      $scope.textSpeech = $scope.helpText;
      $scope.showText = true;
      Ctrl3.instructionsPlayer2.play();
    }
  };

  Ctrl3.setUpLevel = function() {
    if (!Ctrl3.level) {
      Ctrl3.level = Util.getLevel($scope.activityId);
    }
  };

  Ctrl3.setUpScore = function() {
    Ctrl3.score = Util.getScore($scope.activityId);

  };

  Ctrl3.setUpStatus = function() {
    Ctrl3.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
  }

  Ctrl3.setUpContextVariables = function(data) {
    var letterJson = data.letter;
    Ctrl3.addScore = data.scoreSetUp.add;
    Ctrl3.substractScore = data.scoreSetUp.substract;
    Ctrl3.finalizationLevel = data.finalizationLevel;
    Ctrl3.totalLevels = data.totalLevels;
    Ctrl3.initialLevel = 1;
    Ctrl3.letter = letterJson.letter;
    Ctrl3.letterTutorial = letterJson.letter.toUpperCase() + ".mp3";
    $scope.letters = [];
    $scope.letters = _.shuffle(letterJson.lettersToPlay);
    Ctrl3.dashboard = [Ctrl3.letter];
    $scope.introText = data.instructionsPath.intro.text;
    if (!Ctrl3.instructionsPlayer) {
      Ctrl3.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
        function success() {
          Ctrl3.instructionsPlayer.release();
          $scope.showText = false;
          if (!Ctrl3.beforeLeave) {
            $timeout(function() {
              $scope.showText = true;
              $scope.textSpeech = $scope.helpText;
              Ctrl3.instructionsPlayer2.play();
            }, 500);
          }
        },
        function error(err) {
          $log.error(err);
          Ctrl3.instructionsPlayer.release();
          Ctrl3.speaking = false;
        }
      );
    }

    $scope.helpText = data.instructionsPath.action[0].text;
    Ctrl3.instructionsPlayer2 = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.action[0].path,
      function success() {
        Ctrl3.instructionsPlayer2.release();
        if (!Ctrl3.beforeLeave) {
          Ctrl3.letterPlayer.play();
        }
      },
      function error(err) {
        $log.error(err);
        Ctrl3.instructionsPlayer2.release();
        Ctrl3.speaking = false;
      }
    );

    Ctrl3.letterPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.action[1].path + Ctrl3.letterTutorial,
      function success() {
        Ctrl3.letterPlayer.release();
        $scope.showText = false;
        Ctrl3.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl3.letterPlayer.release();
        Ctrl3.speaking = false;
      }
    );

    if (!Ctrl3.finished) {
      var endingFeedback = RandomLetterThree.getEndingAudio(0);
      $scope.endText = endingFeedback.text;

      Ctrl3.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
        function success() {
          Ctrl3.endPlayer.release();
          $state.go('lobby');
        },
        function error(err) {
          $log.error(err);
          Ctrl3.endPlayer.release();
        }
      );
    } else {
      endingFeedback = RandomLetterThree.getEndingAudio(1);
      $scope.endText = endingFeedback.text;

      Ctrl3.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
        function success() {
          Ctrl3.endPlayer.release();
          $state.go('lobby');
        },
        function error(err) {
          $log.error(err);
          Ctrl3.endPlayer.release();
        }
      );
    }
  };

  //end players
  //release em
  Ctrl3.successFeedback = function() {
    var successFeedback = RandomLetterThree.getSuccessAudio();
    $scope.textSpeech = successFeedback.text;
    $scope.showText = true;
    successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
      function success() {
        successPlayer.release();
      },
      function error(err) {
        $log.error(err);
        successPlayer.release();
        $scope.checkingWord = false;
      }
    );
    Ctrl3.speaking = true;
    successPlayer.play();
  };

  Ctrl3.errorFeedback = function() {
    var failureFeedback = RandomLetterThree.getFailureAudio();
    $scope.textSpeech = failureFeedback.text;
    $scope.showText = true;
    failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
      function success() {
        failurePlayer.release();
        $scope.showText = false;
        Ctrl3.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        failurePlayer.release();
        $scope.showText = false;
        Ctrl3.speaking = false;
      });
    failurePlayer.play();
    Ctrl3.speaking = true;
  };

  Ctrl3.success = function() {
    Ctrl3.playedLetters.push(Ctrl3.letter.toLowerCase());
    Ctrl3.successFeedback();
    $timeout(function() {
      Ctrl3.levelUp();
      if (!Ctrl3.finished) {
        Ctrl3.score = Score.update(Ctrl3.addScore, $scope.activityId, Ctrl3.finished);
        Ctrl3.finished = Ctrl3.level >= Ctrl3.finalizationLevel;
        if (Ctrl3.finished) {
          ActividadesFinalizadasService.add($scope.activityId);
          $scope.textSpeech = $scope.endText;
          $scope.showText = true;
          Ctrl3.speaking = true;
          Ctrl3.endPlayer.play();
        } else {
          Ctrl3.showDashboard(false);
        }
      } else if (Ctrl3.level <= Ctrl3.totalLevels) {
        Ctrl3.showDashboard(false);
      } else {
        ActividadesFinalizadasService.addMax($scope.activityId);
        Ctrl3.level = Ctrl3.initialLevel;
        $scope.textSpeech = $scope.endText;
        $scope.showText = true;
        Ctrl3.speaking = true;
        Ctrl3.endPlayer.play();
      }
    }, 2000);
  };

  Ctrl3.error = function() {
    if (!Ctrl3.finished) {
      Ctrl3.score = Score.update(-Ctrl3.substractScore, $scope.activityId, Ctrl3.finished);
      Util.saveScore($scope.activityId, Ctrl3.score);
    }
    Ctrl3.errorFeedback();
  };

  $scope.checkLetter = function(selectedObject) {
    var ER = new RegExp(Ctrl3.letter, "i");
    var name = selectedObject.toLowerCase();
    if (ER.test(name)) {
      Ctrl3.success();
    } else {
      Ctrl3.error();
    }
  };

  Ctrl3.levelUp = function() {
    Ctrl3.level++;
    Ctrl3.dashboard = [];
  };

  Ctrl3.levelDown = function() {
    Ctrl3.level = (level > 1) ? (level - 1) : 1;
    Ctrl3.dashboard = [];
  };

  $scope.selectLetter = function(name) {
    if (!Ctrl3.speaking) {
      Ctrl3.speaking = true;
      $scope.selectedObject = name;
      $scope.checkLetter(name);
    }
  };

  //*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl3.showDashboard(true);
  });

  Ctrl3.releasePlayer = function(player) {
    if (player) {
      player.release();
    }
  };

  $scope.$on('$ionicView.beforeLeave', function() {
    Ctrl3.beforeLeave = true;
    Util.saveLevel($scope.activityId, Ctrl3.level);
    Ctrl3.releasePlayer(Ctrl3.instructionsPlayer);
    Ctrl3.releasePlayer(Ctrl3.instructionsPlayer2);
    Ctrl3.releasePlayer(Ctrl3.letterPlayer);
    Ctrl3.releasePlayer(Ctrl3.endPlayer);
    Ctrl3.releasePlayer(successPlayer);
    Ctrl3.releasePlayer(failurePlayer);
  });
});
