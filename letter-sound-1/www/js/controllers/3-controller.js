angular.module('saan.controllers')

.controller('3Ctrl', function($scope, $timeout, $state, RandomLetterThree, TTSService,
  Util, Score, ActividadesFinalizadasService, AssetsPath) {
  $scope.imgs = [];
  $scope.activityProgress = 0;
  $scope.showText = false;
  $scope.textSpeech = "";
  $scope.instructions = ""; // Instructions to read
  $scope.speak = TTSService.speak;
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.activityId = 3; // Activity Id
  $scope.assetsPath = AssetsPath.getImgs($scope.activityId);

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
  Ctrl3.alphabet = "abcdefghijklmnopqrstuvwxyz";
  Ctrl3.aplhabetLetters = Ctrl3.alphabet.split("");
  Ctrl3.srcAlphabetLetters = "";

  Ctrl3.showDashboard = function(readInstructions) {

    Ctrl3.setUpLevel();
    Ctrl3.setUpScore();
    Ctrl3.setUpStatus();

    RandomLetterThree.letter(Ctrl3.level, Ctrl3.playedLetters).then(
      function success(data) {
        Ctrl3.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 2000 : 1000;
        $timeout(function() {
          if (readInstructions) {
            Ctrl3.instructionsPlayer.play();
            readInstructions = false;
          }
        }, readWordTimeout);
      },
      function error(error) {
        $log.error(error);
      }
    );
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
    $scope.instructions = data.instructions;
    Ctrl3.successMessages = data.successMessages;
    Ctrl3.errorMessages = data.errorMessages;
    Ctrl3.addScore = data.scoreSetUp.add;
    Ctrl3.substractScore = data.scoreSetUp.substract;
    Ctrl3.finalizationLevel = data.finalizationLevel;
    Ctrl3.totalLevels = data.totalLevels;
    Ctrl3.initialLevel = 1;

    Ctrl3.letter = letterJson.letter;
    Ctrl3.letterTutorial = letterJson.letter;

    $scope.imgs = [];
    for (var i in letterJson.imgs) {
      if (letterJson.imgs[i]) {
        var img = {};
        img.name = letterJson.imgs[i].name;
        img.src = Util.getRandomElemFromArray(letterJson.imgs[i].src);
        $scope.imgs.push(img);
      }
    }
    $scope.imgs = _.shuffle($scope.imgs);
    Ctrl3.dashboard = [Ctrl3.letter];
    $scope.instructions = letterJson.instruction;

    if (Ctrl3.finished) {
      $scope.activityProgress = 100;
    } else {
      $scope.activityProgress = 100 * (Ctrl3.level - 1) / Ctrl3.totalLevels;
    }

    Ctrl3.instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + data.instructionsPath,
      function success() {
        Ctrl3.instructionsPlayer.release();
      },
      function error(err) {
        $log.error(err);
        Ctrl3.instructionsPlayer.release();
      }
    );
  };

  Ctrl3.successFeedback = function() {
    var successFeedback = RandomLetterThree.getSuccessAudio();
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

  Ctrl3.errorFeedback = function() {
    var failureFeedback = RandomLetterThree.getFailureAudio();
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
          $state.go('lobby');
        } else {
          Ctrl3.showDashboard(true);
        }
      } else if (Ctrl3.level <= Ctrl3.totalLevels) {
        Ctrl3.showDashboard(true);
      } else {
        Ctrl3.level = Ctrl3.initialLevel;
        $state.go('lobby');
      }
    }, 1000);
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

  $scope.showPage = function() {
    $scope.isActivity = true;
    $scope.instructions = Ctrl3.letterInstruction;
    $timeout(function() {
      $scope.speak($scope.instructions);
    }, 1000);
  }

  $scope.selectLetter = function(name, objectNameSrc) {
    $scope.selectedObject = name;
    $scope.speak(name);
    $timeout(function() {
      $scope.checkLetter(name);
    }, 1000);
  };

  //*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl3.showDashboard(true);
  });
  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, Ctrl3.level);
  });
});
