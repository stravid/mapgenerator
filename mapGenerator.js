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
    
    generateOutline: function() {
        
        // lineArray containing only outlines
        var outLines = new Array();
        var length = this.hexagons.length;
        
        for (var i = 0; i < length; i++) {
            for (var j = 0; j < 6; j++) {
                var line = this.hexagons[i].lines[j];
                if (outLines.contains(line))
                    outLines = outLines.erase(line);
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
    }
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
        
        // pointArray
        for (var row = 0; row < numberOfHexagonsInAColumn + 1; row++) {
            for (var column = 0; column < numberOfHexagonsInARow + 1; column++) {
                
                var x, y;
                
                x = column * hexagonWidth;
                if ((row % 2) == 1)
                    y = row * this.hexagonSize * 0.75;
                else
                    y = row * this.hexagonSize * 0.75 + 0.25 * this.hexagonSize;
                this.points.push(new Point(x, y));
                    
                x = (column + 0.5) * hexagonWidth;
                if ((row % 2) == 1)
                    y = row * this.hexagonSize * 0.75 + 0.25 * this.hexagonSize;
                else
                    y = row * this.hexagonSize * 0.75;
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
        var averageCountrySize = parseInt(this.hexagons.length * 0.8 / numberOfCountries);        
        
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
    }
});

function rand(minimum, maximum)
{
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}