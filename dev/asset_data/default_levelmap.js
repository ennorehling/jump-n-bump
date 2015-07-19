var LEVEL_SCALE_FACTOR = 4;
var LEVEL_WIDTH = 22;
var LEVEL_HEIGHT = 16;

function create_default_level() {
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
    return { ban_map: ban_map, image: document.getElementById('level'), mask: document.getElementById('mask') };
}
