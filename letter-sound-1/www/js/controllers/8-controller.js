(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('8Ctrl',['$scope','Util', 'NumberMatching', function($scope, Util, NumberMatching) {
		$scope.activityId = '8';
    $scope.dropzoneModel = [];

    var config = '';
    var matchesCount = 0;
    var Ctrl8 = Ctrl8 || {};

    $scope.$on('$ionicView.beforeEnter', function() {
      Ctrl8.getConfiguration();
    });

    Ctrl8.getConfiguration = function (level){
			NumberMatching.getConfig(level).then(function(data){
				config = data;
        config.cards = parseInt(config.cards, 10);
        config.top = parseInt(config.top, 10);
        config.numberRange = parseInt(config.numberRange, 10);
        Ctrl8.setActivity();
			});
		};

    Ctrl8.setActivity  = function (){
      $scope.matches = [];
      $scope.cards = [];

      var number;
      var index;
      var valid;
      matchesCount = 0;

      for (var i = 0; i < config.cards; i++){
        valid = false;
				while (!valid){
					number = Math.floor(Math.random() * 10);
          index = _.findIndex($scope.cards, function(card){return card.value == number;}, number);
          valid = (number !== 0 && index == -1);
        }

				$scope.cards.push({value: number, dropzone: []});
        $scope.matches.push(number);
			}

      $scope.matches = _.shuffle($scope.matches);
    };

    $scope.sortableOptions = {
      containment: '.placeholder',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        return Ctrl8.checkMatch(sourceItemHandleScope, destSortableScope);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-' + $scope.activityId + '-content',
      clone: true,
      itemMoved: function(eventObj) {
        Ctrl8.moveMatch(eventObj);
      }
    };

    $scope.numberToWord = function(number){
      return Util.numberToWords(number);
    };

    Ctrl8.checkMatch = function(sourceItemHandleScope, destSortableScope){
      return parseInt(destSortableScope.element[0].parentElement.innerText, 10) == parseInt(sourceItemHandleScope.modelValue, 10);
    };

    Ctrl8.moveMatch = function(eventObj) {
      var item = $scope.dropzoneModel.pop();
      var index = _.findIndex($scope.cards,
                              function(card){return card.value == item;},
                              item);
      $scope.cards[index].dropzone.push(item);
      matchesCount++;

      if (matchesCount == config.cards){
        Ctrl8.setActivity();
      }
    };

	}]);
})();
