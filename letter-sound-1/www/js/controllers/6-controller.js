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

  $scope.phonemas = [];
  $scope.imgBox = "magic-pot.png";
  $scope.showText = false;
  $scope.textSpeech = "";


  var Ctrl6 = Ctrl6 || {};
  Ctrl6.instructionsPlayer;

  Ctrl6.successFeedback = function() {
    var successFeedback = RandomWordSix.getSuccessAudio();
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

  Ctrl6.errorFeedback = function() {
    var failureFeedback = RandomWordSix.getFailureAudio();
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

  Ctrl6.showDashboard = function(readInstructions) {
    Ctrl6.setUpLevel();
    Ctrl6.setUpScore();
    Ctrl6.setUpStatus();

    RandomWordSix.word($scope.level, $scope.playedWords).then(
      function success(data) {
        Ctrl6.setUpContextVariables(data);
        var readWordTimeout = (readInstructions) ? 4000 : 1000;
        $timeout(function() {
          if (readInstructions) {
           $scope.textSpeech = "Hi!";
           $scope.showText = false;
           $scope.speaking = false;
            Ctrl6.instructionsPlayer.play();
          }
          $timeout(function() {
            Ctrl6.phonemaPlayer.play();
          }, readWordTimeout);
        }, readWordTimeout);
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
    var aux_letters = wordJson.word.split("");
    for (var j in aux_letters) {
      if (aux_letters[j]) {
        var letter = aux_letters[j];
        $scope.letters.push({
          "letter": letter,
          "index": j
        });
        $scope.hasDraggedLetter[letter + "_" + j] = false;
      }
    }
    $scope.letters2 = [];

    var letterJSON = Util.getRandomElemFromArray($scope.letters);
    $scope.currentPhonema = letterJSON.letter;
    $scope.totalLevels = data.totalLevels;
    $scope.phonemas = [];

    Ctrl6.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
      function success() {
        Ctrl6.instructionsPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
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
      },
      function error(err) {
        $log.error(err);
        Ctrl6.instructionsTapPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );

    Ctrl6.phonemaPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + "letters/" + $scope.currentPhonema.toUpperCase(),
      function success() {
        Ctrl6.phonemaPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      },
      function error(err) {
        $log.error(err);
        Ctrl6.phonemaPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );
  };

  $scope.checkPhonema = function(selectedObject) {
    var ER = new RegExp($scope.currentPhonema, "i");
    var name = selectedObject.toLowerCase();
    return ER.test(name);
  };

  $scope.getNewPhonema = function() {
    $scope.phonemas.push($scope.currentPhonema);
    var selected = true;
    while (selected && $scope.phonemas.length < $scope.letters.length) {
      var letterJSON = Util.getRandomElemFromArray($scope.letters);
      $scope.currentPhonema = letterJSON.letter;
      selected = $scope.hasDraggedLetter[letterJSON.letter + "_" + letterJSON.index];
    }
  };


  Ctrl6.success = function() {
    var LAST_CHECK = $scope.phonemas.length === $scope.letters.length;
    Ctrl6.successFeedback();
    if (!$scope.finished) {
      $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
    }
    if (LAST_CHECK) {
      $scope.speak($scope.word);
      $timeout(function() {
        Ctrl6.levelUp();
        if (!$scope.finished) {
          $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
          $scope.finished = $scope.level >= $scope.finalizationLevel;
          if ($scope.finished) {
            ActividadesFinalizadasService.add($scope.activityId);
            $state.go('lobby');
          } else if ($scope.level <= $scope.totalLevels) {
            Ctrl6.showDashboard(false);
          } else {
            $state.go('lobby');
          }
        } else if ($scope.level <= $scope.totalLevels) {
          Ctrl6.showDashboard(false);
        } else {
          $scope.level = Ctrl6.initialLevel;
          $state.go('lobby');
        }
      }, 1000);
    } else {
      $scope.speak($scope.currentPhonema);
    }
  };

  Ctrl6.error = function() {
    if (!$scope.finished) {
      $scope.score = Score.update(-$scope.substractScore, $scope.activityId, $scope.finished);
      Util.saveScore($scope.activityId, $scope.score);
    }
    $scope.speak(name);
    $timeout(function() {
      Ctrl6.errorFeedback();
    }, 000);
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
      $scope.speak($scope.instructions);
    }, 1000);
  }

  $scope.sortableTargetOptions = {
    containment: '.activity6',
    accept: function(sourceItemHandleScope, destSortableScope){
      $scope.isPhonemaOk = $scope.checkPhonema(sourceItemHandleScope.modelValue.letter);
      return $scope.isPhonemaOk;
    }
  };

  $scope.sortableSourceOptions = {
    containment: '.activity6',
    containerPositioning: 'relative',
    clone: true,// ACA si es false se rompe todo!!!!
    allowDuplicates: true,
    dragEnd: function(eventObj) {
      if (!$scope.isPhonemaOk){
         $scope.handleProgress(false);
      }
    },
    itemMoved: function (eventObj) {
      var jsonInfo = eventObj.source.itemScope.modelValue;
      var letter_index = jsonInfo.index;
      var letter_value = jsonInfo.letter;
      var index = letter_value + "_" + letter_index;
      $scope.hasDraggedLetter[index] = true;
      $scope.getNewPhonema();
      $scope.handleProgress(true,letter_value);
    }
  };

  $scope.isDragged = function(letter , index) {
    return $scope.hasDraggedLetter[letter +"_" + index] === true;
  };
  $scope.speakConditional = function(letter, index) {
    if ($scope.isDragged(letter, index)) {
      $scope.speak(letter);
    }
  };

  //*************** ACTIONS **************************/
  $scope.$on('$ionicView.beforeEnter', function() {
    Ctrl6.showDashboard(true);
  });

  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, $scope.level);
  });
});
