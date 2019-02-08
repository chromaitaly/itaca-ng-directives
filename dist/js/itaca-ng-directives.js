/*******************************************************************************
********************************************************************************
********************************************************************************
***	   itaca-ng-directives														 
***    Copyright (C) 2016-2018   Chroma Italy Hotels srl	 
***                                                                          
***    This program is free software: you can redistribute it and/or modify  
***    it under the terms of the GNU General Public License as published by  
***    the Free Software Foundation, either version 3 of the License, or     
***    (at your option) any later version.                                   
***                                                                          
***    This program is distributed in the hope that it will be useful,       
***    but WITHOUT ANY WARRANTY; without even the implied warranty of        
***    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         
***    GNU General Public License for more details.                          
***                                                                          
***    You should have received a copy of the GNU General Public License     
***    along with this program.  If not, see <http://www.gnu.org/licenses/>. 
********************************************************************************
********************************************************************************
*******************************************************************************/
(function() {
    "use strict";
    angular.module("itaca.directives", [ "ngMaterial", "itaca.services", "itaca.utils", "pascalprecht.translate", "tmh.dynamicLocale" ]);
    angular.module("itaca.directives").config([ "$windowProvider", "$translateProvider", "tmhDynamicLocaleProvider", function($windowProvider, $translateProvider, tmhDynamicLocaleProvider) {
        var defaultLocale = ($windowProvider.$get().navigator.language || $windowProvider.$get().navigator.userLanguage).split("-")[0].toLowerCase();
        $translateProvider.useLoader("i18nLoader");
        $translateProvider.preferredLanguage(defaultLocale);
        $translateProvider.useCookieStorage();
        $translateProvider.useMissingTranslationHandlerLog();
        $translateSanitizationProvider.addStrategy("sce", "sceStrategy");
        $translateProvider.useSanitizeValueStrategy("sce");
        tmhDynamicLocaleProvider.localeLocationPattern("/resources/public/js/i18n/angular-locale_{{locale}}.js");
        tmhDynamicLocaleProvider.useCookieStorage();
        tmhDynamicLocaleProvider.defaultLocale(defaultLocale);
    } ]);
})();

(function() {
    "use strict";
    AnimatedDirective.$inject = [ "HtmlUtils", "$window" ];
    angular.module("itaca.directives").directive("chAnimated", AnimatedDirective);
    function AnimatedDirective(HtmlUtils, $window) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var el = angular.element(element);
                function init() {
                    if (!_.isNil(scope.currentAnimation)) {
                        el.removeClass(scope.currentAnimation);
                    }
                    var delay = isFinite(parseInt(attrs.chAnimatedDelay)) ? parseInt(attrs.chAnimatedDelay) : 0;
                    el.css({
                        "-webkit-animation-delay": delay + "ms",
                        "animation-delay": delay + "ms"
                    });
                    el.addClass("animated");
                    el.addClass(attrs.chAnimated);
                    scope.currentAnimation = attrs.chAnimated;
                }
                scope.$watchGroup([ function() {
                    return attrs.chAnimated;
                }, function() {
                    return attrs.chAnimatedDelay;
                } ], init);
            }
        };
    }
})();

(function() {
    "use strict";
    BackBtnDirective.$inject = [ "$rootScope", "localStorageService", "Navigation" ];
    angular.module("itaca.directives").directive("chBackBtn", BackBtnDirective);
    function BackBtnDirective($rootScope, localStorageService, Navigation) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var historyVarName = "X-ITACA-AI-HISTORY";
                var history = localStorageService.get(historyVarName);
                if (!history || !history.length) {
                    element.addClass("hide");
                }
                var storePreviousPath = function(event, current, previous, error) {
                    if (!current.$$route || current.$$route.originalPath.includes("login")) {
                        return;
                    }
                    var currentPath = current.$$route.originalPath;
                    var history = localStorageService.get(historyVarName) || [];
                    if (!history.length || history.indexOf(currentPath) != history.length - 1) {
                        history.push(currentPath);
                        localStorageService.set(historyVarName, history);
                    }
                    if (history.length) {
                        element.removeClass("hide");
                    }
                };
                $rootScope.$on("$routeChangeSuccess", storePreviousPath);
                element.on("click", function(ev) {
                    ev.preventDefault();
                    var history = localStorageService.get(historyVarName) || [];
                    var prevPath = history.length > 1 ? history.splice(-2)[0] : "/";
                    if (!prevPath.includes("login")) {
                        localStorageService.set(historyVarName, history);
                        Navigation.go(prevPath);
                    }
                });
            }
        };
    }
})();

