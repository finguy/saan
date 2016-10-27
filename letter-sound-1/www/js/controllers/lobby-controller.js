angular.module('saan.controllers')
.controller('LobbyCtrl', function($scope, actividadesConfiguradas, ActividadesFinalizadasService, _, $ionicPlatform){
	var chequearActividadesDisponibles = function(){
		var actividadesDisponibles = [];
		var actividadesFinalizadas = ActividadesFinalizadasService.get();
		_.each(actividadesConfiguradas,function(key, actividadConfigurada){
			if(actividadesConfiguradas[actividadConfigurada]){
				if((actividadesConfiguradas[actividadConfigurada].dependencies === undefined) ||
						actividadesConfiguradas[actividadConfigurada].length === 0){
							actividadesDisponibles.push(actividadConfigurada);
				}else{
					var actividadesNecesarias = actividadesConfiguradas[actividadConfigurada].dependencies;
					if(_.difference(actividadesNecesarias,actividadesFinalizadas).length === 0){
						actividadesDisponibles.push(actividadConfigurada);
					}


				}
			}
		});


		$scope.actividadesDisponibles = actividadesDisponibles;
		console.log("lobby check");
		$ionicPlatform.ready(function() {
			console.log(Media);

			var coso2 = new Media("/android_asset/www/sounds/03_Revolution_Radio.mp3",
				function(){ console.log("sabe2");},
				function(err){ console.log(err);} );

			coso2.play();

			
		});

	};

	$scope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
		if(toState.name === 'lobby'){
			chequearActividadesDisponibles();
		}
	});
	console.log("lobby");
});
