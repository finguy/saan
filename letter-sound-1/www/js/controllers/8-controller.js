(function() {
  'use strict';

	angular.module('saan.controllers')
	.controller('8Ctrl',['$scope','Util', 'NumberMatching', function($scope, Util, NumberMatching) {
		$scope.activityId = '8';
    $scope.dropzoneModel = [];

    var config = '';
    var matches = 0;

    $scope.$on('$ionicView.beforeEnter', function() {
      getConfiguration();
    });

    function getConfiguration(level){
			NumberMatching.getConfig(level).then(function(data){
				config = data;
        config.cards = parseInt(config.cards, 10);
        config.top = parseInt(config.top, 10);
        config.numberRange = parseInt(config.numberRange, 10);
        setActivity();
			});
		}

    function setActivity(){
      $scope.matches = [];
      $scope.cards = [];

      var number;
      var index;
      var valid;

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
    }

    $scope.sortableOptions = {
      containment: '.placeholder',
      allowDuplicates: true,
      accept: function(sourceItemHandleScope, destSortableScope){
        return checkMatch(sourceItemHandleScope, destSortableScope);
      }
    };

    $scope.sortableCloneOptions = {
      containment: '.activity-content',
      clone: true,
      itemMoved: function(eventObj) {
        moveMatch(eventObj);
      }
    };

    $scope.numberToWord = function(number){
      return Util.numberToWords(number);
    };

    function checkMatch(sourceItemHandleScope, destSortableScope){
      return parseInt(destSortableScope.element[0].parentElement.innerText, 10) == parseInt(sourceItemHandleScope.modelValue, 10);
    }

    function moveMatch(eventObj) {
      var item = $scope.dropzoneModel.pop();
      var index = _.findIndex($scope.cards,
                              function(card){return card.value == item;},
                              item);
      $scope.cards[index].dropzone.push(item);
      matches++;
      
      if (matches == config.cards){
        setActivity();
      }
    }

	}]);
})();
