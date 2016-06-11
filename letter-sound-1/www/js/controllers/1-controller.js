angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomWord, RandomLetters, TTSService,
  Util) {
  $scope.activityId = '1'; // Activity Id
  $scope.word = ""; // Word to play in level
  $scope.instructions = ""; // Instructions to read
  $scope.successMessages = [];
  $scope.errorMessages  = [];
  $scope.letters = []; // Word letters
  $scope.dashboard = []; // Dashboard letters
  $scope.selectedLetters = []; // Collects letters the user selects
  $scope.playedWords = []; // Collects words the user played
  $scope.level = $scope.level || 1; // Indicates activity level

  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  //Shows Activity Dashboard
  $scope.showDashboard = function(readInstructions) {
    RandomWord.word($scope.level, $scope.playedWords).then(
      function success(data) {
        var word = data.word;
        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        $scope.word = word;
        var letters = word.split("");
        var src = [];
        _.each(letters, function(letter, key) {
          var l = RandomLetters.letters(letters.length, letter);
          l.push(letter);
          src.push(_.shuffle(l));
        });
        $scope.dashboard = src;

        var readWordTimeout = (readInstructions) ? 2000 : 1000;
        //wait for UI to load
        setTimeout(function() {
          if (readInstructions){
            $scope.speak($scope.instructions);
              setTimeout(function() {
                $scope.speak($scope.word);
              }, 7000);
          } else {
            $scope.speak($scope.word);
          }
        }, readWordTimeout);

      },
      function error(error) {
        console.log(error);
      }
    );
  };

  //Verifies selected letters and returns true if they match the word
  $scope.checkWord = function() {
    var builtWord = $scope.selectedLetters.join("");

    setTimeout(function(){
      $scope.speak(builtWord);
    }, 100);

    if (builtWord.toLowerCase() === $scope.word.toLowerCase()) {
      $scope.playedWords.push(builtWord.toLowerCase());

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

  //*************** ACTIONS **************************/
  //Show Dashboard
  $scope.showDashboard(true);
});
