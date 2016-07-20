angular.module('saan.services')

.service('Util', function($http, Levels) {
  return {
    getRandomNumber: function(top){
      return Math.floor((Math.random() * top));
    },
    successAnimation: function(domId) {
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
               var randomY = 30;
               var speed = 1.2 + Math.random() * 3;
               var size = 7 ;
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

           function getOffset(el) {
              el = el.getBoundingClientRect();
              return {
                left: el.left + window.scrollX,
                top: el.top + window.scrollY
              }
          }
          //Create canvas to draw animation
          var el = document.getElementById(domId);
          var pos = getOffset(el);
          var canvas = document.createElement("canvas");
          canvas.className  = "animation";
          canvas.style.position = "absolute";
          canvas.style.zIndex= "12332";
          canvas.style.top = pos.top + "px";
          canvas.style.left = pos.left +"px";
          canvas.id = "animationCanvas";
          //Append canvas
          document.getElementsByTagName('body')[0].appendChild(canvas);
          mainContext = canvas.getContext('2d');
          circles = [];
          //Draw animation
          drawCircles(mainContext);
          setTimeout(function() {
              var canvas = document.getElementById('animationCanvas');
              canvas.parentNode.removeChild(canvas);
              circles = [];
              mainContext = null;
          },1000);
    } 
  };
});
