angular.module('saan.controllers')

.controller('6Ctrl', function($scope, $state, $log, $timeout, RandomWordSix,
  Util, Score, ActividadesFinalizadasService, AssetsPath) {
  $scope.activityId = 6; // Activity Id
  $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
  $scope.word = ""; // Letter to play in level
  $scope.letters = [];
  $scope.shuffleLetters = [];
  $scope.letters2 = [];
  $scope.dropzone = [];
  $scope.hasDraggedLetter = [];
  $scope.phonemas = [];
  $scope.imgBox = "magic-pot.png";
  $scope.showText = false;
  $scope.textSpeech = "";

  var successFeedback;
  var failureFeedback;
  var Ctrl6 = Ctrl6 || {};
  var dragChecked = false;
  Ctrl6.instructionsPlayer;
  Ctrl6.playedWords = {};
  Ctrl6.successFeedback = function() {
   if (!$scope.speaking) {
     successFeedback = RandomWordSix.getSuccessAudio();
     $scope.textSpeech = successFeedback.text;
     $scope.showText = true;
     var successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
       function success() {
         successPlayer.release();
         $scope.showText = false;
         $scope.speaking = false;
       },
       function error(err) {
         $log.error(err);
         successPlayer.release();
         $scope.showText = false;
         $scope.checkingWord = false;
         $scope.speaking = false;
       }
     );
     $scope.speaking = true;
     successPlayer.play();
    }
  };

  Ctrl6.errorFeedback = function() {
   if (!$scope.speaking) {
    failureFeedback = RandomWordSix.getFailureAudio();
    $scope.textSpeech = failureFeedback.text;
    $scope.showText = true;
    var failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
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
      });
    $scope.speaking = true;
    failurePlayer.play();
   }
  };

  Ctrl6.showDashboard = function(readInstructions) {
    Ctrl6.setUpLevel();
    Ctrl6.setUpScore();
    Ctrl6.setUpStatus();

    RandomWordSix.word(Ctrl6.level, Ctrl6.playedWords).then(
      function success(data) {
        Ctrl6.setUpContextVariables(data);
        $timeout(function() {
          if (!Ctrl6.beforeLeave){
            if (readInstructions) {
             $scope.textSpeech = "Hi!";
             $scope.showText = true;
             $scope.speaking = true;
             Ctrl6.instructionsPlayer.play();
            } else {
             $scope.speaking = true;
             Ctrl6.phonemaPlayer.play();
            }
          }
        }, 1000);
      },
      function error(error) {
        $log.error(error);
      }
    );
  };

  Ctrl6.setUpLevel = function() {
    if (!Ctrl6.level) {
      Ctrl6.level = Util.getLevel($scope.activityId);
    }
  };

  Ctrl6.setUpScore = function() {
    Ctrl6.score = Util.getScore($scope.activityId);

  };

  Ctrl6.setUpStatus = function() {
    Ctrl6.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
  }

  Ctrl6.setUpContextVariables = function(data) {
    var word = data.word;
    var img  = data.img;
    $scope.addScore = data.scoreSetUp.add;
    $scope.substractScore = data.scoreSetUp.substract;
    $scope.finalizationLevel = data.finalizationLevel;
    $scope.word = word;
    $scope.wordImg = AssetsPath.getImgs($scope.activityId) + img;
    $scope.showImage = false;
    Ctrl6.initialLevel = 0;
    $scope.letters = [];
    $scope.letterSounds = [];
    Ctrl6.playedWords[$scope.word] = true;

    var letters = word.split("");
    for (var i in letters) {
     if (letters[i]) {
      $scope.letters.push({"index": i, "letter": letters[i]});
      $scope.letterSounds.push({"index": i, "letter": letters[i]});
     }
    }


    $scope.letters = _.shuffle($scope.letters);
    $scope.letters2 = [];
    $scope.currentPhonema = $scope.letterSounds[0];
    $scope.letterSounds.shift();
    $scope.totalLevels = data.totalLevels;
    $scope.phonemas = [];
    $scope.hasDraggedLetter = [];

    for (var i = 0; i < $scope.letters.length; i++) {
     var letter = $scope.letters[i];
     $scope.hasDraggedLetter[letter + "_" + i] = false;
    }

    Ctrl6.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
      function success() {
        Ctrl6.instructionsPlayer.release();
        if (!Ctrl6.beforeLeave) {
         $timeout(function() {
          Ctrl6.phonemaPlayer.play();
         },1000);
        }
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl6.instructionsPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );

    Ctrl6.phonemaPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + "letters/" + $scope.currentPhonema.letter.toUpperCase() + ".mp3",
      function success() {
        Ctrl6.phonemaPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl6.phonemaPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );

    if (!Ctrl6.finished) {
    var endingFeedback = RandomWordSix.getEndingAudio(0);
    $scope.textSpeech = endingFeedback.text;

    Ctrl6.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path ,
      function success() {
        Ctrl6.endPlayer.release();
        $scope.speaking = false;
        $state.go('lobby');
      },
      function error(err) {
        $log.error(err);
        Ctrl6.endPlayer.release();
        $scope.speaking = false;
      }
    );
   } else {
      endingFeedback = RandomWordSix.getEndingAudio(1);
      $scope.textSpeech = endingFeedback.text;

      Ctrl6.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
        function success() {
          Ctrl6.endPlayer.release();
          $scope.speaking = false;
          $state.go('lobby');
        },
        function error(err) {
          $log.error(err);
          Ctrl6.endPlayer.release();
          $scope.speaking = false;
        }
      );
    }
  };

  $scope.checkPhonema = function(selectedObject) {
    var ER = new RegExp($scope.currentPhonema.letter, "i");
    var name = selectedObject.letter.toLowerCase();
    return ER.test(name);
  };

  $scope.getNewPhonema = function() {
    $scope.currentPhonema = $scope.letterSounds[0];
    $scope.letterSounds.shift();
    Ctrl6.phonemaPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + "letters/" + $scope.currentPhonema.letter.toUpperCase() + ".mp3",
      function success() {
        Ctrl6.phonemaPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl6.phonemaPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );
    $scope.speaking = true;
    Ctrl6.phonemaPlayer.play();
  };


  Ctrl6.success = function() {
    var LAST_CHECK = $scope.letters2.length === $scope.letters.length;
      if (!Ctrl6.finished) {
         Ctrl6.score = Score.update($scope.addScore, $scope.activityId, Ctrl6.finished);
       }
       if (LAST_CHECK) {
         $scope.showImage = true;
         Ctrl6.successFeedback();
         $timeout(function() {
           if (!Ctrl6.finished) {
             Ctrl6.levelUp();
             Ctrl6.score = Score.update($scope.addScore, $scope.activityId, Ctrl6.finished);
             Ctrl6.finished = Ctrl6.level >= $scope.finalizationLevel;
             if (Ctrl6.finished) {
               ActividadesFinalizadasService.add($scope.activityId);
               $scope.textSpeech = 'Thank you!';
               $scope.showText = true;
               Ctrl6.endPlayer.play();
             } else if (Ctrl6.level < $scope.totalLevels) {
               Ctrl6.showDashboard(false);
             } else {
              $scope.textSpeech = 'Thank you!';
              $scope.showText = true;
               Ctrl6.endPlayer.play();
             }
           } else if ( (Ctrl6.level + 1)  < $scope.totalLevels ) {
             Ctrl6.levelUp();
             Ctrl6.showDashboard(false);
           } else {
             Ctrl6.level = Ctrl6.initialLevel;
             $scope.textSpeech = 'Thank you!';
             $scope.showText = true;
             Ctrl6.endPlayer.play();
           }
         }, 2000);
       }
  };

  Ctrl6.error = function() {
    if (!Ctrl6.finished) {
      Ctrl6.score = Score.update(-$scope.substractScore, $scope.activityId, Ctrl6.finished);
      Util.saveScore($scope.activityId, Ctrl6.score);
    }
    $timeout(function() {
      Ctrl6.errorFeedback();
    }, 1000);
  };

  $scope.handleProgress = function(isPhonemaOk, name) {
    if (isPhonemaOk) {
      Ctrl6.success();
    } else {
      Ctrl6.error();
    }
  };

  Ctrl6.levelUp = function() {
    Ctrl6.level++;
    $scope.letters = [];
    $scope.selectedLetters = [];
  };

  Ctrl6.levelDown = function() {
    Ctrl6.level = (level > 1) ? (level - 1) : 1;
    $scope.letters = [];
    $scope.selectedLetters = [];
  };

  $scope.readTapInstruction = function() {
   if (!$scope.speaking){
     Ctrl6.phonemaPlayer.play();
     $scope.speaking = true;
   }
  };

  $scope.sortableTargetOptions = {
    containment: '.activity-6',
    accept: function(sourceItemHandleScope, destSortableScope){
      dragChecked = true;
      var value = sourceItemHandleScope.modelValue;
      console.log(value);
      $scope.isPhonemaOk = $scope.checkPhonema(value);
      return $scope.isPhonemaOk;
    }
  };

  $scope.sortableSourceOptions = {
    containment: '.activity-6',
    containerPositioning: 'relative',
    clone: true,
    allowDuplicates: true,
    dragEnd: function(eventObj) {
      if (dragChecked && !$scope.isPhonemaOk){
        $scope.handleProgress(false);
      }
      dragChecked = false;
    },
    itemMoved: function (eventObj) {
     console.log('itemMoved');
      var item = eventObj.source.itemScope.modelValue;
      $scope.hasDraggedLetter[item.letter + "_" + item.index] = true;
      if ($scope.letters2.length != $scope.letters.length) {
        $scope.getNewPhonema();
      }
      $scope.handleProgress(true,item.letter);
    }
  };
  $scope.isDragged = function(letter , index) {
    return $scope.hasDraggedLetter[letter +"_" + index] === true;
  };

  Ctrl6.releasePlayer = function (player) {
    if (player) {
      player.release();
    }
  };

  //*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl6.showDashboard(true);
    Ctrl6.beforeLeave = false;
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    Ctrl6.beforeLeave = true;
    Util.saveLevel($scope.activityId, Ctrl6.level);
    Ctrl6.releasePlayer(Ctrl6.instructionsPlayer);
    Ctrl6.releasePlayer(Ctrl6.phonemaPlayer);
    Ctrl6.releasePlayer(Ctrl6.endPlayer);
    Ctrl6.releasePlayer(successPlayer);
    Ctrl6.releasePlayer(failurePlayer);
  });
});
