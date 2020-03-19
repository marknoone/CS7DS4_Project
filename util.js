// Basic distance between two points
const util = {
    dist: function(x1, x2, y1, y2) {
        var a = x1 - x2;
        var b = y1 - y2;
        return Math.sqrt( a*a + b*b );
    }
}