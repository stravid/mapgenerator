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
            allHexagons = allHexagons.combine(this.hexagons[i].neighbors);
        }
        
        var neighborHexagons = new Array();
        
        for (var i = 0; i < allHexagons.length; i++) {
            if (!this.hexagons.contains(allHexagons[i]))
                neighborHexagons.push(allHexagons[i]);
        }
        
        return neighborHexagons;
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
                
                if ((i % 2) == 1) {
                    if (!topBorder) {
                        this.hexagons[index].neighbors.push(this.hexagons[index - numberOfHexagonsInARow]);
                        if (!rightBorder)
                            this.hexagons[index].neighbors.push(this.hexagons[index + 1 - numberOfHexagonsInARow]);
                    }
                    if (!bottomBorder) {
                        if (!rightBorder)
                            this.hexagons[index].neighbors.push(this.hexagons[index + 1 + numberOfHexagonsInARow]);
                        this.hexagons[index].neighbors.push(this.hexagons[index + numberOfHexagonsInARow]);
                    }
                }
                else {
                    if (!topBorder) {
                        if (!leftBorder)
                            this.hexagons[index].neighbors.push(this.hexagons[index - 1 - numberOfHexagonsInARow]);
                        this.hexagons[index].neighbors.push(this.hexagons[index - numberOfHexagonsInARow]);
                    }
                    if (!bottomBorder) {
                        this.hexagons[index].neighbors.push(this.hexagons[index + numberOfHexagonsInARow]);
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
        var possibleNeighbors = new Array();
        var allNeighbors = country.getNeighborHexagons();
        
        for (var i = 0; i < allNeighbors.length; i++) {
            if (!this.usedHexagons.contains(allNeighbors[i]))
                possibleNeighbors.push(allNeighbors[i]);
        }
        
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
                if (!this.usedHexagons.contains(freeHexagons[i].neighbors[j])) {
                    freeHexagons.include(freeHexagons[i].neighbors[j]);
                }
            }
        }
        
        if (freeHexagons.length >= maximumHoleSize)
            return false;
        else
        {
            this.usedHexagons.combine(freeHexagons);
            return true;
        }
    },
    
    generateCountry: function(ID, neighborCountry, size, maximumHoleSize) {
        var country = new Country();
        var startHexagon;
        country.ID = ID;
        
        if (size > maximumHoleSize)
            maximumHoleSize = size;
        
        do {
            startHexagon = this.getRandomNeighborHexagon(neighborCountry);
            
            // FIXME: Error handling, where and how should that happen?
            if (!startHexagon)
                log.error('Country has no free neighbor hexagons!');
        } while(this.holeChecker(startHexagon, maximumHoleSize))
        
        country.hexagons.push(startHexagon);
        this.usedHexagons.push(startHexagon);
        
        for (var i = 0; i < size - 1; i++) {
            var newHexagon = this.getRandomNeighborHexagon(country);
            country.hexagons.push(newHexagon);
            this.usedHexagons.push(newHexagon);
        }
        
        return country;
    }
});

