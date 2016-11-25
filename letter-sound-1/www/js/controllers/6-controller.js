angular.module('saan.controllers')

.controller('6Ctrl', function($scope, $state, $log, $timeout, RandomWordSix, TTSService,
  Util, Score, ActividadesFinalizadasService) {
  $scope.activityId = '6'; // Activity Id
  $scope.word = ""; // Letter to play in level
  $scope.letters = [];
  $scope.letters2 = [];
  $scope.lettersDragged = [];
  $scope.imgSrc = "";
  $scope.instructions = ""; // Instructions to read
  $scope.successMessages = [];
  $scope.errorMessages = [];
  $scope.words = []; // Word letters
  $scope.dashboard = []; // Dashboard letters
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.playedWords = []; // Collects words the user played
  $scope.level = null; // Indicates activity level
  $scope.totalLevels = 3;
  $scope.activityProgress = 0;
  $scope.letterInstruction = "";
  $scope.score = 0;
  $scope.status = false;
  $scope.dropzone = [];
  $scope.hasDraggedLetter = [];
  $scope.phonemas = [];
  $scope.imgBox = "img/6-assets/objects/treasure-chest-stars.png";
  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  //Shows Activity Dashboard
  var Ctrl6 = Ctrl6 || {};

  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, $scope.level);
  });

  Ctrl6.showDashboard = function(readInstructions) {

    Ctrl6.setUpLevel();
    Ctrl6.setUpScore();
    Ctrl6.setUpStatus();

    RandomWordSix.word($scope.level, $scope.playedWords).then(
      function success(data) {
        Ctrl6.setUpContextVariables(data);
        //wait for UI to load
        var readWordTimeout = (readInstructions) ? 4000 : 1000;
        $timeout(function() {
          if (readInstructions) {
            $scope.speak($scope.instructions);
          }

          $timeout(function() {
            $scope.speak($scope.currentPhonema);
          }, readWordTimeout);
        }, readWordTimeout);
      },
      function error(error) {
        $log.error(error);
      }
    );
  };

  Ctrl6.setUpLevel = function() {
    if (!$scope.level) {
      $scope.level = Util.getLevel($scope.activityId);
    }
  };

  Ctrl6.setUpScore = function() {
    $scope.score = Util.getScore($scope.activityId);

  };

  Ctrl6.setUpStatus = function() {
    $scope.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
  }

  Ctrl6.setUpContextVariables = function(data) {
    var wordJson = data.word;
    $scope.instructions = data.instructions;
    $scope.successMessages = data.successMessages;
    $scope.errorMessages = data.errorMessages;
    $scope.addScore = data.scoreSetUp.add;
    $scope.substractScore = data.scoreSetUp.substract;
    $scope.finalizationLevel = data.finalizationLevel;
    Ctrl6.initialLevel = 1;
    $scope.word = wordJson.word;
    $scope.playedWords.push(wordJson.word);
    $scope.words = [];
    var aux_letters = wordJson.word.split("");
    for (var j in aux_letters) {
      if (aux_letters[j]) {
        var letter = aux_letters[j];
        $scope.letters.push({
          "letter": letter,
          "index": j
        });
        $scope.hasDraggedLetter[letter + "_" + j] = false;
      }
    }

    $scope.letters = _.shuffle($scope.letters);
    $scope.lettersDragged = wordJson.word.split("");
    var letterJSON = Util.getRandomElemFromArray($scope.letters);
    $scope.currentPhonema = letterJSON.letter;
    $scope.imgSrc = Util.getRandomElemFromArray(wordJson.imgs);
    $scope.dashboard = [$scope.word];
    $scope.wordInstruction = wordJson.instruction;
    $scope.totalLevels = data.totalLevels;
    $scope.phonemas = [];
    if ($scope.finished) {
      $scope.activityProgress = 100;
    } else {
      $scope.activityProgress = 100 * ($scope.level - 1) / $scope.totalLevels;
    }
  };

  //Verifies selected letters or and returns true if they match the word
  $scope.checkPhonema = function(selectedObject) {
    var ER = new RegExp($scope.currentPhonema, "i");
    var name = selectedObject.toLowerCase();
    return ER.test(name);
  };

  $scope.getNewPhonema = function() {
    //GET a new letter
    $scope.phonemas.push($scope.currentPhonema);
    var selected = true;
    while (selected && $scope.phonemas.length < $scope.letters.length) {
      var letterJSON = Util.getRandomElemFromArray($scope.letters);
      $scope.currentPhonema = letterJSON.letter;
      selected = $scope.hasDraggedLetter[letterJSON.letter + "_" + letterJSON.index];
    }
  };


  Ctrl6.success = function() {
    var LAST_CHECK = $scope.phonemas.length === $scope.letters.length;
    var position = Util.getRandomNumber($scope.successMessages.length);
    var successMessage = $scope.successMessages[position];
    $scope.speak(successMessage);
    $timeout(function() {
      if (!$scope.finished) {
        $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
      }
      if (LAST_CHECK) {
        $scope.speak($scope.word);
        $timeout(function() {
          Ctrl6.levelUp(); //Advance level
          if (!$scope.finished) {
            $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
            $scope.finished = $scope.level >= $scope.finalizationLevel;
            if ($scope.finished) {
              ActividadesFinalizadasService.add($scope.activityId);
              $state.go('lobby');
            } else if ($scope.level <= $scope.totalLevels) {
              Ctrl6.showDashboard(false);
            } else {              
              $state.go('lobby');
            }
          } else if ($scope.level <= $scope.totalLevels) {
            Ctrl6.showDashboard(false);
          } else {
            $scope.level = Ctrl6.initialLevel;
            $state.go('lobby');
          }
        }, 1000);
      } else {
        $scope.speak($scope.currentPhonema);
      }
    }, 1000);
  };

  Ctrl6.error = function() {
    if (!$scope.finished) {
      $scope.score = Score.update(-$scope.substractScore, $scope.activityId, $scope.finished);
      Util.saveScore($scope.activityId, $scope.score);
    }
    $scope.speak(name);
    //wait for speak
    $timeout(function() {
      var position = Util.getRandomNumber($scope.errorMessages.length);
      var errorMessage = $scope.errorMessages[position];
      $scope.speak(errorMessage);
    }, 000);
  };

  $scope.handleProgress = function(isPhonemaOk, name) {
    if (isPhonemaOk) {
      Ctrl6.success();
    } else {
      Ctrl6.error();
    }
  };

  //Advance one level
  Ctrl6.levelUp = function() {
    $scope.level++;
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };

  // Goes back one level
  Ctrl6.levelDown = function() {
    $scope.level = (level > 1) ? (level - 1) : 1;
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };

  Ctrl6.showPage = function() {
    $scope.isActivity = true;
    $scope.instructions = $scope.letterInstruction;
    $timeout(function() {
      $scope.speak($scope.instructions);
    }, 1000);
  }


  //*************** ACTIONS **************************/
  //Show Dashboard
  Ctrl6.showDashboard(true);
});
