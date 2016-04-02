(function () {
    'use strict';
    /*global angular */

    angular
        .module('dlebedev.dl-autocomplete.demo.app', [
           'dlebedev.dl-autocomplete',
        ])
        .controller('DemoAppCtrl', DemoAppCtrl);

    DemoAppCtrl.$inject = ['$scope', '$http'];

    function DemoAppCtrl($scope, $http) {
        var vm = this;
        vm.title = 'dlAutocomplete Directive Example';
        vm.getAddresses = getAddresses;

        function getAddresses(query) {
            return $http
                .get('//maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        address: query,
                        sensor: false
                    }
                })
                .then(function(response) {
                    return response.data.results.map(function(item) {
                        return item.formatted_address;
                    });
                });
        }
    }
})();