(function() {
    "use strict";
    DisableTransitionsListenersDirective.$inject = [ "TransitionsListener" ];
    angular.module("itaca.directives").directive("chDisableTransitionsListeners", DisableTransitionsListenersDirective);
    function DisableTransitionsListenersDirective(TransitionsListener) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                TransitionsListener.disable(attrs.chDisableTransitionsListeners);
            }
        };
    }
})();

(function() {
    "use strict";
    DownloadDirective.$inject = [ "$http", "$timeout", "$log", "Loading", "Dialog" ];
    angular.module("itaca.directives").directive("chDownload", DownloadDirective);
    function DownloadDirective($http, $timeout, $log, Loading, Dialog) {
        return {
            restrict: "A",
            scope: {
                chDownload: "=",
                maxRetry: "=?",
                retryDelay: "=?",
                onError: "&?"
            },
            link: function(scope, element, attrs) {
                scope.maxRetry = scope.maxRetry || 1;
                scope.retryDelay = scope.retryDelay || 5e3;
                scope.download = function(ev) {
                    if (scope.downloaded) {
                        scope.downloaded = false;
                        return;
                    }
                    scope.attempt = 1;
                    scope.$$doDownload(ev);
                };
                scope.$$doDownload = function(ev) {
                    Loading.start();
                    var finallyFn = function() {
                        scope.attempt++;
                    };
                    var finallyErrorFn = function() {
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
                            } else {
                                var linkEl = scope.$$getLinkEl();
                                linkEl.href = "data:" + (response.data.contentType || "application/octet-stream") + ";base64," + encodeURI(response.data.file);
                                linkEl.setAttribute("download", response.data.filename);
                                scope.downloaded = true;
                                if (document.createEvent) {
                                    var eventObj = new MouseEvent("click", {
                                        view: window,
                                        bubbles: true,
                                        cancelable: true
                                    });
                                    linkEl.dispatchEvent(eventObj);
                                } else {
                                    linkEl.fireEvent("click");
                                }
                            }
                            Loading.stop();
                        }
                    }, function(response) {
                        if (response.status == 412 || !scope.$$manageRetry(response.status == 507)) {
                            $log.error("Error downloading file: " + response.data && response.data.message ? response.data.message : "");
                            scope.onError && scope.onError(response);
                            Loading.stop();
                        }
                    }).finally(finallyFn, finallyErrorFn);
                };
                scope.$$manageRetry = function(longWait) {
                    if (scope.attempt < scope.maxRetry) {
                        $timeout(scope.$$doDownload, longWait ? scope.retryDelay : 1e3);
                        return true;
                    }
                    return false;
                };
                scope.$$getLinkEl = function() {
                    var linkEl = element[0].querySelector(".ch-download-button-link");
                    if (linkEl == null) {
                        linkEl = document.createElement("a");
                        linkEl.setAttribute("target", "_blank");
                        linkEl.className = "ch-download-button-link";
                        element[0].appendChild(linkEl);
                    }
                    return linkEl;
                };
                var targetEl = element[0];
                targetEl.addEventListener("click", scope.download);
                scope.$on("$destroy", function() {
                    targetEl.removeEventListener("click", scope.download);
                });
            }
        };
    }
})();

(function() {
    "use strict";
    EventsManagerCtrl.$inject = [ "$scope", "$element", "$attrs" ];
    angular.module("itaca.directives").directive("chEventsManager", EventsManagerDirective);
    function EventsManagerDirective() {
        return {
            restrict: "A",
            controller: EventsManagerCtrl
        };
    }
    function EventsManagerCtrl($scope, $element, $attrs) {
        var events = $scope.$eval($attrs.chEventsManager);
        if (!events || !angular.isArray(events)) {
            return;
        }
        _.forEach(events, function(ev) {
            if (!ev || !ev.event || !ev.fn || !angular.isFunction(ev.fn)) {
                return true;
            }
            $scope.$on(ev.event, function(e, args) {
                ev.fn.apply($scope, angular.isArray(ev.params) ? ev.params : _.isNil(args) ? null : angular.isArray(args) ? args : [ args ]);
            });
        });
    }
})();

