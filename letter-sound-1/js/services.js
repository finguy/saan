angular.module('saan.services', ['underscore'])

.factory('Config', ['$http', '_', '$q', function($http, _, $q) {
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

    })
      
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
  }
  

  return {
    add : marcarComoFinalizada,
    get : getActividadesFinalizadas
  };
}])
.factory('TTSService', ['$q', function($q) {
  
  var speak = function(word,locale,rate){
    var deferred = $q.defer();
    if(cordova && cordova.plugins.TTS){
      var args = {"text":word,
  				  "locale":locale,
  				  "rate":rate};
      cordova.plugins.TTS.speak(args, function(){
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
  }
  

  return {
    speak : speak
  };
}])
.factory('MediaService', ['$window', function($window) {
  var media = function (source) {
	 var my_media = new Media(source,
			function(param){console.log("MediaService OK : " + param )},
			function(param){console.log("MediaService Error : " + param)},
			function(param){console.log("MediaService Status : " + param)})
			console.log("Factory MediaServie" );
			return my_media;
  }
  return {
    media : media
  };
}])