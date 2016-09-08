angular.module('saan.services')
.factory('LearningNumber', function($http, Util) {
  return {
    getConfig: function(level) {
      var src = 'data/9-config.json';
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          return {
            instructions : data.instructions,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            level: data.levels[level-1]
          };
        },
        function error() {
          //TODO: handle errors for real
          console.log("error");
        }
      );
    }
  };
});
