'use strict';


// Declare app level module which depends on filters, and services

angular.module('HomeExpensesApp', ['HomeExpensesApp.controllers', 'HomeExpensesApp.directives', 'HomeExpensesApp.filters', 'ngRoute', 'ui.bootstrap', 'ngCsv']).
  config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/addItem', {templateUrl: 'partials/addItem', controller: 'AddItemCtrl'});
	$routeProvider.when('/listItems', {templateUrl: 'partials/listItems', controller: 'ListItemsCtrl'});
	$routeProvider.when('/adminItems', {templateUrl: 'partials/adminItems', controller: 'AdminItemsCtrl'});
    $routeProvider.otherwise({redirectTo: '/addItem'});
  }]).
  config(['$httpProvider', '$compileProvider', function ($httpProvider, $compileProvider) {
//	$httpProvider.defaults.headers.common['Content-type'] = 'application/json;charset=UTF-8';
	var elementsList = jQuery();
	
	var showMessage = function(content, cl, time) {
            jQuery('<div/>')
                .addClass('message')
                .addClass(cl)
                .hide()
                .fadeIn('fast')
                .delay(time)
                .fadeOut('fast', function() { jQuery(this).remove(); })
                .appendTo(elementsList)
                .text(content);
			
        };
        $httpProvider.responseInterceptors.push(function($timeout, $q) {
            return function(promise) {
                return promise.then(function(successResponse) {
                    if (successResponse.config.method.toUpperCase() != 'GET')
                        showMessage('Success', 'successMessage', 5000);
                    return successResponse;

                }, function(errorResponse) {
                    switch (errorResponse.status) {
                        case 401:
                            showMessage('Wrong usename or password', 'errorMessage', 20000);
                            break;
                        case 403:
                            showMessage('You don\'t have the right to do this', 'errorMessage', 20000);
                            break;
                        case 500:
                            showMessage('Error ' + errorResponse.data.error.message, 'errorMessage', 20000);
                            break;
                        default:
                            showMessage('Error ' + errorResponse.status + ': ' + errorResponse.data.error, 'errorMessage', 20000);
                    }
                    return $q.reject(errorResponse);
                });
            };
        });
        $compileProvider.directive('appMessages', function() {
            var directiveDefinitionObject = {
                link: function(scope, element, attrs) { elementsList.push(jQuery(element)); }
            };
            return directiveDefinitionObject;
        });
  }]).
  config(['$locationProvider', function ($locationProvider) {
	$locationProvider.html5Mode(true);
  }]);
  
