angular.module('saan.controllers')

.controller('9Ctrl', function($scope, $timeout, $log, $state, RandomWordsNine, TTSService,
  Util, Score, ActividadesFinalizadasService) {
  $scope.activityId = 9; // Activity Id
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

  $scope.$on('$ionicView.beforeLeave', function() {
    Util.saveLevel(Ctrl3.activityId, Ctrl3.level);
  });

  //Shows Activity Dashboard
  var Ctrl9 = Ctrl9 || {};
  Ctrl9.level = null;
  Ctrl9.showDashboard = function(readInstructions) {
    Ctrl9.setUpLevel();
    Ctrl9.setUpScore();
    Ctrl9.setUpStatus();


    RandomWordsNine.words(Ctrl9.level, $scope.playedWords).then(
      function success(data) {
        Ctrl9.setUpContextVariables(data);
        //wait for UI to load
        var readWordTimeout = (readInstructions) ? 4000 : 1000;
        $timeout(function() {
          if (readInstructions) {
            $scope.speak($scope.instructions);
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
    $scope.instructions = data.instructions;
    $scope.successMessages = data.successMessages;
    $scope.errorMessages = data.errorMessages;
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
  };

  Ctrl9.success = function() {
    $scope.draggedImgs.push("dummyValue");
    var LAST_CHECK = $scope.draggedImgs.length === $scope.totalWords;
    var position = Util.getRandomNumber($scope.successMessages.length);
    var successMessage = $scope.successMessages[position];
    $scope.speak(successMessage);
    $timeout(function() {
      if (LAST_CHECK) {
        Ctrl9.levelUp(); //Advance level
        if (!Ctrl9.finished) { //Aumento puntaje
          $scope.score = Score.update($scope.addScore, $scope.activityId, Ctrl9.finished);
          Ctrl9.finished = Ctrl9.level >= Ctrl9.finalizationLevel;
          if (Ctrl9.finished) { // Puede haber alcanzado el puntaje para que marque como finalizada.
            ActividadesFinalizadasService.add($scope.activityId);
            $state.go('lobby');
          } else if (Ctrl9.level <= Ctrl9.totalLevels) {
            Ctrl9.showDashboard(false);
          } else {
            Ctrl9.level =  Ctrl9.initialLevel;
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
    }, 1000);
  };

  Ctrl9.error = function() {
    if (!Ctrl9.finished) {
      $scope.score = Score.update(-$scope.substractScore, $scope.activityId, Ctrl9.finished);
    }
    var position = Util.getRandomNumber($scope.errorMessages.length);
    var errorMessage = $scope.errorMessages[position];
    $scope.speak(errorMessage);
  };

  $scope.handleProgress = function(isWordOk) {
    if (isWordOk) {
      Ctrl9.success();
    } else {
      Ctrl9.error();
    }
  };

  //Advance one level
  Ctrl9.levelUp = function() {
    Ctrl9.level++;
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };

  // Goes back one level
  Ctrl9.levelDown = function() {
    Ctrl9.level = (Ctrl9.level > 1) ? (Ctrl9.level - 1) : 1;
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };
  /*************** ACTIONS **************************/
  //Show Dashboard
  Ctrl9.showDashboard(true);
});