function rand(minimum, maximum)
{
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

// BELOW THIS POINT ONLY OLD STUFF
/*
var Shape = new Class({
    elements: new Array(),
    ID: -1,
    neighbors: new Array(),
    outline: new Array(),
});

var Point = new Class({
    initialize: function(x, y) {
        this.x = x;
        this.y = y;
    },
    x: 0,
    y: 0    
});

var Hexagon = new Class({
    Extends: Shape,
    initialize: function() {
        this.elements.push(new Point(0,0));
        this.elements.push(new Point(0,0));
        this.elements.push(new Point(0,0));
        this.elements.push(new Point(0,0));
        this.elements.push(new Point(0,0));
        this.elements.push(new Point(0,0));
    },
    countryID: -1
});

var Country = new Class({
    Extends: Shape
});

var Region = new Class({
    Extends: Shape
});

var Map = new Class({
    hexagons: new Array(),
    countries: new Array(),
    regions: new Array(),
    width: 0,
    height: 0,
    hexagonSize: 0,
    holeCounter: 0,
                    
    initialize: function(width, height, hexagonSize) {
        this.width = width;
        this.height = height;
        this.hexagonSize = hexagonSize;
    },
                    
    generateHexagonArray: function() {
        var hexagonWidth = Math.sqrt(3) * this.hexagonSize / 2;
        var numberOfHexagonsInARow = parseInt((this.width / hexagonWidth) - 0.5 );
        var numberOfHexagonsInAColumn = parseInt(((4 * this.height) / (3 * this.hexagonSize) ) - (1 / 3) );
        var hexagonID = 0;
    
        for (var row = 0; row < numberOfHexagonsInAColumn; row++) {
            for (var column = 0; column < numberOfHexagonsInARow; column++) {
                var tempHexagon = new Hexagon();
                tempHexagon.ID = hexagonID;
                var oddrow = 0;
                    
                if ((row % 2) == 1)
                    oddrow = hexagonWidth / 2;
                    
                tempHexagon.elements[0].x = (column + 0.5) * hexagonWidth + oddrow;
                tempHexagon.elements[0].y = row * this.hexagonSize * 0.75;
                    
                tempHexagon.elements[1].x = (column + 1) * hexagonWidth + oddrow;
                tempHexagon.elements[1].y = row * this.hexagonSize * 0.75 + 0.25 * this.hexagonSize;
                    
                tempHexagon.elements[2].x = (column + 1) * hexagonWidth + oddrow;
                tempHexagon.elements[2].y = (row + 1) * this.hexagonSize * 0.75;
                    
                tempHexagon.elements[3].x = (column + 0.5) * hexagonWidth + oddrow;
                tempHexagon.elements[3].y = row * this.hexagonSize * 0.75 + this.hexagonSize;
                    
                tempHexagon.elements[4].x = column * hexagonWidth + oddrow;
                tempHexagon.elements[4].y = (row + 1) * this.hexagonSize * 0.75;
                    
                tempHexagon.elements[5].x = column * hexagonWidth + oddrow;
                tempHexagon.elements[5].y = row * this.hexagonSize * 0.75 + 0.25 * this.hexagonSize;
                    
                this.hexagons.push(tempHexagon);
                hexagonID++;
            }
        }
        
        this.setHexagonNeighbors(numberOfHexagonsInARow);
    },
    
    isHexagonInAHole: function(ID, maximumHoleSize) {
        var freeNeighbors = new Array();
        var wereNewNeighborsAdded = true;
        freeNeighbors.push(ID);
        
        for (var i = 0; i < freeNeighbors.length; i++) {
            // FIXME
            //if (!wereNewNeighborsAdded)
                //break;
            if (freeNeighbors.length >= maximumHoleSize)
                return false;
            
            wereNewNeighborsAdded = false;
            
            for (var j = 0; j < this.hexagons[freeNeighbors[i]].neighbors.length; j++) {
                var id = this.hexagons[freeNeighbors[i]].neighbors[j];
                
                if (this.hexagons[id].countryID == -1) {
                    if (!freeNeighbors.contains(id)) {
                        freeNeighbors.push(id);
                        wereNewNeighborsAdded = true;
                    }
                }
            }  
        }
        
        if (freeNeighbors.length >= maximumHoleSize)
            return false;
        else
        {
            //console.warn('Hexagon is in a hole!');
            this.usedHexagons.combine(freeNeighbors);
            this.holeCounter++;
            return true;  
        }
            
    },
    
    getFreeNeighborHexagons: function(country) {            
        var possibleNeighbors = new Array();
        var amountOfHexagonsInCountry = country.elements.length;

        for (var i = 0; i < amountOfHexagonsInCountry; i++) {
            possibleNeighbors = possibleNeighbors.combine(this.hexagons[country.elements[i]].neighbors);
        }

        var realNeighbors = new Array();
        
        for (var i = 0; i < possibleNeighbors.length; i++) {
            // if (this.hexagons[possibleNeighbors[i]].countryID == -1 && !this.usedHexagons.contains(possibleNeighbors[i]))
            if (!this.usedHexagons.contains(possibleNeighbors[i]))
                realNeighbors.push(possibleNeighbors[i]);
        }
        
        
        
        if (realNeighbors.length > 0)
            return realNeighbors;
        else
            return false;
    },
    
    testGenerator: function(countrySize, countrySizeVariance, maximumHoleSize) {        
        this.usedHexagons = new Array();
        this.unusedHexagons = this.hexagons.map(function(item, index) {
            return item.ID; 
        });
        var factor = 4;
        var countryCounter = 0;
        var nextStartID;
        var holeFails = 0;
        
        nextStartID = rand(0, this.unusedHexagons.length - 1);
        
        while (this.hexagons.length - (this.usedHexagons.length + 250) > maximumHoleSize * factor) {
            holeFails = 0;
            console.log('new country index: ' + countryCounter);
            if (countryCounter > 0) {
                var collectionCountry = new Country();
                collectionCountry.elements = this.usedHexagons;
                var freeNeighbors = this.getFreeNeighborHexagons(collectionCountry);
                
                if (!freeNeighbors) {
                    console.error('Big Fail 1');
                    return;
                }
                
                do {
                    holeFails++;
                    
                    if (holeFails > 20) {
                        console.error('only holes?! ONE' + countryCounter);
                        return false;
                    }
                    
                    nextStartID = freeNeighbors[rand(0, freeNeighbors.length - 1)];
                } while (this.isHexagonInAHole(nextStartID, maximumHoleSize + 1))
            }
            holeFails = 0;
            this.countries.push(new Country());
            this.countries[countryCounter].ID = countryCounter;
            this.countries[countryCounter].elements.push(nextStartID);
            this.unusedHexagons.splice(this.unusedHexagons.indexOf(nextStartID), 1);
            this.usedHexagons.push(nextStartID);
            this.hexagons[nextStartID].countryID = countryCounter;
            console.log('new start hex:' + nextStartID);
            
            if (rand(0, 1) == 1)
                var f = 1;
            else
                var f = -1;
                
            var numberOfHexagons = (countrySize + rand(0, countrySizeVariance) * f);
            
            for (var i = 0; i < numberOfHexagons; i++) {
                var freeNeighbors = this.getFreeNeighborHexagons(this.countries[countryCounter]);
                var newHexagonID = freeNeighbors[rand(0, freeNeighbors.length - 1)];
                
                if (!freeNeighbors) {
                    console.log(numberOfHexagons);
                    console.error('Big Fail 2');
                    return;
                }
                
                // if (this.isHexagonInAHole(newHexagonID, maximumHoleSize + 1)) {
                if (false) {
                    holeFails++;
                    
                    if (holeFails > 20) {
                        console.error('only holes?! TWO' + countryCounter);
                        continue;
                    }
                    i--;
                }
                else {
                    this.countries[countryCounter].elements.push(newHexagonID);
                    this.unusedHexagons.splice(this.unusedHexagons.indexOf(newHexagonID), 1);
                    this.usedHexagons.push(newHexagonID);
                    this.hexagons[newHexagonID].countryID = countryCounter;
                    //console.log('new country hex:' + newHexagonID);
                }
            }

            countryCounter++;
        }
    },
    
    setHexagonNeighbors: function(numberOfHexagonsInARow) {
        var leftBorder = true;
        var topBorder = true;
        var rightBorder = false;
        var bottomBorder = false;    
        var rows = this.hexagons.length / numberOfHexagonsInARow;
        var index = 0;
                    
        for (var i = 0; i < rows; i++) {
            leftBorder = true;
                    
            if (i == (rows - 1))
                bottomBorder = true;
                    
            for (var j = 0; j < numberOfHexagonsInARow; j++) {
                if (j == (numberOfHexagonsInARow - 1))
                    rightBorder = true;
                    
                if (!leftBorder)
                    this.hexagons[index].neighbors.push(index - 1);
                    
                if (!rightBorder)
                    this.hexagons[index].neighbors.push(index + 1);
                    
                if ((i % 2) == 1) {
                    if (!topBorder) {
                        this.hexagons[index].neighbors.push(index - numberOfHexagonsInARow);
                        if (!rightBorder)
                            this.hexagons[index].neighbors.push(index + 1 - numberOfHexagonsInARow);
                    }
                    if (!bottomBorder) {
                        if (!rightBorder)
                            this.hexagons[index].neighbors.push(index + 1 + numberOfHexagonsInARow);
                        this.hexagons[index].neighbors.push(index + numberOfHexagonsInARow);
                    }
                }
                else {
                    if (!topBorder) {
                        if (!leftBorder)
                            this.hexagons[index].neighbors.push(index - 1 - numberOfHexagonsInARow);
                        this.hexagons[index].neighbors.push(index - numberOfHexagonsInARow);
                    }
                    if (!bottomBorder) {
                        this.hexagons[index].neighbors.push(index + numberOfHexagonsInARow);
                        if (!leftBorder)
                            this.hexagons[index].neighbors.push(index - 1 + numberOfHexagonsInARow);
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
});
*/
/*
// lineNeighbors
for (var row = 0; row < numberOfHexagonsInAColumn + 1; row++) {
    
    var oddrow = 0;
    if ((row % 2) == 1)
        oddrow = 1;
    
    for (var column = 0; column < numberOfHexagonsInARow * 2 + 1; column++) {
        var lineNumber = (row * (numberOfHexagonsInARow * 3 + 2)) + column;
        var neighborLine;
        
        if (column != 0) {
            neighborLine = lineNumber - 1;
            this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
        }
        
        if ((row % 2) == 0) {
            if (column != 0) {
                neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 2 + column;
                this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            }
            neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 1 + column;
            this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
        }
        if ((row % 2) == 1) {
            neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 1 + column;
            this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            if (column != numberOfHexagonsInARow) {
                neighborLine = lineNumber - numberOfHexagonsInARow * 2 + column;
                this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            }
        }
            
        if (column != numberOfHexagonsInARow) {
            neighborLine = lineNumber + 1;
            this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
        }
        
        if ((row % 2) == 0 && ) {
            if ((column % 2) == 0) {
                neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 2 + column;
                this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            } else {
                neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 1 + column;
                this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            }
        }
        if ((row % 2) == 1) {
            neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 1 + column;
            this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            if (column != numberOfHexagonsInARow) {
                neighborLine = lineNumber - numberOfHexagonsInARow * 2 + column;
                this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            }
        }
    }
    
    if (row < numberOfHexagonsInAColumn) {
        for (var column = 0; column < numberOfHexagonsInARow + 1; column++) {
            var lineNumber = (row * (numberOfHexagonsInARow * 3 + 2)) + numberOfHexagonsInARow * 2 + 1 + column;
            
            var neighborLine;
            
            if ((row % 2) == 0) {
                if (column != 0) {
                    neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 2 + column;
                    this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
                }
                neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 1 + column;
                this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
            }
            if ((row % 2) == 1) {
                neighborLine = lineNumber - numberOfHexagonsInARow * 2 - 1 + column;
                this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
                if (column != numberOfHexagonsInARow) {
                    neighborLine = lineNumber - numberOfHexagonsInARow * 2 + column;
                    this.lines[lineNumber].neighbors.push(this.lines[neighborLine]);
                }
            }
        }
    }
}
*/