angular.module('saan.controllers')

.controller('3Ctrl', function($scope, RandomLetterThree, TTSService,
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

    //Reproduces sound using TTSService
    $scope.speak = TTSService.speak;

    //Shows Activity Dashboard
    $scope.showDashboard = function(readInstructions) {
      RandomLetterThree.letter($scope.level, $scope.playedLetters).then(
        function success(data) {
          var letterJson = data.letter;
          $scope.instructions = data.instructions;
          $scope.successMessages = data.successMessages;
          $scope.errorMessages = data.errorMessages;
          $scope.letter = letterJson.letter;
          $scope.upperCaseImgSrc = letterJson.upperCaseImg;
          $scope.lowerCaseImgSrc =  letterJson.lowerCaseImg;
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

    $scope.showPage = function() {
      $scope.isActivity = true;
    }

    //*************** ACTIONS **************************/
    //Show Dashboard
    $scope.showDashboard(true);
  });
