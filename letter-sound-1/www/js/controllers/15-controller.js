(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('15Ctrl', ['$scope', '$log', '$state', 'MathOralProblems', 'AssetsPath', 'ActividadesFinalizadasService',
  function ($scope, $log, $state, MathOralProblems, AssetsPath, ActividadesFinalizadasService) {
    $scope.activityId = '15';

    var Ctrl15 = Ctrl15 || {};

    var config;
    var stage;
    var level;

    $scope.$on('$ionicView.beforeEnter', function() {
      stage = 1; //TODO: retrieve and load from local storage
      level = 1; //TODO: retrieve and load from local storage
      Ctrl15.getConfiguration(level);
    });

    Ctrl15.getConfiguration = function (level){
      MathOralProblems.getConfig(level).then(function(data){
        config = data;
        Ctrl15.setActivity(Ctrl15.getStage(stage));
      });
    };

    Ctrl15.setActivity = function(stageData){
      $scope.options = [];

      var instructionsPlayer = new Media(AssetsPath.sounds(stageData.soundPath),
        function(){ $scope.$apply(Ctrl15.showOptions(stageData)); },
        function(err){ console.log(err); }
      );

      instructionsPlayer.play();
    };

    Ctrl15.getStage = function(stage){
      return config.problems[stage-1];
    };

    Ctrl15.showOptions = function(stageData){
      var options = [];
      options.push(stageData.answer);

      var number;
      for (var i = 1; i < config.options; i++){
        var valid = false;
        while (!valid){
          number = Math.floor(Math.random() * 10);
          var index = _.findIndex(options, function(option){return option === number;}, number);
          valid = (number !== 0 && index === -1);
        }

        options.push(number);
      }

      $scope.options = _.shuffle(options);
    };

    $scope.checkAnswer = function(value){
      if (value === Ctrl15.getStage(stage).answer){
        stage++;
        if (stage <= config.problems.length){
          setTimeout(function(){
            $scope.$apply(function(){ Ctrl15.setActivity(Ctrl15.getStage(stage));});
          }, 1000);
        }
        else{
          ActividadesFinalizadasService.add($scope.activityId);
          $state.go('lobby');
        }
      }
    };
   }]);
})();
