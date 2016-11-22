(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('15Ctrl', ['$scope', '$log', '$state', '$timeout', 'MathOralProblems',
  'AssetsPath', 'ActividadesFinalizadasService', 'Util',
  function ($scope, $log, $state, $timeout, MathOralProblems, AssetsPath,
    ActividadesFinalizadasService, Util) {
    $scope.activityId = 15;

    var Ctrl15 = Ctrl15 || {};

    var config;
    var stageNumber;
    var stageData;
    var level;

    //media players
    var instructionsPlayer;
    var problemPlayer;

    $scope.$on('$ionicView.beforeEnter', function() {
      stageNumber = 1;
      level = Util.getLevel($scope.activityId) || 1;
      Ctrl15.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);
    });

    Ctrl15.getConfiguration = function (level){
      MathOralProblems.getConfig(level).then(function(data){

        config = data;

        //play instructions of activity
        instructionsPlayer = new Media(AssetsPath.sounds(config.instructionsPath),
          function(){
            Ctrl15.setActivity();
            instructionsPlayer.release();
          },
          function(err){ $log.error(err); }
        );

        instructionsPlayer.play();
      });
    };


  Ctrl15.setActivity = function(){
      $scope.options = [];

      Ctrl15.setStage(stageNumber);
        problemPlayer = new Media(AssetsPath.sounds(stageData.soundPath),
        function(){
          $scope.$apply(Ctrl15.showOptions());
          problemPlayer.release();
        },
        function(err){ $log.error(err); }
      );

      problemPlayer.play();
    };

    Ctrl15.setStage = function(stageNumber){
      if (stageNumber >= 1){
        stageData = config.problems[stageNumber-1];
      }else{
        $log.error("Invalid stage number");
      }
    };

    Ctrl15.showOptions = function(){
      var options = [];
      options.push(stageData.answer);

      var number;
      var index;
      for (var i = 1; i < config.options; i++){
        var valid = false;
        while (!valid){
          number = Math.floor(Math.random() * 10);
          index = _.findIndex(options, function(option){return option === number;}, number);
          valid = (number !== 0 && index === -1);
        }

        options.push(number);
      }

      $scope.options = _.shuffle(options);
    };

    $scope.checkAnswer = function(value){
      if (value === stageData.answer){
        if (stageNumber < config.problems.length){
          stageNumber++;
          $timeout(function(){
            $scope.$apply(Ctrl15.setActivity());
          }, 1000);
        }
        else {
          if (level == MathOralProblems.getMinLevel() &&
            !ActividadesFinalizadasService.finalizada($scope.activityId)){
            // if player reached minimum for setting activity as finished
            ActividadesFinalizadasService.add($scope.activityId);
            level++;
            $state.go('lobby');
          }
          else {
            if (level == MathOralProblems.getMaxLevel()){
              level = 1;
              $state.go('lobby');
            }
            else {
              stageNumber = 1;
              Util.saveLevel($scope.activityId, ++level);
              Ctrl15.getConfiguration(level);
            }
          }
        }
      }
    };
   }]);
})();
