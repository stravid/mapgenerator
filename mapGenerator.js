var Point = new Class({
    initialize: function(x, y) {
        this.x = x;
        this.y = y;
    },
    x: 0,
    y: 0    
});

var Line = new Class({
    initialize: function(pointA, pointB) {
        this.points.push(pointA);
        this.points.push(pointB);
    },
    points: new Array(),
});

var Hexagon = new Class({
    initialize: function(lineA, lineB, lineC, lineD, lineE, lineF) {
        this.lines.push(lineA);
        this.lines.push(lineB);
        this.lines.push(lineC);
        this.lines.push(lineD);
        this.lines.push(lineE);
        this.lines.push(lineF);
        
        this.used = false;
    },
    lines: new Array(),
    neighbors: new Array(),
    outline: new Array()
});

var Country = new Class({
    hexagons: new Array(),
    neighbors: new Array(),
    outline: new Array(),
    inLines: new Array(),
    doubleLines: new Array(),
    
    getNeighborHexagons: function() {
        var allHexagons = new Array();
        
        for (var i = 0; i < this.hexagons.length; i++) {
            // allHexagons = allHexagons.combine(this.hexagons[i].neighbors);
            allHexagons.extend(this.hexagons[i].neighbors);
        }
        
        var neighborHexagons = new Array();
        
        for (var i = 0; i < allHexagons.length; i++) {
            if (!allHexagons[i].used)
                neighborHexagons.include(allHexagons[i]);
                // neighborHexagons.push(allHexagons[i]);
        }
        
        return neighborHexagons;
    },
    
    getLineField: function() {
        var connectedLines = new Array();
        connectedLines.push(this.doubleLines[0]);
        this.doubleLines.erase(this.doubleLines[0]);
        var found = true;
        
        while (found) {
            found = false;
            for (var i = 0; i < connectedLines.length; i++) {
                for (var j = 0; j < this.doubleLines.length; j++) {
                    if ((this.doubleLines[j].points[0] == connectedLines[i].points[0]) || 
                        (this.doubleLines[j].points[1] == connectedLines[i].points[1]) || 
                        (this.doubleLines[j].points[1] == connectedLines[i].points[0]) || 
                        (this.doubleLines[j].points[0] == connectedLines[i].points[1])) {
                        
                        var line = this.doubleLines[j];
                        connectedLines.push(line);
                        this.doubleLines.erase(line);
                        
                        found = true;
                        break;
                    }
                }
                if (found) break;
            }
        }
        return connectedLines;
    },
    
    getHexagonField: function(hexagons) {
        var connectedHexagons = new Array();
        connectedHexagons.push(hexagons[0]);
        hexagons.erase(hexagons[0]);
        var found = true;
        
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
                if (found) break;
            }
        }
        return connectedHexagons;
    },
    
    getBase: function() {
        var sumX = 0;
        var sumY = 0;
        var length = this.outline.length;
        for (var i = 0; i < length; i++) {
            sumX += this.outline[i].x;
            sumY += this.outline[i].y;
        }
        
        this.center = new Point(sumX/length, sumY/length);
    },
    
    getCenter: function() {
        
        var triplePoints = new Array();
        var points = new Array();
        var length = this.inLines.length;
        for (var i = 0; i < length; i++) {
            for (var j = 0; j < 2; j++) {
                var point = this.inLines[i].points[j];
                if (points.contains(point)) {
                    if (!triplePoints.contains(point))
                        triplePoints.push(point);
                }
                else
                    points.push(point);            }
        }
        
        var sumX = 0;
        var sumY = 0;
        if (triplePoints.length < 1) {
            
            // set center in middle of a hexagon
            length = this.hexagons.length;
            for (var i = 0; i < length; i++) {
                if (this.hexagons[i].neighbors.length == 3) {
                    for (var i = 0; i < 6; i++) {
                        sumX += this.hexagons[i].lines[i].points[0].x + this.hexagons[i].lines[i].points[1].x;
                        sumY += this.hexagons[i].lines[i].points[0].y + this.hexagons[i].lines[i].points[1].y;
                    }
                    this.center = new Point(sumX/12, sumY/12);
                    return;
                }
            }
            
            for (var i = 0; i < 6; i++) {
                sumX += this.hexagons[0].lines[i].points[0].x + this.hexagons[0].lines[i].points[1].x;
                sumY += this.hexagons[0].lines[i].points[0].y + this.hexagons[0].lines[i].points[1].y;
            }
            this.center = new Point(sumX/12, sumY/12);
            return;
        }
        
        length = this.inLines.length;
        for (var i = 0; i < length; i++) {
            if (triplePoints.contains(this.inLines[i].points[0]) && triplePoints.contains(this.inLines[i].points[1]))
                this.doubleLines.push(this.inLines[i]);
        }
        
        if (this.doubleLines.length < 1) {
        
            // set center to a triple point
            this.center = new Point(triplePoints[0].x, triplePoints[0].y);
            return;
        }
        
        var lineFields = new Array();
        while (this.doubleLines.length > 0) {
            lineFields.push(this.getLineField());
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
            length = lineField.length;
            for (var i = 0; i < length; i++) {
                sumX += lineField[i].points[0].x + lineField[i].points[1].x;
                sumY += lineField[i].points[0].y + lineField[i].points[1].y;
            }
            
            this.center = new Point(sumX/length/2, sumY/length/2);
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
    },
    
    generateOutline: function() {
        
        // lineArray containing only outlines
        var outLines = new Array();
        var length = this.hexagons.length;
        
        for (var i = 0; i < length; i++) {
            for (var j = 0; j < 6; j++) {
                var line = this.hexagons[i].lines[j];
                if (outLines.contains(line)) {
                    outLines = outLines.erase(line);
                    this.inLines.push(line);
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
                }
                else if (outLines[i].points[b] == point) {
                    point = outLines[i].points[a];
                    this.outline.push(outLines[i].points[a]);
                    outLines = outLines.erase(outLines[i]);
                }
            }
        }
        if (outLines.length > 0)
            this.holeLines = outLines;
    },
});

