var Shape = new Class({
    elements: new Array(),
    ID: -1,
    neighbors: new Array()
});

var Point = new Class({
    x: 0,
    y: 0    
});

var Hexagon = new Class({
    Extends: Shape
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
    }
});

// BELOW THIS POINT ONLY OLD STUFF
var Triangle = new Class({
    vertex: new Array(new Point(), new Point(), new Point()),
    neighbors: new Array(),
    countryID: -1
});

var Country = new Class({
    trianglesInCountry: new Array(),
    triangleIDs: new Array(),
    ID: -1
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
                console.warn('triangle is in hole');
                continue;
            }
        }
        
        usedTriangles.push(startID);
        tempCountry.triangleIDs.push(startID);
        tempCountry.trianglesInCountry.push(triangles[startID]);
        triangles[startID].countryID = countryID;
        
        var difference = rand(0, averageAmountOfTrianglesPerCountry / 2);
        var fail = false;
        for (var i = 0; i < averageAmountOfTrianglesPerCountry - difference; i++) {
            var possibleNeighbors = getPossibleNeighbors(tempCountry, triangles);
            if (possibleNeighbors.length == 0) {
                countryID--;
                fail = true;
                // DEBUGGING
                console.warn('it seems like SOMETHING failed');
                console.log(tempCountry);
                console.log(startID);
                drawCountryInColor(tempCountry.trianglesInCountry, '#000000');
                return countries;
                break;
            }
            var nextID = possibleNeighbors[rand(0, possibleNeighbors.length - 1)];
            
            if (usedTriangles.contains(nextID))
                i--;
            else {
                usedTriangles.push(nextID);
                triangles[nextID].countryID = countryID;
                tempCountry.triangleIDs.push(nextID);
                tempCountry.trianglesInCountry.push(triangles[nextID]);
            }
        }
        
        if (!fail) {
            countries.push(tempCountry);
            drawCountry(tempCountry.trianglesInCountry);
        }
        
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
    
    /*if (returnValue) {
       console.warn('true returned');
    }
    else {
        console.warn('false returned');
        if (enoughNeighbors)
            console.info(enoughNeighbors);
        else
            console.log(takenNeighbors);
    }*/
    
    return returnValue;
}

function isDefined( variable)
{
    return (typeof(variable) == "undefined")?  false: true;
}
