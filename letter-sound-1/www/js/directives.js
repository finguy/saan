angular.module('starter.directives', [])
.directive('dashboardLetrasUno', function() {
    return {
        //FIXE: Cambiar por la templateUrl;
        //templateUrl: "templates/dashboardLetras.html",
        template: "<div class=\"row\" ><div class=\"col\" ng-repeat=\"fila in dashBoard\"><button style=\"clear:both;float:left;\" ng-repeat=\"letra in fila\" class=\"button  button-outline button-stable\">{{letra}}</button></div></div>",
        link: function(scope) {
          scope.user = "leandro";
        }
      }
});
