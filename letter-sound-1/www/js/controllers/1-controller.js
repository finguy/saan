angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomWord, RandomLetters) {
	$scope.activityId = '1';
  $scope.word = "";
  $scope.letters = [];
  $scope.dashBoard = [];
  $scope.selectedLetters = [];

  RandomWord.word().then(
    function success(word){
      $scope.word = word;
      var letters = word.split("");
      var src = [];
      _.each(letters, function(letter, key){
        var l  = RandomLetters.letters(letters.length, letter);
        l.push(letter);
        src.push(_.shuffle(l));
      });
      $scope.dashBoard = src;
    },
    function error(error){
      console.log(error);
    }
  );

  $scope.checkWord = function(){
    var builtWord = $scope.selectedLetters.join("");
    if (builtWord == $scope.word){
      console.log("success!!!");
    }
    else{
      console.log("nooope");
    }
  };
});
