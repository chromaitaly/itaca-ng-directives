/**
 * Dato un array di oggetti {event:nome-evento, fn: funzione, params: parametri funzione}
 * creo i listener che rimangono in ascolto su l'evento passato
 * ed eseguono la funzione passata
 */
(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('chEventsManager', EventsManagerDirective);
	
	/* @ngInject */
	function EventsManagerDirective() {
		return {
			restrict : 'A',
		    controller: EventsManagerCtrl
		};
	}
	
	/* @ngInject */
	function EventsManagerCtrl($scope, $element, $attrs) {
    	var events = $scope.$eval($attrs.chEventsManager);
    	
    	if(!events || !angular.isArray(events)){
    		return;
    	}
    	
		_.forEach(events, function(ev){
			if(!ev || !ev.event || !ev.fn || !angular.isFunction(ev.fn)){
				return true;
			}
			
			$scope.$on(ev.event, function(e, args){
				/**
				 * Se ci sono i parametri della funzione do priorità a loro
				 * altrimenti controllo se ci sono parametri passati dall'evento
				 */
				ev.fn.apply($scope, angular.isArray(ev.params) ? ev.params: args ? args: null);
			});
		});
    }
})();