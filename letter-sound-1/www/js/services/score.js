angular.module('saan.services')

.service('Score', function($http, Levels) {
    return {
      update: function(points, currentScore) {
         if ( (currentScore + points) >= 0){
            return currentScore + points;
          }
          return 0;
      },
      isActivityFinished: function(jsonScore, currentScore) {
        return jsonScore.minScore <= currentScore;
      }
  }
});
