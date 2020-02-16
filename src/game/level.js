import { LEVEL_SCALE_FACTOR, LEVEL_WIDTH } from "../asset_data/default_levelmap";
export var SQUARE_SIZE = 1 << LEVEL_SCALE_FACTOR;
export var BAN_VOID	= 0;
export var BAN_SOLID	= 1;
export var BAN_WATER	= 2;
export var BAN_ICE		= 3;
export var BAN_SPRING	= 4;

let ban_map;

export function SET_BAN_MAP(new_ban_map) {
    ban_map = new_ban_map;
}

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
