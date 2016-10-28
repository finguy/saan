angular.module('saan.services')
.factory('MathOralProblems', function($http, $log) {
  return {
    getConfig: function(level) {
      var src = 'data/15-config.json';
      if (level >= 1){
        return $http.get(src).then(
          function success(response) {
            return response.data.levels[level-1];
          },
          function error() {
            //TODO: handle errors for real
            console.log("error");
          }
        );
      }
      else {
        $log.error("Invalid level value");
      }
    }
  };
});
