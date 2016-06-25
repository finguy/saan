// Ionic Starter App

angular.module('saan', ['ionic', 'saan.controllers', 'saan.services'])

.run(function($ionicPlatform, _) {

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js

  $stateProvider

  // setup a dynamic route for all activities
    .state('activity', {
    url: '/activity/:activityId',
    templateUrl: function ($stateParams){
      return "templates/" + $stateParams.activityId + ".html";
    },
    controllerProvider : function ($stateParams){
      return $stateParams.activityId + "Ctrl";
    }
    
                
  }),

  $stateProvider

  // setup a state for the lobby
    .state('lobby', {
    url: '/lobby',
    templateUrl: "templates/lobby.html",
    controller: "LobbyCtrl",
    resolve : {
      actividadesConfiguradas : function(Config){
        return Config.get();
      }
    }
  })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/lobby');

});

