/**
 * Fisso il riepilogo costi allo scroll della pagina
 */
(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('chSticky', StickyDirective);
	
	/* @ngInject */
	function StickyDirective($window) {
	    return {
	        restrict: "A",
	        scope: {
	        	parent: "@stickyParent",
	        	offset: "@stickyOffset",
	        	cssClass: "@stickyClass",
	        	parentWidth: "@hasParentWidth",
	        	isSticky: "=?"
	        },
	        link: function (scope, element, attrs) {
	            var parentHeight, offsetTop, elementHeight, width;
	            var parent = scope.parent ? document.querySelector(scope.parent) : element.parent()[0];
	            var offset = scope.offset || 0;
	            scope.isSticky = scope.isSticky || false;
	            
	            parent.style.position = 'relative';
	            
	            var doSticky = function () {
	            	parentHeight = parent.offsetHeight;
	            	
	                offsetTop = parent.offsetTop - offset;
	                
	                elementHeight = element[0].offsetHeight;

	                if ($window.pageYOffset >= offsetTop && $window.pageYOffset <=  (offsetTop + (parentHeight - elementHeight)) ) {
	                	scope.isSticky = true;
	                	
	                	if(scope.parentWidth){
	                		width = parent.offsetWidth +'px';
	                	}
	                	element.css({'position':'fixed', 'top': offset + 'px', 'z-index': '10', 'bottom': '', 'width': width});
	                	
	                	if(scope.cssClass){
	                		element.addClass(scope.cssClass);
	                	}
	                } else {
	                	if($window.pageYOffset >= offsetTop && $window.pageYOffset > (offsetTop + (parentHeight - elementHeight))){
	                		element.css({'position':'absolute', 'bottom':'0', 'z-index': '',  'top':'', 'width': ''});
	                	}else{
	                		element.css({'position':'absolute', 'bottom':'', 'z-index': '',  'top':'0', 'width': ''});
	                	}
	                    
	                    if(scope.cssClass){
	                    	element.removeClass(scope.cssClass);
	                    }
	                    
	                    scope.isSticky = false;
	                }
	            };

	            $window.addEventListener("scroll", doSticky);
	            
	            scope.$on("$destroy", $window.removeEventListener("scroll", doSticky));
	        }
	    };
	}
})();