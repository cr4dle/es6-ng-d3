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

    $scope.prepareData = function (data, groupBy) {
        return $filter('orderBy')(data.reduce(function (previousValue, currentValue, index, array) {
            var tempDate = new Date(currentValue[groupBy]);
            let date = Date.parse(tempDate.toString().split(" ")[1] + ' 01 ' + tempDate.getFullYear().toString());

            let found = $filter('filter')(previousValue, { groupBy: date }, true);
            if (found.length) {
                found[0].values.push(currentValue);
            } else {
                previousValue.push({
                    groupBy: date,
                    values: [currentValue]
                });
            }

            return previousValue;
        }, []), 'groupBy');
    };

    $scope.resolveData = function (data, groupBy, field) {
        let graphic1 = [], graphic2 = [];

        let tempData = $scope.prepareData(data, groupBy);

        angular.forEach(tempData, function (value) {
            graphic1.push({
                date: value.groupBy,
                value: value.values.reduce(function(previousValue, currentValue){ return previousValue + currentValue[field]}, 0)
            });

            graphic2.push({
                date: value.groupBy,
                value: value.values.length
            });
        });

        return [graphic1, graphic2];
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