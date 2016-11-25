(function() {
  'use strict';
  angular.module('saan.controllers')
    .controller('12Ctrl', function($scope, $state, $log, $timeout, RandomText, TTSService,
      Util, Animations, Score, ActividadesFinalizadasService) {
      $scope.activityId = '12'; // Activity Id
      $scope.img = "";
      $scope.assets = [];
      $scope.playedTexts = [];
      $scope.text = "";
      $scope.instructions = ""; // Instructions to read
      $scope.successMessages = [];
      $scope.errorMessages = [];
      $scope.showText = false;
      $scope.showQuestion = false;
      $scope.showOptions = false;
      $scope.dashboard = []; // Dashboard letters

      $scope.level = null; // Indicates activity level
      $scope.totalLevels = 3;
      $scope.activityProgress = 0;
      $scope.score = 0;
      $scope.checkingAnswer = false;

      //Reproduces sound using TTSService
      $scope.speak = TTSService.speak;

      $scope.$on('$ionicView.beforeLeave', function() {
        Util.saveLevel($scope.activityId, $scope.level);
      });

      var Ctrl12 = Ctrl12 || {};

      Ctrl12.setUpLevel = function() {
        if (!$scope.level) {
          $scope.level = Util.getLevel($scope.activityId);
        }
      };

      Ctrl12.setUpScore = function() {
        $scope.score = Util.getScore($scope.activityId);        
      };

      Ctrl12.setUpStatus = function() {
        $scope.finished = ActividadesFinalizadasService.finalizada($scope.activityId);
      };

      //Shows Activity Dashboard
      Ctrl12.showDashboard = function(readInstructions) {

        Ctrl12.setUpLevel();
        Ctrl12.setUpScore();
        Ctrl12.setUpStatus();

        RandomText.text($scope.level, $scope.playedTexts).then(
          function success(data) {
            Ctrl12.setUpContextVariables(data);
            var readWordTimeout = (readInstructions) ? 2000 : 1000;

            //wait for UI to load
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

      Ctrl12.setUpContextVariables = function(data) {
        var textJson = data.textJson;
        var position = Util.getRandomNumber(textJson.questions.length);
        $scope.playedTexts.push(textJson.id);
        $scope.text = textJson.text;
        $scope.showText = true;
        $scope.showQuestion = false;
        $scope.showOptions = false;
        $scope.question = textJson.questions[position].question;
        $scope.answer = parseInt(textJson.questions[position].answer, 10);
        $scope.options = _.shuffle(textJson.questions[position].options);

        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;

        $scope.assets = data.assets;
        $scope.addScore = data.scoreSetUp.add;
        $scope.substractScore = data.scoreSetUp.substract;
        $scope.minScore = data.scoreSetUp.minScore;
        $scope.totalLevels = data.totalLevels;
        Ctrl12.finalizationLevel = data.finalizationLevel;
        Ctrl12.initialLevel = 1;
        $scope.checkingAnswer = false;
        if ($scope.finished) {
          $scope.activityProgress = 100;
        } else {
          $scope.activityProgress = 100 * ($scope.level - 1) / $scope.totalLevels;
        }

      };
      Ctrl12.success = function() {
        $scope.checkingAnswer = true;
        var position = Util.getRandomNumber($scope.successMessages.length);
        var successMessage = $scope.successMessages[position];
        $scope.speak(successMessage);
        $timeout(function() {
          //Advance level
          Ctrl12.levelUp(); //Advance level
          if (!$scope.finished) {
            $scope.score = Score.update($scope.addScore, $scope.activityId, $scope.finished);
            $scope.finished = $scope.level >= Ctrl12.finalizationLevel;
            if ($scope.finished) {
              ActividadesFinalizadasService.add($scope.activityId);
              $state.go('lobby');
            } else {
              Ctrl12.showDashboard(true);
            }
          } else if ($scope.level <= $scope.totalLevels) {
            Ctrl12.showDashboard(true);
          } else {
            $scope.level = Ctrl12.initialLevel;
            $state.go('lobby');
          }
        }, 1000);
      };

      Ctrl12.error = function() {
        if (!$scope.finished) {
          $scope.score = Score.update(-$scope.substractScore, $scope.activityId, $scope.finished);
        }
        var position = Util.getRandomNumber($scope.errorMessages.length);
        var errorMessage = $scope.errorMessages[position];
        $scope.speak(errorMessage);
        $timeout(function() {
          $scope.checkingAnswer = false;
        }, 1000);
      };
      $scope.handleProgress = function(answer) {
        var isAnswerOk = $scope.answer === parseInt(answer, 10);
        if (isAnswerOk) {
          Ctrl12.success();
        } else {
          Ctrl12.error();

        }
      };

      $scope.displayQuestion = function() {
        $scope.showText = false;
        $scope.showQuestion = true;
        //Wait for UI to load
        $timeout(function() {
          $scope.speak($scope.question);
          //Wait spoken instructions
          $timeout(function() {
            $scope.showQuestion = false;
            $scope.showOptions = true;
            $scope.$apply(); //this triggers a $digest
          }, 2000);
        }, 1000);
      };

      //Advance one level
      Ctrl12.levelUp = function() {
        $scope.level++;
        $scope.letters = [];
        $scope.dashboard = [];
        $scope.selectedLetters = [];
      };

      // Goes back one level
      Ctrl12.levelDown = function() {
        $scope.level = (level > 1) ? (level - 1) : 1;
        $scope.numbers = [];
        $scope.dashboard = [];
        $scope.selectedNumbers = [];
      };


      //*************** ACTIONS **************************/
      //Show Dashboard
      Ctrl12.showDashboard(true);
    });
})();
