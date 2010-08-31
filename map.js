/* Helpers and native extentions */
function rand(minimum, maximum) {
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

Array.prototype.contains = function(item, from) {
    return this.indexOf(item, from) != -1;
};

Array.prototype.include = function(item) {
    if (!this.contains(item))
        this.push(item);
    
    return this;  
};

Array.prototype.combine = function(array) {
    for (var i = 0, length = array.length; i < length; i++) {
        this.include(array[i]);
    }
    
    return this;
};

if (!Array.prototype.forEach) {
    // FIXME: WTF
    Array.prototype.forEach = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        
        if (typeof fun != "function")
            throw new TypeError();
    
        var thisp = arguments[1];
        
        for (var i = 0; i < len; i++) {
            if (i in this)
                fun.call(thisp, this[i], i, this);
        }
    };
}

Array.prototype.each = Array.prototype.forEach;

function Map(width, height, hexagonSize, useCompactShapes) {
    this.points = new Array();
    this.lines = new Array();
    this.hexagons = new Array();
    this.usedHexagons = new Array();
    this.countries = new Array();
    this.regions = new Array();
    this.width = width;
    this.height = height;
    this.hexagonSize = hexagonSize;
    this.useCompactShapes = useCompactShapes;
    
    console.log(this.useCompactShapes);
};

Map.prototype.generateHexagonArray = function(useDistortion) {
    var hexagonWidth = Math.sqrt(3) * this.hexagonSize / 2;
    var numberOfHexagonsInARow = parseInt((this.width / hexagonWidth) - 0.5 );
    var numberOfHexagonsInAColumn = parseInt(((4 * this.height) / (3 * this.hexagonSize) ) - (1 / 3) );
    
    // pointArray
    for (var row = 0; row < numberOfHexagonsInAColumn + 1; row++) {
        for (var column = 0; column < numberOfHexagonsInARow + 1; column++) {
            var x, y, phi, r;
            
            x = column * hexagonWidth;
            
            if ((row % 2) == 1)
                y = row * this.hexagonSize * 0.75;
            else
                y = row * this.hexagonSize * 0.75 + 0.25 * this.hexagonSize;
             
            if (useDistortion) {   
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
                
            if (useDistortion) {   
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
};

Map.prototype.getRandomNeighborHexagon = function(country) {
    var possibleNeighbors = country.getNeighborHexagons(this.useCompactShapes);
    
    if (possibleNeighbors.length > 0)
        return possibleNeighbors[rand(0, possibleNeighbors.length - 1)];
    else
        return false; 
};

Map.prototype.holeChecker = function(hexagon, maximumHoleSize) {
    var freeHexagons = new Array();
        
    freeHexagons.push(hexagon);
    
    for (var i = 0; i < freeHexagons.length; i++) {
        if (freeHexagons.length >= maximumHoleSize)
            return false;
        
        for (var j = 0; j < freeHexagons[i].neighbors.length; j++) {
            if (!freeHexagons[i].neighbors[j].used) {
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
};

Map.prototype.generateCountry = function(ID, neighborCountry, size, maximumHoleSize) {
    var country = new Country();
    var startHexagon;
    
    country.ID = ID;
    
    if (size > maximumHoleSize)
        maximumHoleSize = size;
        
    if (neighborCountry != null) {
        do {
            startHexagon = this.getRandomNeighborHexagon(neighborCountry);
            
            // FIXME: Error handling, where and how should that happen?
            if (!startHexagon)
                return null;
            
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
};

Map.prototype.normalGenerator = function(numberOfCountries, countrySizeVariance, maximumHoleSize) {
    var averageCountrySize = parseInt(this.hexagons.length * 0.6 / numberOfCountries);        

    for (var i = 0; i < numberOfCountries; i++) {
        var sign;
        
        if (rand(0, 1) == 1)
            sign = 1;
        else
            sign = -1;
        
        if (countrySizeVariance < 0 || countrySizeVariance > 0.9)
            countrySizeVariance = 0;
        
        var countrySize = (averageCountrySize + rand(0, parseInt(averageCountrySize * countrySizeVariance)) * sign);
        
        if (this.countries.length > 0) {
            var globalCountry = new Country();
            
            globalCountry.hexagons = this.usedHexagons;
            this.countries.push(this.generateCountry(i, globalCountry, countrySize, maximumHoleSize));
        }
        else 
            this.countries.push(this.generateCountry(i, null, countrySize, maximumHoleSize));   
    }
};

Map.prototype.getCountryNeighbors = function() {
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
};

Map.prototype.deleteCountryHoles = function() {
    var length = this.countries.length
    
    for (var i = 0; i < length; i++) {
        if (this.countries[i].holeLines != undefined) {
            var country = this.countries[i];
            
            while ( 0 < country.holeLines.length) {
                var hexLength = this.hexagons.length;
                
                for (var j = 0; j < hexLength; j++) {
                    if (this.hexagons[j].lines.contains(country.holeLines[0]) && 
                        !country.hexagons.contains(this.hexagons[j])) {
                        
                        country.hexagons.push(this.hexagons[j]);
                        for (var k = 0; k < 6; k++) {
                            if (!country.inlines.contains(this.hexagons[j].lines[k]))
                                country.inlines.push(this.hexagons[j].lines[k]);
                        }
                            
                        for (var k = 0; k < 6; k++) {
                            country.holeLines.erase(this.hexagons[j].lines[k]);
                        }
                        
                        break;
                    }
                }
            }
        }
    }
};

Map.prototype.calculateOutlines = function() {
    for (var i = 0; i < this.countries.length; i++) {
        this.countries[i].generateOutline();
    }        
};
    
Map.prototype.calculateCenters = function() {
   for (var i = 0; i < this.countries.length; i++) {
        this.countries[i].getCenter();
    } 
};