angular.module('saan.services')
.factory('NumberOperations', function($http, Util) {
  return {
    getConfig: function(level) {
      var src = 'data/14-config.json';
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          return {
            instructions : data.instructions,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            numberRange : parseInt(data.numberRange, 10),
            options: parseInt(data.options, 10),
            optionsRange: parseInt(data.optionsRange, 10),
            mode: parseInt(data.mode, 10)
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
