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
    hexagonSize:0,
                    
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
            console.warn('Hexagon is in a hole!');
            return true;  
        }
            
    },
    
    generateCountries: function(numberOfPlayers, countriesPerPlayer, countrySizeVariance, maximumHoleSize) {
        var averageAmountOfHexagonsPerCountry = parseInt(this.hexagons.length / (numberOfPlayers * countriesPerPlayer) * 2 / 3);
        
        this.usedHexagons = new Array();
        
        console.info('Total amount of hexagons: ' + this.hexagons.length);
        console.info('Average amount of hexagons per country: ' + averageAmountOfHexagonsPerCountry);
        console.info('Amount of countries: ' + numberOfPlayers * countriesPerPlayer);
        
        // FIXME: if the amount if countries is to big the system is fucked in some cases..
        for (var i = 0; i < numberOfPlayers * countriesPerPlayer / 2; i++) {
            console.info('New country index: ' + i);
            
            var startID;
            
            if (i == 0) {
                startID = rand(0, this.hexagons.length - 1);
            }
            else {
                var randomCountry = new Country();
                randomCountry.elements = this.usedHexagons;
                startID = this.getNewHexagonNeighborID(randomCountry);
            }
            
            this.hexagons[startID].countryID = i;
            this.usedHexagons.push(startID);
            this.countries.push(new Country());
            this.countries[i].ID = i;
            this.countries[i].elements.push(startID);
            
            console.info('Start ID: ' + startID);
            
            var numberOfHexagons = averageAmountOfHexagonsPerCountry - rand(0, countrySizeVariance);
            
            console.info('Country will have ' + numberOfHexagons + ' hexagons');
            
            for (var j = 0; j < numberOfHexagons - 1; j++) {
                var newHexagonID;
                
                do {
                    newHexagonID = this.getNewHexagonNeighborID(this.countries[i]);
                } while (this.isHexagonInAHole(newHexagonID, maximumHoleSize))
                
                this.hexagons[newHexagonID].countryID = i;
                this.usedHexagons.push(newHexagonID);
                this.countries[i].elements.push(newHexagonID);
            }
            
            console.log(this.countries[i].elements);
        }
    },
    
    getNewHexagonNeighborID: function(country) {
        var newHexagonNeighbors = new Array();
        
        for (var i = 0; i < country.elements.length; i++) {
            newHexagonNeighbors = newHexagonNeighbors.combine(this.hexagons[country.elements[i]].neighbors);
        }
        
        var newHexagonIDs = new Array();
        
        for (var j = 0; j < newHexagonNeighbors.length; j++) {
            if (this.hexagons[newHexagonNeighbors[j]].countryID == -1)
                newHexagonIDs.push(this.hexagons[newHexagonNeighbors[j]].ID);
        }
        
        return newHexagonIDs[rand(0, newHexagonIDs.length - 1)];
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
                    
    getOutline: function(hexagonIDs) {
        var Points = getOutlinePoints(hexagonIDs);            
                    
        var outline = new Array();
        var FirstHexagonPoint = hexagons[getTopHexagonPoint(hexagonIDs)];
        var HexagonPoint = FirstHexagonPoint; 
                    
        do {
            outline.push(hexagonPoint);
            hexagonPoint = getNextHexagonPoint(hexagonIDs, hexagonPoint);
        }
        while (hexagonPoint != FirstHexagonPoint);
                    
        return outline;
    },
                    
    getOutlinePoints: function(hexagonIDs) {
        var points = new Array();
                    
        for (var i = hexagonIDs.length -1; i >= 0; i--) {
            for (var j = 5; j >= 0; j--) {
                var hexagonPoint = new Array();
                hexagonPoint.push(hexagons[hexagonIds[i]].elements[j].x);
                hexagonPoint.push(hexagons[hexagonIds[i]].elements[j].y);
                points.push(hexagonPoint)
            }
        }
                    
        for (var i = points.length - 1; i >= 0; i--) {
                        
        } 
    },
                    
    getTopHexagonPoint: function(hexagonIDs) {
        var hexagonID = 100000000;
        for (var i = 0; i < hexagonIDs.length; i++ ) {
            if (hexagonIDs[i] < hexagonID)
                hexagonID = hexagonIDs[i];
        }
            
        return hexagons[hexagonID].elements[0];
    },
                    
    getNextHexagonPoint: function(hexagonIDs, hexagonPoint) {
        for (var i = hexagonIDs.length - 1; i >= 0; i--) {
                        
        } 
    },
});

