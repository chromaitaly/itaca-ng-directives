(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('chBackBtn', BackBtnDirective);
	
	/* @ngInject */
	function BackBtnDirective($rootScope, localStorageService, Navigation) {
		return {
			restrict : 'A',
			link : function(scope, element, attrs) {
				var historyVarName = "X-ITACA-AI-HISTORY";
				
				var history = localStorageService.get(historyVarName);
				if (!history || !history.length) {
					element.addClass("hide");
				}
				
				var storePreviousPath = function(event, current, previous, error) {
					if (!current.$$route || current.$$route.originalPath.includes("login")) {
						return;
					}
					
					var currentPath = current.$$route.originalPath;
					var history = localStorageService.get(historyVarName) || [];
					
					if (!history.length || history.indexOf(currentPath) != (history.length -1)) {  
						history.push(currentPath);
						localStorageService.set(historyVarName, history);
					}
						
					if (history.length) {
						element.removeClass("hide");
					}
				};
				
				$rootScope.$on('$routeChangeSuccess', storePreviousPath);
				
				element.on("click", function(ev) {
	            	ev.preventDefault();
	            	
	            	var history = localStorageService.get(historyVarName) || [];
	            	var prevPath = history.length > 1 ? history.splice(-2)[0] : "/";
	            	
	            	if (!prevPath.includes("login")) {
	            		localStorageService.set(historyVarName, history);
	            		// go back
	            		Navigation.go(prevPath);
	            	}
				});
			}
		};
	}
})();