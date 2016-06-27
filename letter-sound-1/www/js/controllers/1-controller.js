angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomLetter, TTSService,
  Util) {
  $scope.activityId = '1'; // Activity Id
  $scope.letter = ""; // Letter to play in level
  $scope.imgs = [];
  $scope.instructions = ""; // Instructions to read
  $scope.successMessages = [];
  $scope.errorMessages  = [];
  $scope.letters = []; // Word letters
  $scope.dashboard = []; // Dashboard letters
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.playedLetters = []; // Collects words the user played
  $scope.level = $scope.level || 1; // Indicates activity level
  $scope.upperCase = "";
  $scope.lowercase = "";
  $scope.isUpperCase = true;
  $scope.isLowerCase = false;
  $scope.isActivity = false;
  $scope.counter = 0;

  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  //Shows Activity Dashboard
  $scope.showDashboard = function(readInstructions) {
    RandomLetter.letter($scope.level, $scope.playedLetters).then(
      function success(data) {
        var letterJson = data.letter;

        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        $scope.letter = letterJson.letter;
        $scope.upperCase = letterJson.letter.toUpperCase();
        $scope.lowercase = letterJson.letter.toLowerCase();
        $scope.imgs = letterJson.imgs;
        $scope.dashboard = [$scope.letter];

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
            $scope.showDashboard(); //Reload dashboard
          }, 1000);
        }, 1000);

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
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };

  $scope.showPage = function(){
    $scope.counter = ($scope.counter + 1 ) % 3;
    $scope.isUpperCase = $scope.counter == 1;
    $scope.isLowerCase = $scope.counter == 2;
    $scope.isActivity = $scope.counter == 0;

    if ($scope.isActivity ) {
      // read letter instruction
    }
  };
  //*************** ACTIONS **************************/
  //Show Dashboard
  $scope.showDashboard(true);
});
