/* Helpers and native extentions */
Array.prototype.extend = function (array) {
    for (var i = 0; i < array.length; i++) {
        this.push(array[i]);
    }
    
    return this;
};

Array.prototype.contains = function(item, from) {
    return this.indexOf(item, from) != -1;
};

Array.prototype.include = function(item) {
    if (!this.contains(item))
        this.push(item);
    
    return this;  
};

Array.prototype.erase = function(item) {
    for (var i = this.length; i--; i) {
        if (this[i] === item)
            this.splice(i, 1);
    }
    
    return this;  
};

Array.prototype.getLast = function() {
    return (this.length) ? this[this.length - 1] : null;
};

function Country() {
    this.hexagons = new Array();
    this.neighbors = new Array();
    this.outline = new Array();
    this.inlines = new Array();
};

Country.prototype.getNeighborHexagons = function(useCompactShapes) {
    var allHexagons = new Array();
    
    for (var i = 0; i < this.hexagons.length; i++) {
        allHexagons.extend(this.hexagons[i].neighbors);
    }
    
    var neighborHexagons = new Array();
    
    for (var i = 0; i < allHexagons.length; i++) {
        if (!allHexagons[i].used)
            if (useCompactShapes)
                neighborHexagons.push(allHexagons[i]);
            else
                neighborHexagons.include(allHexagons[i]);
    }
    
    return neighborHexagons;
};

Country.prototype.getPointField = function(points) {
    var connectedPoints = new Array(),
        line = this.hexagons[0].lines[0];
        lineLength = Math.sqrt(Math.pow(line.points[0].x - line.points[1].x, 2) + Math.pow(line.points[0].y - line.points[1].y, 2)) * 1.1,
        isConnected = true;
    
    connectedPoints.push(points[0]);
    points.erase(points[0]);
    
    while (isConnected) {
        isConnected = false;
        
        for (var i = 0; i < connectedPoints.length; i++) {
            for (var j = 0; j < points.length; j++) {
                if (Math.sqrt(Math.pow(connectedPoints[i].x - points[j].x, 2) + Math.pow(connectedPoints[i].y - points[j].y, 2)) < lineLength) {
                    connectedPoints.push(points[j]);
                    points.erase(points[j]);
                    
                    isConnected = true;
                    break;
                }
            }
            
            if (isConnected)
                break;
        }
    }
    
    return connectedPoints;
};

Country.prototype.getLineField = function(lines) {
    var connectedLines = new Array(),
        isConnected = true;
    
    connectedLines.push(lines[0]);
    lines.erase(lines[0]);
    
    while (isConnected) {
        isConnected = false;
        
        for (var i = 0; i < connectedLines.length; i++) {
            for (var j = 0; j < lines.length; j++) {
                if ((lines[j].points[0] == connectedLines[i].points[0]) || 
                    (lines[j].points[1] == connectedLines[i].points[1]) || 
                    (lines[j].points[1] == connectedLines[i].points[0]) || 
                    (lines[j].points[0] == connectedLines[i].points[1])) {
                    
                    connectedLines.push(lines[j]);
                    lines.erase(lines[j]);
                    
                    isConnected = true;
                    break;
                }
            }
            
            if (isConnected)
                break;
        }
    }
    
    return connectedLines;
};

Country.prototype.getHexagonField = function(hexagons) {
    var connectedHexagons = new Array(),
        isConnected = true;
    
    connectedHexagons.push(hexagons[0]);
    hexagons.erase(hexagons[0]);
    
    while (isConnected) {
        isConnected = false;
        
        for (var i = 0, ii = connectedHexagons.length; i < ii; i++) {
            for (var j = 0, jj = hexagons.length; j < jj; j++) {
                if (hexagons[j].neighbors.contains(connectedHexagons[i])) {
                    connectedHexagons.push(hexagons[j]);
                    hexagons.erase(hexagons[j]);
                    
                    isConnected = true;
                    break;
                }
            }
            
            if (isConnected)
                break;
        }
    }
    
    return connectedHexagons;
};

