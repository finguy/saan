angular.module('saan.services')
.factory('NumberMatching', function($http, Util) {
  return {
    getConfig: function(level) {
      var src = 'data/8-config.json';
      return $http.get(src).then(
        function success(response) {
          var data = response.data;
          return {
            instructions : data.instructions,
            errorMessages : data.errorMessages,
            successMessages: data.successMessages,
            numberRange : data.numberRange,
            cards: data.cards,
            options: data.options
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
