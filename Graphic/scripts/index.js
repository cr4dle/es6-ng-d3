angular.module('App', [])
.controller('TodoCtrl', function ($scope, $http, $filter) {

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

    $scope.plot = function () {
        $scope.todo($scope.graphicProperties, $scope.data, 'date', 'amount');
    }

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

    //todo: split in small methods
    //$scope.setScale = function (data, domain, range) {
    //    var x = d3.scaleTime()
    //        .range($scope.basicHelpers(data, domain, 'both'));

    //    var y = d3.scaleLinear()
    //        .range($scope.basicHelpers(data, range, 'both'));

    //    var line = d3.line()
    //        .x(function (d) { return x(d[domain]); })
    //        .y(function (d) { return x(d[range]); });

    //    return line;
    //};
    //todo: split in small methods
    //$scope.svg = function (graphicProperties) {
    //    var svg = d3.select("body").append("svg")
    //        .attr("width", graphicProperties.width + graphicProperties.margin.left +graphicProperties.margin.right)
    //        .attr("height", graphicProperties.height + graphicProperties.margin.top + graphicProperties.margin.bottom)
    //        .append("g")
    //        .attr("transform", "translate(" + graphicProperties.margin.left + "," + graphicProperties.margin.top + ")");

    //    return svg;
    //};

    //todo: split in small methods
    $scope.todo = function (graphicProperties, data, domain, range) {
        ///
        var x = d3.scaleTime()
            .range([0, graphicProperties.width]);

        var y = d3.scaleLinear()
            .range([graphicProperties.height, 0]);

        var line = d3.line()
            .x(function (d) { return x(d.date); })
            .y(function (d) { return y(d.value); });

        ///
        var svg = d3.select("body").append("svg")
            .attr("width", graphicProperties.width + graphicProperties.margin.left + graphicProperties.margin.right)
            .attr("height", graphicProperties.height + graphicProperties.margin.top + graphicProperties.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + graphicProperties.margin.left + "," + graphicProperties.margin.top + ")");

        ///
        d3.json("../json/tSample.json", function (error, data) {
            if (error) throw error;

            let graphicData = $scope.resolveData(data, 'date', 'amount');

            let value = graphicData[0];//.slice(0,12);
                x.domain(d3.extent(value, function (d) { return d.date; }));
                y.domain(d3.extent(value, function (d) { return d.value; }));

                svg.append("g")
                    .attr("class", "axis axis--x")
                    .attr("transform", "translate(0," + $scope.graphicProperties.height + ")")
                    .call(d3.axisBottom(x));

                svg.append("g")
                    .attr("class", "axis axis--y")
                    .call(d3.axisLeft(y))
                  .append("text")
                    .attr("class", "axis-title")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", ".71em")
                    .style("text-anchor", "end");

                svg.append("path")
                    .datum(value)
                    .attr("class", "line")
                    .attr("d", line)
                    .attr('stroke', 'green')
                    .attr('stroke-width', 5)
                    .attr('fill', 'none');

                //svg.append("path")
                //    .datum(graphicData[1])
                //    .attr("class", "line")
                //    .attr("d", line)
                //    .attr('stroke', 'blue')
                //    .attr('stroke-width', 5)
                //    .attr('fill', 'none');

        });
    };
    
    $scope.fieldExists = function (dataRow, field) {
        return dataRow[field] !== undefined;
    }

    // Methods to prepare the data for the graphic
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

    // Get an array for each line we need to draw
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

    // Graphic properties
    $scope.margin = { top: 20, right: 20, bottom: 30, left: 50 };

    $scope.graphicProperties = {
        margin: $scope.margin,
        width: 960 - $scope.margin.left - $scope.margin.right,
        height: 500 - 20 - 30
    };

    // Triggers the draw
    $scope.plot();
});