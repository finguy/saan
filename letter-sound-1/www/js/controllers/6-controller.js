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
    var Ctrl6 = Ctrl6 || {};
    Ctrl6.showDashboard = function(readInstructions) {

      Ctrl6.setUpLevel();
      Ctrl6.setUpScore();
      Ctrl6.setUpStatus();

      RandomWordSix.word($scope.level, $scope.playedWords).then(
        function success(data) {
          Ctrl6.setUpContextVariables(data);
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

    Ctrl6.setUpLevel = function() {
      var level = Util.getLevel($scope.activityId);
      if (level) {
        $scope.level = level;
        $scope.activityProgress = 100 * (level-1)/$scope.totalLevels; // -1 porque empieza en cero.
      }
    };

    Ctrl6.setUpScore = function(){
      var score = Util.getScore($scope.activityId);
      if (score) {
        $scope.score = score
      }
    };

    Ctrl6.setUpStatus = function(){
      var finished = Util.getStatus($scope.activityId);
      if (finished === false || finished === true) {
        $scope.finished = finished;
      }
    }

    Ctrl6.setUpContextVariables = function(data) {
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
      $scope.currentPhonema = Util.getRandomElemFromArray($scope.letters);
      $scope.imgSrc = Util.getRandomElemFromArray(wordJson.imgs);
      $scope.dashboard = [$scope.word];
      $scope.wordInstruction = wordJson.instruction;
      $scope.totalLevels = data.totalLevels;
    };

    //Verifies selected letters or and returns true if they match the word
    $scope.checkPhonema = function(selectedObject) {
        var LAST_CHECK  = false;
        var moreThanOneLetter = false;
        var current = $scope.letters[0];
        var i = 0;
        while (!moreThanOneLetter && (i+1) < $scope.letters.length ) {
          moreThanOneLetter = current != $scope.letters[i+1];
          current = $scope.letters[i+1];
          i++;
        }

        LAST_CHECK = !moreThanOneLetter;
        var ER = new RegExp($scope.currentPhonema,"i");
        var name = selectedObject.toLowerCase();
        $scope.speak(name);
        if (ER.test(name)) {

            var aux = $scope.letters;
            $scope.letters = [];
            for (var i in aux) {
              if (aux[i] && aux[i] !== name) {
                $scope.letters.push(aux[i]);
              }
            }

            //wait for speak
            setTimeout(function() {
            if (LAST_CHECK) {
                Ctrl6.levelUp(); //Advance level
                $scope.score = Score.update($scope.addScore, $scope.score);
                Util.saveLevel($scope.activityId, $scope.level);
                if (!$scope.finished) { // Solo sumo o resto si no esta finalizada
                  Util.saveScore($scope.activityId, $scope.score);
                  $scope.finished = $scope.score >= $scope.minScore;
                  if ($scope.finished) {
                      Util.saveStatus($scope.activityId, $scope.finished);
                      ActividadesFinalizadasService.add($scope.activityId);
                  }
                 }
                 $scope.speak($scope.word);
                  setTimeout(function() {
                   Ctrl6.showDashboard(false); //Reload dashboard
                  }, 1000);
            } else {
              $scope.currentPhonema = Util.getRandomElemFromArray($scope.letters);
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
      setTimeout(function(){
          $scope.speak($scope.instructions);
      },1000);
    }


    //*************** ACTIONS **************************/
    //Show Dashboard
    Ctrl6.showDashboard(true);
  });
