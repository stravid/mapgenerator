var map;

function toHex(dec) {
    // create list of hex characters
    var hexCharacters = "0123456789ABCDEF";
    // if number is out of range return limit
    if (dec < 0)
        return "00";
    if (dec > 255)
        return "FF";

    // decimal equivalent of first hex character in converted number
    var i = Math.floor(dec / 16);
    // decimal equivalent of second hex character in converted number
    var j = dec % 16;
    // return hexadecimal equivalent
    return hexCharacters.charAt(i) + hexCharacters.charAt(j);
}


function initMap()
{
    map = Raphael("map", 1000, 500);
}

/*
function drawCountry(hexagons, hexagonIDs, color)
{   
    if (!isDefined(color)) {
        var color = "#"+toHex(rand(0,255));
        color += toHex(rand(0,255));
        color += toHex(rand(0,255));
    }
    
    for (var i = 0; i < hexagonIDs.length; i++) {
        
        var line = "M " + hexagons[hexagonIDs[i]].elements[0].x + " " + hexagons[hexagonIDs[i]].elements[0].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[1].x + " " + hexagons[hexagonIDs[i]].elements[1].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[2].x + " " + hexagons[hexagonIDs[i]].elements[2].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[3].x + " " + hexagons[hexagonIDs[i]].elements[3].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[4].x + " " + hexagons[hexagonIDs[i]].elements[4].y;
        line += "L " + hexagons[hexagonIDs[i]].elements[5].x + " " + hexagons[hexagonIDs[i]].elements[5].y + " Z";
        
        line = map.path(line);
        line.attr("stroke", color);
        line.attr("fill", color);
    }
}*/

function drawCountry(points, color) {
    
    if (!$defined(color)) {
        var color = "#"+toHex(rand(0,255));
        color += toHex(rand(0,255));
        color += toHex(rand(0,255));
    }
    
    var line = "M " + points[0].x + " " + points[0].y;
    for (var i = 1; i < points.length; i++) {
        line += "L " + points[i].x + " " + points[i].y;
    }
    line += " Z";
    
    line = map.path(line).attr("fill", color);
}

function drawLines(lines, color)
{       
    for (var i = 0; i < lines.length; i++) {
        var line = "M " + lines[i].points[0].x + " " + lines[i].points[0].y;
        line += "L " + lines[i].points[1].x + " " + lines[i].points[1].y;
        line = map.path(line).attr({stroke: color});
    }
}