Country.prototype.getCenter = function() {
    // triplePoints are points in the inside of a country / a triplePoint is part of 3 hexagons
    var triplePoints = new Array(),
        points = new Array();
    
    for (var i = 0, ii = this.inlines.length; i < ii; i++) {
        for (var j = 0; j < 2; j++) {
            var point = this.inlines[i].points[j];
            
            if (points.contains(point)) {
                if (!triplePoints.contains(point))
                    triplePoints.push(point);
            }
            else
                points.push(point); 
        }
    }
    
    var sumX = 0,
        sumY = 0;
    
    // no triplePoints: set center in middle of a hexagon
    if (triplePoints.length < 1) {
        for (var i = 0, ii = this.hexagons.length; i < ii; i++) {
            var inCountryNeighbors = 0;
            
            for (var j = 0; j < 6; j++) {
                if (this.hexagons.contains(this.hexagons[i].neighbors[j])) {
                    inCountryNeighbors++;
                    
                    // use a hexagon as center with 3 neighbors
                    if (inCountryNeighbors == 3) {
                        for (var k = 0; k < 6; k++) {
                            sumX += this.hexagons[i].lines[k].points[0].x + this.hexagons[i].lines[k].points[1].x;
                            sumY += this.hexagons[i].lines[k].points[0].y + this.hexagons[i].lines[k].points[1].y;
                        }
                        
                        this.center = new Point(sumX / 12, sumY / 12);
                        return;
                    }
                }
            }
        }
        
        // if there is no hexagon with 3 neighbors, use first
        for (var i = 0; i < 6; i++) {
            sumX += this.hexagons[0].lines[i].points[0].x + this.hexagons[0].lines[i].points[1].x;
            sumY += this.hexagons[0].lines[i].points[0].y + this.hexagons[0].lines[i].points[1].y;
        }
        
        this.center = new Point(sumX / 12, sumY / 12);
        return;
    }
    
    // a pointField consists of connected triplePoints
    var pointFields = new Array();
    
    while (triplePoints.length > 0) {
        pointFields.push(this.getPointField(triplePoints));
    }
    
    // get the biggest pointField
    var pointField = pointFields[0];
    for (var i = 1; i < pointFields.length; i++) {
        if (pointFields[i].length > pointField.length)
            pointField = pointFields[i];
    }
    
    // set center to average triplePoint in pointField
    for (var i = 0, ii = pointField.length; i < ii; i++) {
        sumX += pointField[i].x;
        sumY += pointField[i].y;
    }
    
    var centerPoint = new Point(sumX / pointField.length, sumY / pointField.length),
        minDistance = Infinity,
        j;
    
    if (pointField.length < 7) {
        this.center = centerPoint;
        return;
    }
    
    for (var i = 0, ii = pointField.length; i < ii; i++) {
        var distance = Math.sqrt(Math.pow(centerPoint.x - pointField[i].x, 2) + Math.pow(centerPoint.y - pointField[i].y, 2));
        
        if (distance < minDistance) {
            j = i;
            minDistance = distance;
        }
    }
    
    this.center = pointField[j];
};

