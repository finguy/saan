angular.module('saan.controllers')

.controller('3Ctrl', function($scope, $timeout,$log, $state, RandomLetterThree, TTSService,
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
  var successPlayer;
  var failurePlayer;
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
  Ctrl3.letterPath = "";
  Ctrl3.speaking = false;
  Ctrl3.showDashboard = function(readInstructions) {

    Ctrl3.setUpLevel();
    Ctrl3.setUpScore();
    Ctrl3.setUpStatus();

    RandomLetterThree.letter(Ctrl3.level, Ctrl3.playedLetters).then(
      function success(data) {
        Ctrl3.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 2000 : 1000;
        var instructionsTimeout = 0;
        $timeout(function() {
          if (readInstructions) {
            Ctrl3.speaking = true;
            Ctrl3.instructionsPlayer.play();
            readInstructions = false;
            instructionsTimeout = 21000;

          } else {
            Ctrl3.letterPlayer.play();
            Ctrl3.speaking = true;
          }

      },
      function error(error) {
        $log.error(error);
      }
    );
   });
  };

  $scope.readTapInstruction = function(instructionsTimeout) {
   if (!Ctrl3.speaking){
     $timeout(function() {
           Ctrl3.instructionsPlayer2.play();
           Ctrl3.speaking = true;
          },instructionsTimeout);
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
    Ctrl3.letterTutorial = letterJson.letter.toUpperCase() +".mp3";
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

    Ctrl3.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
      function success() {
        Ctrl3.instructionsPlayer.release();
        //Ctrl3.speaking = false;
        Ctrl3.instructionsPlayer2.play();
      },
      function error(err) {
        $log.error(err);
        Ctrl3.instructionsPlayer.release();
        Ctrl3.speaking = false;
      }
    );
    Ctrl3.instructionsPlayer2 = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.action[0].path,
      function success() {
        Ctrl3.instructionsPlayer2.release();
        Ctrl3.letterPlayer.play();
        Ctrl3.speaking = false;
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
        Ctrl3.speaking = false;
      },
      function error(err) {
        $log.error(err);
        Ctrl3.letterPlayer.release();
        Ctrl3.speaking = false;
      }
    );

    var endingFeedback1 = RandomLetterThree.getEndingAudio(0);
    $scope.textSpeech1 = endingFeedback1.text;

    Ctrl3.endPlayer1 = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback1.path ,
      function success() {
        Ctrl3.endPlayer1.release();
        Ctrl3.speaking = false;
      },
      function error(err) {
        $log.error(err);
        Ctrl3.endPlayer1.release();
        Ctrl3.speaking = false;
      }
    );

    var endingFeedback2 = RandomLetterThree.getEndingAudio(1);
    $scope.textSpeech2 = endingFeedback2.text;

    Ctrl3.endPlayer2 = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback2.path,
      function success() {
        Ctrl3.endPlayer2.release();
        Ctrl3.speaking = false;
      },
      function error(err) {
        $log.error(err);
        Ctrl3.endPlayer2.release();
        Ctrl3.speaking = false;
      }
    );
  };

   //end players
   //release em
  Ctrl3.successFeedback = function() {
   if (!Ctrl3.speaking) {
      var successFeedback = RandomLetterThree.getSuccessAudio();
      $scope.textSpeech = successFeedback.text;
      $scope.showText = true;
      successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
        function success() {
          successPlayer.release();
          $scope.showText = false;
          Ctrl3.speaking = false;
        },
        function error(err) {
          $log.error(err);
          successPlayer.release();
          $scope.showText = false;
          $scope.checkingWord = false;
          Ctrl3.speaking = false;
        }
      );
      successPlayer.play();
      Ctrl3.speaking = true;
    }
  };

  Ctrl3.errorFeedback = function() {
   if (!Ctrl3.speaking) {
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
    }
  };

  Ctrl3.success = function() {
    Ctrl3.playedLetters.push(Ctrl3.letter.toLowerCase());
    Ctrl3.successFeedback();
    $timeout(function () {
     Ctrl3.levelUp();
     if (!Ctrl3.finished) {
       Ctrl3.score = Score.update(Ctrl3.addScore, $scope.activityId, Ctrl3.finished);
       Ctrl3.finished = Ctrl3.level >= Ctrl3.finalizationLevel;
       if (Ctrl3.finished) {
         ActividadesFinalizadasService.add($scope.activityId);
         Ctrl3.endPlayer1.play();
         $timeout(function () {
           $state.go('lobby');
         }, 10000);

       } else {
         Ctrl3.showDashboard(false);
       }
     } else if (Ctrl3.level <= Ctrl3.totalLevels) {
       Ctrl3.showDashboard(false);
     } else {
       Ctrl3.level = Ctrl3.initialLevel;
       Ctrl3.endPlayer2.play();
       $timeout(function () {
         $state.go('lobby');
       }, 10000);
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

  $scope.showPage = function() {
    $scope.isActivity = true;
    $scope.instructions = Ctrl3.letterInstruction;
    $timeout(function() {
      $scope.speak($scope.instructions);
    }, 1000);
  }

  $scope.selectLetter = function(name, objectNameSrc) {
   if (!Ctrl3.speaking) {
     $scope.selectedObject = name;
     $scope.checkLetter(name);
   }
  };

  //*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl3.showDashboard(true);
  });
  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, Ctrl3.level);
    Ctrl3.instructionsPlayer.release();
    Ctrl3.instructionsPlayer2.release();
    Ctrl3.letterPlayer.release();
    Ctrl3.endPlayer1.release();
    Ctrl3.endPlayer2.release();
    successPlayer.release();
    failurePlayer.release();
    Ctrl3.endPlayer1.release();
    Ctrl3.endPlayer2.release();
  });
});
