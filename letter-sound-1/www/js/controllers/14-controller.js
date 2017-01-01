(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('14Ctrl',['$scope', '$log', '$state', '$timeout', 'Util', 'NumberOperations',
  'ActividadesFinalizadasService','AssetsPath', 'AppSounds',
  function($scope, $log, $state, $timeout, Util, NumberOperations, ActividadesFinalizadasService,
    AssetsPath, AppSounds) {

    $scope.activityId = 14;
    $scope.dropzoneModel = [];
    $scope.numbers = [0,0];
    $scope.imgPath = AssetsPath.getImgs($scope.activityId);

    var result;
    var config = '';
    var ADD = 1;
    var SUBTRACT = 2;
    var stageNumber;
    var level;
    var Ctrl14 = Ctrl14 || {};
    var instructionsPlayer;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var readInstructions;
    var activityReady = false;

    $scope.$on('$ionicView.beforeEnter', function(){
      stageNumber = 1; //TODO: retrieve and load from local storage
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = false; //TODO set this to true
      Ctrl14.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);

      if (!angular.isUndefined(instructionsPlayer))
        instructionsPlayer.release();

      if (!angular.isUndefined(successPlayer))
        successPlayer.release();

      if (!angular.isUndefined(failurePlayer))
        failurePlayer.release();

      if (!angular.isUndefined(tapPlayer))
        tapPlayer.release();

      if (!angular.isUndefined(endPlayer))
        endPlayer.release();
    });

    Ctrl14.getConfiguration = function (level) {
      NumberOperations.getConfig(level).then(function(data){
        config = data;
        $scope.levelConfig = config.levelConfig;
        Ctrl14.setActivity();

        if (readInstructions){
          $timeout(function () {
            var introPath = config.instructions.intro.path;
            // play instructions of activity
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + introPath,
              function(){
                instructionsPlayer.release();
                activityReady = true;
                $scope.showText = false;
                $scope.$apply();
              },
              function(err){
                $log.error(err);
                instructionsPlayer.release();
                $scope.showText = false;
                $scope.$apply();
              }
            );

            $scope.textSpeech = config.instructions.intro.text;
            $scope.showText = true;
            instructionsPlayer.play();
            readInstructions = false;
          }, 1000);
        }
        else {
          activityReady = true;
        }

        tapPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.tap.path,
          function(){}, function(err){ $log.error(err);}
        );
      });
    };

    $scope.sortableOptions = {
      containment: '.placeholder',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        return sourceItemHandleScope.modelValue == result;
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      clone: true,
      dragEnd: function(eventObj){
        if (!$scope.sortableOptions.accept(eventObj.source.itemScope, eventObj.dest.sortableScope)){
          Ctrl14.failure();
        }
      },
      itemMoved: function (eventObj){
        AppSounds.playTap();
        $timeout(function(){
          $scope.$apply(function(){
            Ctrl14.success();
          });
        }, 1000);
      }
    };

    Ctrl14.setActivity  = function(){
      console.log("lalalal");
      $scope.dropzoneModel = [];
      var results = [];
      var numbers = [];

      // select the two numbers to add/subtract
      numbers.push(_.random(1, config.numberRange));
      if (config.mode == ADD){
        numbers.push(_.random(1, config.numberRange));
        result = numbers[0] + numbers[1];
        $scope.operator = "+";
      }
      else{
        numbers.push(_.random(1, numbers[0]));
        result = numbers[0] - numbers[1];
        $scope.operator = "-";
      }

      results.push(result);
      $scope.numbers = numbers;

      var top = (result + config.optionsRange <= config.numberRange) ? result + config.optionsRange : config.numberRange;
      var bottom = (result - config.optionsRange <= 0) ? 0 : result - config.optionsRange;

      var number;
      var index;
      var valid;

      // select the result options
      for (var i = 1; i < config.options; i++){
        valid = false;
        while (!valid){
          number = _.random(bottom, top);
          index = _.indexOf(results, number);
          valid = index == -1;
        }
        results.push(number);
      }

      //shuffle the results
      $scope.results = _.shuffle(results);
    };

    Ctrl14.success = function(){

      var successFeedback = NumberOperations.getSuccessAudio();

      successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
        function(){
          successPlayer.release();
          $scope.showText = false;
          $scope.$apply();

          if (stageNumber < config.levelConfig.stages){
            stageNumber++;
            $timeout(function(){
              Ctrl14.setActivity();
            }, 1000);
          }
          else{
            if (level == NumberOperations.getMinLevel() &&
              !ActividadesFinalizadasService.finalizada($scope.activityId)){
              // if player reached minimum for setting activity as finished
              Ctrl14.minReached();
            }
            else {
              if (level == NumberOperations.getMaxLevel()){
                Ctrl14.maxReached();
              }
              else {
                $timeout(function(){
                  stageNumber = 1;
                  Util.saveLevel($scope.activityId, ++level);
                  Ctrl14.getConfiguration(level);
                }, 1000);
              }
            }
          }
        },
        function(err){ $log.error(err); successPlayer.release(); $scope.showText = false; $scope.$apply();}
      );

      $scope.textSpeech = successFeedback.text;
      $scope.showText = true;
      successPlayer.play();
    };

    $scope.tapInstruction = function() {
      if (activityReady){
        tapPlayer.play();
      }
    };

    Ctrl14.failure = function(){
      if (!checking){
        var failureFeedback = NumberOperations.getFailureAudio();

        failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
          function(){ failurePlayer.release(); $scope.showText = false; checking = false; $scope.$apply();},
          function(err){ failurePlayer.release(); $log.error(err); $scope.showText = false; checking = false; $scope.$apply();}
        );

        $scope.textSpeech = failureFeedback.text;
        $scope.showText = true;
        failurePlayer.play();
      }
    };

    Ctrl14.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      level++;
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
        function(){
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        }, function(err){
          $log.error(err);
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        }
      );

      $scope.textSpeech = config.ending[0].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

    Ctrl14.maxReached = function(){
      level = 1;
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
        function(){
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        },
        function(err){ $log.error(err); $scope.showText = false; $state.go('lobby'); }
      );

      $scope.textSpeech = config.ending[1].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

    $scope.enabled = function() { return activityReady;};

  }]);

})();
