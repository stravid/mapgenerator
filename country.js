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

Country.prototype.getNeighborHexagons = function() {
    var allHexagons = new Array();
    
    for (var i = 0; i < this.hexagons.length; i++) {
        allHexagons.extend(this.hexagons[i].neighbors);
    }
    
    var neighborHexagons = new Array();
    
    for (var i = 0; i < allHexagons.length; i++) {
        if (!allHexagons[i].used)
            neighborHexagons.include(allHexagons[i]);
            //neighborHexagons.push(allHexagons[i]);
            // FIXME: whats that?!
    }
    
    return neighborHexagons;
};

Country.prototype.getLineField = function(lines) {
    var connectedLines = new Array();
    
    connectedLines.push(lines[0]);
    lines.erase(lines[0]);
    
    // FIXME: found what?
    var found = true;
    
    while (found) {
        found = false;
        
        for (var i = 0; i < connectedLines.length; i++) {
            for (var j = 0; j < lines.length; j++) {
                if ((lines[j].points[0] == connectedLines[i].points[0]) || 
                    (lines[j].points[1] == connectedLines[i].points[1]) || 
                    (lines[j].points[1] == connectedLines[i].points[0]) || 
                    (lines[j].points[0] == connectedLines[i].points[1])) {
                    
                    var line = lines[j];
                    
                    connectedLines.push(line);
                    lines.erase(line);
                    found = true;
                    
                    break;
                }
            }
            
            if (found)
                break;
        }
    }
    
    return connectedLines;
};

Country.prototype.getHexagonField = function(hexagons) {
    var connectedHexagons = new Array();
    var found = true;
    
    connectedHexagons.push(hexagons[0]);
    hexagons.erase(hexagons[0]);
    
    while (found) {
        found = false;
        
        for (var i = 0; i < connectedHexagons.length; i++) {
            for (var j = 0; j < hexagons.length; j++) {
                if (hexagons[j].neighbors.contains(connectedHexagons[i])) {
                    var hex = hexagons[j];
                    
                    connectedHexagons.push(hex);
                    hexagons.erase(hex);
                    found = true;
                    
                    break;
                }
            }
            
            if (found)
                break;
        }
    }
    
    return connectedHexagons;
};

