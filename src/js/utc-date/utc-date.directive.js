(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('utcDate', UtcDateDirective);
	
	/* @ngInject */
	function UtcDateDirective(DateUtils, $parse) {
		  return {
		    restrict: 'A',
		    require: 'ngModel', 
		    link: function (scope, element, attrs, ngModelCtrl) {
		    	ngModelCtrl.$viewChangeListeners.push(function(){ 
		    		if (ngModelCtrl.$modelValue && angular.isDate(ngModelCtrl.$modelValue)) {
		    			$parse(attrs.ngModel).assign(scope, DateUtils.absoluteDate(ngModelCtrl.$modelValue));
		    		}
		    	});
		    }
		  };
	}
})();