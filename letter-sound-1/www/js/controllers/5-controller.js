angular.module('saan.controllers')
.controller('5Ctrl', function($scope, RandomLetter, TTSService,
  Util,Score) {
  $scope.activityId = '5'; // Activity Id
  $scope.letter = ""; // Letter to play in level
  $scope.letterSrc = "";
  $scope.imgs = [];
  $scope.instructions = ""; // Instructions to read
  $scope.successMessages = [];
  $scope.errorMessages  = [];
  $scope.letters = []; // Word letters
  $scope.dashboard = []; // Dashboard letters
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.playedLetters = []; // Collects words the user played
  $scope.level = $scope.level || 1; // Indicates activity level
  $scope.totalLevels = 2;
  $scope.activityProgress = 0;
  $scope.score = 0;

  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  //Shows Activity Dashboard
  $scope.showDashboard = function(readInstructions) {

    $scope.setUpLevel();
    $scope.setUpScore();
    $scope.setUpStatus();

    var status = Util.getStatus("Activity5-level");
    if (status) {
      status = parseInt(status,10);
      $scope.level = status;
      $scope.activityProgress = 100 * (status-1)/$scope.totalLevels; // -1 porque empieza en cero.
    }
    RandomLetter.letter($scope.level, $scope.playedLetters).then(
      function success(data) {

        $scope.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 2000 : 1000;
        //wait for UI to load
        setTimeout(function() {
          if (readInstructions){
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
  };

  $scope.setUpContextVariables = function(data) {
        var letterJson = data.letter;
        $scope.letterSrc  = letterJson.letterSrc;
        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        $scope.letter = letterJson.letter;
        $scope.dashboard = [$scope.letter];
        $scope.addScore = data.scoreSetUp.add;
        $scope.substractScore = data.scoreSetUp.substract;
        $scope.minScore = data.scoreSetUp.minScore;

        $scope.imgs = [];
         for (var i in letterJson.imgs){
           if (letterJson.imgs[i]) {
              var img = {};
              img.name = letterJson.imgs[i].name;
              img.src = Util.getRandomElemFromArray(letterJson.imgs[i].src);
              $scope.imgs.push(img);
           }
         }

  };

  //Verifies selected letters and returns true if they match the word
  $scope.checkLetter = function(selectedObject) {
    var ER = new RegExp($scope.letter,"i");
    var name = selectedObject.toLowerCase();
    if (ER.test(name)) {
      $scope.playedLetters.push($scope.letter.toLowerCase());
        setTimeout(function() {
          var position = Util.getRandomNumber($scope.successMessages.length);
          var successMessage = $scope.successMessages[position];
          $scope.speak(successMessage);
          //wait for speak
          setTimeout(function() {
            $scope.levelUp(); //Advance level
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
            $scope.showDashboard(); //Reload dashboard
          }, 1000);
        }, 1000);

    } else {
      $scope.score = Score.update(-$scope.substractScore, $scope.score);
      console.log($scope.score);
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

  //*************** ACTIONS **************************/
  //Show Dashboard
  $scope.showDashboard(true);
});
