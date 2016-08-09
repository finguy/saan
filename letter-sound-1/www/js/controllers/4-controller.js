angular.module('saan.controllers')
.controller('4Ctrl', function($scope ,RandomNumber, TTSService,
  Util, Animations) {
  $scope.activityId = '1'; // Activity Id
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


  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  //range
  $scope.range = Util.range;

  //Shows Activity Dashboard
  $scope.showDashboard = function(readInstructions) {
    var status = Util.getStatus("Activity4-level");
    if (status) {
      status = parseInt(status,10);
      $scope.level = status;
      $scope.activityProgress = 100 * (status-1)/$scope.totalLevels; // -1 porque empieza en cero.
    }
    RandomNumber.number($scope.level, $scope.playedNumbers).then(
      function success(data) {
        var numberJson = data.number;
        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        $scope.number = numberJson.number;
        $scope.imgs = numberJson.imgs;
        $scope.dashboard = [$scope.number];
        $scope.assets = data.assets;

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

  //Verifies selected letters and returns true if they match the word
  $scope.checkNumber = function(selectedObject, domId) {
    if ($scope.number === parseInt(selectedObject,10)) {
      Animations.successFireworks(domId);
      $scope.playedNumbers.push($scope.number);
        setTimeout(function() {
          var position = Util.getRandomNumber($scope.successMessages.length);
          var successMessage = $scope.successMessages[position];
          $scope.speak(successMessage);
          setTimeout(function() {
            $scope.levelUp(); //Advance level
            Util.saveStatus({key: "Activity4-level", value: $scope.level});
            $scope.showDashboard(); //Reload dashboard
          }, 1000);
      }, 4000);
    } else {
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
    $scope.numbers = [];
    $scope.dashboard = [];
    $scope.selectedNumbers = [];
  };

  //*************** ACTIONS **************************/
  //Show Dashboard
  $scope.showDashboard(true);
});
