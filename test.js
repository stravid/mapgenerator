function test()
{
    var triangles = generateTriangleArray(10, 10, 10);
    var startID = rand(0, triangles.length - 1);
    var tempCountry = new Country();
    tempCountry.triangles.push(startID);
    tempCountry.ID = 0;
    triangles[startID].countryID = 0;
    
    var possibleNeighbors = getPossibleNeighbors(tempCountry, triangles);
    
    for (var i = 0; i < possibleNeighbors.length; i++) {
        console.log(possibleNeighbors[i]);
    }
}

test();