// BELOW THIS POINT ONLY OLD STUFF
var Triangle = new Class({
    vertex: new Array(new Point(), new Point(), new Point()),
    neighbors: new Array(),
    countryID: -1
});

function setNeighbors(triangles, numberOfTrianglesInARow)
{
    var leftBorder = true;
    var topBorder = true;
    var rightBorder = false;
    var bottomBorder = false;    
    var rows = triangles.length / numberOfTrianglesInARow;
    var index = 0;
    
    for (var i = 0; i < rows; i++) {
        leftBorder = true;
        
        if (i == (rows - 1))
                bottomBorder = true;
                
        for (var j = 0; j < numberOfTrianglesInARow; j++) {
            if (j == (numberOfTrianglesInARow - 1))
                rightBorder = true;
            
            if (!leftBorder)
                triangles[index].neighbors.push(index - 1);
            
            if (!rightBorder)
                triangles[index].neighbors.push(index + 1);
            
            if ((i % 2) == 1) {
                if ((index % 2) == 1) {
                    if (!topBorder)
                        triangles[index].neighbors.push((i - 1) * numberOfTrianglesInARow + j);
                }
                else {
                    if (!bottomBorder)
                        triangles[index].neighbors.push((i + 1) * numberOfTrianglesInARow + j);
                }
            }
            else {
                if ((index % 2) == 1) {
                    if (!bottomBorder)
                        triangles[index].neighbors.push((i + 1) * numberOfTrianglesInARow + j);
                }
                else {
                    if (!topBorder)
                        triangles[index].neighbors.push((i - 1) * numberOfTrianglesInARow + j);
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
    
    return triangles;
}

function generateTriangleArray(mapWidth, mapHeight, numberOfTrianglesInARow)
{
    var triangleWidth = parseInt(mapWidth / numberOfTrianglesInARow);
    var triangleHeight = Math.sqrt(triangleWidth * triangleWidth - (triangleWidth * triangleWidth)/4 );
    var numberOfTrianglesInAColumn = parseInt(mapHeight / triangleHeight);
    var numberOfTriangles = numberOfTrianglesInAColumn * numberOfTrianglesInARow;
    var triangles = new Array();
        
    for (var row = 0; row < numberOfTrianglesInAColumn; row++) {
        for (var column = 0; column < numberOfTrianglesInARow * 2; column++) {
            var tempTriangle = new Triangle();
            
            if ((row % 2) == (column % 2)) {
                tempTriangle.vertex[0].x = (column / 2) * triangleWidth;
                tempTriangle.vertex[0].y = row * triangleHeight;
                tempTriangle.vertex[1].x = ((column / 2) + 1) * triangleWidth;
                tempTriangle.vertex[1].y = row * triangleHeight;
                tempTriangle.vertex[2].x = (column / 2) * triangleWidth + triangleWidth / 2;
                tempTriangle.vertex[2].y = (row + 1) * triangleHeight;
            }
            else {
                tempTriangle.vertex[0].x = (column / 2) * triangleWidth;
                tempTriangle.vertex[0].y = (row + 1) * triangleHeight;
                tempTriangle.vertex[1].x = (column / 2) * triangleWidth + triangleWidth / 2;
                tempTriangle.vertex[1].y = row * triangleHeight;
                tempTriangle.vertex[2].x = ((column / 2) + 1) * triangleWidth;
                tempTriangle.vertex[2].y = (row + 1) * triangleHeight;
            }
            
            triangles.push(tempTriangle);
        }
    }
    
    triangles = setNeighbors(triangles, numberOfTrianglesInARow * 2);
    
    return triangles;    
}

function generateMap(triangles, numberOfPlayers)
{
    var numberOfTriangles = triangles.length;
    var countriesPerPlayer = 10;
    var averageAmountOfTrianglesPerCountry = numberOfTriangles / (numberOfPlayers * countriesPerPlayer) * 2 / 3;
    var usedTriangles = new Array();
    var countries = new Array();
    
    var startID = rand(0, numberOfTriangles - 1);    
    
    /*
    do {
        var startID = rand(0, numberOfTriangles - 1);    
    }while (!isValidStartID(startID, triangles));
*/    
    
    
    for (var countryID = 0; countryID < countriesPerPlayer * numberOfPlayers; countryID++) {
        var tempCountry = new Country();
        tempCountry.ID = countryID;
        var tempTriangles = triangles;
        var tempUsedTriangles = usedTriangles;
        
        if (countryID != 0) {
            var global = new Country();
            var usedTrianglesLength = usedTriangles.length;
            for (var i = 0; i < usedTrianglesLength; i++) {
                global.triangleIDs.push(usedTriangles[i]);
            }
            var possibleNeighbors = getPossibleNeighbors(global, triangles);
            var startID = possibleNeighbors[rand(0, possibleNeighbors.length - 1)];
            
            if (isTriangleInAHole(triangles, startID, averageAmountOfTrianglesPerCountry)) {
                countryID--;
                // console.warn('triangle is in hole');
                continue;
            }
        }
        
        usedTriangles.push(startID);
        tempCountry.triangleIDs.push(startID);
        tempCountry.trianglesInCountry.push(triangles[startID]);
        triangles[startID].countryID = countryID;
        
        var difference = rand(0, averageAmountOfTrianglesPerCountry / 2);
        for (var i = 0; i < averageAmountOfTrianglesPerCountry - difference; i++) {
            var possibleNeighbors = getPossibleNeighbors(tempCountry, triangles);
            // this should not happen at any time
            if (possibleNeighbors.length == 0) {
                console.error('Something FAILED');
                return 'fail';
            }
            
            do {
                var nextID = possibleNeighbors[rand(0, possibleNeighbors.length - 1)];
            } while(usedTriangles.contains(nextID))
            usedTriangles.push(nextID);
            triangles[nextID].countryID = countryID;
            tempCountry.triangleIDs.push(nextID);
            tempCountry.trianglesInCountry.push(triangles[nextID]);
        }
        
        countries.push(tempCountry);
        drawCountry(tempCountry.trianglesInCountry);
    }
    
    return countries;
}

function isValidStartID(startID, triangles)
{
    // TODO
    return true;
}

function getPossibleNeighbors(country, triangles)
{
    var possibleNeighbors = new Array();
    var amountOfTrianglesInCountry = country.triangleIDs.length;
    
    for (var i = 0; i < amountOfTrianglesInCountry; i++) {
        var triangleIndex = country.triangleIDs[i];
        var currentNeighbors = triangles[triangleIndex].neighbors;
        var amountOfNeighbors = currentNeighbors.length;
        
        for (var j = 0; j < amountOfNeighbors; j++) {
            if (triangles[currentNeighbors[j]].countryID == -1)
                possibleNeighbors.push(triangles[triangleIndex].neighbors[j]);
        }
    }
    if (possibleNeighbors.length == 0) {
        console.log(country);
    }
    return possibleNeighbors;
}

function rand(minimum, maximum)
{
    return Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;
}

function isTriangleInAHole(triangles, triangleID, averageAmountOfTrianglesPerCountry)
{
    var takenNeighbors = new Array();
    var freeNeighbors = new Array();
    if (!isDefined(triangleID))
        console.warn('FAIL BOY');
    freeNeighbors.push(triangleID);
    var freeNeighborsCounter = 1;
    var i = 0;
    var addedNewFreeNeighbor = true;
    var length;
    
    while (freeNeighborsCounter < averageAmountOfTrianglesPerCountry && addedNewFreeNeighbor) {
        addedNewFreeNeighbor = false;
        length = freeNeighbors.length;
        if (!isDefined(triangles[freeNeighbors[i]])) {
            console.log('index:' + i);
            console.log(freeNeighbors[i]);
        }
        for (i; i < length; i++) {
            for (var j = 0; j < triangles[freeNeighbors[i]].neighbors.length; j++) {
                var id = triangles[freeNeighbors[i]].neighbors[j];
                
                if (triangles[id].countryID == -1) {
                    if (!freeNeighbors.contains(id)) {
                        freeNeighborsCounter++;
                        freeNeighbors.push(id);
                        addedNewFreeNeighbor = true;
                    }
                }
                else
                    takenNeighbors.push(triangles[id].countryID);
            }
        }
    }
    
    var returnValue;
    var enoughNeighbors = false;
    
    if (freeNeighborsCounter >= averageAmountOfTrianglesPerCountry) {
        returnValue = false;
        enoughNeighbors = true;
    }
    else {
        var firstElement = takenNeighbors[0];
        
        for (var i = 0; i < takenNeighbors.length; i++) {
            if (firstElement != takenNeighbors[i])
                returnValue = false;
        }
        
        returnValue = true;
    }
    

    
    return returnValue;
}

function isDefined( variable)
{
    return (typeof(variable) == "undefined")?  false: true;
}

