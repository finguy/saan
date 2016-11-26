angular.module('saan.controllers')
  .controller('5Ctrl', function($scope, $timeout, $state, $log, RandomLetter, TTSService,
    Util, Score, ActividadesFinalizadasService, AssetsPath) {
    $scope.activityId = 5; // Activity Id
    $scope.letter = ""; // Letter to play in level
    $scope.letterSrc = "";
    $scope.imgs = [];
    $scope.instructions = ""; // Instructions to read
    $scope.successMessages = [];
    $scope.errorMessages = [];
    $scope.letters = []; // Word letters
    $scope.checkingLetter = false;
    $scope.checkingWord = false;
    $scope.activityProgress = 0;
    $scope.showText = false;
    $scope.textSpeech = "";

    //Reproduces sound using TTSService
    $scope.speak = TTSService.speak;

    //Shows Activity Dashboard
    var Ctrl5 = Ctrl5 || {};
    Ctrl5.selectedObject = ""; // Collects letters the user selects
    Ctrl5.playedLetters = []; // Collects words the user played
    Ctrl5.level = null; // Indicates activity level
    Ctrl5.score = 0;
    Ctrl5.successPlayer;
    Ctrl5.failurePlayer;

    $scope.$on('$ionicView.beforeLeave', function() {
      Util.saveLevel($scope.activityId, Ctrl5.level);
    });

    Ctrl5.showDashboard = function(readInstructions) {
      $scope.checkingWord = false;

      Ctrl5.setUpLevel();
      Ctrl5.setUpScore();
      Ctrl5.setUpStatus();

      RandomLetter.letter(Ctrl5.level, Ctrl5.playedLetters).then(
        function success(data) {

          Ctrl5.setUpContextVariables(data);
          var readWordTimeout = (readInstructions) ? 2000 : 1000;
          //wait for UI to load
          $timeout(function() {
            if (readInstructions) {
              $scope.speak($scope.instructions);
              $timeout(function() {
                $scope.speak($scope.letter);
              }, 7000);
            } else {
              $scope.speak($scope.letter);
            }
          }, readWordTimeout);

        },
        function error(error) {
          $log.error(error);
        }
      );
    };

    Ctrl5.setUpLevel = function() {
      if (!Ctrl5.level) {
        Ctrl5.level = Util.getLevel($scope.activityId);
      }
    };

    Ctrl5.setUpScore = function() {
      Ctrl5.score = Util.getScore($scope.activityId);
    };

    Ctrl5.setUpStatus = function() {
      Ctrl5.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
    };

    Ctrl5.setUpContextVariables = function(data) {
      var letterJson = data.letter;
      $scope.letterSrc = letterJson.letterSrc;
      $scope.instructions = data.instructions;
      $scope.successMessages = data.successMessages;
      $scope.errorMessages = data.errorMessages;
      $scope.letter = letterJson.letter;

      Ctrl5.addScore = data.scoreSetUp.add;
      Ctrl5.substractScore = data.scoreSetUp.substract;
      Ctrl5.finalizationLevel = data.finalizationLevel;
      Ctrl5.totalLevels = data.totalLevels;
      Ctrl5.initialLevel = 1;

      $scope.imgs = [];
      for (var i in letterJson.imgs) {
        if (letterJson.imgs[i]) {
          var img = {};
          img.name = letterJson.imgs[i].name;
          img.src = Util.getRandomElemFromArray(letterJson.imgs[i].src);
          $scope.imgs.push(img);
        }
      }

      if (Ctrl5.finished) {
        $scope.activityProgress = 100;
      } else {
        $scope.activityProgress = 100 * (Ctrl5.level - 1) / Ctrl5.totalLevels;
      }

      //Success feeback player
      var successFeedback = RandomLetter.getSuccessAudio();
      Ctrl5.successText = successFeedback.text;
      Ctrl5.successPlayer = new Media(AssetsPath.getSuccessAudio($scope.activityId) + successFeedback.path,
        function success() {
          Ctrl5.successPlayer.release();
          $scope.showText = false;
        },
        function error(err) {
          $log.error(err);
          Ctrl5.successPlayer.release();
          $scope.showText = false;
          $scope.checkingWord = false;
        }
      );

      //Failure feeback player
      var failureFeedback = RandomLetter.getFailureAudio();
      Ctrl5.failureText = failureFeedback.text;
      Ctrl5.failurePlayer = new Media(AssetsPath.getFailureAudio($scope.activityId) + failureFeedback.path,
        function success() {
          Ctrl5.failurePlayer.release();
          $scope.showText = false;
          $scope.$apply();
        },
        function error(err) {
          $log.error(err);
          Ctrl5.failurePlayer.release();
          $scope.showText = false;
        }
      );
    };

    Ctrl5.success = function() {
      Ctrl5.playedLetters.push($scope.letter.toLowerCase());
      $timeout(function() {
        $scope.showText = true;
        $scope.textSpeech = Ctrl5.successText;
        Ctrl5.successPlayer.play();
        //wait for speak
        $timeout(function() {
          Ctrl5.levelUp(); //Advance level
          if (!Ctrl5.finished) {
            Ctrl5.score = Score.update(Ctrl5.addScore, $scope.activityId, Ctrl5.finished);
            Ctrl5.finished = Ctrl5.level >= Ctrl5.finalizationLevel;
            if (Ctrl5.finished) {
              ActividadesFinalizadasService.add($scope.activityId);
              $state.go('lobby');
            } else {
              Ctrl5.showDashboard(false);
            }
          } else if (Ctrl5.level <= Ctrl5.totalLevels) {
            Ctrl5.showDashboard(false);
          } else {
            Ctrl5.level = Ctrl5.initialLevel;
            $state.go('lobby');
          }
        }, 1000);
      }, 1000);
    };

    Ctrl5.error = function() {
      Ctrl5.score = Score.update(-Ctrl5.substractScore, Ctrl5.score);
      Util.saveScore($scope.activityId, Ctrl5.score);
      //wait for speak
      $timeout(function() {
        $scope.checkingWord = false;
        $scope.showText = true;
        $scope.textSpeech = Ctrl5.failureText;
        Ctrl5.failurePlayer.play();
      }, 1000);
    };

    //Verifies selected letters and returns true if they match the word
    Ctrl5.handleProgress = function(selectedObject) {
      $scope.checkingWord = true;
      var ER = new RegExp($scope.letter, "i");
      var name = selectedObject.toLowerCase();
      if (ER.test(name)) {
        Ctrl5.success();
      } else {
        Ctrl5.error();
      }
    };

    //Advance one level
    Ctrl5.levelUp = function() {
      Ctrl5.level++;
      $scope.letters = [];
      $scope.selectedLetters = [];
    };

    // Goes back one level
    Ctrl5.levelDown = function() {
      Ctrl5.level = (level > 1) ? (level - 1) : 1;
      $scope.letters = [];
      $scope.selectedLetters = [];
    };

    $scope.selectLetter = function(name, objectNameSrc) {
      if (!$scope.checkingLetter && !$scope.checkingWord) {
        $scope.checkingLetter = true;
        Ctrl5.selectedObject = name;
        var object = objectNameSrc.split("/");
        var objectName = object[object.length - 1].replace(".png", "");
        $scope.speak($scope.letter + " in " + objectName);
        $timeout(function() {
          $scope.checkingLetter = false;
          Ctrl5.handleProgress(name);
        }, 500);
      }
    };

    //*************** ACTIONS **************************/
    //Show Dashboard
    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl5.showDashboard(true);
    });
  });
