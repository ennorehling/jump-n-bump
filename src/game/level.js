var SQUARE_SIZE = 1 << LEVEL_SCALE_FACTOR;
var BAN_VOID	= 0;
var BAN_SOLID	= 1;
var BAN_WATER	= 2;
var BAN_ICE		= 3;
var BAN_SPRING	= 4;

var ban_map;

export function GET_BAN_MAP_XY(x, y) {
    if (y<0) y = 0;
    return ban_map[(x >> LEVEL_SCALE_FACTOR) + (y >> LEVEL_SCALE_FACTOR) * LEVEL_WIDTH];
}

export function GET_BAN_MAP(x, y) {
    if (y < 0) y = 0;
    return ban_map[x + y * LEVEL_WIDTH];
}

export function GET_BAN_MAP_IN_WATER(s1, s2) {
    return (GET_BAN_MAP_XY((s1), ((s2) + 7)) == BAN_VOID || GET_BAN_MAP_XY(((s1) + 15), ((s2) + 7)) == BAN_VOID)
	&& (GET_BAN_MAP_XY((s1), ((s2) + 8)) == BAN_WATER || GET_BAN_MAP_XY(((s1) + 15), ((s2) + 8)) == BAN_WATER);
}
