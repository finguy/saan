angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomWord, RandomLetters, TTSService) {
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

        var readWordTimeout = (readInstructions)? 2000 : 1000;
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
    if (builtWord.toLowerCase() === $scope.word.toLowerCase()) {
      $scope.playedWords.push(builtWord.toLowerCase());
      return true;
    } else {
      return false;
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