var Region = new Class({
    countries: new Array(),
    neighbors: new Array(),
    outline: new Array()
});

var Map = new Class({
    points: new Array(),
    lines: new Array(),
    hexagons: new Array(),
    usedHexagons: new Array(),
    countries: new Array(),
    regions: new Array(),
    width: 0,
    height: 0,
    hexagonSize: 0,
                    
    initialize: function(width, height, hexagonSize) {
        this.width = width;
        this.height = height;
        this.hexagonSize = hexagonSize;
    },
    
    generateHexagonArray: function() {
        var hexagonWidth = Math.sqrt(3) * this.hexagonSize / 2;
        var numberOfHexagonsInARow = parseInt((this.width / hexagonWidth) - 0.5 );
        var numberOfHexagonsInAColumn = parseInt(((4 * this.height) / (3 * this.hexagonSize) ) - (1 / 3) );
        var distort = false;
        
        // pointArray
        for (var row = 0; row < numberOfHexagonsInAColumn + 1; row++) {
            for (var column = 0; column < numberOfHexagonsInARow + 1; column++) {
                
                var x, y, phi, r;
                
                x = column * hexagonWidth;
                if ((row % 2) == 1)
                    y = row * this.hexagonSize * 0.75;
                else
                    y = row * this.hexagonSize * 0.75 + 0.25 * this.hexagonSize;
                 
                if (distort) {   
                    phi = Math.random() * Math.PI * 2;
                    r = Math.random() * this.hexagonSize/4;
                    
                    x += r * Math.cos(phi);
                    x += r * Math.sin(phi);
                }
                
                this.points.push(new Point(x, y));
                    
                x = (column + 0.5) * hexagonWidth;
                if ((row % 2) == 1)
                    y = row * this.hexagonSize * 0.75 + 0.25 * this.hexagonSize;
                else
                    y = row * this.hexagonSize * 0.75;
                    
                if (distort) {   
                    phi = Math.random() * 2 * Math.PI;
                    r = Math.random() * this.hexagonSize/4;

                    x += r * Math.cos(phi);
                    x += r * Math.sin(phi);
                }
                    
                this.points.push(new Point(x, y));
            }
        }
        
        // lineArray
        for (var row = 0; row < numberOfHexagonsInAColumn + 1; row++) {
            var number = numberOfHexagonsInARow * 2 + 2;
            
            for (var column = 0; column < numberOfHexagonsInARow * 2 + 1; column++) {
                var pointA, pointB;
                pointA = this.points[(row * number) + column];
                pointB = this.points[(row * number) + column + 1];
                this.lines.push(new Line(pointA, pointB));
            }
            
            if (row < numberOfHexagonsInAColumn) {
                var oddrow = 0;
                if ((row % 2) == 1)
                    oddrow = 1;
                
                for (var column = 0; column < numberOfHexagonsInARow + 1; column++) {
                    var pointA, pointB;
                    pointA = this.points[(row * number) + column * 2 + oddrow];
                    pointB = this.points[((row + 1) * number) + column * 2 + oddrow];
                    this.lines.push(new Line(pointA, pointB));
                }
            }
        }
        
        // hexagonArray
        var linesPerRow = numberOfHexagonsInARow * 3 + 2;
        
        for (var row = 0; row < numberOfHexagonsInAColumn; row++) {
            var oddrow = 0;
            if ((row % 2) == 1)
                oddrow = 1;
                
            for (var column = 0; column < numberOfHexagonsInARow; column++) {
                
                var number = linesPerRow * row + column * 2 + oddrow;
                var lineA = this.lines[number];
                var lineB = this.lines[number+1];
                
                number = linesPerRow * row + (numberOfHexagonsInARow * 2 + 1) + column;
                var lineC = this.lines[number];
                var lineD = this.lines[number+1];
                
                number = linesPerRow * (row + 1) + column * 2 + oddrow;
                var lineE = this.lines[number];
                var lineF = this.lines[number+1];
                
                this.hexagons.push(new Hexagon(lineA, lineB, lineD, lineF, lineE, lineC));
            }
        }
        
        // hexagonNeighbors
        var leftBorder = true;
        var topBorder = true;
        var rightBorder = false;
        var bottomBorder = false;
        var index = 0;
        
        for (var i = 0; i < numberOfHexagonsInAColumn; i++) {
            leftBorder = true;
            
            if (i == (numberOfHexagonsInAColumn - 1))
                bottomBorder = true;
            
            for (var j = 0; j < numberOfHexagonsInARow; j++) {
                if (j == (numberOfHexagonsInARow - 1))
                    rightBorder = true;
                
                if (!leftBorder)
                    this.hexagons[index].neighbors.push(this.hexagons[index - 1]);
                
                if (!rightBorder)
                    this.hexagons[index].neighbors.push(this.hexagons[index + 1]);
                    
                if (!topBorder) {
                    this.hexagons[index].neighbors.push(this.hexagons[index - numberOfHexagonsInARow]);
                    if ((i % 2) == 1) {
                        if (!rightBorder)
                            this.hexagons[index].neighbors.push(this.hexagons[index + 1 - numberOfHexagonsInARow]);
                    } else {
                        if (!leftBorder)
                            this.hexagons[index].neighbors.push(this.hexagons[index - 1 - numberOfHexagonsInARow]);
                    }
                }
                
                if (!bottomBorder) {
                    this.hexagons[index].neighbors.push(this.hexagons[index + numberOfHexagonsInARow]);
                    if ((i % 2) == 1) {
                        if (!rightBorder)
                            this.hexagons[index].neighbors.push(this.hexagons[index + 1 + numberOfHexagonsInARow]);
                    } else {
                        if (!leftBorder)
                            this.hexagons[index].neighbors.push(this.hexagons[index - 1 + numberOfHexagonsInARow]);
                    }
                }
                    
                if (leftBorder)
                    leftBorder = false;
                else if (rightBorder)
                    rightBorder = false;
                    
                index++;
            }
            
            if (topBorder)
                topBorder = false;
        }
    },
    
    getRandomNeighborHexagon: function(country) {
        // var possibleNeighbors = new Array();
        var possibleNeighbors = country.getNeighborHexagons();
        /*
        for (var i = 0; i < allNeighbors.length; i++) {
            if (!allNeighbors[i].used)
                possibleNeighbors.push(allNeighbors[i]);
            //if (!this.usedHexagons.contains(allNeighbors[i]))      
        }*/
        
        if (possibleNeighbors.length > 0)
            return possibleNeighbors[rand(0, possibleNeighbors.length - 1)];
        else
            return false;
    },
    
    holeChecker: function(hexagon, maximumHoleSize) {
        var freeHexagons = new Array();
        
        freeHexagons.push(hexagon);
        
        for (var i = 0; i < freeHexagons.length; i++) {
            if (freeHexagons.length >= maximumHoleSize)
                return false;
            
            for (var j = 0; j < freeHexagons[i].neighbors.length; j++) {
                if (!freeHexagons[i].neighbors[j].used) {
                // if (!this.usedHexagons.contains(freeHexagons[i].neighbors[j])) {
                    freeHexagons.include(freeHexagons[i].neighbors[j]);
                }
            }
        }
        
        if (freeHexagons.length >= maximumHoleSize)
            return false;
        else
        {
            this.usedHexagons.combine(freeHexagons);
            freeHexagons.each(function(hexagon) {
                hexagon.used = true;
            });
            return true;
        }
    },
    
    generateCountry: function(ID, neighborCountry, size, maximumHoleSize) {
        var country = new Country();
        var startHexagon;
        country.ID = ID;
        
        if (size > maximumHoleSize)
            maximumHoleSize = size;
            
        if (neighborCountry != null) {
            do {
                startHexagon = this.getRandomNeighborHexagon(neighborCountry);
                
                // FIXME: Error handling, where and how should that happen?
                if (!startHexagon) {
                    console.error('Country has no free neighbor hexagons!');
                    return null;   
                }
                
            } while(this.holeChecker(startHexagon, maximumHoleSize))
        }
        else
            startHexagon = this.hexagons[rand(0, this.hexagons.length - 1)];
          
        startHexagon.used = true;    
        country.hexagons.push(startHexagon);
        this.usedHexagons.push(startHexagon);
        
        for (var i = 0; i < size - 1; i++) {
            var newHexagon = this.getRandomNeighborHexagon(country);
            newHexagon.used = true;
            country.hexagons.push(newHexagon);
            this.usedHexagons.push(newHexagon);
        }
        
        return country;
    },
    
    normalGenerator: function(numberOfCountries, countrySizeVariance, maximumHoleSize) {
        var averageCountrySize = parseInt(this.hexagons.length * 0.6 / numberOfCountries);        
        
        console.info('Average Country Size: ' + averageCountrySize);
        
        for (var i = 0; i < numberOfCountries; i++) {
            if (rand(0, 1) == 1)
                var sign = 1;
            else
                var sign = -1;
                
            var countrySize = (averageCountrySize + rand(0, averageCountrySize * countrySizeVariance) * sign);
            
            console.info('Size of Country #' + i + ': ' + countrySize);
            
            if (this.countries.length > 0) {
                var globalCountry = new Country();
                globalCountry.hexagons = this.usedHexagons;
                this.countries.push(this.generateCountry(i, globalCountry, countrySize, maximumHoleSize));
            }
            else 
                this.countries.push(this.generateCountry(i, null, countrySize, maximumHoleSize));   
        }
    },
    
    getCountryNeighbors: function() {
        var length = this.countries.length;
        for (var i = 0; i < length; i++) {
            for (var j = i + 1; j < length; j++) {
                var outlineLength = this.countries[j].outline.length;
                var countryOutline = this.countries[i].outline;
                for (var k = 0; k < outlineLength; k++) {
                    if (countryOutline.contains(this.countries[j].outline[k])) {
                        this.countries[i].neighbors.push(this.countries[j]);
                        this.countries[j].neighbors.push(this.countries[i]);
                        break;
                    }
                }
            }
        }
    },
    
    deleteCountryHoles: function() {
        var length = this.countries.length
        for (var i = 0; i < length; i++) {
            if ($defined(this.countries[i].holeLines)) {
                var country = this.countries[i];
                console.info('holes deleted: ' + country.ID);
                while ( 0 < country.holeLines.length) {
                    var hexLength = this.hexagons.length;
                    for (var j = 0; j < hexLength; j++) {
                        if (this.hexagons[j].lines.contains(country.holeLines[0]) && 
                            !country.hexagons.contains(this.hexagons[j])) {
                            
                            country.hexagons.push(this.hexagons[j]);
                            for (var k = 0; k < 6; k++)
                                if (!country.inLines.contains(this.hexagons[j].lines[k]))
                                    country.inLines.push(this.hexagons[j].lines[k]);
                            for (var k = 0; k < 6; k++)
                                country.holeLines.erase(this.hexagons[j].lines[k]);
                            break;
                        }
                    }
                }
            }
        }
    }
});

function rand(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}