angular.module('saan.controllers')
  .controller('4Ctrl', function($scope, $state,  RandomNumber, TTSService,
    Util, Animations, Score, ActividadesFinalizadasService) {

    var Ctrl4 = Ctrl4 || {};
    Ctrl4.activityId = '4';
    Ctrl4.playedNumbers = [];
    Ctrl4.level = $scope.level || 1;
    Ctrl4.totalLevels = 3;
    Ctrl4.score = 0;

    $scope.number = null;
    $scope.imgs = [];
    $scope.instructions = "";
    $scope.successMessages = [];
    $scope.errorMessages = [];
    $scope.activityProgress = 0;
    $scope.checkingNumber = false;
    $scope.numberDragged = [];

    //Reproduces sound using TTSService
    $scope.speak = TTSService.speak;



    Ctrl4.setUpLevel = function() {
      Ctrl4.level = Util.getLevel(Ctrl4.activityId);
    };

    Ctrl4.setUpScore = function() {
      Ctrl4.score = Util.getScore(Ctrl4.activityId);
    };

    Ctrl4.setUpStatus = function() {
      Ctrl4.finished = Util.getStatus(Ctrl4.activityId);
    }

    //Shows Activity Dashboard
    Ctrl4.showDashboard = function(readInstructions) {
      Ctrl4.setUpLevel();
      Ctrl4.setUpScore();
      Ctrl4.setUpStatus();

      //GET number
      RandomNumber.number(Ctrl4.level, Ctrl4.playedNumbers).then(
        function success(data) {
          Ctrl4.setUpContextVariables(data);
          var readWordTimeout = (readInstructions) ? 2000 : 1000;
          //wait for UI to load
          setTimeout(function() {
            if (readInstructions) {
              $scope.speak(Ctrl4.instructions);
              setTimeout(function() {
                $scope.speak($scope.number);
              }, 8000);
            } else {
              $scope.speak($scope.number);
            }
          }, readWordTimeout);

        },
        function error(error) {
          console.log(error);
        }
      );
    };
    Ctrl4.setUpContextVariables = function(data) {
      var numberJson = data.number;
      $scope.number = numberJson.number;
      $scope.imgs = [];
      Ctrl4.instructions = data.instructions;
      Ctrl4.successMessages = data.successMessages;
      Ctrl4.errorMessages = data.errorMessages;
      Ctrl4.assets = data.assets;
      Ctrl4.addScore = data.scoreSetUp.add;
      Ctrl4.substractScore = data.scoreSetUp.substract;
      Ctrl4.minScore = data.scoreSetUp.minScore;
      Ctrl4.totalLevels = data.totalLevels;

      var length = Ctrl4.assets.length;
      var used = [];
      for (var i in numberJson.imgs) {
        if (numberJson.imgs[i]) {
          var img = {};
          img.name = numberJson.imgs[i].name;
          img.src = [];
          //Select an unused asset
          var index = Util.getRandomNumber(length);
          while (used[index] || !Ctrl4.assets[index]) {
            index = Util.getRandomNumber(length);
          }
          used[index] = true;
          for (var j = 0; j < img.name; j++) {
            img.src.push(Ctrl4.assets[index]);
          }
          $scope.imgs.push(img);
        }
      }
      $scope.activityProgress = 100 * (Ctrl4.level-1)/Ctrl4.totalLevels;
    };

    Ctrl4.handleProgress = function(numberOk) {
      if (numberOk) {
        Ctrl4.playedNumbers.push($scope.number);
        var position = Util.getRandomNumber(Ctrl4.successMessages.length);
        var successMessage = Ctrl4.successMessages[position];
        $scope.speak(successMessage);
        //wait for speak
        setTimeout(function() {
          Ctrl4.levelUp(); //Advance level
          Util.saveLevel(Ctrl4.activityId, Ctrl4.level);
          if (!Ctrl4.finished) {
            Ctrl4.score = Score.update(Ctrl4.addScore, Ctrl4.activityId, Ctrl4.finished);
            Ctrl4.finished = Ctrl4.score >= Ctrl4.minScore;
            if (Ctrl4.finished) {
              Util.saveStatus(Ctrl4.activityId, Ctrl4.finished);
              ActividadesFinalizadasService.add(Ctrl4.activityId);
            }
          }
          if (Ctrl4.level >= Ctrl4.totalLevels) {
            $state.go('lobby');
          } else {
            Ctrl4.showDashboard(); //Reload dashboard
          }
        }, 1000);
      } else {
        if (!Ctrl4.finished) {
          Ctrl4.score = Score.update(-Ctrl4.substractScore, Ctrl4.activityId, Ctrl4.finished);
        }
        var position = Util.getRandomNumber(Ctrl4.errorMessages.length);
        var errorMessage = Ctrl4.errorMessages[position];
        $scope.speak(errorMessage);
      }
    }


    //Advance one level
    Ctrl4.levelUp = function() {
      Ctrl4.level++;
      Ctrl4.numbers = [];
      Ctrl4.playedNumbers = [];
      Ctrl4.imgs = [];
    };

    // Goes back one level
    Ctrl4.levelDown = function() {
      Ctrl4.level = (level > 1) ? (level - 1) : 1;
      Ctrl4.numbers = [];
      Ctrl4.playedNumbers = [];
      Ctrl4.imgs = [];
    };


    //Drag
    $scope.sortableSourceOptions = {
      containment: '.activity4-content',
      containerPositioning: 'relative',
      clone: false,
      dragEnd: function(eventObj) {
        if (!$scope.sortableTargetOptions.accept(eventObj.source.itemScope, eventObj.dest.sortableScope)) {
          Ctrl4.handleProgress(false);
        } else {
          console.log("move again!");
        }
      },
      itemMoved: function(eventObj) {
        Ctrl4.handleProgress(true);
      }
    };

    //Drop
    $scope.sortableTargetOptions = {
      accept: function(sourceItemHandleScope, destSortableScope) {
        return sourceItemHandleScope.modelValue.name == $scope.number;
      }
    };


    //*************** ACTIONS **************************/
    //Show Dashboard
    Ctrl4.showDashboard(true);
  });
