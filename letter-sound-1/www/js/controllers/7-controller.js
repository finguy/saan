(function() {
  'use strict';
  angular.module('saan.controllers')

  .controller('7Ctrl', ['$rootScope', '$scope', '$log', '$state', '$timeout', 'DeckBuilder', 'Util',
  'ActividadesFinalizadasService', 'AssetsPath',
  function($rootScope, $scope, $log, $state, $timeout, DeckBuilder, Util, ActividadesFinalizadasService, AssetsPath) {
    $rootScope.activityId = 7;
    $scope.deck = [];
    $scope.map = [];
    $scope.enabled = false;

    var Ctrl7 = Ctrl7 || {} ;
    var config = '';
    var level;
    var instructionsPlayer;
    var successPlayer;
    var tapPlayer;
    var endPlayer;
    var readInstructions;
    var activityReady = false;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = true;
      Ctrl7.getConfiguration(level);
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, level);

      $rootScope.activityId = '';

      if (!angular.isUndefined(instructionsPlayer))
        instructionsPlayer.release();

      if (!angular.isUndefined(successPlayer))
        successPlayer.release();

      if (!angular.isUndefined(tapPlayer))
        tapPlayer.release();

      if (!angular.isUndefined(endPlayer))
        endPlayer.release();
    });

    Ctrl7.getConfiguration = function(level){
      DeckBuilder.getConfig(level).then(function(data){
        config = data;
        $scope.size = config.level.numberOfCards;
        $scope.buildDeck();

        activityReady = !readInstructions;
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

        Ctrl7.setTapPlayer();

      });
    };

    Ctrl7.setTapPlayer = function(){
      tapPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + config.instructions.tap.path,
        function(){
          activityReady = true;
          $scope.showText = false;
          $scope.$apply();
        },
        function(err){
          $log.error(err);
          activityReady = true;
          $scope.showText = false;
          $scope.$apply();
        }
      );
    };

    $scope.buildDeck = function(){
      $scope.map = [];
      $scope.deck = [];
      var cards = [];
      var auxCards = [];

      for (var i = 0; i < $scope.size / 2; i++){

        var number = _.random(config.level.numberFrom, config.level.numberTo);
        while (_.indexOf(auxCards, number) != -1)
          number = Math.floor(Math.random() * 10);

        auxCards.push(number);
        cards.push({key: number, value: number});
        cards.push({key: number, value: Util.numberToWords(number)});
      }

      cards = _.shuffle(cards);

      var deck = [];
      var deckMap = [];
      var deckDimension = Math.sqrt($scope.size);

      for (var j = 0; j < deckDimension; j++){
        deck.push(cards.splice(0, deckDimension));
        deckMap.push(_.map(deck[j], function(num){ return 0; }));
      }

      $scope.map = deckMap;
      $scope.deck = deck;
    };

    $scope.enabled = function(){
      // flip is enabled after instructions are read
      return activityReady;
    };

    $scope.deckCompleted = function(){
      if (level == DeckBuilder.getMinLevel() &&
        !ActividadesFinalizadasService.finalizada($scope.activityId)){
        Ctrl7.minReached();
      }
      else {
        if (level == DeckBuilder.getMaxLevel()){
          Ctrl7.maxReached();
        }
        else {
          Util.saveLevel($scope.activityId, ++level);
          Ctrl7.getConfiguration(level);
        }
      }
    };

    $scope.tapInstruction = function() {
      if (activityReady){
        activityReady = false;
        $scope.textSpeech = config.instructions.tap.text;
        $scope.showText = true;
        tapPlayer.play();
      }
    };

    Ctrl7.minReached = function(){
      activityReady = false;
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      level++;
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
        function(){
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        },
        function(err){
          $log.error(err);
          $scope.showText = false;
          $state.go('lobby');
        }
      );

      $scope.textSpeech = config.ending[0].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

    Ctrl7.maxReached = function(){
      level = 1;
      activityReady = false;
      endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
        function(){
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        },
        function(err){
          $log.error(err);
          endPlayer.release();
          $scope.showText = false;
          $state.go('lobby');
        }
      );

      $scope.textSpeech = config.ending[1].text;
      $scope.showText = true;
      $scope.$apply();
      endPlayer.play();
    };

    $scope.feedback = function(success){
      if (success){
        activityReady = false;
        var successFeedback = DeckBuilder.getSuccessAudio();
        successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function(){
            activityReady = true;
            successPlayer.release();
            $scope.showText = false;
            $scope.$apply();
          },
          function(err){
            $log.error(err);
            successPlayer.release();
            activityReady = true;
            $scope.showText = false;
            $scope.$apply();
          }
        );

        $scope.textSpeech = successFeedback.text;
        $scope.showText = true;
        successPlayer.play();
      }
    };
  }]);
})();