(function() {
    "use strict";
    InputCheckDirective.$inject = [ "$q" ];
    angular.module("itaca.directives").directive("chInputCheck", InputCheckDirective);
    function InputCheckDirective($q) {
        return {
            restrict: "A",
            require: "ngModel",
            scope: {
                ngModel: "=",
                chInputCheck: "="
            },
            link: function(scope, element, attrs, ngModelCtrl) {
                scope.check = function() {
                    $q.when(scope.chInputCheck(scope.ngModel), function(valid) {
                        ngModelCtrl.$setValidity("chValid", valid);
                        ngModelCtrl.$checking = false;
                    }, function() {
                        ngModelCtrl.$setValidity("chValid", false);
                        ngModelCtrl.$checking = false;
                    }, function() {
                        ngModelCtrl.$checking = true;
                    });
                };
                scope.$watchCollection("ngModel", function(newValue, oldValue) {
                    if (_.isNil(newValue) || _.isEmpty(newValue)) {
                        ngModelCtrl.$setValidity("chValid", true);
                    } else {
                        ngModelCtrl.$setValidity("chValid", false);
                        scope.check();
                    }
                });
            }
        };
    }
})();

(function() {
    "use strict";
    LazyImageDirective.$inject = [ "$compile", "UrlBuilder" ];
    angular.module("itaca.directives").directive("lazyImage", LazyImageDirective);
    function LazyImageDirective($compile, UrlBuilder) {
        return {
            restrict: "A",
            scope: {
                defaultImgUrl: "=",
                maxRetry: "=",
                hideOnError: "=?",
                onLoad: "&?"
            },
            link: function(scope, element, attrs) {
                var cssClass = attrs.loadedClass, origSrc, timeout, loadingId = "lipr_" + Date.now(), maxRetry = maxRetry || 3, attempt = 0;
                scope.hideOnError = _.isBoolean(scope.hideOnError) ? scope.hideOnError : false;
                function load() {
                    if (attempt >= maxRetry) {
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
                            element[0].src = UrlBuilder.withParam(origSrc, "cache", Date.now().toString());
                            load();
                            attempt++;
                        }, 3e3);
                    }
                }
                function showLoading() {
                    element.addClass("hide");
                    element[0].style.setProperty("display", "none", "important");
                    if (scope.hideOnError) {
                        return;
                    }
                    if (!document.getElementById(loadingId)) {
                        var contentTr = angular.element('<md-progress-circular id="' + loadingId + '" class="md-primary ch-progress" md-mode="indeterminate"></md-progress-circular>');
                        element.after(contentTr);
                        $compile(contentTr)(scope);
                    }
                }
                element.on("load", function(e) {
                    scope.onLoad && scope.onLoad();
                    clearTimeout(timeout);
                    element.css("display", "inherit");
                    element.addClass(cssClass);
                    element.removeClass("hide");
                    var loading = document.getElementById(loadingId);
                    loading && angular.element(loading).remove();
                });
                element.on("error", function() {
                    load();
                });
                showLoading();
                scope.$on("$destroy", function() {
                    clearTimeout(timeout);
                });
            }
        };
    }
})();

(function() {
    "use strict";
    DatepickerOnClickDirective.$inject = [ "$timeout" ];
    angular.module("itaca.directives").directive("mdDatepickerOnClick", DatepickerOnClickDirective);
    function DatepickerOnClickDirective($timeout) {
        return {
            restrict: "A",
            require: "mdDatepicker",
            link: function(scope, element, attributes, DatePickerCtrl) {
                element.find("input").on("click", function(e) {
                    $timeout(DatePickerCtrl.openCalendarPane.on(DatePickerCtrl, e));
                });
            }
        };
    }
})();

(function() {
    "use strict";
    DatepickerReadonlyDirective.$inject = [ "$timeout" ];
    angular.module("itaca.directives").directive("mdDatepickerReadonly", DatepickerReadonlyDirective);
    function DatepickerReadonlyDirective($timeout) {
        return {
            restrict: "A",
            require: "mdDatepicker",
            link: function(scope, element, attributes, DatePickerCtrl) {
                element.find("input").attr("readonly", "readonly");
            }
        };
    }
})();

