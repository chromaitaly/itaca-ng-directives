(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('chDisableTransitionsListeners', DisableTransitionsListenersDirective);
	
	/* @ngInject */
	function DisableTransitionsListenersDirective(TransitionsListener) {
		return {
			restrict: 'A',
			link: function(scope, element, attrs) {
				TransitionsListener.disable(attrs.chDisableTransitionsListeners);
			}
		};
	}
})();