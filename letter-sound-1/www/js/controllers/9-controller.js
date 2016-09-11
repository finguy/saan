angular.module('saan.controllers')

.controller('9Ctrl', function($scope, RandomWordsNine, TTSService,
  Util,Score,ActividadesFinalizadasService) {
      $scope.activityId = '9'; // Activity Id
      $scope.words = [];
      $scope.imgs = [];
      $scope.dropzone = [];
      $scope.isPhonemaOk = false;
      $scope.imgsDragged = [];
      $scope.currentWord = "";

      $scope.draggedImgs = [];
      //Shows Activity Dashboard
      var Ctrl9 = Ctrl9 || {};
      Ctrl9.showDashboard = function(readInstructions) {
        Ctrl9.setUpLevel();
        Ctrl9.setUpScore();
        Ctrl9.setUpStatus();

        RandomWordsNine.words($scope.level, $scope.playedWords).then(
          function success(data) {
            Ctrl9.setUpContextVariables(data);
            //wait for UI to load
            var readWordTimeout = (readInstructions) ? 4000 : 1000;
            setTimeout(function() {
              if (readInstructions){
                $scope.speak($scope.instructions);
              }

              setTimeout(function() {
                  $scope.speak($scope.currentPhonema);
              }, readWordTimeout);
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
          $scope.activityProgress = 100 * (level-1)/$scope.totalLevels; // -1 porque empieza en cero.
        }
      };

      Ctrl9.setUpScore = function(){
        var score = Util.getScore($scope.activityId);
        if (score) {
          $scope.score = score
        }
      };

      Ctrl9.setUpStatus = function(){
        var finished = Util.getStatus($scope.activityId);
        if (finished === false || finished === true) {
          $scope.finished = finished;
        }
      }

      Ctrl9.setUpContextVariables = function(data) {
        var wordsJson = data;
        $scope.words = _.shuffle(wordsJson.words.words);
        $scope.imgs = [];
        for (var i in $scope.words) {
          if ($scope.words[i]) {
              $scope.words[i].letters = $scope.words[i].word.split("");
              var index = Util.getRandomNumber($scope.words[i].imgs.length);
              $scope.imgs.push($scope.words[i].imgs[index]);
          }
        }
        $scope.imgs = _.shuffle($scope.imgs);
        console.log("imgs:");
        console.log($scope.imgs);
      }

      /*************** ACTIONS **************************/
      //Show Dashboard
      Ctrl9.showDashboard(true);
});
