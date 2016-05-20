angular.module('saan.services')

.factory('RandomWord', function($http){
  return {
    word : function(){
      return $http.get('data/words.json').then(
        function success(response) {
          var data = response.data;
          var position = Math.floor((Math.random() * data.words.length));
          return data.words[position];
        },
        function error(){
          //TODO: handle errors for real
          console.log("error");
        }
      );
    }
  };
})

.factory('RandomLetters', function($http){
  return {
    letters : function(cant, word){
      var differentLetters = [];
      var cantLetters = 24;
      if (word) {
        differentLetters = word.split("");
      }
      if (cant > 0) {
          cantLetters = cant;
      }
      var alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
      return _.chain(alphabet)
      .difference(differentLetters) // Remove from alphabet letters in word
      .sample(cantLetters)
      .value();
    },
  };
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
