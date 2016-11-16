angular.module('saan.controllers')
  .controller('5Ctrl', function($scope, $state, RandomLetter, TTSService,
    Util, Score) {
    $scope.activityId = '5'; // Activity Id
    $scope.letter = ""; // Letter to play in level
    $scope.letterSrc = "";
    $scope.imgs = [];
    $scope.instructions = ""; // Instructions to read
    $scope.successMessages = [];
    $scope.errorMessages = [];
    $scope.letters = []; // Word letters
    $scope.dashboard = []; // Dashboard letters
    $scope.selectedObject = ""; // Collects letters the user selects
    $scope.playedLetters = []; // Collects words the user played
    $scope.level = $scope.level || 1; // Indicates activity level
    $scope.totalLevels = 2;
    $scope.activityProgress = 0;
    $scope.score = 0;
    $scope.checkingWord = false;

    //Reproduces sound using TTSService
    $scope.speak = TTSService.speak;

    //Shows Activity Dashboard
    var Ctrl5 = Ctrl5 || {};
    Ctrl5.showDashboard = function(readInstructions) {
      $scope.checkingWord = false;
      Ctrl5.setUpLevel();
      Ctrl5.setUpScore();
      Ctrl5.setUpStatus();

      var status = Util.getStatus("Activity5-level");
      if (status) {
        status = parseInt(status, 10);
        $scope.level = status;
        $scope.activityProgress = 100 * (status - 1) / $scope.totalLevels; // -1 porque empieza en cero.
      }
      RandomLetter.letter($scope.level, $scope.playedLetters).then(
        function success(data) {

          Ctrl5.setUpContextVariables(data);
          var readWordTimeout = (readInstructions) ? 2000 : 1000;
          //wait for UI to load
          setTimeout(function() {
            if (readInstructions) {
              $scope.speak($scope.instructions);
              setTimeout(function() {
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
      $scope.level = Util.getLevel($scope.activityId);
    };

    Ctrl5.setUpScore = function() {
      $scope.score = Util.getScore($scope.activityId);
    };

    Ctrl5.setUpStatus = function() {
      var finished = Util.getStatus($scope.activityId);
      if (finished === false || finished === true) {
        $scope.finished = finished;
      }
    };

    Ctrl5.setUpContextVariables = function(data) {
      var letterJson = data.letter;
      $scope.letterSrc = letterJson.letterSrc;
      $scope.instructions = data.instructions;
      $scope.successMessages = data.successMessages;
      $scope.errorMessages = data.errorMessages;
      $scope.letter = letterJson.letter;
      $scope.dashboard = [$scope.letter];
      $scope.addScore = data.scoreSetUp.add;
      $scope.substractScore = data.scoreSetUp.substract;
      $scope.minScore = data.scoreSetUp.minScore;
      $scope.totalLevels = data.totalLevels;

      $scope.imgs = [];
      for (var i in letterJson.imgs) {
        if (letterJson.imgs[i]) {
          var img = {};
          img.name = letterJson.imgs[i].name;
          img.src = Util.getRandomElemFromArray(letterJson.imgs[i].src);
          $scope.imgs.push(img);
        }
      }
      $scope.activityProgress = 100 * ($scope.level - 1) / $scope.totalLevels;
    };

    //Verifies selected letters and returns true if they match the word
    $scope.checkLetter = function(selectedObject) {
      $scope.checkingWord = true;
      var ER = new RegExp($scope.letter, "i");
      var name = selectedObject.toLowerCase();
      if (ER.test(name)) {
        $scope.playedLetters.push($scope.letter.toLowerCase());
        setTimeout(function() {
          var position = Util.getRandomNumber($scope.successMessages.length);
          var successMessage = $scope.successMessages[position];
          $scope.speak(successMessage);
          //wait for speak
          setTimeout(function() {
            Ctrl5.levelUp(); //Advance level

            Util.saveLevel($scope.activityId, $scope.level);
            if (!$scope.finished) {
              $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
              $scope.finished = $scope.score >= $scope.minScore;
              if ($scope.finished) {
                Util.saveStatus($scope.activityId, $scope.finished);
                ActividadesFinalizadasService.add($scope.activityId);
              }
            }
            if ($scope.level >= $scope.totalLevels) {
              $state.go('lobby');
            } else {
              Ctrl5.showDashboard(); //Reload dashboard
            }
          }, 1000);
        }, 1000);

      } else {
        if (!$scope.finished) {
          $scope.score = Score.update(-$scope.substractScore, $scope.activityId, $scope.finished);
        }
        //wait for speak
        setTimeout(function() {
          $scope.checkingWord = false;
          var position = Util.getRandomNumber($scope.errorMessages.length);
          var errorMessage = $scope.errorMessages[position];
          $scope.speak(errorMessage);
        }, 1000);
      }
    };

    //Advance one level
    Ctrl5.levelUp = function() {
      $scope.level++;
      $scope.letters = [];
      $scope.dashboard = [];
      $scope.selectedLetters = [];
    };

    // Goes back one level
    Ctrl5.levelDown = function() {
      $scope.level = (level > 1) ? (level - 1) : 1;
      $scope.letters = [];
      $scope.dashboard = [];
      $scope.selectedLetters = [];
    };

    //*************** ACTIONS **************************/
    //Show Dashboard
    Ctrl5.showDashboard(true);
  });
