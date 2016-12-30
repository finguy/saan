(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('8Ctrl',['$scope', '$log', '$state', '$timeout', 'Util', 'NumberMatching', 'ActividadesFinalizadasService', 'AssetsPath',
  function($scope, $log, $state, $timeout, Util, NumberMatching, ActividadesFinalizadasService, AssetsPath) {
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
    var checking = false;
    var dragChecked = false;
    var dragOk = false;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = false;
      $scope.dragDisabled = false;
      Ctrl8.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);
    });

    Ctrl8.getConfiguration = function (level){
      NumberMatching.getConfig(level).then(function(data){
        config = data;
        Ctrl8.setStage();
        Ctrl8.setActivity();
        if (readInstructions){
          // play instructions of activity
          instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.intro.path,
            function(){
              instructionsPlayer.release();
              readInstructions = false;
              $scope.showText = false;
              $scope.dragDisabled = false;
              $scope.$apply();
            },
            function(err){
              $log.error(err);
              instructionsPlayer.release();
              readInstructions = false;
              $scope.showText = false;
              $scope.dragDisabled = false;
              $scope.$apply();
            }
          );

          $scope.textSpeech = config.instructions.intro.text;
          $scope.showText = true;
          instructionsPlayer.play();
        }
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
        console.log(eventObj);
        //check that item was correctly moved
        if (dragChecked && !dragOk){
          eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
          eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.item);
          Ctrl8.failure();
        }
        else {
          Ctrl8.success();
        }
      }
    };

    $scope.numberToWord = function(number){
      return Util.numberToWords(number);
    };

    Ctrl8.checkMatch = function(sourceItemHandleScope, destSortableScope){
      console.log(parseInt(sourceItemHandleScope.modelValue, 10) == parseInt(destSortableScope.element[0].innerText, 10));
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
        console.log(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path);
        successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function(){
            successPlayer.release();
            $scope.showText = false;
            $scope.$apply();

            if (stageData.tickets.length === 0){
              if (level == NumberMatching.getMinLevel() &&
                !ActividadesFinalizadasService.finalizada($scope.activityId)){
                // if player reached minimum for setting activity as finished
                ActividadesFinalizadasService.add($scope.activityId);
                level++;
                $state.go('lobby');
              }
              else {
                if (level == NumberMatching.getMaxLevel()){
                  level = 1;
                  $state.go('lobby');
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
  }]);
})();
