(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('1Ctrl', ['$scope', '$log', '$state', '$timeout', 'WordBuilding',
    'TTSService', 'AssetsPath', 'ActividadesFinalizadasService',
    function($scope, $log, $state, $timeout, WordBuilding, TTSService, AssetsPath, ActividadesFinalizadasService){
      $scope.activityId = '1'; // Activity Id

      $scope.dashboard = []; // Dashboard letters

      var Ctrl1 = Ctrl1 || {};
      var instructionsPlayer;
      var wordPlayer;
      var successPlayer;
      var failurePlayer;
      var config;
      var selectedLetters = []; // Collects letters the user selects
      var checkingWord = false; //Flag to prevent double click bug
      var checkingLetter = false;
      var level;
      var stageNumber;
      var stageData;

      //Reproduces sound using TTSService
      $scope.speak = TTSService.speak;

      $scope.$on('$ionicView.beforeEnter', function() {
        level = 1; //TODO: retrieve and load from local storage
        Ctrl1.getConfiguration(level);
      });

      $scope.selectLetter = function(position, letter) {
        if (!checkingLetter && !checkingWord){
          checkingLetter = true;
          selectedLetters[position] = letter;
          $scope.speak(letter);
          $timeout(function (){
             checkingLetter = false;
             if (selectedLetters.length === stageData.text.split("").length) {
                 Ctrl1.checkWord();
             }
          }, 500);
        }
      };

      $scope.playWordAudio = function() {
        wordPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + stageData.audio,
          function(){ },
          function(err){ $log.error(err); }
        );

        wordPlayer.play();
      };

      Ctrl1.getConfiguration = function (level){
        stageNumber = 4;
        WordBuilding.getConfig(level).then(function(data){
          config = data;
          config.levelData.words = _.shuffle(config.levelData.words);
          $scope.items = config.levelData.words;
          $log.info($scope.items);
          //play instructions of activity
          instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + config.instructionsPath,
            function(){
              Ctrl1.setActivity();
              instructionsPlayer.release();
            },
            function(err){ $log.error(err); }
          );

          instructionsPlayer.play();
        });
      };

      Ctrl1.setActivity = function(){
        Ctrl1.setStage(stageNumber);
        selectedLetters = [];
        // wordData = config.words[position];
        stageData.text = stageData.text.toLowerCase();
        // config.words.splice(position, 1); // remove the used word

        Ctrl1.buildDashboard();
        $scope.playWordAudio();
      };

      Ctrl1.buildDashboard = function(){
        var letters = stageData.text.split("");
        var src = [];

        _.each(letters, function(letter, key) {
          var l = WordBuilding.getRandomLetters(config.levelData.options - 1, letter);
          l.push(letter);
          src.push(_.shuffle(l));
        });

        $scope.dashboard = src;
        $scope.$apply();
      };

      //Verifies selected letters and returns true if they match the word
      Ctrl1.checkWord = function() {
        checkingWord = true;
        var builtWord = selectedLetters.join("");
        $scope.speak(builtWord);
        $timeout(function(){
          if (builtWord.toLowerCase() === stageData.text.toLowerCase()) {
            Ctrl1.success();
          }
          else {
            Ctrl1.failure();
          }
        }, 500);
        checkingWord = false;
      };

      Ctrl1.success = function(){
        successPlayer = new Media(AssetsPath.getSuccessAudio() + "great.ogg",
          function(){
            successPlayer.release();
            if (stageNumber >= config.levelData.words.length){ //if level finished
              if (level >= WordBuilding.getMaxLevel()){ //was the last level
                ActividadesFinalizadasService.add($scope.activityId);
                $state.go('lobby');
              }
              else {
                Ctrl1.getConfiguration(++level);
              }
            }
            else {
              stageNumber++;
              Ctrl1.setActivity();
            }
          },
          function(err){ $log.error(err); }
        );
        successPlayer.play();
      };

      Ctrl1.failure = function(){
        failurePlayer = new Media(AssetsPath.getFailureAudio() + "try_again.ogg",
          function(){ failurePlayer.release(); },
          function(err){ $log.error(err); }
        );

        failurePlayer.play();
      };

      Ctrl1.setStage = function(stageNumber){
        if (stageNumber >= 1){
          stageData = config.levelData.words[stageNumber-1];
        }else{
          $log.error("Invalid stage number");
        }
      };
    }]
  );
})();
