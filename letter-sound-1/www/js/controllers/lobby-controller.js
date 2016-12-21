angular.module('saan.controllers')
.controller('LobbyCtrl', function($scope, $rootScope, $window, actividadesConfiguradas, ActividadesFinalizadasService, _){

  var chequearActividadesDisponibles = function(){
    var actividadesDisponibles = [];
    var actividadesFinalizadas = ActividadesFinalizadasService.get();
    _.each(actividadesConfiguradas,function(key, actividadConfigurada){
      if (_.findIndex(actividadesDisponibles, function(activity){ return activity == actividadConfigurada; }) == -1){
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
    }
    });


    $scope.actividadesDisponibles = _.sortBy(actividadesDisponibles, "order");
    console.log("lobby check");
  };

  $scope.$on('$stateChangeSuccess',function(event, toState, toParams, fromState, fromParams){
    if(toState.name === 'lobby'){
      chequearActividadesDisponibles();
    }
  });

  $scope.$on('$ionicView.beforeEnter', function() {
    $rootScope.isInLobby = true;
  });

  $scope.$on('$ionicView.leave', function() {
    $rootScope.isInLobby = false;
  });

});
