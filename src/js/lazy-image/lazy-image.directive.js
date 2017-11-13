(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('lazyImage', LazyImageDirective);
	
	/* @ngInject */
	function LazyImageDirective($compile, UrlBuilder) {
		return {
			restrict : 'A',
			scope: {
				defaultImgUrl: '=',
			    maxRetry: '=',
			    hideOnError: "=?",
			    onLoad: "&?"
		    },
			link : function(scope, element, attrs) {
				var cssClass = attrs.loadedClass, origSrc, timeout, loadingId = "lipr_" + Date.now(), maxRetry = maxRetry || 3, attempt = 0;
				scope.hideOnError = _.isBoolean(scope.hideOnError) ? scope.hideOnError : false;

				function load() {
					if(attempt >= maxRetry){
						if (!_.isNil(scope.defaultImgUrl)) {
							element[0].src = scope.defaultImgUrl;
						}
						return;
					}
					
					showLoading();
					
					if (!timeout) {
						timeout = setTimeout(function() {
							if (!origSrc) {
								origSrc = element[0].src;
							}
							
							element[0].src = UrlBuilder.withParam(origSrc, 'cache', Date.now().toString());
							// ricarico
							load();
							
							attempt++;
							
						}, 3000);
					}
				}
				
				function showLoading() {
					element.addClass("hide");
					element[0].style.setProperty("display", "none", "important");
					
					if (scope.hideOnError) {
						return;
					}
					
					if (!document.getElementById(loadingId)){
						var contentTr = angular.element('<md-progress-circular id="' + loadingId + '" class="md-primary ch-progress" md-mode="indeterminate"></md-progress-circular>');
						element.after(contentTr);
						$compile(contentTr)(scope);
					}
				}
				
				element.on('load', function(e) {
					scope.onLoad && scope.onLoad();
					clearTimeout(timeout);
					element.css("display", "inherit");
					element.addClass(cssClass);
					element.removeClass("hide");				
					var loading = document.getElementById(loadingId);
					loading && angular.element(loading).remove();
				});
				
				element.on('error', function() {
					load();
				});
				
				// mostro il loading
				showLoading();
				
				scope.$on("$destroy", function() {
					clearTimeout(timeout);
				});
			}
		};
	}
})();