angular.module('saan.controllers')

.controller('9Ctrl', function($scope, $timeout, $log, $state, RandomWordsNine, TTSService,
  Util, Score, ActividadesFinalizadasService, AssetsPath, AppSounds) {
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
  $scope.speaking = false;
  $scope.introText = "";
  $scope.helpText = "";
  $scope.endText = "";
  var failurePlayer;
  var successPlayer;
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
        $timeout(function() {
          if (readInstructions) {
            $scope.speaking = true;
            $scope.showText = true;
            $scope.textSpeech = $scope.introText;
            Ctrl9.instructionsPlayer.play();
          } else {
           $scope.speaking = false;
           $scope.showText = false;
          }
        }, 1000);
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
   if (!$scope.speaking) {
      var successFeedback = RandomWordsNine.getSuccessAudio();
      $scope.textSpeech = successFeedback.text;
      $scope.showText = true;
      successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
        function success() {
          successPlayer.release();
        },
        function error(err) {
          $log.error(err);
          successPlayer.release();
          $scope.showText = false;
          $scope.checkingWord = false;
          $scope.speaking = false;
          $scope.$apply();
        }
      );
      $scope.speaking = true;
      successPlayer.play();
     }
  };

  $scope.readInstructions = function() {
   if (!$scope.speaking) {
     $scope.speaking = true;
     $scope.showText = true;
     $scope.textSpeech = $scope.helpText;
     Ctrl9.instructionsPlayerTap.play();
   }
  };

  Ctrl9.errorFeedback = function() {
   if (!$scope.speaking) {
      var failureFeedback = RandomWordsNine.getFailureAudio();
      $scope.textSpeech = failureFeedback.text;
      $scope.showText = true;
      failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
        function success() {
          failurePlayer.release();
          $scope.showText = false;
          $scope.speaking = false;
          $scope.$apply();
        },
        function error(err) {
          $log.error(err);
          failurePlayer.release();
          $scope.showText = false;
          $scope.speaking = false;
          $scope.$apply();
        });
      $scope.speaking = true;
      failurePlayer.play();
    }
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

    if (!Ctrl9.finished) {
      endingFeedback = RandomWordsNine.getEndingAudio(0);
      $scope.endText = endingFeedback.text;
      Ctrl9.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
        function success() {
          Ctrl9.endPlayer.release();
          Ctrl9.speaking = false;
          $state.go('lobby');
        },
        function error(err) {
          $log.error(err);
          Ctrl9.endPlayer.release();
          Ctrl9.speaking = false;
        }
      );
    } else {

      endingFeedback = RandomWordsNine.getEndingAudio(1);
      $scope.endText = endingFeedback.text;
      Ctrl9.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
        function success() {
          Ctrl9.endPlayer.release();
          Ctrl9.speaking = false;
          $state.go('lobby');
        },
        function error(err) {
          $log.error(err);
          Ctrl9.endPlayer.release();
          Ctrl9.speaking = false;
        }
      );
    }
    $scope.introText = data.instructionsPath[0].text;
    Ctrl9.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath[0].path,
      function success() {
        Ctrl9.instructionsPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl9.instructionsPlayer.release();
        $scope.speaking = false;
        $scope.$apply();
      }
    );
    $scope.helpText = data.instructionsPath[1].text;
    Ctrl9.instructionsPlayerTap = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath[1].path,
      function success() {
        Ctrl9.instructionsPlayerTap.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl9.instructionsPlayerTap.release();
        $scope.speaking = false;
        $scope.$apply();
      }
    );
  };

  Ctrl9.success = function() {
    AppSounds.playTap();
    $scope.draggedImgs.push("dummyValue");
    var LAST_CHECK = $scope.draggedImgs.length === $scope.totalWords;
    if (LAST_CHECK) {
     Ctrl9.successFeedback();
     $timeout(function() {
      Ctrl9.levelUp();
      if (!Ctrl9.finished) {
        $scope.score = Score.update($scope.addScore, $scope.activityId, Ctrl9.finished);
        Ctrl9.finished = Ctrl9.level >= (Ctrl9.finalizationLevel + 1 );
        if (Ctrl9.finished) {
          ActividadesFinalizadasService.add($scope.activityId);
          $scope.showText = true;
          $scope.textSpeech = $scope.endText;
          Ctrl9.endPlayer.play();
        } else if (Ctrl9.level <= Ctrl9.totalLevels) {
          Ctrl9.showDashboard(false);
        } else {
          Ctrl9.level = Ctrl9.initialLevel;
          $scope.showText = true;
          $scope.textSpeech = $scope.endText;
          Ctrl9.endPlayer.play();
        }
      } else {
        if (Ctrl9.level <= Ctrl9.totalLevels) {
          Ctrl9.showDashboard(false);
        } else {
          ActividadesFinalizadasService.addMax($scope.activityId);
          Ctrl9.level = Ctrl9.initialLevel;
          $scope.showText = true;
          $scope.textSpeech = $scope.endText;
          Ctrl9.endPlayer.play();
        }
      }
     }, 2000);

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

  Ctrl9.releasePlayer = function(player) {
    if (player) {
      player.release();
    }
  };

  //Drag
  $scope.sourceOptions = {
    containment: '.activity9',
    containerPositioning: 'relative',
    dragEnd: function(eventObj) {
     var validDrag =  typeof $scope.wordOk !== 'undefined' ;
     var progressOk = $scope.wordOk;
     $scope.wordOk =  undefined;
      if (validDrag && !progressOk){
        console.log("wrong!!");
        //Remove element from where it was added
        eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
        //Add elemebt back again   Note:
        eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.itemScope.modelValue ); // uso itemScope.modelValue porque eventObj.source.itemScope.item es undefined
        $scope.handleProgress(false);
      } else if (validDrag) {
       $scope.handleProgress(true);
      }
    },
    accept: function(sourceItemHandleScope, destSortableScope){
      return false;
    }
  };

  //Drop
  $scope.targetOptions = {
    containment: '.activity9',
    accept: function(sourceItemHandleScope, destSortableScope){
      $scope.wordOk = sourceItemHandleScope.modelValue.word == destSortableScope.modelValue[0];
      return $scope.wordOk;
    }
  };

  /*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl9.showDashboard(true);
  });
  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, Ctrl9.level);
    Ctrl9.releasePlayer(Ctrl9.instructionsPlayer);
    Ctrl9.releasePlayer(Ctrl9.instructionsPlayerTap);
    Ctrl9.releasePlayer(Ctrl9.endPlayer);
    Ctrl9.releasePlayer(successPlayer);
    Ctrl9.releasePlayer(failurePlayer);
  });
});
