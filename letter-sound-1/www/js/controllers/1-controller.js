(function() {
  'use strict';

  angular.module('saan.controllers')
  .controller('1Ctrl', ['$scope', '$log', '$state', '$timeout', 'WordBuilding',
    'TTSService', 'AssetsPath', 'ActividadesFinalizadasService', 'Util',
    function($scope, $log, $state, $timeout, WordBuilding, TTSService, AssetsPath,
      ActividadesFinalizadasService, Util){
      $scope.activityId = 1; // Activity Id

      $scope.dashboard = []; // Dashboard letters
      $scope.showText = false;
      $scope.checkingWord = false;
      $scope.checkingLetter = false;
      $scope.imagePath = AssetsPath.getImgs($scope.activityId);

      var Ctrl1 = Ctrl1 || {};
      var instructionsPlayer;
      var wordPlayer;
      var successPlayer;
      var failurePlayer;
      var config;
      var selectedLetters = []; // Collects letters the user selects
      var level;
      var stageData;
      var stageNumber;
      var readInstructions;
      var letterPlayers = [];
      var endPlayer;
      var playingWord = false;
      var leaving = false;

      $scope.$on('$ionicView.beforeEnter', function() {
        stageNumber = 1;
        level = Util.getLevel($scope.activityId) || 1;
        $scope.readInstructions = true;

        for (var i = 0; i < 26; i++){
          letterPlayers[i] = new Media(AssetsPath.getActivityAudio($scope.activityId) +
            "letters/" + String.fromCharCode(i + "a".charCodeAt(0)) + ".mp3",
            function(){},
            function(err){Ctrl1.letterPlayerFailure(err);}
          );
        }

        Ctrl1.getConfiguration(level);
      });

      $scope.$on('$ionicView.beforeLeave', function() {
        Util.saveLevel($scope.activityId, level);
        leaving = true;

        // releasing loose players
        _.each(letterPlayers, function(element){
          element.release();
        });

        if (!angular.isUndefined(instructionsPlayer))
          instructionsPlayer.release();

        if (!angular.isUndefined(wordPlayer))
          wordPlayer.release();

        if (!angular.isUndefined(successPlayer))
          successPlayer.release();

        if (!angular.isUndefined(failurePlayer))
          failurePlayer.release();
      });

      $scope.selectLetter = function(position, letter) {
        if (!$scope.readInstructions && !$scope.checkingLetter && !$scope.checkingWord){
          var pos = letter.toLowerCase().charCodeAt(0) - "a".charCodeAt(0);
          letterPlayers[pos].play();
          $scope.checkingLetter = true;
          selectedLetters[position] = letter;

          if (_.without(selectedLetters, undefined).length === stageData.text.split("").length) {
            Ctrl1.checkWord();
          }

          $scope.checkingLetter = false;
        }
      };

      $scope.playWordAudio = function() {
        if (!$scope.readInstructions && !playingWord){
          wordPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + stageData.audio,
            function(){
              wordPlayer.release();
              playingWord = false;
            },
            function(err){
              $log.error(err);
              wordPlayer.release();
              playingWord = false;
            }
          );

          wordPlayer.play();
          playingWord = true;
        }
      };

      Ctrl1.getConfiguration = function (level){
        WordBuilding.getConfig(level).then(function(data){
          config = data;
          config.levelData.words = _.shuffle(config.levelData.words);

          Ctrl1.setActivity();
        });
      };

      Ctrl1.setActivity = function(){
        Ctrl1.setStage(stageNumber);
        selectedLetters = [];
        stageData.text = stageData.text.toLowerCase();
        Ctrl1.buildDashboard();

        //play instructions of activity
        if ($scope.readInstructions){
          $timeout(function () {
            var introPath = config.instructions.path;
            instructionsPlayer = new Media(AssetsPath.getInstructionsAudio($scope.activityId) + introPath,
              function(){
                instructionsPlayer.release();
                $scope.readInstructions = false;
                $scope.showText = false;
                $timeout(function(){
                  if (!leaving){
                    $scope.playWordAudio();
                    $scope.$apply();
                  }
                }, 500);
              },
              function(err){
                $log.error(err);
                instructionsPlayer.release();
                $scope.readInstructions = false;
                $scope.showText = false;
                $timeout(function(){
                  if (!leaving){
                    $scope.playWordAudio();
                    $scope.$apply();
                  }
                }, 500);
              }
            );

            $scope.textSpeech = config.instructions.text;
            $scope.showText = true;
            instructionsPlayer.play();

          }, 1000);
        }
        else {
          $scope.playWordAudio();
        }
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
        $scope.checkingWord = true;
        var builtWord = selectedLetters.join("");
        $timeout(function(){
          if (builtWord.toLowerCase() === stageData.text.toLowerCase()) {
            $scope.playWordAudio();
            $timeout(function(){Ctrl1.success();}, 1000);
          }
          else {
            Ctrl1.failure();
          }

        }, 1000);
      };

      Ctrl1.success = function(){
        var successFeedback = WordBuilding.getSuccessAudio();

        stageNumber++;
        $scope.stageNumber++;
        successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
          function(){
            successPlayer.release();
            $scope.showText = false;

            if (stageNumber > config.levelData.words.length){ //if level finished
              if (level == WordBuilding.getMinLevel() &&
                !ActividadesFinalizadasService.finalizada($scope.activityId)){
                Ctrl1.minReached();
              }
              else {
                if (level == WordBuilding.getMaxLevel()){
                  // if player finished all available levels
                  Ctrl1.maxReached();
                }
                else {
                  // player still has levels to play
                  stageNumber = 1;
                  Util.saveLevel($scope.activityId, ++level);
                  Ctrl1.getConfiguration(level);
                }
              }
            }
            else {
              Ctrl1.setActivity();
            }
            $scope.checkingWord = false;
            $scope.$apply();
          },
          function(err){
            $log.error(err);
            successPlayer.release();
            $scope.showText = false;
            $scope.checkingWord = false;
            $scope.$apply();
          }
        );

        $scope.textSpeech = successFeedback.text;
        $scope.showText = true;
        successPlayer.play();
      };

      Ctrl1.failure = function(){
        var failureFeedback = WordBuilding.getFailureAudio();

        failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
          function(){ failurePlayer.release(); $scope.showText = false; $scope.checkingWord = false; $scope.$apply();},
          function(err){ $log.error(err); failurePlayer.release(); $scope.showText = false; $scope.checkingWord = false; $scope.$apply();}
        );

        $scope.textSpeech = failureFeedback.text;
        $scope.showText = true;
        failurePlayer.play();
      };

      Ctrl1.setStage = function(stageNumber){
        if (stageNumber >= 1){
          stageData = config.levelData.words[stageNumber-1];
        }else{
          $log.error("Invalid stage number");
        }
      };

      Ctrl1.letterPlayerFailure = function(err){
        $log.error(err);
      };

      Ctrl1.minReached = function(){
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

      Ctrl1.maxReached = function(){
        level = 1;
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
    }]
  );
})();
