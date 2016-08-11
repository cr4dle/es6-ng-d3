var graphicData = [];

angular.module('App', [])
.controller('TodoCtrl', function ($scope, $http, $filter) {

    $scope.svg;
    // Graphic properties
    $scope.margin = { top: 20, right: 20, bottom: 30, left: 50 };

    $scope.graphicProperties = {
        margin: $scope.margin,
        width: 960 - $scope.margin.left - $scope.margin.right,
        height: 500 - $scope.margin.top - $scope.margin.bottom
    };

    $scope.xScale = d3.scaleTime()
            .range([0, $scope.graphicProperties.width - $scope.graphicProperties.margin.left -$scope.graphicProperties.margin.right]);

    $scope.yScale = d3.scaleLinear()
        .range([$scope.graphicProperties.height - $scope.graphicProperties.margin.top - $scope.graphicProperties.margin.bottom, 0]);

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

    $scope.changeDataRange = function () {
        let x = $scope.changeDataRangeX();

        let y = $scope.changeDataRangeY();

        var temp = [graphicData[0].slice(0, 12), graphicData[1].slice(0, 12)];

        var line = d3.line()
            .x(function (d) { return x.scale(d.date); })
            .y(function(d) { return y.scale(d.value);
        });

        // Make the changes
        $scope.svg.select(".line")   // change the line
            .datum(temp[0])
            .transition()
            .attr("d", line)
            .attr('stroke', 'blue')
            .attr('stroke-width', 2)
            .attr('fill', 'none');

        $scope.svg.select(".x.axis") // change the x axis
            .transition()
            .call(x.axis);
        $scope.svg.select(".y.axis") // change the y axis
            .transition()
            .call(y.axis);
    };

    $scope.changeDataRangeX = function () {
        // 1) change the scale
        var newScale = $scope.createLinearScaleX(graphicData[0].slice(0, 12));

        // 2) redefine the axis
        var newAxis = $scope.createAxis('B', newScale);

        // 3) redraw the axis
        //$scope.updateGraphic('.x', newAxis);

        return { scale: newScale, axis: newAxis };
    };

    $scope.changeDataRangeY = function () {
        // 1) change the scale
        var newScale = $scope.createLinearScaleY(graphicData[1].slice(0, 12));

        // 2) redefine the axis
        var newAxis = $scope.createAxis('L', newScale);

        // 3) redraw the axis
        //$scope.updateGraphic('.y', newAxis);

        return { scale: newScale, axis: newAxis };
    };

    // Create X scale
    $scope.createLinearScaleX = function (data) {
        return $scope.xScale.domain($scope.basicHelpers(data, 'date', 'both'));
    };

    // Create Y scale
    $scope.createLinearScaleY = function (data) {
        return $scope.yScale.domain($scope.basicHelpers(data, 'value', 'both'));
    };

    // Create axis
    $scope.createAxis = function (orientation, scale) {
        let axis;
        switch (orientation) {
            case 'L':
                axis = d3.axisLeft().scale(scale);
                break;
            case 'T':
                axis = d3.axisTop().scale(scale);
                break;
            case 'R':
                axis = d3.axisRight().scale(scale);
                break;
            default:
            case 'B':
                axis = d3.axisBottom().scale(scale);
                break;
        }

        return axis;
    };

    // Update graphic
    $scope.updateGraphic = function (selector, axis) {
        d3.select(selector)
            .transition(1000)
            .call(axis);
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
    $scope.todo = function (graphicProperties, data, domain, range) {
        var line = d3.line()
            .x(function (d) { return $scope.xScale(d.date); })
            .y(function (d) { return $scope.yScale(d.value); });

        ///
        $scope.svg = d3.select("body").append("svg");

        $scope.svg.attr("width", graphicProperties.width + graphicProperties.margin.left + graphicProperties.margin.right)
            .attr("height", graphicProperties.height + graphicProperties.margin.top + graphicProperties.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + graphicProperties.margin.left + "," + graphicProperties.margin.top + ")");

        ///

        d3.json("../json/tSample.json", function (error, data) {
            if (error) throw error;

            graphicData = $scope.resolveData(data, 'date', 'amount');

            let value = graphicData[0];//.slice(0,12);

            $scope.xScale.domain(d3.extent(value, function (d) { return d.date; }));
            $scope.yScale.domain(d3.extent(value, function (d) { return d.value; }));

            $scope.svg.append("g")
                .attr("class", "axis axis--x")
                .attr("transform", "translate(" + $scope.graphicProperties.margin.left + "," + ($scope.graphicProperties.height - $scope.graphicProperties.margin.top -$scope.graphicProperties.margin.bottom) + ")")
                .call(d3.axisBottom($scope.xScale));

            $scope.svg.append("g")
                .attr("class", "axis axis--y")
                .attr("transform", "translate(" + $scope.graphicProperties.margin.left+ ",0)")
                .call(d3.axisLeft($scope.yScale));

            $scope.svg.append("path")
                .datum(value)
                .attr("class", "line")
                .attr("transform", "translate(" + $scope.graphicProperties.margin.left + ",0)")
                .attr("d", line)
                .attr('stroke', 'orange')
                .attr('stroke-width', 2)
                .attr('fill', 'none');

            // Second line
            value = graphicData[1];//.slice(0,12);

            $scope.xScale.domain(d3.extent(value, function (d) { return d.date; }));
            $scope.yScale.domain(d3.extent(value, function (d) { return d.value; }));

            $scope.svg.append("g")
                .attr("class", "axis axis--y")
                .call(d3.axisRight($scope.yScale))
                .attr("transform", "translate(" + ($scope.graphicProperties.width - $scope.graphicProperties.margin.right) + ",0)");

            $scope.svg.append("path")
                .datum(value)
                .attr("class", "line")
                .attr("transform", "translate(" + $scope.graphicProperties.margin.left + ",0)")
                .attr("d", line)
                .attr('stroke', "blue")
                .attr('stroke-width', 2)
                .attr('fill', 'none');
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

    // Triggers the draw
    $scope.plot();
});