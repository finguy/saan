angular.module('saan.controllers')

.controller('9Ctrl', function($scope, $timeout, $log, $state, RandomWordsNine, TTSService,
  Util, Score, ActividadesFinalizadasService, AssetsPath) {
  $scope.activityId = 9; 
  $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
  $scope.activityProgress = 0;
  $scope.words = [];
  $scope.imgs = [];
  $scope.dropzone = [];
  $scope.draggedImgs = [];
  $scope.playedWords = [];
  $scope.items = ['dummy'];
  $scope.showText = false;
  $scope.textSpeech = "";
  $scope.speak = TTSService.speak;


  var Ctrl9 = Ctrl9 || {};
  Ctrl9.level = null;
  Ctrl9.instructionsPlayer;
  Ctrl9.showDashboard = function(readInstructions) {
    Ctrl9.setUpLevel();
    Ctrl9.setUpScore();
    Ctrl9.setUpStatus();


    RandomWordsNine.words(Ctrl9.level, $scope.playedWords).then(
      function success(data) {
        Ctrl9.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 4000 : 1000;
        $timeout(function() {
          if (readInstructions) {
            Ctrl9.instructionsPlayer.play();
          }
        }, readWordTimeout);
      },
      function error(error) {
        $log.error(error);
      }
    );
  };

  Ctrl9.setUpLevel = function() {
    if (!Ctrl9.level) {
      Ctrl9.level = Util.getLevel($scope.activityId);
    }
  };

  Ctrl9.setUpScore = function() {
    $scope.score = Util.getScore($scope.activityId);
  };

  Ctrl9.setUpStatus = function() {
    Ctrl9.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
  };

  Ctrl9.successFeedback = function() {
    var successFeedback = RandomWordsNine.getSuccessAudio();
    $scope.textSpeech = successFeedback.text;
    $scope.showText = true;
    var successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
      function success() {
        successPlayer.release();
        $scope.showText = false;
      },
      function error(err) {
        $log.error(err);
        successPlayer.release();
        $scope.showText = false;
        $scope.checkingWord = false;
      }
    );
    successPlayer.play();
  };

  Ctrl9.errorFeedback = function() {
    var failureFeedback = RandomWordsNine.getFailureAudio();
    $scope.textSpeech = failureFeedback.text;
    $scope.showText = true;
    var failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
      function success() {
        failurePlayer.release();
        $scope.showText = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        failurePlayer.release();
        $scope.showText = false;
      });
    failurePlayer.play();
  };

  Ctrl9.setUpContextVariables = function(data) {
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
        $scope.imgs.push({
          image: $scope.words[i].imgs[index],
          dropzone: [$scope.words[i].word]
        });
      }
    }

    $scope.imgs = _.shuffle($scope.imgs);
    $scope.totalWords = $scope.imgs.length;
    $scope.addScore = data.scoreSetUp.add;
    $scope.substractScore = data.scoreSetUp.substract;
    $scope.minScore = data.scoreSetUp.minScore;
    Ctrl9.finalizationLevel = data.finalizationLevel;
    Ctrl9.totalLevels = data.totalLevels;
    Ctrl9.initialLevel = 1;


    if (Ctrl9.finished) {
      $scope.activityProgress = 100;
    } else {
      $scope.activityProgress = 100 * (Ctrl9.level - 1) / Ctrl9.totalLevels;
    }

    Ctrl9.instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + data.instructionsPath,
      function success() {
        Ctrl9.instructionsPlayer.release();
        $scope.playWordAudio();
      },
      function error(err) {
        $log.error(err);
        Ctrl9.instructionsPlayer.release();
      }
    );
  };

  Ctrl9.success = function() {
    $scope.draggedImgs.push("dummyValue");
    var LAST_CHECK = $scope.draggedImgs.length === $scope.totalWords;
    Ctrl9.successFeedback();
    if (LAST_CHECK) {
      Ctrl9.levelUp();
      if (!Ctrl9.finished) {
        $scope.score = Score.update($scope.addScore, $scope.activityId, Ctrl9.finished);
        Ctrl9.finished = Ctrl9.level >= Ctrl9.finalizationLevel;
        if (Ctrl9.finished) {
          ActividadesFinalizadasService.add($scope.activityId);
          $state.go('lobby');
        } else if (Ctrl9.level <= Ctrl9.totalLevels) {
          Ctrl9.showDashboard(false);
        } else {
          Ctrl9.level = Ctrl9.initialLevel;
          $state.go('lobby');
        }
      } else {
        if (Ctrl9.level <= Ctrl9.totalLevels) {
          Ctrl9.showDashboard(false);
        } else {
          Ctrl9.level = Ctrl9.initialLevel;
          $state.go('lobby');
        }
      }
    }
  };

  Ctrl9.error = function() {
    if (!Ctrl9.finished) {
      $scope.score = Score.update(-$scope.substractScore, $scope.activityId, Ctrl9.finished);
    }
    Ctrl9.errorFeedback();
  };

  $scope.handleProgress = function(isWordOk) {
    if (isWordOk) {
      Ctrl9.success();
    } else {
      Ctrl9.error();
    }
  };

  Ctrl9.levelUp = function() {
    Ctrl9.level++;
  };

  Ctrl9.levelDown = function() {
    Ctrl9.level = (Ctrl9.level > 1) ? (Ctrl9.level - 1) : 1;
  };

  /*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl9.showDashboard(true);
  });
  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel(Ctrl9.activityId, Ctrl9.level);
  });
});
