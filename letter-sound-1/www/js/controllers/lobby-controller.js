angular.module('saan.controllers')
.controller('LobbyCtrl', function($scope, actividadesConfiguradas, ActividadesFinalizadasService, _){
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
    
	};

	$scope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
		if(toState.name === 'lobby'){
			chequearActividadesDisponibles();
		}
	});
	console.log("lobby");
});