(function() {
    "use strict";
    OnClickPanelDirective.$inject = [ "$mdPanel", "$mdMedia" ];
    angular.module("itaca.directives").directive("onClickPanel", OnClickPanelDirective);
    function OnClickPanelDirective($mdPanel, $mdMedia) {
        return {
            restrict: "A",
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
                scope.xPosition = _.includes([ "CENTER", "ALIGN_START", "ALIGN_END", "OFFSET_START", "OFFSET_END" ], scope.xPosition) ? scope.xPosition : "CENTER";
                scope.yPosition = _.includes([ "CENTER", "ALIGN_TOPS", "ALIGN_BOTTOMS", "ABOVE", "BELOW" ], scope.yPosition) ? scope.yPosition : "BELOW";
                scope.clickOutsideToClose = scope.clickOutsideToClose || true;
                scope.panelClass = scope.panelClass || "bg-white md-whiteframe-15dp";
                scope.hasBackdrop = _.isNil(scope.hasBackdrop) ? true : scope.hasBackdrop;
                var targetEl = element[0];
                var blockBodyScroll = function(block) {
                    angular.element(document.body).css({
                        overflow: block ? "hidden" : "auto"
                    });
                };
                var position = $mdPanel.newPanelPosition().relativeTo(element).addPanelPosition($mdPanel.xPosition[scope.xPosition], $mdPanel.yPosition[scope.yPosition]);
                var config = {
                    attachTo: angular.element(document.body),
                    controller: scope.ctrl || "basePanelCtrl",
                    controllerAs: "ctrl",
                    templateUrl: scope.onClickPanel,
                    position: position,
                    clickOutsideToClose: scope.clickOutsideToClose,
                    disableParentScroll: scope.disableParentScroll,
                    hasBackdrop: scope.hasBackdrop,
                    fullscreen: _.isBoolean(scope.fullscreen) ? scope.fullscreen : false,
                    panelClass: scope.panelClass,
                    locals: {
                        data: scope.workingData,
                        hasConfirm: scope.hasConfirm,
                        hasClose: scope.hasClose
                    },
                    onCloseSuccess: function(panelRef, closeReason) {
                        var tbc = _.isBoolean(scope.hasConfirm) ? scope.hasConfirm : false;
                        if (!tbc || _.isBoolean(closeReason) && closeReason) {
                            _.assign(scope.data, scope.workingData);
                            scope.onClose && scope.onClose(scope.data);
                        }
                        (scope.hasBackdrop || scope.disableBodyScroll) && blockBodyScroll(false);
                    },
                    onOpenComplete: function() {
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
                    config.locals = scope.locals || {
                        hasConfirm: scope.hasConfirm,
                        hasClose: scope.hasClose
                    };
                    config.locals.data = scope.workingData;
                    $mdPanel.open(config);
                };
                targetEl.addEventListener("click", openPanel);
                scope.$on("$destroy", function() {
                    targetEl.removeEventListener("click", openPanel);
                });
            }
        };
    }
})();

(function() {
    "use strict";
    SocialLoginDirective.$inject = [ "$log", "$interval", "Navigator" ];
    angular.module("itaca.directives").directive("socialLogin", SocialLoginDirective);
    function SocialLoginDirective($log, $interval, Navigator) {
        return {
            restrict: "A",
            scope: {
                socialLogin: "@",
                provider: "@",
                reload: "="
            },
            link: function(scope, element, attrs) {
                var provider = scope.socialLogin || scope.provider;
                scope.popup = {};
                function loginSocial(ev) {
                    ev.preventDefault();
                    var __ret = calculatePopupDimensions();
                    var url = "/signin/" + provider + "/popup";
                    var specs = "scrollbars=yes, width=" + __ret.w + ", height=" + __ret.h + ", top=" + __ret.top + ", left=" + __ret.left;
                    scope.popup = window.open(url, "socialLogin", specs);
                    if (!scope.stop) {
                        scope.stop = $interval(function() {
                            scope.loginCallback();
                        }, 1e3);
                    }
                }
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
                };
                scope.unregister = function() {
                    scope.stopCheck();
                };
                scope.$on("destroy", scope.unregister);
                function calculatePopupDimensions() {
                    var w = 650;
                    var h = 650;
                    var wLeft = window.screenLeft ? window.screenLeft : window.screenX;
                    var wTop = window.screenTop ? window.screenTop : window.screenY;
                    var left = wLeft + window.innerWidth / 2 - w / 2;
                    var top = wTop + window.innerHeight / 2 - h / 2;
                    return {
                        w: w,
                        h: h,
                        left: left,
                        top: top
                    };
                }
                element.bind("click", function(e) {
                    loginSocial(e);
                });
            }
        };
    }
})();

