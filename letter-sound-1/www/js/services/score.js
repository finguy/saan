angular.module('saan.services')

.service('Score',function(Util) {
    return {
      update: function(points, activityId, isFinalized) {
         var currentScore = Util.getScore(activityId);
         var score = currentScore  + points;
         if ( score >= 0 && !isFinalized) {
            Util.saveScore(activityId, score);
            return score;
         } else if (isFinalized) {
           return currentScore;
         }

          return 0;
      },
      isActivityFinished: function(jsonScore, currentScore) {
        return jsonScore.minScore <= currentScore;
      }
  };
});
