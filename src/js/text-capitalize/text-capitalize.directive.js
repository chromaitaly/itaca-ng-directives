(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('textCapitalize', TextCapitalizeDirective);
	
	/* @ngInject */
	function TextCapitalizeDirective(textTransformService) {
		return {
			restrict : 'A',
			require : '?ngModel',
			link : function(scope, element, attrs, ngModelController) {
				function capitalize(s) {
					return angular.isString(s) && s.length > 0 ? s[0].toUpperCase() + s.substr(1).toLowerCase() : s;
				}
				textTransformService.transform(element, ngModelController,
						capitalize);
			}
		};
	}
})();