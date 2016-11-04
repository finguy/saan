angular.module('saan.controllers')

.controller('16Ctrl', function($scope, RandomWordsSixteen, TTSService,
  Util, Score, ActividadesFinalizadasService) {

  $scope.letters = [];
  $scope.imgs = [];
  $scope.dropzone = [];
  $scope.items = ['dummy'];
  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;
  //Shows Activity Dashboard
  var Ctrl16 = Ctrl16 || {};
  Ctrl16.activityId = 16; // Activity Id
  Ctrl16.totalLevels = 1;
  Ctrl16.level = Ctrl16.level || 1; // Indicates activity level
  Ctrl16.activityProgress = 0;
  Ctrl16.letterOk = false;
  Ctrl16.playedLetters = [];

  Ctrl16.showDashboard = function(readInstructions) {

    RandomWordsSixteen.letters(Ctrl16.level, Ctrl16.playedLetters).then(
      function success(data) {
        Ctrl16.setUpContextVariables(data);
        Ctrl16.setUpLevel();
        Ctrl16.setUpScore();
        Ctrl16.setUpStatus();

        //wait for UI to load
        var readWordTimeout = (readInstructions) ? 4000 : 1000;
        setTimeout(function() {
          if (readInstructions) {
            $scope.speak(Ctrl16.instructions);
          }
        }, readWordTimeout);
      },
      function error(error) {
        console.log(error);
      }
    );
  };

  Ctrl16.setUpLevel = function() {
    var level = Util.getLevel(Ctrl16.activityId);
    if (level) {
      Ctrl16.level = level;
      Ctrl16.activityProgress = 100 * (level - 1) / Ctrl16.totalLevels;
    }
  };

  Ctrl16.setUpScore = function() {
    var score = Util.getScore(Ctrl16.activityId);
    if (score) {
      Ctrl16.score = score;
    }
  };

  Ctrl16.setUpStatus = function() {
    var finished = Util.getStatus(Ctrl16.activityId);
    if (finished === false || finished === true) {
      Ctrl16.finished = finished;
    }
  };

  Ctrl16.setUpContextVariables = function(data) {
    var wordsJson = data;
    $scope.imgs = [];
    $scope.draggedImgs = [];
    Ctrl16.playedLetters.push(wordsJson.info.id);
    $scope.letters = [];
    for (var i in wordsJson.info.letters) {
      if (wordsJson.info.letters[i]) {
        var index = Util.getRandomNumber(wordsJson.info.letters[i].assets.length);
        $scope.imgs.push({
          image: wordsJson.info.letters[i].assets[index],
          dropzone: [wordsJson.info.letters[i].name]
        });
        $scope.letters.push({
          name: wordsJson.info.letters[i].name,
          letterImage: wordsJson.info.letters[i].letterImg
        });
      }
    }

    $scope.imgs = _.shuffle($scope.imgs);
    Ctrl16.instructions = data.instructions;
    Ctrl16.successMessages = data.successMessages;
    Ctrl16.errorMessages = data.errorMessages;
    Ctrl16.addScore = data.scoreSetUp.add;
    Ctrl16.substractScore = data.scoreSetUp.substract;
    Ctrl16.minScore = data.scoreSetUp.minScore;
    Ctrl16.totalLevels = data.totalLevels;
  };

  $scope.handleProgress = function(isLetterOk) {
    var LAST_CHECK = $scope.draggedImgs.length === $scope.letters.length;
    if (isLetterOk) {
      $scope.speak($scope.letter);
      //wait for speak
      setTimeout(function() {
        if (!Ctrl16.finished) {
          Ctrl16.score = Score.update(Ctrl16.addScore, Ctrl16.score);
          Util.saveScore(Ctrl16.activityId, Ctrl16.score);
        }
        var position = Util.getRandomNumber(Ctrl16.successMessages.length);
        var successMessage = Ctrl16.successMessages[position];
        $scope.speak(successMessage);
        setTimeout(function() {
          if (LAST_CHECK) {
            Ctrl16.levelUp(); //Advance level
            Util.saveLevel(Ctrl16.activityId, Ctrl16.level);
            if (!Ctrl16.finished) { // Solo sumo o resto si no esta finalizada
              Ctrl16.finished = Ctrl16.score >= Ctrl16.minScore;
              Util.saveStatus(Ctrl16.activityId, Ctrl16.finished);
              ActividadesFinalizadasService.add(Ctrl16.activityId);
            }
            Ctrl16.showDashboard(false); //Reload dashboard
          }
        }, 1000);
      }, 1000);
    } else {
      Ctrl16.score = Score.update(-Ctrl16.substractScore, Ctrl16.score);
      Util.saveScore(Ctrl16.activityId, Ctrl16.score);
      $scope.speak(name);
      //wait for speak
      setTimeout(function() {
        var position = Util.getRandomNumber(Ctrl16.errorMessages.length);
        var errorMessage = Ctrl16.errorMessages[position];
        $scope.speak(errorMessage);
      }, 000);
    }


  };

  //Advance one level
  Ctrl16.levelUp = function() {
    Ctrl16.level++;
    $scope.letters = [];
  };

  // Goes back one level
  Ctrl16.levelDown = function() {
    Ctrl16.level = (level > 1) ? (level - 1) : 1;
    Ctrl16.letters = [];
  };
  /*************** ACTIONS **************************/
  //Show Dashboard
  Ctrl16.showDashboard(true);

  //Drag
  $scope.sourceOptions = {
    containment: '.activity16',
    containerPositioning: 'relative',
    dragEnd: function(eventObj) {
      if (!Ctrl16.letterOk) {
        console.log("wrong!!");
        Ctrl16.handleProgress(false);
      } else {
        console.log("move again");
      }
    },
    itemMoved: function(eventObj) {
      console.log("success");
      Ctrl16.handleProgress(true);
    },
    accept: function(sourceItemHandleScope, destSortableScope) {
      return false;
    }
  };

  //Drop
  $scope.targetOptions = {
    containment: '.activity16',
    accept: function(sourceItemHandleScope, destSortableScope) {
      $scope.letterOk = sourceItemHandleScope.modelValue.name == destSortableScope.modelValue[0];
      return $scope.letterOk;
    }
  };

  $scope.isVisible = function(item) {
    return item && item.dropzone && item.dropzone.length == 1;
  };
});
