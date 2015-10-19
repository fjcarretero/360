'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('HomeExpensesApp.services', []).
  factory('ItemServices', ['$log', '$http', '$q', '$rootScope', function($log, $http, $q, $rootScope) {
	return {
		addItem: function(item, callback) {
			$http.post('/api/item/', {item: item}).
				success(function (data) {
//					$log.log('kkota');
					callback();
				});
		},
		getCategories: function(callback) {
			$http.get('/api/categories/').
				success(function (data) {
//					$log.log('kkota');
					callback(data);
				});
		},
		listItems: function(callback) {
			$http.get('/api/items/').
				success(function (data) {
//					$log.log('kkota');
					callback(data.items);
				});
		},
		removeItem: function(id, callback) {
			$http['delete']('/api/item/' + id).
				success(function (data) {
//					$log.log('kkota');
					callback(data);
				});
		},
		getGroupedItemsByDate: function(date, callback) {
			var start = moment(date).startOf('month').format('DD/MM/YYYY');
			var end = moment(date).add(1, 'M').startOf('month').format('DD/MM/YYYY');
			$http.get('/api/itemsByCategory', {params: {from: start, to: end}}).
				success(function (data) {
//					$log.log('kkota');
					callback(data);
				});
		}
		
	};
  }]);