(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('textUppercase', TextUppercaseDirective);
	
	/* @ngInject */
	function TextUppercaseDirective(textTransformService) {
		return {
			restrict : 'A',
			require : '?ngModel',
			link : function(scope, element, attrs, ngModelController) {
				textTransformService.transform(element, ngModelController,
						angular.uppercase);
			}
		};
	}
})();