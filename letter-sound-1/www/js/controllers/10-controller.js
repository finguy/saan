angular.module('saan.controllers')
.controller('10Ctrl', function($scope ,RandomWordTen, TTSService,
  Util, Animations, Score,ActividadesFinalizadasService) {
  $scope.activityId = '10'; // Activity Id
  $scope.word = []; // Letter to play in level
  $scope.wordStr = "";
  $scope.rimes = [];
  $scope.words = [];
  $scope.img = "";
  $scope.assets = [];
  $scope.playedWords = [];
  $scope.instructions = ""; // Instructions to read
  $scope.successMessages = [];
  $scope.errorMessages  = [];
  $scope.numbers = []; // Word letters
  $scope.dashboard = []; // Dashboard letters
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.playedWords = []; // Collects words the user played
  $scope.level = $scope.level || 1; // Indicates activity level
  $scope.totalLevels = 3;
  $scope.activityProgress = 0;
  $scope.score = 0;
  $scope.checkingNumber = false;

  $scope.imgsDragged = [];

  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  var Ctrl10 = Ctrl10 || {};

  Ctrl10.setUpLevel = function() {
    var level = Util.getLevel($scope.activityId);
    if (level) {
      $scope.level = level;
      $scope.activityProgress = 100 * (level-1)/$scope.totalLevels; // -1 porque empieza en cero.
    }
  };

  Ctrl10.setUpScore = function(){
    var score = Util.getScore($scope.activityId);
    if (score) {
      $scope.score = score
    }
  };

  Ctrl10.setUpStatus = function(){
    var finished = Util.getStatus($scope.activityId);
    if (finished === false || finished === true) {
      $scope.finished = finished;
    }
  }

  //Shows Activity Dashboard
  Ctrl10.showDashboard = function(readInstructions) {

    Ctrl10.setUpLevel();
    Ctrl10.setUpScore();
    Ctrl10.setUpStatus();

    RandomWordTen.word($scope.level, $scope.playedWords).then(
      function success(data) {
        Ctrl10.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 2000 : 1000;

        //wait for UI to load
        setTimeout(function() {
          if (readInstructions){
            $scope.speak($scope.instructions);
              setTimeout(function() {
                $scope.speak($scope.wordStr);
              }, 3000);
          } else {
            $scope.speak($scope.wordStr);
          }
        }, readWordTimeout);

      },
      function error(error) {
        console.log(error);
      }
    );
  };
  Ctrl10.setUpContextVariables = function(data) {
    var wordJson = data.wordJson;
    $scope.playedWords.push(wordJson.word);
    $scope.wordStr = wordJson.word;
    $scope.word = wordJson.word.split("");
    $scope.rimesStr = wordJson.rimes.join(",");
    var index = Util.getRandomNumber(wordJson.rimes.length);
    var rime = wordJson.rimes[index];
    var wordsToPlay = [];

    for (var j in data.allWords) {
      if (data.allWords[j]) {
        var ER = new RegExp(data.allWords[j],"i");
        if (!ER.test($scope.rimesStr)) {
            wordsToPlay.push({"letters": data.allWords[j].split(""), "word": data.allWords[j]});
        }
      }
    }

    wordsToPlay.length = 3;
    wordsToPlay.push({"word":rime, "letters": rime.split("")});
    $scope.words = _.shuffle(wordsToPlay);

    $scope.instructions = data.instructions;
    $scope.successMessages = data.successMessages;
    $scope.errorMessages = data.errorMessages;
    var index = Util.getRandomNumber(wordJson.imgs.length);
    $scope.img = wordJson.imgs[index];
    $scope.dashboard = [$scope.number];
    $scope.assets = data.assets;
    $scope.addScore = data.scoreSetUp.add;
    $scope.substractScore = data.scoreSetUp.substract;
    $scope.minScore = data.scoreSetUp.minScore;
    $scope.totalLevels = data.totalLevels;
    $scope.checkingNumber = false;

  };

    $scope.handleProgress = function(isWordOk) {
          if (isWordOk) {
              $scope.speak($scope.word +" rimes with " + $scope.draggedWord);
              //wait for speak
              setTimeout(function() {
              if (!$scope.finished) {
                $scope.score = Score.update($scope.addScore, $scope.score);
                Util.saveScore($scope.activityId, $scope.score);
              }
              var position = Util.getRandomNumber($scope.successMessages.length);
              var successMessage = $scope.successMessages[position];
              $scope.speak(successMessage);
              setTimeout(function() {
                Ctrl10.levelUp(); //Advance level
                Util.saveLevel($scope.activityId, $scope.level);
                if (!$scope.finished) { // Solo sumo o resto si no esta finalizada
                  $scope.finished = $scope.score >= $scope.minScore;
                  Util.saveStatus($scope.activityId, $scope.finished);
                  ActividadesFinalizadasService.add($scope.activityId);
                }
                Ctrl10.showDashboard(false); //Reload dashboard

              }, 1000);
            }, 4000);
            } else {
                $scope.score = Score.update(-$scope.substractScore, $scope.score);
                Util.saveScore($scope.activityId, $scope.score);
                $scope.speak(name);
                //wait for speak
                setTimeout(function() {
                  var position = Util.getRandomNumber($scope.errorMessages.length);
                  var errorMessage = $scope.errorMessages[position];
                  $scope.speak(errorMessage);
                }, 1000);
            }


      };

  //Advance one level
  Ctrl10.levelUp = function() {
    $scope.level++;
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };

  // Goes back one level
  Ctrl10.levelDown = function() {
   $scope.level = (level > 1) ? (level - 1) : 1;
    $scope.numbers = [];
    $scope.dashboard = [];
    $scope.selectedNumbers = [];
  };

  //*************** ACTIONS **************************/
  //Show Dashboard
  Ctrl10.showDashboard(true);
});