(function() {
    "use strict";
    StickyDirective.$inject = [ "$window" ];
    angular.module("itaca.directives").directive("chSticky", StickyDirective);
    function StickyDirective($window) {
        return {
            restrict: "A",
            scope: {
                parent: "@stickyParent",
                offset: "@stickyOffset",
                cssClass: "@stickyClass",
                parentWidth: "@hasParentWidth",
                isSticky: "=?"
            },
            link: function(scope, element, attrs) {
                var parentHeight, offsetTop, elementHeight, width;
                var parent = scope.parent ? document.querySelector(scope.parent) : element.parent()[0];
                var offset = scope.offset || 0;
                scope.isSticky = scope.isSticky || false;
                parent.style.position = "relative";
                var doSticky = function() {
                    parentHeight = parent.offsetHeight;
                    offsetTop = parent.offsetTop - offset;
                    elementHeight = element[0].offsetHeight;
                    if ($window.pageYOffset >= offsetTop && $window.pageYOffset <= offsetTop + (parentHeight - elementHeight)) {
                        scope.isSticky = true;
                        if (scope.parentWidth) {
                            width = parent.offsetWidth + "px";
                        }
                        element.css({
                            position: "fixed",
                            top: offset + "px",
                            "z-index": "10",
                            bottom: "",
                            width: width
                        });
                        if (scope.cssClass) {
                            element.addClass(scope.cssClass);
                        }
                    } else {
                        if ($window.pageYOffset >= offsetTop && $window.pageYOffset > offsetTop + (parentHeight - elementHeight)) {
                            element.css({
                                position: "absolute",
                                bottom: "0",
                                "z-index": "",
                                top: "",
                                width: ""
                            });
                        } else {
                            element.css({
                                position: "absolute",
                                bottom: "",
                                "z-index": "",
                                top: "0",
                                width: ""
                            });
                        }
                        if (scope.cssClass) {
                            element.removeClass(scope.cssClass);
                        }
                        scope.isSticky = false;
                    }
                };
                $window.addEventListener("scroll", doSticky);
                scope.$on("$destroy", $window.removeEventListener("scroll", doSticky));
            }
        };
    }
})();

(function() {
    "use strict";
    TextCapitalizeDirective.$inject = [ "textTransformService" ];
    angular.module("itaca.directives").directive("textCapitalize", TextCapitalizeDirective);
    function TextCapitalizeDirective(textTransformService) {
        return {
            restrict: "A",
            require: "?ngModel",
            link: function(scope, element, attrs, ngModelController) {
                function capitalize(s) {
                    return angular.isString(s) && s.length > 0 ? s[0].toUpperCase() + s.substr(1).toLowerCase() : s;
                }
                textTransformService.transform(element, ngModelController, capitalize);
            }
        };
    }
})();

(function() {
    "use strict";
    TextLowercaseDirective.$inject = [ "textTransformService" ];
    angular.module("itaca.directives").directive("textLowercase", TextLowercaseDirective);
    function TextLowercaseDirective(textTransformService) {
        return {
            restrict: "A",
            require: "?ngModel",
            link: function(scope, element, attrs, ngModelController) {
                textTransformService.transform(element, ngModelController, angular.lowercase);
            }
        };
    }
})();

(function() {
    "use strict";
    TextUppercaseDirective.$inject = [ "textTransformService" ];
    angular.module("itaca.directives").directive("textUppercase", TextUppercaseDirective);
    function TextUppercaseDirective(textTransformService) {
        return {
            restrict: "A",
            require: "?ngModel",
            link: function(scope, element, attrs, ngModelController) {
                textTransformService.transform(element, ngModelController, angular.uppercase);
            }
        };
    }
})();

(function() {
    "use strict";
    TzDateDirective.$inject = [ "DateUtils", "$parse" ];
    angular.module("itaca.directives").directive("tzDate", TzDateDirective);
    function TzDateDirective(DateUtils, $parse) {
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, element, attrs, ngModelCtrl) {
                ngModelCtrl.$viewChangeListeners.push(function() {
                    if (ngModelCtrl.$modelValue && angular.isDate(ngModelCtrl.$modelValue)) {
                        var offset = attrs.tzDate;
                        offset && $parse(attrs.ngModel).assign(scope, moment(ngModelCtrl.$modelValue).utcOffset(offset, true).toDate());
                    }
                });
            }
        };
    }
})();

(function() {
    "use strict";
    UtcDateDirective.$inject = [ "DateUtils", "$parse" ];
    angular.module("itaca.directives").directive("utcDate", UtcDateDirective);
    function UtcDateDirective(DateUtils, $parse) {
        return {
            restrict: "A",
            require: "ngModel",
            link: function(scope, element, attrs, ngModelCtrl) {
                ngModelCtrl.$viewChangeListeners.push(function() {
                    if (ngModelCtrl.$modelValue && angular.isDate(ngModelCtrl.$modelValue)) {
                        $parse(attrs.ngModel).assign(scope, DateUtils.absoluteDate(ngModelCtrl.$modelValue));
                    }
                });
            }
        };
    }
})();