(function () {
    'use strict';
    /*global angular */

    angular
        .module('dlebedev.dl-autocomplete', [])
        .directive('dlAutocomplete', AutocompleteDirective);

    AutocompleteDirective.$inject = [];

    function AutocompleteDirective() {
        var directive = {
            controller: AutocompleteCtrl,
            controllerAs: 'vm',
            scope: true,
            bindToController: true,  // because the scope is isolated
            restrict: 'A',
            require: 'ngModel',
            templateUrl: '/template/dl-autocomplete.html',
            link: link,
        };

        return directive;

        function link(scope, element, attrs, ngModel) {
            scope.vm.init(element, attrs, ngModel);
        }
    }

    AutocompleteCtrl.$inject = ['$scope', '$parse', '$q'];

    function AutocompleteCtrl($scope, $parse, $q) {
        var vm = this;
        
        vm.element = null;
        vm.attrs = null;
        vm.ngModel = null;
        vm.matches = [];
        vm.bOpen = false;
        vm.idxActiveMatch = null;
                
        vm.init = init;
        vm.updateMatches = updateMatches;
        vm.hasMatches = hasMatches;
        vm.watchNgModelChange = watchNgModelChange;
        vm.listenKeyboardEvents = listenKeyboardEvents;
        vm.isOpen = isOpen;
        vm.isActiveMatch = isActiveMatch;
        vm.setActiveMatch = setActiveMatch;
        vm.hasActiveMatch = hasActiveMatch;
        vm.selectMatch = selectMatch;
        vm.selectActiveMatch = selectActiveMatch;
        vm.incActiveMatch = incActiveMatch;
        vm.decActiveMatch = decActiveMatch;
        vm.hideMatches = hideMatches;

        /**
         * Autocomplete directive constructor.
         *
         * @param {Object} element The jqLite-wrapped element that this directive matches
         * @param {Object} attrs Hash object with key-value pairs of normalized attribute names and their corresponding attribute values
         * @param {Object} ngModel The directive's required NgModelController instance
         */
        function init(element, attrs, ngModel) {
            vm.element = element;
            vm.attrs = attrs;
            vm.ngModel = ngModel;
            
            vm.element
                .find('.dl-autocomplete')
                .insertAfter(vm.element);

            vm.updateMatches();
            vm.watchNgModelChange();
            vm.listenKeyboardEvents();
        }

        function updateMatches() {
            $q
                .when($parse(vm.attrs.dlAutocomplete)($scope.$parent))
                .then(function(matches) {
                    vm.matches = matches;
                    vm.setActiveMatch(null);
                    vm.bOpen = angular.isArray(vm.matches) && vm.hasMatches();
                });
        }

        function hasMatches() {
            return vm.matches.length > 0;
        }

        function watchNgModelChange() {
            vm.attrs.$observe('ngModel', function(value) {
                $scope.$watch(value, function(newValue) {
                    vm.updateMatches();
                });
            });
        }

        function listenKeyboardEvents() {
            vm.element
                .on('blur', function() {
                    if (!vm.hasActiveMatch()) {
                        $scope.$evalAsync(vm.hideMatches);
                    }
                })
                .on('keyup', function(event) {
                    switch (event.which) {
                        case 27:
                            $scope.$evalAsync(vm.hideMatches);
                            break;
                        case 13:
                            $scope.$evalAsync(vm.selectActiveMatch);
                            break;
                        case 38:
                            $scope.$evalAsync(vm.decActiveMatch);
                            break;
                        case 40:
                            $scope.$evalAsync(vm.incActiveMatch);
                            break;
                    }
                });
        }

        function isOpen() {
            return vm.bOpen;
        }

        function isActiveMatch(idxMatch) {
            return vm.idxActiveMatch === idxMatch;
        }

        function setActiveMatch(idxMatch) {
            vm.idxActiveMatch = idxMatch;
        }

        function hasActiveMatch() {
            return vm.idxActiveMatch !== null;
        }

        function selectMatch(idxMatch) {
            var newValue = vm.matches[idxMatch];
            vm.hideMatches();
            $parse(vm.attrs.ngModel).assign($scope.$parent, newValue);
        }

        function selectActiveMatch() {
            if (vm.hasActiveMatch()) {
                vm.selectMatch(vm.idxActiveMatch);
            }
        }

        function incActiveMatch() {
            if (vm.hasMatches()) {
                if (vm.idxActiveMatch === null) {
                    vm.setActiveMatch(0);
                } else {
                    vm.setActiveMatch(vm.idxActiveMatch === vm.matches.length - 1 ? 0 : vm.idxActiveMatch + 1);
                }
            }
        }

        function decActiveMatch() {
            if (vm.hasMatches()) {
                if (vm.idxActiveMatch === null) {
                    vm.setActiveMatch(vm.matches.length - 1);
                } else {
                    vm.setActiveMatch(vm.idxActiveMatch === 0 ? vm.matches.length - 1 : vm.idxActiveMatch - 1);
                }
            }
        }

        function hideMatches() {
            vm.bOpen = false;
            vm.setActiveMatch(null);
        }
    }
})();
