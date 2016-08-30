angular.module('saan.controllers')
.controller('4Ctrl', function($scope ,RandomNumber, TTSService,
  Util, Animations, Score) {
  $scope.activityId = '4'; // Activity Id
  $scope.number = null; // Letter to play in level
  $scope.imgs = [];
  $scope.assets = [];
  $scope.instructions = ""; // Instructions to read
  $scope.successMessages = [];
  $scope.errorMessages  = [];
  $scope.numbers = []; // Word letters
  $scope.dashboard = []; // Dashboard letters
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.playedNumbers = []; // Collects words the user played
  $scope.level = $scope.level || 1; // Indicates activity level
  $scope.totalLevels = 3;
  $scope.activityProgress = 0;
  $scope.score = 0;
  $scope.checkingNumber = false;


  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

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

  //Shows Activity Dashboard
  $scope.showDashboard = function(readInstructions) {

    $scope.setUpLevel();
    $scope.setUpScore();
    $scope.setUpStatus();

    RandomNumber.number($scope.level, $scope.playedNumbers).then(
      function success(data) {
        $scope.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 2000 : 1000;

        //wait for UI to load
        setTimeout(function() {
          if (readInstructions){
            $scope.speak($scope.instructions);
              setTimeout(function() {
                $scope.speak($scope.number);
              }, 8000);
          } else {
            $scope.speak($scope.number);
          }
        }, readWordTimeout);

      },
      function error(error) {
        console.log(error);
      }
    );
  };
  $scope.setUpContextVariables = function(data) {
    var numberJson = data.number;
    $scope.instructions = data.instructions;
    $scope.successMessages = data.successMessages;
    $scope.errorMessages = data.errorMessages;
    $scope.number = numberJson.number;
    $scope.imgs = [];
    $scope.dashboard = [$scope.number];
    $scope.assets = data.assets;
    $scope.addScore = data.scoreSetUp.add;
    $scope.substractScore = data.scoreSetUp.substract;
    $scope.minScore = data.scoreSetUp.minScore;
    $scope.totalLevels = data.totalLevels;
    $scope.checkingNumber = false;

    var length = $scope.assets.length;
    for (var i in numberJson.imgs){
      if (numberJson.imgs[i]) {
         var img = {};
         img.name = numberJson.imgs[i].name;
         img.src = [];
         //var used = [];
         var index = Util.getRandomNumber(length);
         for (var j=0; j < img.name; j++) {
           //var index = Util.getRandomNumber(length);
           /*while (used[index] || !$scope.assets[index]) {
              index = Util.getRandomNumber(length);
           }*/
          // used[index] = true;
           img.src.push($scope.assets[index]);
         }
         $scope.imgs.push(img);
      }
    }
  };
  //Verifies selected letters and returns true if they match the word
  $scope.checkNumber = function(selectedObject, domId) {
    if ($scope.number === parseInt(selectedObject,10)) {
      $scope.checkingNumber = true;
      Animations.successFireworks(domId);
      $scope.playedNumbers.push($scope.number);
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
      }, 4000);
    } else {
      //wait for speak
      setTimeout(function() {
        $scope.checkingNumber = false;
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
    $scope.numbers = [];
    $scope.dashboard = [];
    $scope.selectedNumbers = [];
  };

  //*************** ACTIONS **************************/
  //Show Dashboard
  $scope.showDashboard(true);
});
