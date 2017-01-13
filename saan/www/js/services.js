angular.module('saan.services', [])

.factory('Config', ['$http', '$q', function($http, $q) {
    // Might use a resource here that returns a JSON array
    var get = function() {
      var deferred = $q.defer();
      if (this.config) {
        deferred.resolve(this.config);
        return deferred;
      } else

        return $http({
        method: 'GET',
        url: 'config.json'
      }).then(function successCallback(response) {
        this.config = response.data;
        return response.data;

      }, function errorCallback() {

      });

    };


    return {
      get: get
    };
  }])
  .factory('ActividadesFinalizadasService', ['$window', function($window) {

    var FINISHED_ACTIVITIES = "finishedActivities";
    var FINISHED_ACTIVITIES_MAX = "finishedActivitiesMax";

    var marcarComoFinalizada = function(activityId) {
        var finishedActivities = JSON.parse($window.localStorage.getItem(FINISHED_ACTIVITIES)) || [];
        if (_.indexOf(finishedActivities, activityId) == -1){
          finishedActivities.push(activityId);
          $window.localStorage.setItem(FINISHED_ACTIVITIES, JSON.stringify(finishedActivities));
        }
      },
      getActividadesFinalizadas = function() {
        return JSON.parse($window.localStorage.getItem(FINISHED_ACTIVITIES)) || [];
      },
      actividadFinalizada = function(activityId){
        var finishedActivities = JSON.parse($window.localStorage.getItem(FINISHED_ACTIVITIES)) || [];
        return _.indexOf(finishedActivities, activityId) != -1;
      },
      actividadFinalizadaMax = function(activityId){
        var finishedActivities = JSON.parse($window.localStorage.getItem(FINISHED_ACTIVITIES_MAX)) || [];
        return _.indexOf(finishedActivities, activityId) != -1;
      },
      marcarFinalizadaMax = function(activityId) {
        var finishedActivities = JSON.parse($window.localStorage.getItem(FINISHED_ACTIVITIES_MAX)) || [];
        if (_.indexOf(finishedActivities, activityId) == -1){
          finishedActivities.push(activityId);
          $window.localStorage.setItem(FINISHED_ACTIVITIES_MAX, JSON.stringify(finishedActivities));
        }
      };

    return {
      add: marcarComoFinalizada,
      get: getActividadesFinalizadas,
      finalizada: actividadFinalizada,
      maxFinalizada: actividadFinalizadaMax,
      addMax: marcarFinalizadaMax
    };
  }])
  .factory('TTSService', ['$q', function($q) {
    var speak = function(word, locale, rate) {
      var deferred = $q.defer();
      if (cordova && cordova.plugins.TTS) {
        var args = {
          "text": word,
          "locale": locale,
          "rate": rate
        };

        return cordova.plugins.TTS.speak(args, function() {
          deferred.resolve();
        }, function(error) {
          deferred.reject("Error using cordova TTS plugin");
          console.error(error);
        });
      } else {
        deferred.reject("Error using cordova TTS plugin");
        console.error("Cordova TTS plugin is not loaded");
      }
      return deferred.promise;
    };
    return {
      speak: speak
    };

  }]);
