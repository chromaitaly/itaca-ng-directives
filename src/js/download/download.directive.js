(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('chDownload', DownloadDirective);
	
	/* @ngInject */
	function DownloadDirective($http, $timeout, $log, Loading, Dialog) {
		return {
			restrict : 'A',
			scope: {
				chDownload: "=",
				maxRetry: "=?",
				retryDelay: "=?",
				onError: "&?"				
		    },
			link : function(scope, element, attrs) {
				scope.maxRetry = scope.maxRetry || 1;
				scope.retryDelay = scope.retryDelay || 5000;
				
				scope.download = function(ev){
					if (scope.downloaded) {
						scope.downloaded = false;
						return;
					}
					
					scope.attempt = 1;
					
					scope.$$doDownload(ev);
				};
				
				scope.$$doDownload = function(ev){
					Loading.start();
					
					var finallyFn = function(){
						scope.attempt++;
					};
					
					var finallyErrorFn = function(){
						scope.attempt++;
						Loading.stop();
					};
					
					$http.get(scope.chDownload).then(function(response) {
						if (!response.data.file) {
							scope.$$manageRetry(true);
							
						} else {
							if (bowser.ios) {
								var data = {
									file: response.data.file, 
									filename: response.data.filename,
									contentType: response.data.contentType,
									title: scope.downloadReadyLabel,
									downloadLabel: scope.downloadLabel
								};
								
								Dialog.downloadFile(ev, data);
//								Loading.stop();
								
							} else {
								var linkEl = scope.$$getLinkEl();
								linkEl.href = 'data:' + (response.data.contentType || "application/octet-stream") + ';base64,' + encodeURI(response.data.file);
								linkEl.setAttribute('download', response.data.filename);
								scope.downloaded = true;
//								linkEl.click();
								
								if(document.createEvent) {
									var eventObj = new MouseEvent("click", {
										view: window,
									    bubbles: true,
									    cancelable: true
									});
									
									linkEl.dispatchEvent(eventObj);
								
								} else {
									linkEl.fireEvent('click');
								}
								
//								Loading.stop();
							}
							
							Loading.stop();
						}
						 
		            }, function(response){
		            	if (response.status == 412 || !scope.$$manageRetry(response.status == 507)){
		            		$log.error("Error downloading file: " + response.data && response.data.message ? response.data.message : "");
		            		scope.onError && scope.onError(response);
		            		Loading.stop();
		            	}
		            	
		            }).finally(finallyFn, finallyErrorFn);
				};
				
				scope.$$manageRetry = function(longWait) {
					if (scope.attempt < scope.maxRetry) {
	            		$timeout(scope.$$doDownload, longWait ? scope.retryDelay : 1000);
	            		return true;
					} 
						
					return false;
				};
				
				scope.$$getLinkEl = function() {
					var linkEl = element[0].querySelector(".ch-download-button-link");
					
					if (linkEl == null) {
						// se non esiste, viene creato
						linkEl = document.createElement('a');
						linkEl.setAttribute('target', '_blank');
						linkEl.className = "ch-download-button-link";
					
						element[0].appendChild(linkEl);
					}
					
					return linkEl;
				};
				
				var targetEl = element[0];
				
				targetEl.addEventListener('click', scope.download);
	        	
				scope.$on("$destroy", function() {
					targetEl.removeEventListener("click", scope.download);
				});
			}
		};
	}
})();