var map;

function toHex(dec) {
    // create list of hex characters
    var hexCharacters = "0123456789ABCDEF"
    // if number is out of range return limit
    if (dec < 0)
        return "00"
    if (dec > 255)
        return "FF"

    // decimal equivalent of first hex character in converted number
    var i = Math.floor(dec / 16)
    // decimal equivalent of second hex character in converted number
    var j = dec % 16
    // return hexadecimal equivalent
    return hexCharacters.charAt(i) + hexCharacters.charAt(j)
}


function initMap()
{
    map = Raphael("map", 1000, 500);
}
/*
function drawCountry(country)
{
    map.clear();
    
    var trianglesLength = country.triangles.length;
    
    for (var i = 0; i < trianglesLength; i++) {
        for (var j = 0; j < 3; j++) {
            
            if (j == 2)
                var k = 0;
            else
                var k = j+1;
            
            var line = "M " + country.triangles[i].vertex[j].x + " " + country.triangles[i].vertex[j].y;
            line += "L " + country.triangles[i].vertex[k].x + " " + country.triangles[i].vertex[k].y;
            
            line = map.path(line); 
        }
    }
}
*/
function drawCountry(triangles)  //(country)
{
    // map.clear();#
    
    var color = "#"+toHex(rand(0,255));
    color += toHex(rand(0,255));
    color += toHex(rand(0,255));
    
    for (var i = 0; i < triangles.length; i++) {
        
        var line = "M " + triangles[i].vertex[0].x + " " + triangles[i].vertex[0].y;
        line += "L " + triangles[i].vertex[1].x + " " + triangles[i].vertex[1].y;
        line += "L " + triangles[i].vertex[2].x + " " + triangles[i].vertex[2].y + " Z";
        
        line = map.path(line);
        line.attr("stroke", color);
        line.attr("fill", color);
        line.attr("stroke", color);
    }
}


function drawCountryInColor(triangles, color)  //(country)
{
    // map.clear();#
    
    for (var i = 0; i < triangles.length; i++) {
        
        var line = "M " + triangles[i].vertex[0].x + " " + triangles[i].vertex[0].y;
        line += "L " + triangles[i].vertex[1].x + " " + triangles[i].vertex[1].y;
        line += "L " + triangles[i].vertex[2].x + " " + triangles[i].vertex[2].y + " Z";
        
        line = map.path(line);
        line.attr("fill", color);
        
    }
}

