angular.module('saan.services')

.service('Util', function($http, Levels) {
  return {
    getRandomNumber: function(top){
      return Math.floor((Math.random() * top));
    },
    successAnimation: function(domId, from) {
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
    },
    successAnimationFireworks :  function(domId) {
      // when animating on canvas, it is best to use requestAnimationFrame instead of setTimeout or setInterval
      // not supported in all browsers though and sometimes needs a prefix, so we need a shim
      window.requestAnimFrame = ( function() {
      	return window.requestAnimationFrame ||
      				window.webkitRequestAnimationFrame ||
      				window.mozRequestAnimationFrame ||
      				function( callback ) {
      					window.setTimeout( callback, 1000 / 60 );
      				};
      })();

      function getOffset(el) {
         el = el.getBoundingClientRect();
         return {
           left: el.left + window.scrollX,
           top: el.top + window.scrollY
         }
     }

      // now we will setup our basic variables for the demo
      var canvas = document.createElement("canvas");
      var el = document.getElementById(domId);
      var pos = getOffset(el);
      canvas.style.position = "absolute";
      canvas.style.zIndex= "12332";

      canvas.style.top = pos.top  + "px";
      canvas.style.left = pos.left +"px";
      canvas.className  = "animation";
      canvas.style.position = "absolute";
      canvas.id = "animationCanvas";


      //Append canvas
      document.getElementsByTagName('body')[0].appendChild(canvas);
      var ctx = canvas.getContext( '2d' );
      //ctx.translate(-100,710);
      		// full screen dimensions
      		cw = 1000;//window.innerWidth,
      		ch = 1000;//window.innerHeight,
      		// firework collection
      		fireworks = [],
      		// particle collection
      		particles = [],
      		// starting hue
      		hue = 120,
      		// when launching fireworks with a click, too many get launched at once without a limiter, one launch per 5 loop ticks
      		limiterTotal = 5,
      		limiterTick = 0,
      		// this will time the auto launches of fireworks, one launch per 80 loop ticks
      		timerTotal = 80,
      		timerTick = 0,
      		mousedown = false,
      		// mouse x coordinate,
      		mx = pos.left,
      		// mouse y coordinate
      		my = pos.top;

          // set canvas dimensions
        //  canvas.style.border = "2px solid black";
        //  canvas.width = 400;
         //canvas.height = 400;




      // now we are going to setup our function placeholders for the entire demo

      // get a random number within a range
      function random( min, max ) {
      	return Math.random() * ( max - min ) + min;
      }

      // calculate the distance between two points
      function calculateDistance( p1x, p1y, p2x, p2y ) {
      	var xDistance = p1x - p2x,
      			yDistance = p1y - p2y;
      	return Math.sqrt( Math.pow( xDistance, 2 ) + Math.pow( yDistance, 2 ) );
      }

      // create firework
      function Firework( sx, sy, tx, ty ) {
      	// actual coordinates
      	this.x = sx;
      	this.y = sy;
      	// starting coordinates
      	this.sx = sx;
      	this.sy = sy;
      	// target coordinates
      	this.tx = tx;
      	this.ty = ty;
      	// distance from starting point to target
      	this.distanceToTarget = calculateDistance( sx, sy, tx, ty );
      	this.distanceTraveled = 0;
      	// track the past coordinates of each firework to create a trail effect, increase the coordinate count to create more prominent trails
      	this.coordinates = [];
      	this.coordinateCount = 3;
      	// populate initial coordinate collection with the current coordinates
      	while( this.coordinateCount-- ) {
      		this.coordinates.push( [ this.x, this.y ] );
      	}
      	this.angle = Math.atan2( ty - sy, tx - sx );
      	this.speed = 10;
      	this.acceleration = 1.05;
      	this.brightness = random( 50, 70 );
      	// circle target indicator radius
      	this.targetRadius = 1;
      }


      // update firework
      Firework.prototype.update = function( index ) {
      	// remove last item in coordinates array
      	this.coordinates.pop();
      	// add current coordinates to the start of the array
      	this.coordinates.unshift( [ this.x, this.y ] );

      	// cycle the circle target indicator radius
      	if( this.targetRadius < 8 ) {
      		this.targetRadius += 0.3;
      	} else {
      		this.targetRadius = 1;
      	}

      	// speed up the firework
      	this.speed *= this.acceleration * 100;

      	// get the current velocities based on angle and speed
      	var vx = Math.cos( this.angle ) * this.speed,
      			vy = Math.sin( this.angle ) * this.speed;
      	// how far will the firework have traveled with velocities applied?
      	this.distanceTraveled = calculateDistance( this.sx, this.sy, this.x + vx, this.y + vy );

      	// if the distance traveled, including velocities, is greater than the initial distance to the target, then the target has been reached
      	if( this.distanceTraveled >= this.distanceToTarget ) {
      		createParticles( this.tx, this.ty );
      		// remove the firework, use the index passed into the update function to determine which to remove
      		fireworks.splice( index, 1 );
      	} else {
      		// target not reached, keep traveling
      		this.x += vx;
      		this.y += vy;
      	}
      }

      // draw firework
      Firework.prototype.draw = function() {

      	ctx.beginPath();
      	// move to the last tracked coordinate in the set, then draw a line to the current x and y
      	ctx.moveTo( this.coordinates[ this.coordinates.length - 1][ 0 ], this.coordinates[ this.coordinates.length - 1][ 1 ] );
      	ctx.lineTo( this.x, this.y );
      	ctx.strokeStyle = 'hsl(' + hue + ', 100%, ' + this.brightness + '%)';
      	ctx.stroke();

      	ctx.beginPath();
      	// draw the target for this firework with a pulsing circle
      	ctx.arc( this.tx, this.ty, this.targetRadius, 0, Math.PI * 2 );
      	ctx.stroke();
      }

      // create particle
      function Particle( x, y ) {
      	this.x = x;
      	this.y = y;
      	// track the past coordinates of each particle to create a trail effect, increase the coordinate count to create more prominent trails
      	this.coordinates = [];
      	this.coordinateCount = 5;
      	while( this.coordinateCount-- ) {
      		this.coordinates.push( [ this.x, this.y ] );
      	}
      	// set a random angle in all possible directions, in radians
      	this.angle = random( 0, Math.PI * 2 );
      	this.speed = random( 1, 10 );
      	// friction will slow the particle down
      	this.friction = 0.95;
      	// gravity will be applied and pull the particle down
      	this.gravity = 1;
      	// set the hue to a random number +-20 of the overall hue variable
      	this.hue = random( hue - 20, hue + 20 );
      	this.brightness = random( 50, 80 );
      	this.alpha = 1;
      	// set how fast the particle fades out
      	this.decay = random( 0.015, 0.03 );
      }

      // update particle
      Particle.prototype.update = function( index ) {
      	// remove last item in coordinates array
      	this.coordinates.pop();
      	// add current coordinates to the start of the array
      	this.coordinates.unshift( [ this.x, this.y ] );
      	// slow down the particle
      	this.speed *= this.friction*5;
      	// apply velocity
      	this.x += Math.cos( this.angle ) * this.speed;
      	this.y += Math.sin( this.angle ) * this.speed + this.gravity;
      	// fade out the particle
      	this.alpha -= this.decay;

      	// remove the particle once the alpha is low enough, based on the passed in index
      	if( this.alpha <= this.decay ) {
      		particles.splice( index, 1 );
      	}
      }

      // draw particle
      Particle.prototype.draw = function() {

      	ctx. beginPath();
      	// move to the last tracked coordinates in the set, then draw a line to the current x and y
      	ctx.moveTo( this.coordinates[ this.coordinates.length - 1 ][ 0 ], this.coordinates[ this.coordinates.length - 1 ][ 1 ] );
      	ctx.lineTo( this.x, this.y );
      	ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
      	ctx.stroke();
      }

      // create particle group/explosion
      function createParticles( x, y ) {
      	// increase the particle count for a bigger explosion, beware of the canvas performance hit with the increased particles though
      	var particleCount = 50;
      	while( particleCount-- ) {
      		particles.push( new Particle( x, y ) );
      	}
      }

      // main demo loop
      function loop() {
      //  console.log(ctx);
          if (ctx) {
          	// this function will run endlessly with requestAnimationFrame
          	requestAnimFrame( loop );
          	// increase the hue to get different colored fireworks over time
          	hue += 0.5;

          	// normally, clearRect() would be used to clear the canvas
          	// we want to create a trailing effect though
          	// setting the composite operation to destination-out will allow us to clear the canvas at a specific opacity, rather than wiping it entirely
          	ctx.globalCompositeOperation = 'destination-out';
          	// decrease the alpha property to create more prominent trails
          	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          	ctx.fillRect( 0, 0, cw, ch );
          	// change the composite operation back to our main mode
          	// lighter creates bright highlight points as the fireworks and particles overlap each other
          	ctx.globalCompositeOperation = 'lighter';

          	// loop over each firework, draw it, update it
          	var i = fireworks.length;
          	while( i-- ) {
          		fireworks[ i ].draw();
          		fireworks[ i ].update( i );
          	}

          	// loop over each particle, draw it, update it
          	var i = particles.length;
          	while( i-- ) {
          		particles[ i ].draw();
          		particles[ i ].update( i );
          	}

          	// launch fireworks automatically to random coordinates, when the mouse isn't down
          	if( timerTick >= timerTotal ) {
          		if( !mousedown ) {
          			// start the firework at the bottom middle of the screen, then set the random target coordinates, the random y coordinates will be set within the range of the top half of the screen
          			//fireworks.push( new Firework( cw / 2, ch, random( 0, cw ), random( 0, ch / 2 ) ) );
          			fireworks.push( new Firework( 10, 10, random( 0, 10 ), random( 0, 10 / 2 ) ) );
          			timerTick = 0;
          		}
          	} else {
          		timerTick++;
          	}

          	// limit the rate at which fireworks get launched when mouse is down
          	if( limiterTick >= limiterTotal ) {
          		if( mousedown ) {
          			// start the firework at the bottom middle of the screen, then set the current mouse coordinates as the target
          			fireworks.push( new Firework(10,10, 60, 60) );
          			limiterTick = 0;
          		}
          	} else {
          		limiterTick++;
          	}
          }
      }

      mousedown = true;
      loop();

      setTimeout(function(){
        mousedown = false;
        requestAnimFrame(function() {
          var canvas = document.getElementById('animationCanvas');
           canvas.parentNode.removeChild(canvas);
           ctx = null;
        });
      },3000);
    }
  };
});
