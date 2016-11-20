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
      var stageData;
      var stageNumber;

      //Reproduces sound using TTSService
      $scope.speak = TTSService.speak;

      $scope.$on('$ionicView.beforeEnter', function() {
        stageNumber = 1;
        level = 1; //TODO: retrieve and load from local storage
        Ctrl1.getConfiguration(level);
      });

      $scope.selectLetter = function(position, letter) {
        if (!$scope.loading && !$scope.readingInstructions && !checkingLetter && !checkingWord){
          checkingLetter = true;
          selectedLetters[position] = letter;
          $scope.speak(letter);
           checkingLetter = false;
           if (selectedLetters.length === stageData.text.split("").length) {
             Ctrl1.checkWord();
           }
        }
      };

      $scope.playWordAudio = function() {
        if (!$scope.loading && !$scope.readingInstructions){
          wordPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + stageData.audio,
            function(){ },
            function(err){ $log.error(err); }
          );

          wordPlayer.play();
        }
      };

      Ctrl1.getConfiguration = function (level){
        $scope.loading = true;
        WordBuilding.getConfig(level).then(function(data){
          config = data;
          config.levelData.words = _.shuffle(config.levelData.words);

          Ctrl1.setActivity();
          //play instructions of activity
          if ($scope.readingInstructions){
            instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + config.instructionsPath,
              function(){
                instructionsPlayer.release();
                $scope.readingInstructions = false;
              },
              function(err){ $log.error(err); }
            );
            instructionsPlayer.play();
          }
        });
      };

      Ctrl1.setActivity = function(){
        Ctrl1.setStage(stageNumber);
        selectedLetters = [];
        stageData.text = stageData.text.toLowerCase();
        Ctrl1.buildDashboard();
      };

      Ctrl1.buildDashboard = function(){
        var letters = stageData.text.split("");
        var src = [];

        _.each(letters, function(letter, key) {
          var l = WordBuilding.getRandomLetters(config.levelData.options - 1, letter);
          l.push(letter);
          src.push(_.shuffle(l));
        });

        $scope.stageNumber = stageNumber;
        $scope.dashboard = src;
        $scope.items = config.levelData.words;
        $scope.loading = false;
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
        stageNumber++;
        $scope.stageNumber++;
        successPlayer = new Media(AssetsPath.getSuccessAudio() + "great.ogg",
          function(){
            successPlayer.release();
            if (stageNumber > config.levelData.words.length){ //if level finished
              if (level >= WordBuilding.getMaxLevel()){ //was the last level
                ActividadesFinalizadasService.add($scope.activityId);
                $state.go('lobby');
              }
              else {
                stageNumber = 1;
                // $scope.stageNumber++;
                Ctrl1.getConfiguration(++level);
              }
            }
            else {
              Ctrl1.setActivity();
              $scope.$apply();
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

      $scope.$watch('loading', function(){
        if (!$scope.loading && !$scope.readingInstructions){
          $scope.playWordAudio();
        }
      });

      $scope.$watch('readingInstructions', function(){
        if (!$scope.loading && !$scope.readingInstructions){
          $scope.playWordAudio();
        }
      });

    }]
  );
})();
