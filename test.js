function test()
{
    var triangles = generateTriangleArray(600, 300, 30);
    var countries = generateMap(triangles, 3);
    for (var i = 0; i < countries.length; i++) {
        // console.log(countries[i].triangles.length);
        drawCountry(countries[i].trianglesInCountry);
    }
    
    /*
    for (var i = 0; i < triangles.length; i++) {
        if (triangles[i].countryID == -1)
            console.log(i + ' belongs to ' + triangles[i].countryID);
    };
    
    var startID = rand(0, triangles.length - 1);
    var tempCountry = new Country();
    tempCountry.triangles.push(startID);
    tempCountry.ID = 0;
    triangles[startID].countryID = 0;
    
    var possibleNeighbors = getPossibleNeighbors(tempCountry, triangles);
    
    for (var i = 0; i < possibleNeighbors.length; i++) {
        console.log(possibleNeighbors[i]);
    };*/
}

function holeTest()
{
    var triangles = generateTriangleArray(100, 100, 5);
    triangles[0].countryID = 1;
    triangles[1].countryID = 1;
    triangles[2].countryID = 1;
    triangles[10].countryID = 1;
    triangles[13].countryID = 1;
    triangles[22].countryID = 1;
    
    console.log(isTriangleInAHole(triangles, 11, 5));
}

holeTest();

// test();