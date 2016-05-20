angular.module('saan.services', [])

.factory('Config', ['$http', '$q', function($http, $q) {
  // Might use a resource here that returns a JSON array
  var get = function(){
    var deferred = $q.defer();
    if(this.config){
      deferred.resolve(this.config);
      return deferred;
    }
    else

    return $http({
      method : 'GET',
      url: 'config.json'
    }).then(function successCallback(response){
      this.config = response.data;
      return response.data;

    },function errorCallback(){

    });

  };


  return {
    get : get
  };
}])
.factory('ActividadesFinalizadasService', ['$window', function($window) {

  var FINISHED_ACTIVITIES = "finishedActivities";

  var marcarComoFinalizada = function (activityId) {
    var finishedActivities = JSON.parse($window.localStorage.getItem(FINISHED_ACTIVITIES)) || [];
    finishedActivities.push(activityId);
    $window.localStorage.setItem(FINISHED_ACTIVITIES, JSON.stringify(finishedActivities));
  },
  getActividadesFinalizadas = function () {
    return JSON.parse($window.localStorage.getItem(FINISHED_ACTIVITIES)) || [];
  };


  return {
    add : marcarComoFinalizada,
    get : getActividadesFinalizadas
  };
}])
.factory('TTSService', ['$q', function($q) {

  var speak = function(word){
    var deferred = $q.defer();
    if(cordova && cordova.plugins.TTS){
      cordova.plugins.TTS.speak(word, function(){
        deferred.resolve();
      },function(error){
        deferred.reject("Error using cordova TTS plugin");
        console.error(error);
      });
    }else{
        deferred.reject("Error using cordova TTS plugin");
        console.error("Cordova TTS plugin is not loaded");
    }
    return deferred.promise;
  };


  return {
    speak : speak
  };
}])
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
});
