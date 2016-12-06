angular.module('saan.controllers')

.controller('16Ctrl', function($scope, $state, $log, $timeout, RandomWordsSixteen, TTSService,
  Util, Score, ActividadesFinalizadasService, AssetsPath) {

  $scope.activityId = 16;
  $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
  $scope.letters = [];
  $scope.imgs = [];
  $scope.dropzone = [];
  $scope.items = ['dummy'];
  $scope.showText = false;
  $scope.textSpeech = "";
  $scope.speak = TTSService.speak;
  $scope.activityProgress = 0;

  var Ctrl16 = Ctrl16 || {};
  Ctrl16.totalLevels = 1;
  Ctrl16.level = null;
  Ctrl16.letterOk = false;
  Ctrl16.playedLetters = [];
  Ctrl16.instructionsPlayer;

  Ctrl16.showDashboard = function(readInstructions) {
    Ctrl16.setUpLevel();
    Ctrl16.setUpScore();
    Ctrl16.setUpStatus();

    RandomWordsSixteen.letters(Ctrl16.level, Ctrl16.playedLetters).then(
      function success(data) {
        Ctrl16.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 4000 : 1000;
        $timeout(function() {
          if (readInstructions) {
            Ctrl16.instructionsPlayer.play();
          }
        }, readWordTimeout);
      },
      function error(error) {
        $log.error(error)
      }
    );
  };

  Ctrl16.setUpLevel = function() {
    if (!Ctrl16.level) {
      Ctrl16.level = Util.getLevel($scope.activityId);
    }
  };

  Ctrl16.setUpScore = function() {
    Ctrl16.score = Util.getScore($scope.activityId);
  };

  Ctrl16.setUpStatus = function() {
    Ctrl16.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
  };

  Ctrl16.successFeedback = function() {
    var successFeedback = RandomWordsSixteen.getSuccessAudio();
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

  Ctrl16.errorFeedback = function() {
    var failureFeedback = RandomWordsSixteen.getFailureAudio();
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
  }

  Ctrl16.setUpContextVariables = function(data) {
    var wordsJson = data;
    var imgs = [];
    var letters = [];
    Ctrl16.playedLetters.push(wordsJson.info.id);
    $scope.letters = [];
    for (var i in wordsJson.info.letters) {
      if (wordsJson.info.letters[i]) {
        var index = Util.getRandomNumber(wordsJson.info.letters[i].assets.length);
        imgs.push({
          image: wordsJson.info.letters[i].assets[index],
          dropzone: [wordsJson.info.letters[i].name]
        });
        letters.push({
          name: wordsJson.info.letters[i].name,
          letterImage: wordsJson.info.letters[i].letterImg
        });
      }
    }

    $scope.imgs = imgs;
    $scope.imgs = _.shuffle($scope.imgs);
    $scope.letters = letters;
    $scope.draggedImgs = [];
    Ctrl16.addScore = data.scoreSetUp.add;
    Ctrl16.substractScore = data.scoreSetUp.substract;
    Ctrl16.finalizationLevel = data.finalizationLevel;
    Ctrl16.totalLevels = data.totalLevels;
    Ctrl16.initialLevel = 1;
    if (Ctrl16.finished) {
      $scope.activityProgress = 100;
    } else {
      $scope.activityProgress = 100 * (Ctrl16.level - 1) / Ctrl16.totalLevels;
    }

    Ctrl16.instructionsPlayer = new Media(AssetsPath.getGeneralAudio() + data.instructionsPath,
      function success() {
        Ctrl16.instructionsPlayer.release();
      },
      function error(err) {
        $log.error(err);
        Ctrl16.instructionsPlayer.release();

      }
    );
  };


  Ctrl16.handleSuccess = function() {
    var LAST_CHECK = $scope.draggedImgs.length === $scope.letters.length;
    $scope.speak($scope.letter);
    $timeout(function() {
      Ctrl16.successFeedback();
      $timeout(function() {
        if (LAST_CHECK) {
          Ctrl16.levelUp();
          if (!Ctrl16.finished) {
            Ctrl16.score = Score.update(Ctrl16.addScore, $scope.activityId, Ctrl16.finished);
            Ctrl16.finished = Ctrl16.level >= Ctrl16.finalizationLevel;
            if (Ctrl16.finished) {
              ActividadesFinalizadasService.add($scope.activityId);
              $state.go('lobby');
            } else if (Ctrl16.level <= Ctrl16.totalLevels) {
              Ctrl16.showDashboard(false);
            } else {
              Ctrl16.level = Ctrl16.initialLevel;
              $state.go('lobby');
            }
          } else {
            if (Ctrl16.level <= Ctrl16.totalLevels) {
              Ctrl16.showDashboard(false);
            } else {
              Ctrl16.level = Ctrl16.initialLevel;
              $state.go('lobby');
            }
          }
        }
      }, 1000);
    }, 1000);
  };

  Ctrl16.handleError = function() {
    if (!Ctrl16.finished) {
      Ctrl16.score = Score.update(-Ctrl16.substractScore, $scope.activityId, Ctrl16.finished);
    }
    $scope.speak(name);
    $timeout(function() {
      Ctrl16.errorFeedback();
    }, 1000);
  };

  Ctrl16.handleProgress = function(isLetterOk) {
    if (isLetterOk) {
      Ctrl16.handleSuccess();
    } else {
      Ctrl16.handleError();
    }
  };

  Ctrl16.levelUp = function() {
    Ctrl16.level++;
    $scope.letters = [];
  };

  Ctrl16.levelDown = function() {
    Ctrl16.level = (level > 1) ? (level - 1) : 1;
    Ctrl16.letters = [];
  };

  $scope.sourceOptions = {
    containment: '.activity-16-content',
    containerPositioning: 'relative',
    dragEnd: function(eventObj) {
      if (!Ctrl16.letterOk) {
        $log.error("wrong!!");
        Ctrl16.handleProgress(false);
      } else {
        $log.error("move again");
      }
    },
    itemMoved: function(eventObj) {
      Ctrl16.handleProgress(true);
    },
    accept: function(sourceItemHandleScope, destSortableScope) {
      return false;
    }
  };

  $scope.targetOptions = {
    containment: '.activity16',
    accept: function(sourceItemHandleScope, destSortableScope) {
      Ctrl16.letterOk = sourceItemHandleScope.modelValue.name == destSortableScope.modelValue[0];
      return Ctrl16.letterOk;
    }
  };

  //*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl16.showDashboard(true);
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, Ctrl16.level);
  });
});
