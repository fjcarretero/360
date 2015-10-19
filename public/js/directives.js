
"use strict";

/* Directives */


angular.module('HomeExpensesApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('refreshList', function(){
	return{
		restrict: 'A',
		link: function(scope, element, attrs){
			//jQuery(element).closest(':jqmData(role=listview)').listview('refresh');   
			jQuery('li').removeClass('ui-li-static');   
		}
	};            
  })//
  .directive('ngBlur', ['$parse', function($parse) {
	  return function(scope, element, attr) {
	    var fn = $parse(attr['ngBlur']);
	    element.bind('blur', function(event) {
	      scope.$apply(function() {
	        fn(scope, {$event:event});
	      });
	    });
	  };
  }])
  .directive('smaTypeahead2', ['$parse', '$log', function($parse, $log) {

	return {
		restrict: 'A',
		require: '?ngModel',
		link: function postLink(scope, element, attrs, controller) {

			var getter = $parse(attrs.smaTypeahead),
					setter = getter.assign,
					value = getter(scope);

			// Watch bsTypeahead for changes
			scope.$watch(attrs.smaTypeahead, function(newValue, oldValue) {
				if(newValue !== oldValue) {
					value = newValue;
				}
			});
			
//			element.bind("keydown keypress", function(event) {
//				if(event.which === 13) {
//					scope.$apply(function(){
//						scope[attrs.typeaheadUpdaterFunction]({name: element.val(), category: 'Unknown'});
//                    });
//					$log.log('kkota 2');
//                    event.preventDefault();
//                }
//            });
            
            element.attr('data-provide', 'typeahead');
			element.typeahead({
				source: function(query) { return angular.isFunction(value) ? value.apply(null, arguments) : value; },
				minLength: attrs.minLength || 1,
				items: attrs.items,
				updater: function(value) {
					//$log.log('kkota');
					// If we have a controller (i.e. ngModelController) then wire it up
					if(controller && attrs.typeaheadUpdaterFunction) {
						scope.$apply(function () {
							scope[attrs.typeaheadUpdaterFunction](value);
						});
					}
					return '';
//					return value;
				}
			});

			// Bootstrap override
			var typeahead = element.data('typeahead');
			// Fixes #2043: allows minLength of zero to enable show all for typeahead
			
			typeahead.$button = jQuery(jQuery.fn.typeahead.defaults.button);
			
			typeahead.$button.bind('click', function(event) {
				scope.$apply(function(){
					scope[attrs.typeaheadUpdaterFunction]({name: element.val(), category: 'Unknown', quantity: 1});
				});
			});
			
			typeahead.lookup = function (ev) {
				var items;
				this.query = this.$element.val() || '';
				if (this.query.length < this.options.minLength) {
					return this.shown ? this.hide() : this;
				}
				items = jQuery.isFunction(this.source) ? this.source(this.query, jQuery.proxy(this.process, this)) : this.source;
				return items ? this.process(items) : this;
			};
			
			typeahead.matcher = function (item) {
				return item.name.toLowerCase().slice(0, this.query.length) === this.query.toLowerCase();
			};
			
			typeahead.highlighter = function (item) {
				return item.name;
			};
			
			typeahead.render = function (items) {
				var that = this;

				items = jQuery(items).map(function (i, item) {
					i = jQuery(that.options.item).attr('data-value', JSON.stringify(item));
					i.find('a').html(that.highlighter(item));
					return i[0];
				});

				items.first().addClass('active');
				this.$menu.html(items);
				return this;
			};
			
			typeahead.select = function () {
				var val = JSON.parse(this.$menu.find('.active').attr('data-value'));
				this.$element
					.val(val.name)
					.change();
				this.updater(val);
				return this.hide();
			};
			
			typeahead.sorter = function (items) {
				var beginswith = [], 
				caseSensitive = [],
				caseInsensitive = [],
				item;

				while (item = items.shift()) {
					if (!item.name.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item);
					else if (~item.name.indexOf(this.query)) caseSensitive.push(item);
					else caseInsensitive.push(item);
				}

				return beginswith.concat(caseSensitive, caseInsensitive);
			};
			
			typeahead.show = function () {
				var pos = jQuery.extend({}, this.$element.position(), {
					height: this.$element[0].offsetHeight
				});

				
				this.$menu
					.insertAfter(this.$element)
					.css({
						top: pos.top + pos.height,
						left: pos.left
					})
					.show();

				this.$button
					.insertAfter(this.$element)
					.css({
						top: '18px'
					})
					.show();

				this.shown = true;
				return this;
			};
			
			// Support 0-minLength
			if(attrs.minLength === "0") {
				setTimeout(function() { // Push to the event loop to make sure element.typeahead is defined (breaks tests otherwise)
					element.on('focus', function() {
						setTimeout(element.typeahead.bind(element, 'lookup'), 200);
					});
				});
			}

		}
	};

  }]).
  directive('smaTypeahead', ['$compile', '$log', function($compile, $log) {
	return {
		restrict: 'A',
		scope: {
			datasets: '=',
            eventHandler: '&ngClick'
		},
		compile: function (element, attrs) {
			var template = angular.element('<span class="input-group-btn"><button class="btn btn-primary glyphicon glyphicon-ok-sign" ng-click="eventHandler()" /></span>');
			var lik = $compile(template);
			return  function (scope, element) {
				element.typeahead(scope.datasets);
				jQuery('.twitter-typeahead').addClass('input-group').css('display', 'table');
				jQuery('.tt-hint').addClass('form-control');
				jQuery('.tt-query').addClass('form-control').after(lik(scope));
			};
		}
	};
  }]).
    directive('smaPopover', ['$compile', '$log', function($compile, $log) {
	return {
		restrict: 'A',
		scope: {
			value: '=',
			listClick: '&'
		},
		transclude: false,
		compile: function (element, attrs) {
			var template = '<div id="supermarkets" class="list-group"><button class="list-group-item" ng-repeat="supermarket in value" ng-click="selectSupermarket()">{{ supermarket.name }}</button></div>';
			var compTpl = $compile(template);
			return  function (scope, element) {	
				element.popover({
					html: true,
					content: function() {
						return template;
					},
					placement: 'bottom'
				}).click( function(e){
					$compile(jQuery('.popover').contents())(scope);
				});
			};
		}
	};
  }]).
    directive('smaPopover2', ['$log', '$parse', '$compile', '$http', '$timeout', '$q', '$templateCache', function($log, $parse, $compile, $http, $timeout, $q, $templateCache) {
	// Hide popovers when pressing esc
	jQuery('body').on('keyup', function(ev) {
		if(ev.keyCode === 27) {
			jQuery('.popover.in').each(function() {
				jQuery(this).popover('hide');
			});
		}
	});
	return {
		restrict: 'A',
    scope: false,
    compile: function (element, attr){
		var template = angular.element('#' + attr.contentRef)[0].innerHTML;
		return function postLink(scope, element, attr, ctrl) {

      var getter = $parse(attr.bsPopover),
        setter = getter.assign,
        value = getter(scope),
        options = {};

      if(angular.isObject(value)) {
        options = value;
      }

		//var template = '<div id="supermarkets" class="list-group"><button class="list-group-item" ng-repeat="supermarket in supermarkets" ng-click="selectSupermarket(supermarket.name)">{{ supermarket.name }}</button></div>';
		
        // Handle response from $http promise
        if(angular.isObject(template)) {
          template = template.data;
        }

        // Handle data-unique attribute
        if(!!attr.unique) {
          element.on('show', function(ev) { // requires bootstrap 2.3.0+
            // Hide any active popover except self
            jQuery('.popover.in').each(function() {
              var $this = jQuery(this),
                popover = $this.data('popover');
              if(popover && !popover.$element.is(element)) {
                $this.popover('hide');
              }
            });
          });
        }

        // Handle data-hide attribute to toggle visibility
        if(!!attr.hide) {
          scope.$watch(attr.hide, function(newValue, oldValue) {
            if(!!newValue) {
              popover.hide();
            } else if(newValue !== oldValue) {
              $timeout(function() {
                popover.show();
              });
            }
          });
        }

        if(!!attr.show) {
          scope.$watch(attr.show, function(newValue, oldValue) {
            if(!!newValue) {
              $timeout(function() {
                popover.show();
              });
            } else if(newValue !== oldValue) {
              popover.hide();
            }
          });
        }

        // Initialize popover
        element.popover(angular.extend({}, options, {
          content: template,
          html: true,
          placement: 'bottom'
        }));

        // Bootstrap override to provide tip() reference & compilation
        var popover = element.data('bs.popover');
        popover.hasContent = function() {
          return this.getTitle() || template; // fix multiple $compile()
        };
        popover.getPosition = function() {
          var r = jQuery.fn.popover.Constructor.prototype.getPosition.apply(this, arguments);

          // Compile content
          $compile(this.$tip)(scope);
          scope.$digest();

          // Bind popover to the tip()
          this.$tip.data('bs.popover', this);

          return r;
        };

        // Provide scope display functions
        scope.$popover = function(name) {
          $log.log(name);
          popover(name);
        };
        angular.forEach(['show', 'hide'], function(name) {
          scope[name] = function() {
            popover[name]();
          };
        });
        scope.dismiss = scope.hide;

        // Emit popover events
        angular.forEach(['show.bs.popover', 'shown.bs.popover', 'hide.bs.popover', 'hidden.bs.popover'], function(name) {
          element.on(name, function(ev) {
            scope.$emit('popover-' + name, ev);
            if(name==='hidden.bs.popover') {
				popover.$tip.css('display','none');
            }
          });
        });

	};

    }
    };
  }]);