Country.prototype.getCenterOld = function() {
    // triplePoints are points in the inside of a country / a triplePoint is part of 3 hexagons
    var triplePoints = new Array(),
        points = new Array();
    
    for (var i = 0, ii = this.inlines.length; i < ii; i++) {
        for (var j = 0; j < 2; j++) {
            var point = this.inlines[i].points[j];
            
            if (points.contains(point)) {
                if (!triplePoints.contains(point))
                    triplePoints.push(point);
            }
            else
                points.push(point); 
        }
    }
    
    var sumX = 0,
        sumY = 0;
    
    // no triplePoints: set center in middle of a hexagon
    if (triplePoints.length < 1) {
        for (var i = 0, ii = this.hexagons.length; i < ii; i++) {
            var inCountryNeighbors = 0;
            
            for (var j = 0; j < 6; j++) {
                if (this.hexagons.contains(this.hexagons[i].neighbors[j])) {
                    inCountryNeighbors++;
                    
                    // use a hexagon as center with 3 neighbors
                    if (inCountryNeighbors == 3) {
                        for (var k = 0; k < 6; k++) {
                            sumX += this.hexagons[i].lines[k].points[0].x + this.hexagons[i].lines[k].points[1].x;
                            sumY += this.hexagons[i].lines[k].points[0].y + this.hexagons[i].lines[k].points[1].y;
                        }
                        
                        this.center = new Point(sumX / 12, sumY / 12);
                        return;
                    }
                }
            }
        }
        
        // if there is no hexagon with 3 neighbors, use first
        for (var i = 0; i < 6; i++) {
            sumX += this.hexagons[0].lines[i].points[0].x + this.hexagons[0].lines[i].points[1].x;
            sumY += this.hexagons[0].lines[i].points[0].y + this.hexagons[0].lines[i].points[1].y;
        }
        
        this.center = new Point(sumX / 12, sumY / 12);
        return;
    }
    
    // doubleLines are Lines inside the country, between 2 triplePoints
    var doubleLines = new Array();
    
    for (var i = 0, ii = this.inlines.length; i < ii; i++) {
        if (triplePoints.contains(this.inlines[i].points[0]) && triplePoints.contains(this.inlines[i].points[1]))
            doubleLines.push(this.inlines[i]);
    }
    
    // no doubleLines: set center to a triplePoint
    if (doubleLines.length < 1) {
        this.center = new Point(triplePoints[0].x, triplePoints[0].y);
        return;
    }
    
    // a lineField consists of connected doubleLines
    var lineFields = new Array();
    
    while (doubleLines.length > 0) {
        lineFields.push(this.getLineField(doubleLines));
    }
    
    // get the biggest lineField
    var lineField = lineFields[0];
    for (var i = 1; i < lineFields.length; i++) {
        if (lineFields[i].length > lineField.length)
            lineField = lineFields[i];
    }
    
    // inLineHexagons are hexagons completely on the inside of a country
    var inLineHexagons = new Array();
    
    for (var i = 0, ii = this.hexagons.length; i < ii; i++) {
        var containsHex = true;
        
        for (var j = 0; j < 6; j++) {
            if (!lineField.contains(this.hexagons[i].lines[j]))
                containsHex = false;
        }
        
        if (containsHex) 
            inLineHexagons.push(this.hexagons[i]);
    }
    
    // no inLineHexagons: set center to line in lineField
    if (inLineHexagons.length < 1) {
        var lineCenters = new Array();
        
        for (var i = 0, ii = lineField.length; i < ii; i++) {
            var x = lineField[i].points[0].x + lineField[i].points[1].x,
                y = lineField[i].points[0].y + lineField[i].points[1].y;
            
            lineCenters.push(new Point(x/2,y/2));
            sumX += x;
            sumY += y;
        }
        
        var centerPoint = new Point(sumX / 2 / lineField.length, sumY / 2 / lineField.length),
            distance = Infinity, 
            j;
        
        for (var i = 0, ii = lineField.length; i < ii; i++) {
            var lineDistance = Math.sqrt(Math.pow(centerPoint.x - lineCenters[i].x, 2) + Math.pow(centerPoint.y - lineCenters[i].y, 2));
            
            if (lineDistance < distance) {
                j = i;
                distance = lineDistance;
            }
        }
        
        this.center = new Point(lineCenters[j].x, lineCenters[j].y);
        return;
    }
    
    // a hexagonField is a field consisting of inLineHexagons
    var hexagonFields = new Array();
    
    while (inLineHexagons.length > 0) {
        hexagonFields.push(this.getHexagonField(inLineHexagons));
    }
    
    // get the biggest hexagonField
    var hexagonField = hexagonFields[0];
    
    for (var i = 1; i < hexagonFields.length; i++) {
        if (hexagonFields[i].length > hexagonField.length)
            hexagonField = hexagonFields[i];
    }
    
    // for (var i = 0, ii = hexagonField.length; i < ii; i++) {
    //     for (var j = 0; j < 6; j++) {
    //         sumX += hexagonField[i].lines[j].points[0].x + hexagonField[i].lines[j].points[1].x;
    //         sumY += hexagonField[i].lines[j].points[0].y + hexagonField[i].lines[j].points[1].y;
    //     }
    // }
    // 
    // this.center = new Point(sumX / 12 / hexagonField.length, sumY / 12 / hexagonField.length);
    
    var hexagonCenters = new Array();
    
    for (var i = 0, ii = hexagonField.length; i < ii; i++) {
        var x = 0,
            y = 0;
            
        for (var j = 0; j < 6; j++) {    
            x += hexagonField[i].lines[j].points[0].x + hexagonField[i].lines[j].points[1].x,
            y += hexagonField[i].lines[j].points[0].y + hexagonField[i].lines[j].points[1].y;
        }
        
        hexagonCenters.push(new Point(x/12, y/12));
        sumX += x / 12;
        sumY += y / 12;
    }
    
    var centerPoint = new Point(sumX / hexagonField.length, sumY / hexagonField.length),
        distance = Infinity, 
        j;
    
    for (var i = 0, ii = hexagonField.length; i < ii; i++) {
        var hexDistance = Math.sqrt(Math.pow(centerPoint.x - hexagonCenters[i].x, 2) + Math.pow(centerPoint.y - hexagonCenters[i].y, 2));
        
        if (hexDistance < distance) {
            j = i;
            distance = hexDistance;
        }
    }
    
    this.center = new Point(hexagonCenters[j].x, hexagonCenters[j].y);
    return;
};

Country.prototype.generateOutline = function() {
    // lineArray containing only outlines
    var outLines = new Array();
    
    for (var i = 0, ii = this.hexagons.length; i < ii; i++) {
        for (var j = 0; j < 6; j++) {
            var line = this.hexagons[i].lines[j];
            
            if (outLines.contains(line)) {
                outLines = outLines.erase(line);
                this.inlines.push(line);
            }
            else
                outLines.push(line);
        }
    }
    
    // getting line on the outside
    var line = outLines.getLast();
    for (var i = 0; i < outLines.length; i++) {
        if (outLines[i].points[0].x < line.points[0].x)
            line = outLines[i];
    }
    
    // creating the outline
    this.outline.push(line.points[0]);
    this.outline.push(line.points[1]);
    outLines = outLines.erase(line);
    
    var startPoint = line.points[0],
        point = line.points[1];
    
    while (startPoint != point) {
        for (var i = 0; i < outLines.length; i++) {
            if (outLines[i].points[0] == point) {   
                point = outLines[i].points[1];
                this.outline.push(outLines[i].points[1]);
                outLines = outLines.erase(outLines[i]);
            } 
            else if (outLines[i].points[1] == point) {
                point = outLines[i].points[0];
                this.outline.push(outLines[i].points[0]);
                outLines = outLines.erase(outLines[i]);
            }
        }
    }
    
    if (outLines.length > 0)
        this.holeLines = outLines;
};