(function() {
  'use strict';
  angular.module('saan.controllers')
  .controller('12Ctrl', function($scope, RandomText, TTSService,
    Util, Animations, Score,ActividadesFinalizadasService) {
    $scope.activityId = '12'; // Activity Id

    $scope.img = "";
    $scope.assets = [];
    $scope.playedTexts = [];
    $scope.text = "";
    $scope.instructions = ""; // Instructions to read
    $scope.successMessages = [];
    $scope.errorMessages  = [];
    $scope.showText = false;
    $scope.showQuestion = false;
    $scope.showOptions = false;
    $scope.dashboard = []; // Dashboard letters

    $scope.level = $scope.level || 1; // Indicates activity level
    $scope.totalLevels = 3;
    $scope.activityProgress = 0;
    $scope.score = 0;
    $scope.checkingAnswer = false;

    //Reproduces sound using TTSService
    $scope.speak = TTSService.speak;

    var Ctrl12 = Ctrl12 || {};

    Ctrl12.setUpLevel = function() {
      var level = Util.getLevel($scope.activityId);
      if (level) {
        $scope.level = level;
        $scope.activityProgress = 100 * (level-1)/$scope.totalLevels; // -1 porque empieza en cero.
      }
    };

    Ctrl12.setUpScore = function(){
      var score = Util.getScore($scope.activityId);
      if (score) {
        $scope.score = score;
      }
    };

    Ctrl12.setUpStatus = function(){
      var finished = Util.getStatus($scope.activityId);
      if (finished === false || finished === true) {
        $scope.finished = finished;
      }
    };

    //Shows Activity Dashboard
    Ctrl12.showDashboard = function(readInstructions) {

      Ctrl12.setUpLevel();
      Ctrl12.setUpScore();
      Ctrl12.setUpStatus();

      RandomText.text($scope.level, $scope.playedTexts).then(
        function success(data) {
          console.log(data);
          Ctrl12.setUpContextVariables(data);
          var readWordTimeout = (readInstructions) ? 2000 : 1000;

          //wait for UI to load
          setTimeout(function() {
            if (readInstructions){
              $scope.speak($scope.instructions);
            }
          }, readWordTimeout);

        },
        function error(error) {
          console.log(error);
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
      $scope.answer = textJson.questions[position].answer;
      $scope.options = _.shuffle(textJson.questions[position].options);

      $scope.instructions = data.instructions;
      $scope.successMessages = data.successMessages;
      $scope.errorMessages = data.errorMessages;

      $scope.assets = data.assets;
      $scope.addScore = data.scoreSetUp.add;
      $scope.substractScore = data.scoreSetUp.substract;
      $scope.minScore = data.scoreSetUp.minScore;
      $scope.totalLevels = data.totalLevels;
      $scope.checkingAnswer = false;

    };

    $scope.handleProgress = function(answer) {
      var ER = new RegExp($scope.answer,"i");
      var isAnswerOk = ER.test(answer);
      if (isAnswerOk) {
        $scope.checkingAnswer = true;
        if (!$scope.finished) {
          $scope.score = Score.update($scope.addScore, $scope.score);
          Util.saveScore($scope.activityId, $scope.score);
        }

        var position = Util.getRandomNumber($scope.successMessages.length);
        var successMessage = $scope.successMessages[position];
        $scope.speak(successMessage);
        setTimeout(function() {
          Ctrl12.levelUp(); //Advance level
          Util.saveLevel($scope.activityId, $scope.level);
          if (!$scope.finished) { // Solo sumo o resto si no esta finalizada
            $scope.finished = $scope.score >= $scope.minScore;
            Util.saveStatus($scope.activityId, $scope.finished);
            ActividadesFinalizadasService.add($scope.activityId);
          }
          Ctrl12.showDashboard(true); //Reload dashboard
        }, 1000);
      } else {
        $scope.score = Score.update(-$scope.substractScore, $scope.score);
        Util.saveScore($scope.activityId, $scope.score);
        $scope.speak(name);
        //wait for speak
        setTimeout(function() {
          var position = Util.getRandomNumber($scope.errorMessages.length);
          var errorMessage = $scope.errorMessages[position];
          $scope.speak(errorMessage);
        }, 1000);
      }
    };

    $scope.displayQuestion = function() {
      $scope.showText = false;
      $scope.showQuestion = true;
      //Wait for UI to load
      setTimeout(function() {
        $scope.speak($scope.question);
        //Wait spoken instructions
        setTimeout(function() {
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
