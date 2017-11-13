(function() {
	'use strict';
	
	angular.module("itaca.directives").directive("socialLogin", SocialLoginDirective);
	
	/* @ngInject */
	function SocialLoginDirective($log, $interval, Navigator) {
		return {
			restrict : "A",
			scope: {
				socialLogin: "@",
				provider: "@",
				reload: "="
		    },
			link: function(scope, element, attrs) {
				var provider = scope.socialLogin || scope.provider;
				scope.popup =  {};
							
				function loginSocial(ev) {
					ev.preventDefault();
				    var __ret = calculatePopupDimensions(); 

				    var url = "/signin/" + provider + "/popup";
				    var specs = "scrollbars=yes, width=" + __ret.w 
				        + ", height=" + __ret.h + ", top=" + __ret.top + ", left=" + __ret.left;

				 
				   scope.popup = window.open(url, "socialLogin", specs);
				  
				   if (!scope.stop) {
					   scope.stop = $interval(function() {
							scope.loginCallback();
						}, 1000);
				   }
				};
				
		        scope.stopCheck = function() {
		        	if (angular.isDefined(scope.stop)) {
		        		$interval.cancel(scope.stop);
		        		scope.stop = undefined;
		        	}
		        };
				
				scope.loginCallback = function() {
					if (scope.popup && scope.popup.closed) {
						$log.info("Popup closed");
						
						Navigator.loadUserDetails();
						
						_.isBoolean(scope.reload) && scope.reload && Navigator.reload();
						scope.unregister();
					}
				}
				
				scope.unregister = function() {
					scope.stopCheck();
				};
				
				scope.$on("destroy", scope.unregister);
				
				/**
				 * Calculate center of window
				 * @returns {{w: number, h: number, left: number, top: number}}
				 */
				function calculatePopupDimensions() {
				    var w = 650;
				    var h = 650;
				    var wLeft = window.screenLeft ? window.screenLeft : window.screenX;
				    var wTop = window.screenTop ? window.screenTop : window.screenY;

				    var left = wLeft + (window.innerWidth / 2) - (w / 2);
				    var top = wTop + (window.innerHeight / 2) - (h / 2);
				    return {w: w, h: h, left: left, top: top};
				};
				
				element.bind('click', function(e) {
					loginSocial(e);
		        });
			}
		};
	}
})();