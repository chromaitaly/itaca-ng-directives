(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('mdDatepickerReadonly', DatepickerReadonlyDirective);
	
	/* @ngInject */
	function DatepickerReadonlyDirective($timeout) {
		return {
		    restrict: 'A',
		    require: 'mdDatepicker', 
		    link: function (scope, element, attributes, DatePickerCtrl) {
		    	element.find('input').attr("readonly", "readonly");
		    }
		};
	}
})();