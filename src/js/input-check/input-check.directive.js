/**
 * valida un input in base al controllo passatogli
 * 
 */
(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('chInputCheck', InputCheckDirective);
	
	/* @ngInject */
	function InputCheckDirective($q){ 
		return {
			restrict: 'A',
			require: 'ngModel',
			scope: {
				ngModel: "=",
				chInputCheck: "=",
			},
			link: function (scope, element, attrs, ngModelCtrl) {
				
				scope.check = function(){
					$q.when(scope.chInputCheck(scope.ngModel),
						// success
						function(valid){
							ngModelCtrl.$setValidity('chValid', valid);
							ngModelCtrl.$checking = false;
						},
						// error
						function(){
							ngModelCtrl.$setValidity('chValid', false);
							ngModelCtrl.$checking = false;
						},
						// in progress
						function(){
							ngModelCtrl.$checking = true;
						}
					);
				};
					
				scope.$watchCollection("ngModel", function(newValue, oldValue) {
					if(_.isNil(newValue) || _.isEmpty(newValue)){
						ngModelCtrl.$setValidity('chValid', true);
					} else {
						ngModelCtrl.$setValidity('chValid', false);
						scope.check();
					}
				});
					
			}
		};
	}
})();