angular.module('App', [])
.controller('TodoCtrl', function ($scope, $http) {

    $scope.showMinimum = function () {
        let minimum = $scope.getMinimum($scope.data, 'amount');

        if (minimum !== undefined) {
            alert('The minimum is: ' + minimum);
        } else {
            alert('The field \'amount\' is not part of the data object');
        }
    };

    $scope.showMaximum = function () {
        let maximum = $scope.getMaximum($scope.data, 'amount');

        if (maximum !== undefined) {
            alert('The maximum is: ' + maximum);
        } else {
            alert('The field \'amount\' is not part of the data object');
        }
    };

    $scope.showBoth = function () {
        let both = $scope.getBoth($scope.data, 'amount');

        if (both !== undefined) {
            alert('The both is: ' + both);
        } else {
            alert('The field \'amount\' is not part of the data object');
        }
    };

    $scope.getMinimum = function (data, basedField) {
        return $scope.basicHelpers(data, basedField, 'min');
    };

    $scope.getMaximum = function (data, basedField) {
        return $scope.basicHelpers(data, basedField, 'max');
    };

    $scope.getBoth = function (data, basedField) {
        return $scope.basicHelpers(data, basedField, 'both');
    };

    $scope.basicHelpers = function (data, field, type) {
        var result = undefined;

        if ($scope.fieldExists(data[0], field)) {
            switch (type) {
                case 'min':
                    result = d3.min(data, function (d, i) { return d[field] });
                    break;
                case 'max':
                    result = d3.max(data, function (d, i) { return d[field] });
                    break;
                case 'both':
                    result = d3.extent(data, function (d, i) { return d[field] });
                    break;
                default:
                    break;
            }
        }

        return result;
    };

    $scope.fieldExists = function (dataRow, field) {
        return dataRow[field] !== undefined;
    }

    $scope.getSample = function () {
        $http.get('./json/tSample.json')
         .then(function (res) {
             $scope.data = res.data;
        });
    };

    // Triggers get the data
    $scope.getSample();
});