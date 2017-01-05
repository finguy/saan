(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('8Ctrl',['$scope', '$log', '$state', '$timeout', 'Util', 'NumberMatching',
  'ActividadesFinalizadasService', 'AssetsPath', 'AppSounds',
  function($scope, $log, $state, $timeout, Util, NumberMatching, ActividadesFinalizadasService, AssetsPath, AppSounds) {
    $scope.activityId = 8;
    $scope.dropzoneModel = [];
    $scope.showText = false;
    $scope.dragDisabled = true;

    var config;
    var Ctrl8 = Ctrl8 || {};
    var level;
    var stageNumber;
    var stageData;
    var readInstructions;
    var instructionsPlayer;
    var failurePlayer;
    var successPlayer;
    var endPlayer;
    var tapPlayer;
    var checking = false;
    var dragChecked = false;
    var dragOk = false;
    var activityReady = false;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
      $scope.dragDisabled = readInstructions;
      Ctrl8.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);

      if (!angular.isUndefined(instructionsPlayer))
        instructionsPlayer.release();

      if (!angular.isUndefined(successPlayer))
        successPlayer.release();

      if (!angular.isUndefined(tapPlayer))
        tapPlayer.release();

      if (!angular.isUndefined(endPlayer))
        endPlayer.release();
    });

    Ctrl8.getConfiguration = function (level){
      NumberMatching.getConfig(level).then(function(data){
        config = data;
        Ctrl8.setStage();
        Ctrl8.setActivity();
        if (readInstructions){

          $timeout(function(){
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.intro.path,
              function(){
                instructionsPlayer.release();
                readInstructions = false;
                $scope.showText = false;
                $scope.dragDisabled = false;
                activityReady = true;
                $scope.$apply();
              },
              function(err){
                $log.error(err);
                instructionsPlayer.release();
                readInstructions = false;
                $scope.showText = false;
                $scope.dragDisabled = false;
                activityReady = true;
                $scope.$apply();
              }
            );

            $scope.textSpeech = config.instructions.intro.text;
            $scope.showText = true;
            instructionsPlayer.play();
          },1000);          
        }
        else {
          activityReady = true;
        }

        tapPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.tap.path,
          function(){}, function(err){ $log.error(err);}
        );
      });
    };

    Ctrl8.clearValues = function(){
      stageData = {};
      config = {};
    };

    Ctrl8.setActivity  = function (){
      checking = false;
      $scope.matches = [];
      $scope.cards = [];

      _.each(stageData.tickets, function(element){
        $scope.cards.push({value: element, dropzone: []});
      });

      stageData.tickets = _.shuffle(stageData.tickets);
      $scope.matches.push(stageData.tickets.pop());
    };

    Ctrl8.setStage = function(){
      stageData = config.level;
      stageData.tickets = _.range(stageData.numberFrom, stageData.numberTo + 1); //numberTo+1 because range is top exclusive
    };

    $scope.tapInstruction = function() {
      if (activityReady){
        tapPlayer.play();
      }
    };

    $scope.sortableOptions = {
      containment: '.placeholder',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        dragChecked = true;
        dragOk = Ctrl8.checkMatch(sourceItemHandleScope, destSortableScope);
        return dragOk;
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      clone: false,
      accept: false,
      dragStart: function(eventObj){
        dragChecked = false;
        dragOk = false;
      },
      dragEnd: function(eventObj) {
        //check that item was correctly moved
        if (dragChecked){
          if (!dragOk){
            eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
            eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.item);
            Ctrl8.failure();
          }
          else {
            AppSounds.playTap();
            Ctrl8.success();
          }
        }
      }
    };

    $scope.numberToWord = function(number){
      return Util.numberToWords(number);
    };

    Ctrl8.checkMatch = function(sourceItemHandleScope, destSortableScope){
      return parseInt(sourceItemHandleScope.modelValue, 10) == parseInt(destSortableScope.element[0].innerText, 10);
    };

    Ctrl8.success = function(eventObj) {
      if (!checking){
        checking = true;
        var item = $scope.dropzoneModel.pop();
        var index = _.findIndex($scope.cards,
                                function(card){return card.value == item;},
                                item);

        $scope.cards[index].dropzone.push(item);

        var successFeedback = NumberMatching.getSuccessAudio();
        successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function(){
            successPlayer.release();
            $scope.showText = false;
            $scope.$apply();

            if (stageData.tickets.length === 0){
              if (level == NumberMatching.getMinLevel() &&
                !ActividadesFinalizadasService.finalizada($scope.activityId)){
                // if player reached minimum for setting activity as finished
                Ctrl8.minReached();
              }
              else {
                if (level == NumberMatching.getMaxLevel()){
                  Ctrl8.maxReached();
                }
                else {
                  $timeout(function(){
                    Util.saveLevel($scope.activityId, ++level);
                    Ctrl8.getConfiguration(level);
                  }, 1000);
                }
              }
            }
            else {
              $scope.matches.push(stageData.tickets.pop());
              $scope.$apply();
            }
            checking = false;
          },
          function(err){ $log.error(err); successPlayer.release(); $scope.showText = false; $scope.$apply(); }
        );

        $scope.textSpeech = successFeedback.text;
        $scope.showText = true;
        successPlayer.play();
      }
    };

    Ctrl8.failure = function(){
      if (!checking){
        var failureFeedback = NumberMatching.getFailureAudio();

        failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
          function(){ failurePlayer.release(); $scope.showText = false; $scope.$apply(); checking = false;},
          function(err){ failurePlayer.release(); $log.error(err); $scope.showText = false; checking = false; $scope.$apply();}
        );

        $scope.textSpeech = failureFeedback.text;
        $scope.showText = true;
        failurePlayer.play();
      }
    };

    Ctrl8.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      $scope.finished = true;
      $scope.$apply();
      level++;

      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
        function(){
          endPlayer.release();
          $state.go('lobby');
        }, function(err){ $log.error(err);}
      );

      $scope.textSpeech = config.ending[0].text;
      $scope.showText = true;
      endPlayer.play();
    };

    Ctrl8.maxReached = function(){
      level = 1;
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
        function(){ endPlayer.release(); $state.go('lobby'); },
        function(err){ $log.error(err);}
      );

      $scope.textSpeech = config.ending[1].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };
  }]);
})();
