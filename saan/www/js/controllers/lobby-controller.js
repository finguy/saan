angular.module('saan.controllers')
.controller('LobbyCtrl', function($scope, $rootScope, $window, actividadesConfiguradas, ActividadesFinalizadasService, _,
  $ionicScrollDelegate ){

  var SCROLL_OFFSET = 800;
  var AVAILABLE_ACTIVITIES = "availableActivities"

  var chequearActividadesDisponibles = function(){
    var actividadesDisponibles = JSON.parse($window.localStorage.getItem(AVAILABLE_ACTIVITIES)) || [];
    var actividadesFinalizadas = ActividadesFinalizadasService.get();
    var actividadesNoDisponibles = [];
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
          } else {
            actividadesNoDisponibles.push(actividadConfigurada);
          }
        }
      }
    }
    });

    $scope.actividadesNoDisponibles = actividadesNoDisponibles;
    $scope.actividadesDisponibles = actividadesDisponibles;

    $window.localStorage.setItem(AVAILABLE_ACTIVITIES, JSON.stringify(actividadesDisponibles));
    console.log($scope.actividadesDisponibles);
    console.log("lobby check");
  };

  $scope.completed = function(id) {
    return ActividadesFinalizadasService.finalizada(parseInt(id,10));
  };

  $scope.maxCompleted = function(id) {
    return ActividadesFinalizadasService.maxFinalizada(parseInt(id,10));
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

  $scope.scrollForward = function(){
    $ionicScrollDelegate.scrollBy(SCROLL_OFFSET, 0, true);
  };

  $scope.scrollBackward = function(){
    $ionicScrollDelegate.scrollBy(-SCROLL_OFFSET, 0, true);
  };

});
