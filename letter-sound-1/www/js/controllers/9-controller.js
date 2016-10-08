angular.module('saan.controllers')

.controller('9Ctrl', function($scope, RandomWordsNine, TTSService,
  Util,Score,ActividadesFinalizadasService) {
      $scope.activityId = 9; // Activity Id
      $scope.totalLevels = 1;
      $scope.level = $scope.level || 1; // Indicates activity level
      $scope.activityProgress = 0;
      $scope.words = [];
      $scope.imgs = [];
      $scope.dropzone = [];
      $scope.isPhonemaOk = false;
      $scope.imgsDragged = [];
      $scope.currentWord = "";
      $scope.draggedImgs = [];
      $scope.playedWords = [];
      $scope.selectedItem = null;
      $scope.items = ['dummy'];
      //Reproduces sound using TTSService
      $scope.speak = TTSService.speak;
      //Shows Activity Dashboard
      var Ctrl9 = Ctrl9 || {};
      Ctrl9.showDashboard = function(readInstructions) {

        RandomWordsNine.words($scope.level, $scope.playedWords).then(
          function success(data) {
            console.log("setting up level!");
            Ctrl9.setUpContextVariables(data);

            Ctrl9.setUpLevel();
            Ctrl9.setUpScore();
            Ctrl9.setUpStatus();

            //wait for UI to load
            var readWordTimeout = (readInstructions) ? 4000 : 1000;
            setTimeout(function() {
              if (readInstructions){
              $scope.speak($scope.instructions);
              }
            }, readWordTimeout);
          },
          function error(error) {
            console.log(error);
          }
        );
      };

      Ctrl9.setUpLevel = function() {
        var level = Util.getLevel($scope.activityId);
        if (level) {
          $scope.level = level;
          $scope.activityProgress = 100 * (level-1)/$scope.totalLevels;
        }

        $scope.activityProgress
      };

      Ctrl9.setUpScore = function(){
        var score = Util.getScore($scope.activityId);
        if (score) {
          $scope.score = score;
        }
      };

      Ctrl9.setUpStatus = function(){
        var finished = Util.getStatus($scope.activityId);
        if (finished === false || finished === true) {
          $scope.finished = finished;
        }
      };

      Ctrl9.setUpContextVariables = function(data) {
        console.log(data);
        var wordsJson = data;
        $scope.words = _.shuffle(wordsJson.words.words);
        $scope.imgs = [];
        $scope.draggedImgs = [];
        $scope.playedWords.push(wordsJson.words.id);
        var cantOpciones = 1;
        for (var i in $scope.words) {
          if ($scope.words[i] && cantOpciones <= wordsJson.limit) {
              cantOpciones++;
              $scope.words[i].letters = $scope.words[i].word.split("");
              var index = Util.getRandomNumber($scope.words[i].imgs.length);
              $scope.imgs.push({image: $scope.words[i].imgs[index], dropzone: [$scope.words[i].word]});
          }
        }

        $scope.imgs = _.shuffle($scope.imgs);
        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        $scope.addScore = data.scoreSetUp.add;
        $scope.substractScore = data.scoreSetUp.substract;
        $scope.minScore = data.scoreSetUp.minScore;
        $scope.totalLevels = data.totalLevels;
      };

      $scope.handleProgress = function(isWordOk) {
          var LAST_CHECK  = $scope.draggedImgs.length === $scope.words.length;
          if (isWordOk) {
              $scope.speak($scope.word);
              //wait for speak
              setTimeout(function() {
              if (!$scope.finished) {
                $scope.score = Score.update($scope.addScore, $scope.score);
                Util.saveScore($scope.activityId, $scope.score);
              }
              var position = Util.getRandomNumber($scope.successMessages.length);
              var successMessage = $scope.successMessages[position];
              $scope.speak(successMessage);
              setTimeout(function() {
                if (LAST_CHECK) {
                    Ctrl9.levelUp(); //Advance level
                    Util.saveLevel($scope.activityId, $scope.level);
                    if (!$scope.finished) { // Solo sumo o resto si no esta finalizada
                      $scope.finished = $scope.score >= $scope.minScore;
                      Util.saveStatus($scope.activityId, $scope.finished);
                      ActividadesFinalizadasService.add($scope.activityId);
                    }
                      Ctrl9.showDashboard(false); //Reload dashboard
                }
              }, 1000);
             }, 1000);
            } else {
                $scope.score = Score.update(-$scope.substractScore, $scope.score);
                Util.saveScore($scope.activityId, $scope.score);
                $scope.speak(name);
                //wait for speak
                setTimeout(function() {
                  var position = Util.getRandomNumber($scope.errorMessages.length);
                  var errorMessage = $scope.errorMessages[position];
                  $scope.speak(errorMessage);
                }, 000);
            }


      };

      //Advance one level
      Ctrl9.levelUp = function() {
        $scope.level++;
        $scope.letters = [];
        $scope.dashboard = [];
        $scope.selectedLetters = [];
      };

      // Goes back one level
      Ctrl9.levelDown = function() {
        $scope.level = (level > 1) ? (level - 1) : 1;
        $scope.letters = [];
        $scope.dashboard = [];
        $scope.selectedLetters = [];
      };
      /*************** ACTIONS **************************/
      //Show Dashboard
      Ctrl9.showDashboard(true);
});
