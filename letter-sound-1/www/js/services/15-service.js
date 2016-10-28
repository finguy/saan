angular.module('saan.services')
.factory('MathOralProblems', function($http) {
  return {
    getConfig: function(level) {
      var src = 'data/15-config2.json';
      return $http.get(src).then(
        function success(response) {
          return response.data;
        },
        function error() {
          //TODO: handle errors for real
          console.log("error");
        }
      );
    }
  };
});
