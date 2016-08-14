angular.module('saan.controllers')

.controller('6Ctrl', function($scope, RandomWordSix, TTSService,
  Util,Score,ActividadesFinalizadasService) {
    $scope.activityId = '6'; // Activity Id
    $scope.word = ""; // Letter to play in level
    $scope.letters = [];
    $scope.lettersDragged = [];
    $scope.imgSrc = "";
    $scope.instructions = ""; // Instructions to read
    $scope.successMessages = [];
    $scope.errorMessages  = [];
    $scope.letters = []; // Word letters
    $scope.dashboard = []; // Dashboard letters
    $scope.selectedObject = ""; // Collects letters the user selects
    $scope.playedWords = []; // Collects words the user played
    $scope.level = $scope.level || 1; // Indicates activity level
    $scope.totalLevels = 3;
    $scope.activityProgress = 0;
    $scope.letterInstruction = "";
    $scope.score = 0;
    $scope.status = false;

    //Reproduces sound using TTSService
    $scope.speak = TTSService.speak;

    //Shows Activity Dashboard
    $scope.showDashboard = function(readInstructions) {

      $scope.setUpLevel();
      $scope.setUpScore();
      $scope.setUpStatus();

      RandomWordSix.word($scope.level, $scope.playedWords).then(
        function success(data) {
          $scope.setUpContextVariables(data);
          //wait for UI to load
          var readWordTimeout = (readInstructions) ? 4000 : 1000;
          setTimeout(function() {
            if (readInstructions){
              $scope.speak($scope.instructions);
            }

            setTimeout(function() {
                $scope.speak($scope.currentPhonema);
            }, readWordTimeout);
          }, readWordTimeout);
        },
        function error(error) {
          console.log(error);
        }
      );
    };

    $scope.setUpLevel = function() {
      var level = Util.getLevel($scope.activityId);
      if (level) {
        $scope.level = level;
        $scope.activityProgress = 100 * (level-1)/$scope.totalLevels; // -1 porque empieza en cero.
      }
    };

    $scope.setUpScore = function(){
      var score = Util.getScore($scope.activityId);
      if (score) {
        $scope.score = score
      }
    };

    $scope.setUpStatus = function(){
      var finished = Util.getStatus($scope.activityId);
      if (finished === false || finished === true) {
        $scope.finished = finished;
      }
    }

    $scope.setUpContextVariables = function(data) {
      var wordJson = data.word;
      $scope.instructions = data.instructions;
      $scope.successMessages = data.successMessages;
      $scope.errorMessages = data.errorMessages;
      $scope.addScore = data.scoreSetUp.add;
      $scope.substractScore = data.scoreSetUp.substract;
      $scope.minScore = data.scoreSetUp.minScore;
      $scope.word = wordJson.word;
      $scope.playedWords.push(wordJson.word);
      $scope.letters = wordJson.word.split("");
      $scope.lettersDragged = wordJson.word.split("");
      $scope.currentPhonema = $scope.letters[0];
      $scope.imgSrc = Util.getRandomElemFromArray(wordJson.imgs);
      $scope.dashboard = [$scope.word];
      $scope.wordInstruction = wordJson.instruction;
    };

    //Verifies selected letters or and returns true if they match the word
    $scope.checkPhonema = function(selectedObject) {
        var LAST_CHECK = $scope.letters.length === 1;
        console.log("LAST_CHECK:");
        console.log(LAST_CHECK);
        var ER = new RegExp($scope.currentPhonema,"i");
        var name = selectedObject.toLowerCase();
        $scope.speak(name);
        if (ER.test(name)) {
            $scope.letters.shift();
            setTimeout(function() {
            if (LAST_CHECK) {
              //wait for speak

                $scope.levelUp(); //Advance level
              /*  $scope.score = Score.update($scope.addScore, $scope.score);
                Util.saveLevel($scope.activityId, $scope.level);
                if (!$scope.finished) { // Solo sumo o resto si no esta finalizada
                  Util.saveScore($scope.activityId, $scope.score);
                  $scope.finished = $scope.score >= $scope.minScore;
                  if ($scope.finished) {
                      Util.saveStatus($scope.activityId, $scope.finished);
                      ActividadesFinalizadasService.add($scope.activityId);
                  }*/
                  console.log("before showing dashboard:");
                  $scope.showDashboard(false); //Reload dashboard
                //}

            } else {
              $scope.currentPhonema = $scope.letters[0];
              setTimeout(function() {
                var position = Util.getRandomNumber($scope.successMessages.length);
                var successMessage = $scope.successMessages[position];
                $scope.speak(successMessage);
                setTimeout(function() {
                  $scope.speak($scope.currentPhonema);
                }, 1000);
              });
            }
           }, 1000);
          } else {
            $scope.score = Score.update(-$scope.substractScore, $scope.score);
            Util.saveScore($scope.activityId, $scope.score);
            //wait for speak
            setTimeout(function() {
              var position = Util.getRandomNumber($scope.errorMessages.length);
              var errorMessage = $scope.errorMessages[position];
              $scope.speak(errorMessage);
            }, 1000);
          }


    };

    //Advance one level
    $scope.levelUp = function() {
      $scope.level++;
      $scope.letters = [];
      $scope.dashboard = [];
      $scope.selectedLetters = [];
    };

    // Goes back one level
    $scope.levelDown = function() {
      $scope.level = (level > 1) ? (level - 1) : 1;
      $scope.letters = [];
      $scope.dashboard = [];
      $scope.selectedLetters = [];
    };

    $scope.showPage = function() {
      $scope.isActivity = true;
      $scope.instructions = $scope.letterInstruction;
      setTimeout(function(){
          $scope.speak($scope.instructions);
      },1000);
    }


    //*************** ACTIONS **************************/
    //Show Dashboard
    $scope.showDashboard(true);
  });
