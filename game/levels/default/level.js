var BAN_VOID	= 0;
var SCALE_FACTOR = 4;
var SQUARE_SIZE = 1 << SCALE_FACTOR;
var LEVEL_WIDTH = 22;
var LEVEL_HEIGHT = 16
var BAN_SOLID	= 1;
var BAN_WATER	= 2;
var BAN_ICE		= 3;
var BAN_SPRING	= 4;

var ban_map;

function GET_BAN_MAP_XY(x, y) {
    if (y<0) y = 0;
    return ban_map[(x >> SCALE_FACTOR) + (y >> SCALE_FACTOR) * LEVEL_WIDTH];
}

function GET_BAN_MAP(x, y) {
    if (y < 0) y = 0;
    return ban_map[x + y * LEVEL_WIDTH];
}

function GET_BAN_MAP_IN_WATER(s1, s2) {
    return (GET_BAN_MAP_XY((s1), ((s2) + 7)) == BAN_VOID || GET_BAN_MAP_XY(((s1) + 15), ((s2) + 7)) == BAN_VOID)
	&& (GET_BAN_MAP_XY((s1), ((s2) + 8)) == BAN_WATER || GET_BAN_MAP_XY(((s1) + 15), ((s2) + 8)) == BAN_WATER);
}
	
function create_map() {
    var levelmap =
        "1110000000000000000000" +
        "1000000000001000011000" +
        "1000111100001100000000" +
        "1000000000011110000011" +
        "1100000000111000000001" +
        "1110001111110000000001" +
        "1000000000000011110001" +
        "1000000000000000000011" +
        "1110011100000000000111" +
        "1000000000003100000001" +
        "1000000000031110000001" +
        "1011110000311111111001" +
        "1000000000000000000001" +
        "1100000000000000000011" +
        "2222222214000001333111" +
        "1111111111111111111111";
    ban_map = [];
    for (i=0; i != LEVEL_WIDTH * LEVEL_HEIGHT; ++i) {
        ban_map[i] = levelmap[i] * 1; //Convert to integer
    }
}
