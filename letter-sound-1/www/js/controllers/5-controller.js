angular.module('saan.controllers')
  .controller('5Ctrl', function($scope,$timeout, RandomLetter, TTSService,
    Util, Score) {
    $scope.activityId = '5'; // Activity Id
    $scope.letter = ""; // Letter to play in level
    $scope.letterSrc = "";
    $scope.imgs = [];
    $scope.instructions = ""; // Instructions to read
    $scope.successMessages = [];
    $scope.errorMessages = [];
    $scope.letters = []; // Word letters
    $scope.checkingLetter = false;
    $scope.checkingWord = false;
    $scope.activityProgress = 0;


    //Reproduces sound using TTSService
    $scope.speak = TTSService.speak;

    //Shows Activity Dashboard
    var Ctrl5 = Ctrl5 || {};
    Ctrl5.selectedObject = ""; // Collects letters the user selects
    Ctrl5.playedLetters = []; // Collects words the user played
    Ctrl5.level = Ctrl5.level || 1; // Indicates activity level
    Ctrl5.score = 0;
    Ctrl5.showDashboard = function(readInstructions) {
      $scope.checkingWord = false;
      Ctrl5.setUpLevel();
      Ctrl5.setUpScore();
      Ctrl5.setUpStatus();

      var status = Util.getStatus("Activity5-level");
      if (status) {
        status = parseInt(status, 10);
        Ctrl5.level = status;
        $scope.activityProgress = 100 * (status - 1) / Ctrl5.totalLevels; // -1 porque empieza en cero.
      }
      RandomLetter.letter(Ctrl5.level, Ctrl5.playedLetters).then(
        function success(data) {

          Ctrl5.setUpContextVariables(data);
          var readWordTimeout = (readInstructions) ? 2000 : 1000;
          //wait for UI to load
          $timeout(function() {
            if (readInstructions) {
              $scope.speak($scope.instructions);
              $timeout(function() {
                $scope.speak($scope.letter);
              }, 7000);
            } else {
              $scope.speak($scope.letter);
            }
          }, readWordTimeout);

        },
        function error(error) {
          console.log(error);
        }
      );
    };

    Ctrl5.setUpLevel = function() {
      var level = Util.getLevel($scope.activityId);
      if (level) {
        Ctrl5.level = level;
        $scope.activityProgress = 100 * (level - 1) / Ctrl5.totalLevels; // -1 porque empieza en cero.
      }
    };

    Ctrl5.setUpScore = function() {
      var score = Util.getScore($scope.activityId);
      if (score) {
        Ctrl5.score = score
      }
    };

    Ctrl5.setUpStatus = function() {
      $scope.finished = Util.getStatus($scope.activityId);
    };

    Ctrl5.setUpContextVariables = function(data) {
      var letterJson = data.letter;
      $scope.letterSrc = letterJson.letterSrc;
      $scope.instructions = data.instructions;
      $scope.successMessages = data.successMessages;
      $scope.errorMessages = data.errorMessages;
      $scope.letter = letterJson.letter;

      $scope.addScore = data.scoreSetUp.add;
      $scope.substractScore = data.scoreSetUp.substract;
      $scope.minScore = data.scoreSetUp.minScore;
      Ctrl5.totalLevels = data.totalLevels;
      $scope.imgs = [];
      for (var i in letterJson.imgs) {
        if (letterJson.imgs[i]) {
          var img = {};
          img.name = letterJson.imgs[i].name;
          img.src = Util.getRandomElemFromArray(letterJson.imgs[i].src);
          $scope.imgs.push(img);
        }
      }

    };

    Ctrl5.handleSuccess = function() {
      Ctrl5.playedLetters.push($scope.letter.toLowerCase());
      $timeout(function() {
        var position = Util.getRandomNumber($scope.successMessages.length);
        var successMessage = $scope.successMessages[position];
        $scope.speak(successMessage);
        //wait for speak
        $timeout(function() {
          Ctrl5.levelUp(); //Advance level
          Ctrl5.score = Score.update($scope.addScore, Ctrl5.score);
          Util.saveLevel($scope.activityId, Ctrl5.level);
          if (!$scope.finished) { // Solo sumo o resto si no esta finalizada
            Util.saveScore($scope.activityId, Ctrl5.score);
            $scope.finished = Ctrl5.score >= $scope.minScore;
            if ($scope.finished) {
              Util.saveStatus($scope.activityId, $scope.finished);
              ActividadesFinalizadasService.add($scope.activityId);
            }
          }
          Ctrl5.showDashboard(); //Reload dashboard
        }, 1000);
      }, 1000);
    };

    Ctrl5.handleError = function() {
      Ctrl5.score = Score.update(-$scope.substractScore, Ctrl5.score);
      Util.saveScore($scope.activityId, Ctrl5.score);
      //wait for speak
      $timeout(function() {
        $scope.checkingWord = false;
        var position = Util.getRandomNumber($scope.errorMessages.length);
        var errorMessage = $scope.errorMessages[position];
        $scope.speak(errorMessage);
      }, 1000);
    };

    //Verifies selected letters and returns true if they match the word
    Ctrl5.handleProgress = function(selectedObject) {
      $scope.checkingWord = true;
      var ER = new RegExp($scope.letter, "i");
      var name = selectedObject.toLowerCase();
      if (ER.test(name)) {
        Ctrl5.handleSuccess();
      } else {
        Ctrl5.handleError();
      }
    };

    //Advance one level
    Ctrl5.levelUp = function() {
      Ctrl5.level++;
      $scope.letters = [];
      $scope.selectedLetters = [];
    };

    // Goes back one level
    Ctrl5.levelDown = function() {
      Ctrl5.level = (level > 1) ? (level - 1) : 1;
      $scope.letters = [];
      $scope.selectedLetters = [];
    };

    $scope.selectLetter = function(name, objectNameSrc) {
      if (!$scope.checkingLetter && !$scope.checkingWord) {
        $scope.checkingLetter = true;
        Ctrl5.selectedObject = name;
        var object = objectNameSrc.split("/");
        var objectName = object[object.length - 1].replace(".png", "");
        $scope.speak($scope.letter + " in " + objectName);
        $timeout(function() {
          $scope.checkingLetter = false;
          Ctrl5.handleProgress(name);
        }, 500);
      }
    };

    //*************** ACTIONS **************************/
    //Show Dashboard
    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl5.showDashboard(true);
    });
  });
