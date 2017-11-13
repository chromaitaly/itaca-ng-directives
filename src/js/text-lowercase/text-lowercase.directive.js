(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('textLowercase', TextLowercaseDirective);
	
	/* @ngInject */
	function TextLowercaseDirective(textTransformService) {
		return {
			restrict : 'A',
			require : '?ngModel',
			link : function(scope, element, attrs, ngModelController) {
				textTransformService.transform(element, ngModelController,
						angular.lowercase);
			}
		};
	}
})();