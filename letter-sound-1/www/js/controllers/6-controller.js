angular.module('saan.controllers')

.controller('6Ctrl', function($scope, $state, $log, $timeout, RandomWordSix,
  Util, Score, ActividadesFinalizadasService, AssetsPath) {
  $scope.activityId = 6; // Activity Id
  $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
  $scope.word = ""; // Letter to play in level
  $scope.letters = [];
  $scope.letters2 = [];
  $scope.lettersDragged = [];
  $scope.playedWords = []; // Collects words the user played
  $scope.dropzone = [];
  $scope.hasDraggedLetter = [];
  $scope.phonemas = [];
  $scope.imgBox = "magic-pot.png";
  $scope.showText = false;
  $scope.textSpeech = "";


  var Ctrl6 = Ctrl6 || {};
  Ctrl6.instructionsPlayer;

  Ctrl6.successFeedback = function() {
   if (!Ctrl6.speaking) {
     var successFeedback = RandomWordSix.getSuccessAudio();
     $scope.textSpeech = successFeedback.text;
     $scope.showText = true;
     var successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
       function success() {
         successPlayer.release();
         $scope.showText = false;
         Ctrl6.speaking = false;
       },
       function error(err) {
         $log.error(err);
         successPlayer.release();
         $scope.showText = false;
         $scope.checkingWord = false;
         Ctrl6.speaking = false;
       }
     );
     Ctrl6.speaking = true;
     successPlayer.play();
    }
  };

  Ctrl6.errorFeedback = function() {
   if (!Ctrl6.speaking) {
    var failureFeedback = RandomWordSix.getFailureAudio();
    $scope.textSpeech = failureFeedback.text;
    $scope.showText = true;
    var failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
      function success() {
        failurePlayer.release();
        $scope.showText = false;
        Ctrl6.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        failurePlayer.release();
        $scope.showText = false;
        Ctrl6.speaking = false;
      });
    Ctrl6.speaking = true;
    failurePlayer.play();
   }
  };

  Ctrl6.showDashboard = function(readInstructions) {
    Ctrl6.setUpLevel();
    Ctrl6.setUpScore();
    Ctrl6.setUpStatus();

    RandomWordSix.word($scope.level, $scope.playedWords).then(
      function success(data) {
        Ctrl6.setUpContextVariables(data);
        $timeout(function() {
          if (readInstructions) {
           $scope.textSpeech = "Hi!";
           $scope.showText = true;
           $scope.speaking = true;
           Ctrl6.instructionsPlayer.play();
          }
        }, 1000);
      },
      function error(error) {
        $log.error(error);
      }
    );
  };

  Ctrl6.setUpLevel = function() {
    if (!$scope.level) {
      $scope.level = Util.getLevel($scope.activityId);
    }
  };

  Ctrl6.setUpScore = function() {
    $scope.score = Util.getScore($scope.activityId);

  };

  Ctrl6.setUpStatus = function() {
    $scope.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
  }

  Ctrl6.setUpContextVariables = function(data) {
    var wordJson = data.word;

    $scope.addScore = data.scoreSetUp.add;
    $scope.substractScore = data.scoreSetUp.substract;
    $scope.finalizationLevel = data.finalizationLevel;
    $scope.word = wordJson.word;
    $scope.playedWords.push(wordJson.word);
    Ctrl6.initialLevel = 1;
    $scope.letters = wordJson.word.split("");
    $scope.letters2 = [];
    $scope.currentPhonema = Util.getRandomElemFromArray($scope.letters);
    $scope.totalLevels = data.totalLevels;
    $scope.phonemas = [];

    for (var i = 0; i < $scope.letters.length; i++) {
     var letter = $scope.letters[i];
     $scope.hasDraggedLetter[letter + "_" + i] = false;


    }

    Ctrl6.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
      function success() {
        Ctrl6.instructionsPlayer.release();
        if (!Ctrl6.beforeLeave) {
          Ctrl6.phonemaPlayer.play();
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

    Ctrl6.instructionsTapPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.tap.path,
      function success() {
        Ctrl6.instructionsTapPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl6.instructionsTapPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );

    Ctrl6.phonemaPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + "letters/" + $scope.currentPhonema.toUpperCase() + ".mp3",
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
        Ctrl6.speaking = false;
        $state.go('lobby');
      },
      function error(err) {
        $log.error(err);
        Ctrl6.endPlayer.release();
        Ctrl6.speaking = false;
      }
    );
   } else {
      endingFeedback = RandomWordSix.getEndingAudio(1);
      $scope.textSpeech = endingFeedback.text;

      Ctrl6.endPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
        function success() {
          Ctrl6.endPlayer.release();
          Ctrl6.speaking = false;
          $state.go('lobby');
        },
        function error(err) {
          $log.error(err);
          Ctrl6.endPlayer.release();
          Ctrl6.speaking = false;
        }
      );
    }
  };

  $scope.checkPhonema = function(selectedObject) {
    var ER = new RegExp($scope.currentPhonema, "i");
    var name = selectedObject.toLowerCase();
    console.log("checkPhonema");
    console.log($scope.currentPhonema);
    console.log(name);
    console.log(ER.test(name));
    return ER.test(name);
  };

  $scope.getNewPhonema = function() {
   console.log($scope.letters2);
   console.log($scope.letters);
    $scope.phonemas.push($scope.currentPhonema);
    var selected = true;
    var ER = new RegExp($scope.letters2.toString(),"i");
    var totalLetters = $scope.letters.length;
    var i  = 0;
    console.log(ER);

    while (selected && i < totalLetters) {
      $scope.currentPhonema = $scope.letters[i];
      selected = $scope.hasDraggedLetter[$scope.currentPhonema + "_" + i];
      i++;
    }
    $scope.hasDraggedLetter[$scope.currentPhonema + "_" + i] = true;
    Ctrl6.phonemaPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + "letters/" + $scope.currentPhonema.toUpperCase() + ".mp3",
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
    var LAST_CHECK = $scope.phonemas.length === $scope.letters.length;

      if (!$scope.finished) {
         $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
       }
       if (LAST_CHECK) {
         Ctrl6.successFeedback();
         $timeout(function() {
           Ctrl6.levelUp();
           if (!$scope.finished) {
             $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
             $scope.finished = $scope.level >= $scope.finalizationLevel;
             if ($scope.finished) {
               ActividadesFinalizadasService.add($scope.activityId);
               Ctrl6.endPlayer.play();
             } else if ($scope.level <= $scope.totalLevels) {
               Ctrl6.showDashboard(false);
             } else {
               Ctrl6.endPlayer.play();
             }
           } else if ($scope.level <= $scope.totalLevels) {
             Ctrl6.showDashboard(false);
           } else {
             $scope.level = Ctrl6.initialLevel;
             Ctrl6.endPlayer.play();
           }
         }, 1000);
       } else {
        // $scope.speak($scope.currentPhonema);
       }
  };

  Ctrl6.error = function() {
    if (!$scope.finished) {
      $scope.score = Score.update(-$scope.substractScore, $scope.activityId, $scope.finished);
      Util.saveScore($scope.activityId, $scope.score);
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
    $scope.level++;
    $scope.letters = [];
    $scope.selectedLetters = [];
  };

  Ctrl6.levelDown = function() {
    $scope.level = (level > 1) ? (level - 1) : 1;
    $scope.letters = [];
    $scope.selectedLetters = [];
  };

  Ctrl6.showPage = function() {
    $scope.isActivity = true;
    $scope.instructions = $scope.letterInstruction;
    $timeout(function() {
    //  $scope.speak($scope.instructions);
    }, 1000);
  }

  $scope.readTapInstruction = function() {
   if (!Ctrl6.speaking){
     Ctrl6.instructionsTapPlayer.play();
     Ctrl6.speaking = true;
   }
  };

  $scope.sortableTargetOptions = {
    containment: '.activity6',
    accept: function(sourceItemHandleScope, destSortableScope){
      var value = sourceItemHandleScope.modelValue;
      console.log(value);
      $scope.isPhonemaOk = $scope.checkPhonema(value);
      return $scope.isPhonemaOk;
    }
  };

  $scope.sortableSourceOptions = {
    containment: '.activity6',
    containerPositioning: 'relative',
    clone:true,
    allowDuplicates: true,
    dragEnd: function(eventObj) {
      if (!$scope.isPhonemaOk){
         $scope.handleProgress(false);
      }
    },
    itemMoved: function (eventObj) {
      var letter = eventObj.source.itemScope.modelValue;
      $scope.getNewPhonema();
      $scope.handleProgress(true,letter);
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
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    Ctrl6.beforeLeave = true;
    Util.saveLevel($scope.activityId, $scope.level);
    Ctrl3.releasePlayer(Ctrl6.instructionsPlayer);
    Ctrl3.releasePlayer(Ctrl6.instructionsTapPlayer);
    Ctrl3.releasePlayer(Ctrl6.phonemaPlayer);
    Ctrl3.releasePlayer(Ctrl6.endPlayer);
    Ctrl3.releasePlayer(successPlayer);
    Ctrl3.releasePlayer(failurePlayer);
  });
});
