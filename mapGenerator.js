var Point = new Class({
    x: 0,
    y: 0    
});

var Triangle = new Class({
    vertex: new Array(new Point(), new Point(), new Point()),
    neighbors: new Array(),
    countryID: -1
});

var Country = new Class({
    triangles: new Array(),
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
    var averageAmountOfTrianglesPerCountry = numberOfTriangles / (numberOfPlayers * countriesPerPlayer);
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
                global.triangles.push(i);
            }
            var possibleNeighbors = getPossibleNeighbors(global, triangles);
            var startID = possibleNeighbors[rand(0, possibleNeighbors.length)];
        }
        
        usedTriangles.push(startID);
        tempCountry.triangles.push(startID);
        triangles[startID].countryID = countryID;
        
        var difference = rand(0, averageAmountOfTrianglesPerCountry / 2);
        var fail = false;
        for (var i = 0; i < averageAmountOfTrianglesPerCountry - difference; i++) {
            var possibleNeighbors = getPossibleNeighbors(tempCountry, triangles);
            if (possibleNeighbors.length == 0) {
                countryID--;
                fail = true;
                break;
            }
            var nextID = possibleNeighbors[rand(0, possibleNeighbors.length)];
            
            if (usedTriangles.contains(nextID))
                i--;
            else {
                usedTriangles.push(nextID);
                triangles[nextID].countryID = countryID;
                tempCountry.triangles.push(nextID);
            }
        }
        
        if (!fail)
            countries.push(tempCountry);
    }
    
    
}

function isValidStartID(startID, triangles)
{
    // TODO
    return true;
}

function getPossibleNeighbors(country, triangles)
{
    var possibleNeighbors = new Array();
    var amountOfTrianglesInCountry = country.triangles.length;
    // console.warn('executed');
    // console.log(amountOfTrianglesInCountry);
    for (var i = 0; i < amountOfTrianglesInCountry; i++) {
        var triangleIndex = country.triangles[i];
        var currentNeighbors = triangles[triangleIndex].neighbors;
        var amountOfNeighbors = currentNeighbors.length;
        
        for (var j = 0; j < amountOfNeighbors; j++) {
            if (triangles[currentNeighbors[j]].countryID == -1)
                possibleNeighbors.push(triangles[triangleIndex].neighbors[j]);
        }
    }
    return possibleNeighbors;
}

function rand(minimum, maximum)
{  
    return Math.floor(Math.random() * maximum + minimum);
}
