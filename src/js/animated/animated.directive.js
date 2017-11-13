/**
 * inserisce la classe di animazione e il tempo di ritardo
 */
(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('chAnimated', AnimatedDirective);
	
	/* @ngInject */
	function AnimatedDirective(HtmlUtils, $window) {
		return {
			restrict: 'A',
			link : function(scope, element, attrs) {
				var el = angular.element(element);
				
//				el.css('opacity', 0);
//				el.removeClass('animated');
//				
//				function showEl(){
//					if(HtmlUtils.isElementInView(el)){
//						el.css('opacity', 1);
//						el.addClass('animated');
//					}
//				}
				
				function init() {
					if(!_.isNil(scope.currentAnimation)){
						el.removeClass(scope.currentAnimation);
					}
					
					var delay = isFinite(parseInt(attrs.chAnimatedDelay)) ? parseInt(attrs.chAnimatedDelay) : 0;
					
					el.css({'-webkit-animation-delay': delay+'ms', 'animation-delay': delay+'ms'});
					el.addClass('animated');
					el.addClass(attrs.chAnimated);
					scope.currentAnimation = attrs.chAnimated;
				};
				
				scope.$watchGroup([function() {
					return attrs.chAnimated;
				}, function() {
					return attrs.chAnimatedDelay;
				}], init);
				
//				showEl();
//				
//				var docContainer = null;
//				if (attrs.chAnimatedContainer) {
//					docContainer = angular.element(document.getElementById(attrs.chAnimatedContainer))[0]; 
//				}
//				
//				if (!docContainer) {
//					docContainer = HtmlUtils.getScrollParent(el);
//				}
//				
//				docContainer = docContainer || $window;
//				
//				docContainer.addEventListener("scroll", showEl);
			}
		};
	}
})();