Country.prototype.getCenter = function() {   
    var triplePoints = new Array();
    var points = new Array();
    var length = this.inlines.length;
    
    for (var i = 0; i < length; i++) {
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
    
    var sumX = 0;
    var sumY = 0;
    
    if (triplePoints.length < 1) {
        // set center in middle of a hexagon
        length = this.hexagons.length;
        
        for (var i = 0; i < length; i++) {
            var inCountryNeighbors = 0;
            
            for (var j = 0; j < 6; j++) {
                if (this.hexagons.contains(this.hexagons[i].neighbors[j])) {
                    inCountryNeighbors++;
                    
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
        
        for (var i = 0; i < 6; i++) {
            sumX += this.hexagons[0].lines[i].points[0].x + this.hexagons[0].lines[i].points[1].x;
            sumY += this.hexagons[0].lines[i].points[0].y + this.hexagons[0].lines[i].points[1].y;
        }
        
        this.center = new Point(sumX / 12, sumY / 12);
        
        return;
    }
    
    var doubleLines = new Array();
    
    length = this.inlines.length;
    
    for (var i = 0; i < length; i++) {
        if (triplePoints.contains(this.inlines[i].points[0]) && triplePoints.contains(this.inlines[i].points[1]))
            doubleLines.push(this.inlines[i]);
    }
    
    if (doubleLines.length < 1) {
        // set center to a triple point
        this.center = new Point(triplePoints[0].x, triplePoints[0].y);
        
        return;
    }
    
    var lineFields = new Array();
    
    while (doubleLines.length > 0) {
        lineFields.push(this.getLineField(doubleLines));
    }
    
    var lineField = lineFields[0];
    
    for (var i = 1; i < lineFields.length; i++) {
        if (lineFields[i].length > lineField.length)
            lineField = lineFields[i];
    }
    
    var inLineHexagons = new Array();
    
    length = this.hexagons.length;
    
    for (var i = 0; i < length; i++) {
        var containsHex = true;
        
        for (var j = 0; j < 6; j++) {
            if (!lineField.contains(this.hexagons[i].lines[j]))
                containsHex = false;
        }
        
        if (containsHex) 
            inLineHexagons.push(this.hexagons[i]);
    }
    
    if (inLineHexagons.length < 1) {
        // average Point of LineField
        var lineCenters = new Array();
        
        length = lineField.length;
        
        for (var i = 0; i < length; i++) {
            var x = lineField[i].points[0].x + lineField[i].points[1].x;
            var y = lineField[i].points[0].y + lineField[i].points[1].y;
            
            lineCenters.push(new Point(x/2,y/2));
            sumX += x;
            sumY += y;
        }
        
        var centerPoint = new Point(sumX/length/2, sumY/length/2);
        var j;
        // FIXME: wtf, shoudnt be Infinity used?
        var distance = 100000000;
        
        for (var i = 0; i < length; i++) {
            var lineDistance = Math.sqrt(((centerPoint.x - lineCenters[i].x) * (centerPoint.x - lineCenters[i].x) + 
                (centerPoint.y - lineCenters[i].y) * (centerPoint.y - lineCenters[i].y)));
                
            if (distance > lineDistance) {
                j = i;
                distance = lineDistance;
            }
        }
        
        this.center = new Point(lineCenters[j].x, lineCenters[j].y);
        
        return;
    }
    
    var hexagonFields = new Array();
    
    while (inLineHexagons.length > 0) {
        hexagonFields.push(this.getHexagonField(inLineHexagons));
    }
    
    var hexagonField = hexagonFields[0];
    
    for (var i = 1; i < hexagonFields.length; i++) {
        if (hexagonFields[i].length > hexagonField.length)
            hexagonField = hexagonFields[i];
    }
    
    length = hexagonField.length;
    
    for (var i = 0; i < length; i++) {
        for (var j = 0; j < 6; j++) {
            sumX += hexagonField[i].lines[j].points[0].x + hexagonField[i].lines[j].points[1].x;
            sumY += hexagonField[i].lines[j].points[0].y + hexagonField[i].lines[j].points[1].y;
        }
    }
    
    this.center = new Point(sumX/length/12, sumY/length/12);
};

Country.prototype.generateOutline = function() {
    // lineArray containing only outlines
    var outLines = new Array();
    var length = this.hexagons.length;
    
    for (var i = 0; i < length; i++) {
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
    
    // getting top left line
    var line = outLines.getLast();
    
    for (var i = 0; i < outLines.length; i++) {
        if (outLines[i].points[0].x + outLines[i].points[1].x < line.points[0].x + line.points[1].x)
            line = outLines[i];
        else if (outLines[i].points[0].x + outLines[i].points[1].x == line.points[0].x + line.points[1].x) {
            if (outLines[i].points[0].y + outLines[i].points[1].y < line.points[0].y + line.points[1].y)
                line = outLines[i];
        }
    }
    
    // creating the outline
    this.outline.push(line.points[0]);
    this.outline.push(line.points[1]);
    outLines = outLines.erase(line);
    
    var startPoint = line.points[0];
    var point = line.points[1];
    
    while (startPoint != point) {
        for (var i = 0; i < outLines.length; i++) {
            var a = 0, b = 1;
        
            if (outLines[i].points[a] == point) {   
                point = outLines[i].points[b];
                this.outline.push(outLines[i].points[b]);
                outLines = outLines.erase(outLines[i]);
            } else if (outLines[i].points[b] == point) {
                point = outLines[i].points[a];
                this.outline.push(outLines[i].points[a]);
                outLines = outLines.erase(outLines[i]);
            }
        }
    }
    
    if (outLines.length > 0)
        this.holeLines = outLines;
};