(function() {
  'use strict';
  angular.module('saan.controllers')

  .controller('7Ctrl', ['$scope', '$log', '$state', 'DeckBuilder', 'Util', 'ActividadesFinalizadasService', 'AssetsPath',
  function($scope, $log, $state, DeckBuilder, Util, ActividadesFinalizadasService, AssetsPath) {
    $scope.activityId = 7;
    $scope.deck = [];
    $scope.map = [];
    $scope.imagePath = AssetsPath.getImgs($scope.activityId);

    var Ctrl7 = Ctrl7 || {} ;
    var config = '';
    var level;
    var instructionsPlayer;
    var successPlayer;
    var failurePlayer;
    var tapPlayer;
    var endPlayer;
    var readInstructions;

    $scope.$on('$ionicView.beforeEnter', function() {
      level = Util.getLevel($scope.activityId) || 1;
      readInstructions = false; //TODO set this to true
      Ctrl7.getConfiguration(level);
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

    Ctrl7.getConfiguration = function(level){
      DeckBuilder.getConfig(level).then(function(data){
        config = data;
        $scope.size = config.level.numberOfCards;
        $scope.buildDeck();
        if (readInstructions){
          $timeout(function () {
            var introPath = config.instructions.intro[$scope.mode - 1].path;
            // play instructions of activity
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + introPath,
              function(){ instructionsPlayer.release(); },
              function(err){ $log.error(err); instructionsPlayer.release(); }
            );

            instructionsPlayer.play();
            readInstructions = false;
          }, 1000);
        }
      });
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

    $scope.deckCompleted = function(){
      var successFeedback = DeckBuilder.getSuccessAudio();

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

      // successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
      //   function(){
            // $scope.showText = false;
      //     if (level == DeckBuilder.getMinLevel() &&
      //       !ActividadesFinalizadasService.finalizada($scope.activityId)){
      //       Ctrl7.minReached();
      //     }
      //     else {
      //       if (level == DeckBuilder.getMaxLevel()){
      //         Ctrl7.maxReached();
      //       }
      //       else {
      //         Util.saveLevel($scope.activityId, ++level);
      //         Ctrl7.getConfiguration(level);
      //       }
      //     }
      //   },
      //   function(err){ $log.error(err); successPlayer.release(); $scope.showText = false; $scope.$apply();}
      // );

      $scope.textSpeech = successFeedback.text;
      $scope.showText = true;
      // successPlayer.play();
    };

    $scope.tapInstruction = function() {
      tapPlayer.play();
    };

    Ctrl7.minReached = function(){
      // if player reached minimum for setting activity as finished
      ActividadesFinalizadasService.add($scope.activityId);
      $scope.$apply();
      level++;
      //TODO uncomment this after getting media assets
      // endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[0].path,
      //   function(){
      //     endPlayer.release();
      //     $state.go('lobby');
      //   }, function(err){ $log.error(err);}
      // );
      //
      // endPlayer.play();
    };

    Ctrl7.maxReached = function(){
      level = 1;
      $state.go('lobby'); // TODO remove this line after getting media assets
      //TODO uncomment this after getting media assets
      // endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + config.ending[1].path,
      //   function(){ endPlayer.release(); $state.go('lobby'); },
      //   function(err){ $log.error(err);}
      // );
      //
      // endPlayer.play();
    };
  }]);
})();
