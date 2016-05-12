angular.module('starter.controllers', [])


<<<<<<< HEAD
.controller('DashCtrl', function($scope, RandomWord, RandomLetters) {
  $scope.word = "";
  $scope.letters = [];
  $scope.dashBoard = [];

  RandomWord.word(function(word){  
    $scope.word = word;
    var letters = word.split("");
    var src = [];
    _.each(letters, function(letter, key){
      var l  = RandomLetters.letters(letters.length, letter);
      l.push(letter);
      src.push(_.shuffle(l));
    });
    $scope.dashBoard = src;
=======
.controller('DashCtrl', function($scope, RandomWord) {
  RandomWord.word().then(function(data) {
    $scope.word = data;
>>>>>>> dev
  });
})

.controller('ChatsCtrl', function($scope, Chats, RandomWord) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
  $scope.word = RandomWord.word();
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
