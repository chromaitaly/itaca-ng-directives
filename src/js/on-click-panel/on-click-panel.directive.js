(function() {
	'use strict';
	
	angular.module("itaca.directives").directive('onClickPanel', OnClickPanelDirective);

	/* @ngInject */
	function OnClickPanelDirective($mdPanel, $mdMedia) {
		return {
			restrict: 'A',
		    scope: {
		    	onClickPanel: "=",
		    	ctrl: "@",
		    	xPosition: "@",
		    	yPosition: "@",
		    	hasBackdrop: "=?",
		    	disableParentScroll: "=?",
		    	disableBodyScroll: "=?",
		    	clickOutsideToClose: "=?",
		    	hasConfirm: "=?",
		    	hasClose: "=?",
		    	panelClass: "@",
		    	data: "=?",
		    	onClose: "&?",
		    	zIndex: "@",
		    	fullscreen: "=?"
		    },
		    link: function(scope, element, attrs) {
		    	scope.xPosition = _.includes(["CENTER", "ALIGN_START", "ALIGN_END", "OFFSET_START", "OFFSET_END"], scope.xPosition) ? scope.xPosition : "CENTER";
		    	scope.yPosition = _.includes(["CENTER", "ALIGN_TOPS", "ALIGN_BOTTOMS", "ABOVE", "BELOW"], scope.yPosition) ? scope.yPosition : "BELOW";
		    	scope.clickOutsideToClose = scope.clickOutsideToClose || true;
		    	scope.panelClass = scope.panelClass || "bg-white md-whiteframe-15dp";
		    	scope.hasBackdrop = _.isNil(scope.hasBackdrop) ? true : scope.hasBackdrop;
		    	
		    	var targetEl = element[0];
		    	
		    	var blockBodyScroll = function(block) {
	    			angular.element(document.body).css({overflow: block ? "hidden" : "auto"});
	        	};
		    	
		    	var position = $mdPanel.newPanelPosition()
			        .relativeTo(element)
			        .addPanelPosition($mdPanel.xPosition[scope.xPosition], $mdPanel.yPosition[scope.yPosition]);
		    	
		    	var config = {
	    			attachTo: angular.element(document.body),
				    controller: scope.ctrl || "basePanelCtrl",
				    controllerAs: 'ctrl',
				    templateUrl: scope.onClickPanel,
				    position: position,
				    clickOutsideToClose: scope.clickOutsideToClose,
				    disableParentScroll: scope.disableParentScroll,
				    hasBackdrop: scope.hasBackdrop,
				    fullscreen: _.isBoolean(scope.fullscreen) ? scope.fullscreen : false,
				    panelClass: scope.panelClass,
				    locals: {data: scope.workingData, hasConfirm: scope.hasConfirm, hasClose: scope.hasClose},
				    onCloseSuccess: function(panelRef, closeReason) {
				    	var tbc = _.isBoolean(scope.hasConfirm) ? scope.hasConfirm : false;
				    	
				    	if (!tbc || (_.isBoolean(closeReason) && closeReason)) {
				    		_.assign(scope.data, scope.workingData);
				    		scope.onClose && scope.onClose(scope.data);
				    	}
				    	
				    	// sblocco scroll body
				    	(scope.hasBackdrop || scope.disableBodyScroll) && blockBodyScroll(false);
				    },
				    onOpenComplete: function() {
				    	// blocco scroll body
				    	(scope.hasBackdrop || scope.disableBodyScroll) && blockBodyScroll(true);
				    }
		    	 };
		    	
		    	 if (scope.zIndex) {
		    		 config.zIndex = scope.zIndex;
		    	 }
		    	 
		    	 var openPanel = function(ev) {
		    		 scope.data = scope.data || {};
	 	    		 scope.workingData = angular.copy(scope.data);
	 	    		  	    		 
		    		 config.openFrom = ev;
		    		 config.locals = scope.locals || {hasConfirm: scope.hasConfirm, hasClose: scope.hasClose};
		    		 // riassegno il workingData
		    		 config.locals.data = scope.workingData;
		    		 
		    		 // apro il pannello 
		    		 $mdPanel.open(config);
		    	 };
		    	 
		    	 targetEl.addEventListener('click', openPanel);
		        	
		    	 scope.$on("$destroy", function() {
		    		 targetEl.removeEventListener("click", openPanel);
		    	 });
		    }
		};
	}
})();