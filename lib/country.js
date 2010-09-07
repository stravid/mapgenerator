/* Helpers and native extentions */
function distance(a, b) {
    return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
};

Array.prototype.extend = function (array) {
    for (var i = 0; i < array.length; i++) {
        this.push(array[i]);
    }
    
    return this;
};

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(item, from) {
        var len = this.length;
        
        for (var i = (from < 0) ? Math.max(0, len + from) : from || 0; i < len; i++) {
            if (this[i] === item)
                return i;
        }
        
        return -1;   
    };
}

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

Country.prototype.getRandomNeighborHexagon = function(useCompactShapes) {
    if (useCompactShapes) {
        while (true) {
            var hexagon = this.hexagons[rand(0, this.hexagons.length - 1)];
            var neighborHexagon = hexagon.neighbors[rand(0, hexagon.neighbors.length - 1)];
                
            if (!neighborHexagon.used)
                return neighborHexagon;
        }
    }
    else {
        var neighborHexagons = new Array();
        
        for (var i = 0; i < this.hexagons.length; i++) {
            for (var j = 0; j < this.hexagons[i].neighbors.length; j++) {
                if (!this.hexagons[i].neighbors[j].used)
                    neighborHexagons.include(this.hexagons[i].neighbors[j]);
            }
        }
        
        return neighborHexagons[rand(0, neighborHexagons.length -1)];
    }
};

Country.prototype.getPointField = function(points, lineLength) {
    var connectedPoints = new Array(),
        isConnected = true;
    
    connectedPoints.push(points[0]);
    points.erase(points[0]);
    
    while (isConnected) {
        isConnected = false;
        
        for (var i = 0; i < connectedPoints.length; i++) {
            for (var j = 0; j < points.length; j++) {
                if (distance(connectedPoints[i], points[j]) < lineLength) {
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
        sumY = 0,
        line = this.hexagons[0].lines[0];
        lineLength = distance(line.points[0], line.points[1]) * 1.1;
    
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
        pointFields.push(this.getPointField(triplePoints, lineLength));
    }
    
    // get the biggest pointField
    var pointField = pointFields[0];
    for (var i = 1; i < pointFields.length; i++) {
        if (pointFields[i].length > pointField.length)
            pointField = pointFields[i];
    }
    
    // inLineHexagons are hexagons completely on the inside of a country
    var inlineHexagons = new Array();
    
    for (var i = 0, ii = this.hexagons.length; i < ii; i++) {
        var containsHex = true;
        
        for (var j = 0; j < 6; j++) {
            if (!pointField.contains(this.hexagons[i].lines[j].points[0]) || 
                !pointField.contains(this.hexagons[i].lines[j].points[1])) {
                
                containsHex = false;
                break;
            }
        }
        
        if (containsHex) 
            inlineHexagons.push(this.hexagons[i]);
    }
    
    // no inlineHexagons: set center to average triplePoint in pointField
    if (inlineHexagons.length < 1) {
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
            var pointDistance = distance(centerPoint, pointField[i]);
            
            if (pointDistance < minDistance) {
                j = i;
                minDistance = pointDistance;
                
                if (minDistance < lineLength / 2)
                    break;
            }
        }
        
        this.center = pointField[j];
        return;
    }
    
    // a hexagonField is a field consisting of inlineHexagons
    var hexagonFields = new Array();
    
    while (inlineHexagons.length > 0) {
        hexagonFields.push(this.getHexagonField(inlineHexagons));
    }
    
    // get the biggest hexagonField
    var hexagonField = hexagonFields[0];
    
    for (var i = 1; i < hexagonFields.length; i++) {
        if (hexagonFields[i].length > hexagonField.length)
            hexagonField = hexagonFields[i];
    }
    
    var hexagonCenters = new Array();
    
    for (var i = 0, ii = hexagonField.length; i < ii; i++) {
        var x = 0,
            y = 0;
            
        for (var j = 0; j < 6; j++) {    
            x += hexagonField[i].lines[j].points[0].x + hexagonField[i].lines[j].points[1].x,
            y += hexagonField[i].lines[j].points[0].y + hexagonField[i].lines[j].points[1].y;
        }
        
        sumX += x /= 12;
        sumY += y /= 12;
        hexagonCenters.push(new Point(x, y));
    }
    
    var centerPoint = new Point(sumX / hexagonField.length, sumY / hexagonField.length),
        minDistance = Infinity,
        j;
    
    if (hexagonField.length < 7) {
        this.center = centerPoint;
        return;
    }
    
    for (var i = 0, ii = hexagonField.length; i < ii; i++) {
        var hexDistance = distance(centerPoint, hexagonCenters[i]);
        
        if (hexDistance < minDistance) {
            j = i;
            minDistance = hexDistance;
            
            if (minDistance < lineLength * 2 / 3)
                break;
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
    
    // creating the outline and bounding box
    this.outline.push(line.points[0]);
    this.outline.push(line.points[1]);
    outLines = outLines.erase(line);
    
    var startPoint = line.points[0],
        point = line.points[1];
    
    this.boundingBox = {};
    this.boundingBox.min = new Point(Math.min(startPoint.x, point.x), Math.min(startPoint.y, point.y));
    this.boundingBox.max = new Point(Math.max(startPoint.x, point.x), Math.max(startPoint.y, point.y));
    
    while (startPoint != point) {
        for (var i = 0; i < outLines.length; i++) {
            var isNewPoint = false;
            
            if (outLines[i].points[0] == point) {   
                point = outLines[i].points[1];
                this.outline.push(outLines[i].points[1]);
                outLines = outLines.erase(outLines[i]);
                isNewPoint = true;
            } 
            else if (outLines[i].points[1] == point) {
                point = outLines[i].points[0];
                this.outline.push(outLines[i].points[0]);
                outLines = outLines.erase(outLines[i]);
                isNewPoint = true;
            }
            
            if (isNewPoint) {
                this.boundingBox.min.x = Math.min(this.boundingBox.min.x, point.x);
                this.boundingBox.min.y = Math.min(this.boundingBox.min.y, point.y);
                
                this.boundingBox.max.x = Math.max(this.boundingBox.max.x, point.x);
                this.boundingBox.max.y = Math.max(this.boundingBox.max.y, point.y);
            }
        }
    }
    
    if (outLines.length > 0)
        this.holeLines = outLines;
};