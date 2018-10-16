angular.module('indexController', [])

.controller('mainController', ['$scope','$http', function($scope, $http) {
    $scope.formData = {};
    $scope.loading = true;
}]);