angular.module('saan.controllers')
.controller('4Ctrl', function($scope, RandomNumber, TTSService,
  Util, Animations, Score, ActividadesFinalizadasService) {
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
  $scope.numberDragged = [];

  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  var Ctrl4 = Ctrl4 || {};

  Ctrl4.setUpLevel = function() {
    var level = Util.getLevel($scope.activityId);
    if (level) {
      $scope.level = level;
      $scope.activityProgress = 100 * (level-1)/$scope.totalLevels; // -1 porque empieza en cero.
    }
  };

  Ctrl4.setUpScore = function(){
    var score = Util.getScore($scope.activityId);
    if (score) {
      $scope.score = score
    }
  };

  Ctrl4.setUpStatus = function(){
    var finished = Util.getStatus($scope.activityId);
    if (finished === false || finished === true) {
      $scope.finished = finished;
    }
  }

  //Shows Activity Dashboard
  Ctrl4.showDashboard = function(readInstructions) {

    Ctrl4.setUpLevel();
    Ctrl4.setUpScore();
    Ctrl4.setUpStatus();

    RandomNumber.number($scope.level, $scope.playedNumbers).then(
      function success(data) {
        Ctrl4.setUpContextVariables(data);
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
  Ctrl4.setUpContextVariables = function(data) {
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

    var length = $scope.assets.length;
    var used = [];
    for (var i in numberJson.imgs){
      if (numberJson.imgs[i]) {
         var img = {};
         img.name = numberJson.imgs[i].name;
         img.src = [];
         //Select an unused asset
         var index = Util.getRandomNumber(length);
         while (used[index] || !$scope.assets[index]) {
            index = Util.getRandomNumber(length);
         }
         used[index] = true;
         for (var j=0; j < img.name; j++) {
           img.src.push($scope.assets[index]);
         }
         $scope.imgs.push(img);
      }
    }
  };
  $scope.handleProgress = function(numberOk) {
    if (numberOk) {
      $scope.playedNumbers.push($scope.number);
          var position = Util.getRandomNumber($scope.successMessages.length);
          var successMessage = $scope.successMessages[position];
          $scope.speak(successMessage);
          //wait for speak
          setTimeout(function() {
            Ctrl4.levelUp(); //Advance level
            $scope.score = Score.update($scope.addScore, $scope.score);
            Util.saveLevel($scope.activityId, $scope.level);
            if (!$scope.finished) { // Solo sumo o resto si no esta finalizada, porque puedo volver a jugar estando finalizada
              Util.saveScore($scope.activityId, $scope.score);
              $scope.finished = $scope.score >= $scope.minScore;
              if ($scope.finished) {
                  Util.saveStatus($scope.activityId, $scope.finished);
                  ActividadesFinalizadasService.add($scope.activityId);
              }
            }
            Ctrl4.showDashboard(); //Reload dashboard
          }, 1000);
    } else {
      $scope.score = Score.update(-$scope.substractScore, $scope.score);
      Util.saveScore($scope.activityId, $scope.score);
      var position = Util.getRandomNumber($scope.errorMessages.length);
      var errorMessage = $scope.errorMessages[position];
      $scope.speak(errorMessage);
    }
  }


  //Advance one level
  Ctrl4.levelUp = function() {
    $scope.level++;
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };

  // Goes back one level
  Ctrl4.levelDown = function() {
   $scope.level = (level > 1) ? (level - 1) : 1;
    $scope.numbers = [];
    $scope.dashboard = [];
    $scope.selectedNumbers = [];
  };

  //DRAG and Drop
  $scope.selectNumber = function(id, name) {
   if (!scope.checkingNumber){
    $scope.selectedObject = name;
    $scope.checkNumber(name, id);
  }
  };

  //Drag
  $scope.sortableSourceOptions = {
    containment: '.activity4-content',
    containerPositioning: 'relative',
    clone: false,
    dragEnd: function(eventObj) {
      if (!$scope.sortableTargetOptions.accept(eventObj.source.itemScope, eventObj.dest.sortableScope)){
        $scope.handleProgress(false);
      } else {
        console.log("move again!");
      }
    },itemMoved: function (eventObj) {
      $scope.handleProgress(true);
    }
  };

  //Drop
  $scope.sortableTargetOptions = {
    accept: function(sourceItemHandleScope, destSortableScope){
      return sourceItemHandleScope.modelValue.name == $scope.number;
    }
  };


  //*************** ACTIONS **************************/
  //Show Dashboard
  Ctrl4.showDashboard(true);
});
