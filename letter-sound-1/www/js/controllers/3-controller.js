angular.module('saan.controllers')

.controller('3Ctrl', function($scope, $timeout, $state, RandomLetterThree, TTSService,
  Util, Score, ActividadesFinalizadasService) {
  $scope.imgs = [];
  $scope.activityProgress = 0;
  var Ctrl3 = Ctrl3 || {};
  $scope.activityId = 3; // Activity Id
  Ctrl3.letter = ""; // Letter to play in level
  Ctrl3.letterTutorial = "";


  $scope.instructions = ""; // Instructions to read
  Ctrl3.successMessages = [];
  Ctrl3.errorMessages = [];

  //Ctrl3.letters = []; // Word letters
  Ctrl3.dashboard = []; // Dashboard letters
  $scope.selectedObject = ""; // Collects letters the user selects
  Ctrl3.playedLetters = []; // Collects words the user played
  Ctrl3.level = null; // Indicates activity level



  Ctrl3.score = 0;
  Ctrl3.status = false;
  Ctrl3.alphabet = "abcdefghijklmnopqrstuvwxyz";
  Ctrl3.aplhabetLetters = Ctrl3.alphabet.split("");
  Ctrl3.srcAlphabetLetters = "";
  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, Ctrl3.level);
  });

  //Shows Activity Dashboard
  Ctrl3.showDashboard = function(readInstructions) {

    Ctrl3.setUpLevel();
    Ctrl3.setUpScore();
    Ctrl3.setUpStatus();

    RandomLetterThree.letter(Ctrl3.level, Ctrl3.playedLetters).then(
      function success(data) {
        Ctrl3.setUpContextVariables(data);

        //wait for UI to load
        var readWordTimeout = (readInstructions) ? 2000 : 1000;
        $timeout(function() {
          if (readInstructions) {
            $scope.speak($scope.instructions);
          }
        }, readWordTimeout);
      },
      function error(error) {
        console.log(error);
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
  };

  Ctrl3.success = function() {
    Ctrl3.playedLetters.push(Ctrl3.letter.toLowerCase());
    $timeout(function() {
      var position = Util.getRandomNumber(Ctrl3.successMessages.length);
      var successMessage = Ctrl3.successMessages[position];
      $scope.speak(successMessage);
      //wait for speak
      $timeout(function() {
        Ctrl3.levelUp(); //Advance level
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
    }, 1000);
  };

  Ctrl3.error = function() {
    if (!Ctrl3.finished) {
      Ctrl3.score = Score.update(-Ctrl3.substractScore, $scope.activityId, Ctrl3.finished);
      Util.saveScore($scope.activityId, Ctrl3.score);
    }
    //wait for speak
    $timeout(function() {
      var position = Util.getRandomNumber(Ctrl3.errorMessages.length);
      var errorMessage = Ctrl3.errorMessages[position];
      $scope.speak(errorMessage);
    }, 1000);
  };

  //Verifies selected letters and returns true if they match the word
  $scope.checkLetter = function(selectedObject) {
    var ER = new RegExp(Ctrl3.letter, "i");
    var name = selectedObject.toLowerCase();
    if (ER.test(name)) {
      Ctrl3.success();
    } else {
      Ctrl3.error();
    }
  };

  //Advance one level
  Ctrl3.levelUp = function() {
    Ctrl3.level++;
    //Ctrl3.letters = [];
    Ctrl3.dashboard = [];
    $scope.selectedLetters = [];
  };

  // Goes back one level
  Ctrl3.levelDown = function() {
    Ctrl3.level = (level > 1) ? (level - 1) : 1;
    //Ctrl3.letters = [];
    Ctrl3.dashboard = [];
    $scope.selectedLetters = [];
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
    var object = objectNameSrc.split("/");
    var objectName = object[object.length - 1].replace(".png", "");
    $scope.speak(name + " in " + objectName);
    $timeout(function() {
      $scope.checkLetter(name);
    }, 1000);
  };

  //*************** ACTIONS **************************/
  //Show Dashboard
  Ctrl3.showDashboard(true);
});
