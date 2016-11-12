(function() {
  'use strict';
  angular.module('saan.services')
  .factory('NumberGroup', NumberGroup);

  // NumberGroup.$inject = ['$http', '$log'];

  function NumberGroup($http, $log) {


    return {
      group: group
    };

    // returns a 3 line json
    function group(target, items) {
      var data = {};
      switch(target){
        case 4:
          data.row1 = items.slice(0,2);
          data.row3 = items.slice(2);
          break;
        case 5:
          data.row1 = items.slice(0,2);
          data.row2 = items.slice(2,3);
          data.row3 = items.slice(3);
          break;
        case 6:
          data.row1 = items.slice(0,3);
          data.row2 = items.slice(3);
          break;
        case 7:
          data.row1 = items.slice(0,3);
          data.row2 = items.slice(3,4);
          data.row3 = items.slice(4);
          break;
        case 8:
          data.row1 = items.slice(0,4);
          data.row2 = items.slice(4);
          break;
        case 9:
          data.row1 = items.slice(0,4);
          data.row2 = items.slice(4,5);
          data.row3 = items.slice(5);
          break;
        case 10:
          data.row1 = items.slice(0,4);
          data.row2 = items.slice(4,6);
          data.row3 = items.slice(6);
          break;
        default:
          data.row1 = items;
          break;
      }

      return data;
    }
  }
})();
