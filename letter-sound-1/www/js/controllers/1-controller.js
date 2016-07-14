angular.module('saan.controllers')

.controller('1Ctrl', function($scope, RandomNumber, Status, TTSService,
  Util) {
  $scope.activityId = '1'; // Activity Id
  $scope.number = null; // Letter to play in level
  $scope.imgs = [];
  $scope.instructions = ""; // Instructions to read
  $scope.successMessages = [];
  $scope.errorMessages  = [];
  $scope.numbers = []; // Word letters
  $scope.dashboard = []; // Dashboard letters
  $scope.selectedObject = ""; // Collects letters the user selects
  $scope.playedNumbers = []; // Collects words the user played
  $scope.level = $scope.level || 1; // Indicates activity level
  $scope.totalLevels = 3;
  $scope.activityProgress = 0;

  //Reproduces sound using TTSService
  $scope.speak = TTSService.speak;

  $scope.showDashboard

  //Shows Activity Dashboard
  $scope.showDashboard = function(readInstructions) {
    var status = Status.get("nivel");
    if (status) {
      $scope.activityProgress = 100 * ($scope.level -1 )/$scope.totalLevels; // -1 porque empieza en cero.
    }
    RandomNumber.number($scope.level, $scope.playedNumbers).then(
      function success(data) {
        var numberJson = data.number;
        $scope.instructions = data.instructions;
        $scope.successMessages = data.successMessages;
        $scope.errorMessages = data.errorMessages;
        $scope.number = numberJson.number;
        $scope.imgs = numberJson.imgs;
        $scope.dashboard = [$scope.number];

        var readWordTimeout = (readInstructions) ? 2000 : 1000;

        //wait for UI to load
      /*  setTimeout(function() {
          if (readInstructions){
            $scope.speak($scope.instructions);
              setTimeout(function() {
                $scope.speak($scope.number);
              }, 8000);
          } else {
            $scope.speak($scope.number);
          }
        }, readWordTimeout);*/

      },
      function error(error) {
        console.log(error);
      }
    );
  };

  //Verifies selected letters and returns true if they match the word
  $scope.checkNumber = function(selectedObject, domId) {
    if ($scope.number === parseInt(selectedObject,10)) {
      $scope.playedNumbers.push($scope.number);
      console.log('checking');
        /*setTimeout(function() {
          var position = Util.getRandomNumber($scope.successMessages.length);
          var successMessage = $scope.successMessages[position];
          $scope.speak(successMessage);
          //wait for speak
          setTimeout(function() { */
            Status.save({key: "nivel", value: $scope.level});
            $scope.levelUp(); //Advance level
            $scope.showDashboard(); //Reload dashboard
        /*  }, 1000);
        }, 1000);*/

        //##########
        var mainContext,circles;
         function Circle(radius, speed, width, xPos, yPos) {
             this.radius = radius;
             this.speed = speed;
             this.width = width;
             this.xPos = xPos;
             this.yPos = yPos;
             this.opacity = 0.05 + Math.random() * 0.5;

             this.counter = 0;

             var signHelper = Math.floor(Math.random() * 2);

             if (signHelper == 1) {
               this.sign = -1;
             } else {
               this.sign = 1;
             }
           }

           function drawStar(x, y, r, p, m)
           {
               mainContext.beginPath();
               for (var i = 0; i < p; i++)
               {
                   mainContext.rotate(Math.PI / p);
                   mainContext.lineTo(0, 0 - (r*m));
                   mainContext.rotate(Math.PI / p);
                   mainContext.lineTo(0, 0 - r);
               }
               mainContext.closePath();

               mainContext.fillStyle = 'rgba(185, 211, 238,' + this.opacity + ')';
               mainContext.fill();
           }

           Circle.prototype.update = function(mainContext) {

             this.counter += this.sign * this.speed;
             mainContext.beginPath();

             mainContext.arc(this.xPos + Math.cos(this.counter / 100) * this.radius,
               this.yPos + Math.sin(this.counter / 100) * this.radius,
               this.width,
               0,
               Math.PI * 2,
               false);

             mainContext.closePath();

             mainContext.fillStyle = 'rgba(255, 255, 0,' + this.opacity + ')';
             mainContext.fill();

           };

           function drawCircles(mainContext) {

             for (var i = 0; i < 150; i++) {


               var randomX = Math.round(-200 + Math.random() * 700);
               var randomY = 30;//Math.round(-200 + Math.random() * 700);
               var speed = 0.2 + Math.random() * 3;
               var size = 5 ;

               var circle = new Circle(100, speed, size, randomX, randomY);
               circles.push(circle);
             }
             draw();
           }

           function draw() {
             if (mainContext) {
               mainContext.clearRect(0, 0, 500, 500);
               for (var i = 0; i < circles.length; i++) {
                 var myCircle = circles[i];
                 myCircle.update(mainContext);
               }
               requestAnimationFrame(draw);
             }
           }


           var animate = function  () {
             var pos = $("#" + domId).position();
             var canvas = document.createElement("canvas");
             canvas.className  = "animation";
             canvas.style.position = "absolute";
             canvas.style.zIndex= "12332";
             canvas.style.top = pos.top + "px";
             canvas.style.left = pos.left +"px";
             canvas.id = "myId";
            document.getElementsByTagName('body')[0].appendChild(canvas);
             mainContext = canvas.getContext('2d');
             circles = [];
             drawCircles(mainContext);
             setTimeout(function() {
                 $("canvas.animation").remove();
                 circles = [];
                 mainContext = null;
             },2000);
           }();
        //##########

    } else {
      //wait for speak
      /*setTimeout(function() {
        var position = Util.getRandomNumber($scope.errorMessages.length);
        var errorMessage = $scope.errorMessages[position];
        $scope.speak(errorMessage);
      }, 1000);*/
    }
  };

  //Advance one level
  $scope.levelUp = function() {
    $scope.level++;
    $scope.letters = [];
    $scope.dashboard = [];
    $scope.selectedLetters = [];
  };

  // Goes back one level
  $scope.levelDown = function() {
   $scope.level = (level > 1) ? (level - 1) : 1;
    $scope.numbers = [];
    $scope.dashboard = [];
    $scope.selectedNumbers = [];
  };

  //*************** ACTIONS **************************/
  //Show Dashboard
  $scope.showDashboard(true);
});
