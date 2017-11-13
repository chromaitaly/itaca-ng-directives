(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('tzDate', TzDateDirective);
	
	/* @ngInject */
	function TzDateDirective(DateUtils, $parse) {
		return {
		    restrict: 'A',
		    require: 'ngModel', 
		    link: function (scope, element, attrs, ngModelCtrl) {
		    	ngModelCtrl.$viewChangeListeners.push(function(){ 
		    		if (ngModelCtrl.$modelValue && angular.isDate(ngModelCtrl.$modelValue)) {
		    			var offset = attrs.tzDate;
		    			offset && $parse(attrs.ngModel).assign(scope, moment(ngModelCtrl.$modelValue).utcOffset(offset, true).toDate());
		    		}
		    	});
		    }
		  };
	}
})();