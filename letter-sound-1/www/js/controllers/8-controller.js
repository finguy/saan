(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('8Ctrl',['$scope', '$log', '$state', '$timeout', 'Util', 'NumberMatching', 'ActividadesFinalizadasService', 'AssetsPath',
  function($scope, $log, $state, $timeout, Util, NumberMatching, ActividadesFinalizadasService, AssetsPath) {
    $scope.activityId = 8;
    $scope.dropzoneModel = [];

    var config;
    // var matchesCount = 0;
    var Ctrl8 = Ctrl8 || {};
    var level;
    var stageNumber;
    var stageData;
    var readInstructions;
    var matchesCount;
    var instructionsPlayer;
    var failurePlayer;
    var successPlayer;

    $scope.$on('$ionicView.beforeEnter', function() {
      // stageNumber = 1;
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
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
          instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + config.instructionsPath,
            function(){ instructionsPlayer.release(); readInstructions = false; },
            function(err){ $log.error(err); instructionsPlayer.release(); readInstructions = false; }
          );

          instructionsPlayer.play();
        }
      });
    };

    Ctrl8.clearValues = function(){
      stageData = {};
      config = {};
    };

    Ctrl8.setActivity  = function (){
      $scope.matches = [];
      $scope.cards = [];

      var number;
      var index;
      var valid;
      matchesCount = 0;

      _.each(stageData.tickets, function(element){
        $scope.cards.push({value: element, dropzone: []});
      });

      $scope.matches = _.shuffle(stageData.tickets);
    };

    Ctrl8.setStage = function(){
      stageData = config.level;
      stageData.tickets = _.range(stageData.numberFrom, stageData.numberTo + 1); //numberTo+1 because range is top exclusive
    };

    $scope.sortableOptions = {
      containment: '.placeholder',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        return Ctrl8.checkMatch(sourceItemHandleScope, destSortableScope);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      clone: false,
      accept: false,
      dragEnd: function(eventObj) {
        //check that item was correctly moved
        if (Ctrl8.checkDragEnd(eventObj.source.itemScope.modelValue)){
          Ctrl8.failure();
        }
      },
      itemMoved: function(eventObj) {
        Ctrl8.success(eventObj);
      }
    };

    $scope.numberToWord = function(number){
      return Util.numberToWords(number);
    };

    Ctrl8.checkMatch = function(sourceItemHandleScope, destSortableScope){
      return parseInt(destSortableScope.element[0].parentElement.innerText, 10) == parseInt(sourceItemHandleScope.modelValue, 10);
    };

    Ctrl8.checkDragEnd = function(movedValue){
      return _.contains($scope.matches, movedValue);
    };

    Ctrl8.success = function(eventObj) {
      var item = $scope.dropzoneModel.pop();
      var index = _.findIndex($scope.cards,
                              function(card){return card.value == item;},
                              item);
      $scope.cards[index].dropzone.push(item);
      var successFeedback = NumberMatching.getSuccessAudio();

      successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
        function(){
          if ($scope.matches.length === 0){
            if (level == NumberMatching.getMinLevel() &&
              !ActividadesFinalizadasService.finalizada($scope.activityId)){
              // if player reached minimum for setting activity as finished
              ActividadesFinalizadasService.add($scope.activityId);
              level++;
              $state.go('lobby');
            }
            else {
              if (level >= NumberMatching.getMaxLevel()){
                level = 1;
                $state.go('lobby');
              }
              else {
                $timeout(function(){
                  stageNumber = 1;
                  Util.saveLevel($scope.activityId, ++level);
                  Ctrl8.getConfiguration(level);
                }, 1000);
              }
            }
          }
        },
        function(err){ $log.error(err); successPlayer.release(); $scope.showText = false; $scope.$apply(); }
      );

      successPlayer.play();
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
