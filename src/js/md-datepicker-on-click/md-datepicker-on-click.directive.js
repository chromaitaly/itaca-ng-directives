(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('mdDatepickerOnClick', DatepickerOnClickDirective);
	
	/* @ngInject */
	function DatepickerOnClickDirective($timeout) {
		  return {
		    restrict: 'A',
		    require: 'mdDatepicker', 
		    link: function (scope, element, attributes, DatePickerCtrl) {
		    	
		    	element.find('input').on('click', function (e) {
		    		$timeout(DatePickerCtrl.openCalendarPane.on(DatePickerCtrl, e));
		    	});
		    }
		  };
	}
})();