function test()
{
    var triangles = generateTriangleArray(100, 100, 20);
    generateMap(triangles, 3);
    
    for (var i = 0; i < triangles.length; i++) {
        if (triangles[i].countryID == -1)
            console.log(i + ' belongs to ' + triangles[i].countryID);
    };
    /*var startID = rand(0, triangles.length - 1);
    var tempCountry = new Country();
    tempCountry.triangles.push(startID);
    tempCountry.ID = 0;
    triangles[startID].countryID = 0;
    
    var possibleNeighbors = getPossibleNeighbors(tempCountry, triangles);
    
    for (var i = 0; i < possibleNeighbors.length; i++) {
        console.log(possibleNeighbors[i]);
    };*/
}

test();