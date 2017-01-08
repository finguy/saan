angular.module('saan.controllers')

.controller('16Ctrl', function($scope, $state, $log, $timeout, RandomWordsSixteen, TTSService,
  Util, Score, ActividadesFinalizadasService, AssetsPath, AppSounds) {

  $scope.assets = [];
  $scope.imgs = [];
  $scope.dropzone = [];
  $scope.items = ['dummy'];
  $scope.showText = false;
  $scope.textSpeech = "";
  $scope.introText = "";
  $scope.helpText = "";
  $scope.endText = "";
  $scope.draggedAssets = [];
  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;
  //Shows Activity Dashboard
  var successPlayer;
  var endingPlayer;
  var failurePlayer;
  var Ctrl16 = Ctrl16 || {};
  $scope.activityId = 16; // Activity Id
  $scope.assetsPath = AssetsPath.getImgs($scope.activityId);
  Ctrl16.totalLevels = 1;
  Ctrl16.level = null; // Indicates activity level
  $scope.activityProgress = 0;
  Ctrl16.letterOk = false;
  Ctrl16.instructionsPlayer;
  $scope.speaking = false;

  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel($scope.activityId, Ctrl16.level);
    Ctrl16.releasePlayer(Ctrl16.instructionsPlayer);
    Ctrl16.releasePlayer(Ctrl16.tapInstructionsPlayer);
    Ctrl16.releasePlayer(successPlayer);
    Ctrl16.releasePlayer(endingPlayer);
    Ctrl16.releasePlayer(failurePlayer);
  });

  Ctrl16.releasePlayer = function (player) {
    if (player) {
      player.release();
    }
  };

  Ctrl16.showDashboard = function(readInstructions) {
    Ctrl16.setUpStatus();
    Ctrl16.setUpLevel();
    Ctrl16.setUpScore();

    RandomWordsSixteen.letters(Ctrl16.level).then(
      function success(data) {
        Ctrl16.setUpContextVariables(data, readInstructions);

        //wait for UI to load
        var readWordTimeout = 1000;
        $timeout(function() {
          if (readInstructions) {
            $scope.showText = true;
            $scope.speaking = true;
            Ctrl16.instructionsPlayer.play();
          } else {
            $scope.showText = false;
            $scope.speaking = false;
          }
        }, readWordTimeout);
      },
      function error(error) {
        $log.error(error);
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
    if (!$scope.speaking) {
    var successFeedback = RandomWordsSixteen.getSuccessAudio();
    $scope.textSpeech = successFeedback.text;
    $scope.showText = true;
    successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
      function success() {
        successPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
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

  Ctrl16.endingFeedbackSetUp = function() {
    if (!$scope.speaking) {
      var index = (Ctrl16.finished) ? 1 : 0;
      var endingFeedback = RandomWordsSixteen.getEndingAudio(index);
      $scope.endText = endingFeedback.text;
      endingPlayer = new Media(AssetsPath.getEndingAudio($scope.activityId) + endingFeedback.path,
        function success() {
          endingPlayer.release();
          $scope.showText = false;
          $scope.speaking = false;
          $scope.$apply();
          $state.go('lobby');
        },
        function error(err) {
          $log.error(err);
          endingPlayer.release();
          $scope.showText = false;
          $scope.checkingWord = false;
          $scope.speaking = false;
        }
      );
     }
  };

  Ctrl16.errorFeedback = function() {
    if (!$scope.speaking) {
      var failureFeedback = RandomWordsSixteen.getFailureAudio();
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
        });
      $scope.speaking = true;
      failurePlayer.play();
     }
  };

  Ctrl16.setUpContextVariables = function(data, readInstructions) {
    var wordsJson = data;
    var imgs = [];
    var assets = [];
    $scope.assets = [];
    for (var i in wordsJson.info.letters) {
      if (wordsJson.info.letters[i]) {
        imgs.push({
          image: wordsJson.info.letters[i].letterImg,
          assets: wordsJson.info.letters[i].assets,
          dropzone: [],
          name: wordsJson.info.letters[i].name
        });
        var letterAssets = wordsJson.info.letters[i].assets.map(function(asset) {
          return {
            name: wordsJson.info.letters[i].name,
            assetImage: asset
          };
        });
        assets = assets.concat(letterAssets);
      }
    }

    $scope.imgs = imgs;
    $scope.imgs = _.shuffle($scope.imgs);
    $scope.assets = assets;
    $scope.draggedImgs = [];
    Ctrl16.successMessages = data.successMessages;
    Ctrl16.errorMessages = data.errorMessages;
    Ctrl16.addScore = data.scoreSetUp.add;
    Ctrl16.substractScore = data.scoreSetUp.substract;
    Ctrl16.finalizationLevel = data.finalizationLevel;
    Ctrl16.totalLevels = data.totalLevels;
    Ctrl16.initialLevel = 1;


    if (readInstructions) {
      $scope.textSpeech = data.instructionsPath.intro.text;
    }
    $scope.introText = data.instructionsPath.intro.text;
    Ctrl16.instructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.intro.path,
      function success() {
        Ctrl16.instructionsPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl16.instructionsPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );

    $scope.helpText = data.instructionsPath.tap.text;
    Ctrl16.tapInstructionsPlayer = new Media(AssetsPath.getActivityAudio($scope.activityId) + data.instructionsPath.tap.path,
      function success() {
        Ctrl16.tapInstructionsPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
        $scope.$apply();
      },
      function error(err) {
        $log.error(err);
        Ctrl16.tapInstructionsPlayer.release();
        $scope.showText = false;
        $scope.speaking = false;
      }
    );

    Ctrl16.endingFeedbackSetUp();
  };


  Ctrl16.handleSuccess = function() {
    AppSounds.playTap();
    var LAST_CHECK = $scope.draggedImgs.length === $scope.assets.length;
    if (LAST_CHECK) {
      Ctrl16.levelUp(); //Advance level
      if (!Ctrl16.finished) { //Aumento puntaje
        Ctrl16.score = Score.update(Ctrl16.addScore, $scope.activityId, Ctrl16.finished);
        Ctrl16.finished = Ctrl16.level >= Ctrl16.finalizationLevel;
        if (Ctrl16.finished) { // Puede haber alcanzado el puntaje para que marque como finalizada.
          ActividadesFinalizadasService.add($scope.activityId);
          $scope.speaking = true;
          $scope.showText = true;
          $scope.textSpeech = $scope.endText;
          endingPlayer.play();
        } else if (Ctrl16.level <= Ctrl16.totalLevels) {
          Ctrl16.successFeedback();
          $timeout(function() {
            Ctrl16.showDashboard(false);
          }, 1000);
        } else {
          Ctrl16.level = Ctrl16.initialLevel;
          $scope.speaking = true;
          $scope.showText = true;
          $scope.textSpeech = $scope.endText;
          endingPlayer.play();
        }
      } else {
        if (Ctrl16.level <= Ctrl16.totalLevels) {
          Ctrl16.successFeedback();
          $timeout(function() {
            Ctrl16.showDashboard(false);
          }, 1000);
        } else {
          Ctrl16.level = Ctrl16.initialLevel;
          $scope.speaking = true;
          $scope.showText = true;
          $scope.textSpeech = $scope.endText;
          endingPlayer.play();
        }
      }
    }

  };

  Ctrl16.handleError = function() {
    if (!Ctrl16.finished) {
      Ctrl16.score = Score.update(-Ctrl16.substractScore, $scope.activityId, Ctrl16.finished);
    }
    Ctrl16.errorFeedback();
  };

  Ctrl16.handleProgress = function(isLetterOk) {
    if (isLetterOk) {
      Ctrl16.handleSuccess();
    } else {
      Ctrl16.handleError();
    }
  };

  //Advance one level
  Ctrl16.levelUp = function() {
    Ctrl16.level++;
    $scope.assets = [];
  };

  // Goes back one level
  Ctrl16.levelDown = function() {
    Ctrl16.level = (level > 1) ? (level - 1) : 1;
    Ctrl16.letters = [];
  };

  //Drag
  $scope.sourceOptions = {
    containment: '.activity-16-content',
    containerPositioning: 'relative',
    dragEnd: function(eventObj) {
     var validDrag =  typeof Ctrl16.letterOk !== 'undefined' ;
     var progressOk = Ctrl16.letterOk;
     Ctrl16.letterOk =  undefined;
      if (validDrag && !progressOk){
        $log.error("wrong!!");
        //Remove element from where it was added
        eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
        //Add elemebt back again   Note:
        eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.itemScope.modelValue ); // uso itemScope.modelValue porque eventObj.source.itemScope.item es undefined
        Ctrl16.handleProgress(false);
      } else if (validDrag) {
        Ctrl16.handleProgress(true);
      }
    },
    accept: function(sourceItemHandleScope, destSortableScope) {
      return false;
    }
  };

  //Drop
  $scope.targetOptions = {
    containment: '.activity16',
    accept: function(sourceItemHandleScope, destSortableScope) {
      Ctrl16.letterOk = sourceItemHandleScope.modelValue.name == destSortableScope.element[0].getAttribute('data-name');
      return Ctrl16.letterOk;
    }
  };

  $scope.tapInstructions = function() {
   if (!$scope.speaking) {
     $scope.showText = true;
     $scope.speaking = true;
     $scope.textSpeech = $scope.helpText;
     Ctrl16.tapInstructionsPlayer.play();
   }
  };

  $scope.$on('$ionicView.beforeEnter', function() {
    /*************** ACTIONS **************************/
    //Show Dashboard
    Ctrl16.showDashboard(true);
  });
});
