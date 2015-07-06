var objects;
var object_anims;


var OBJ_SPRING = 0;
var OBJ_SPLASH = 1;
var OBJ_SMOKE = 2;
var OBJ_YEL_BUTFLY = 3;
var OBJ_PINK_BUTFLY = 4;
var OBJ_FUR = 5;
var OBJ_FLESH = 6;
var OBJ_FLESH_TRACE = 7;
var objects = [];

var OBJ_ANIM_SPRING = 0;
var OBJ_ANIM_SPLASH = 1;
var OBJ_ANIM_SMOKE = 2;
var OBJ_ANIM_YEL_BUTFLY_RIGHT = 3;
var OBJ_ANIM_YEL_BUTFLY_LEFT = 4;
var OBJ_ANIM_PINK_BUTFLY_RIGHT = 5;
var OBJ_ANIM_PINK_BUTFLY_LEFT = 6;
var OBJ_ANIM_FLESH_TRACE = 7;

function create_object_anims() {
    object_anims = [];
    var object_anim_data = [
        [ 6, 0, [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [0, 0], [0, 0], [0, 0], [0, 0]]], 
        [ 9, 0, [[6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [0, 0]]],
        [ 5, 0, [[15, 3], [16, 3], [16, 3], [17, 3], [18, 3], [19, 3], [0, 0], [0, 0], [0, 0], [0, 0]]],
        [ 10, 0, [[20, 2], [21, 2], [22, 2], [23, 2], [24, 2], [25, 2], [24, 2], [23, 2], [22, 2], [21, 2]]],
        [ 10, 0, [[26, 2], [27, 2], [28, 2], [29, 2], [30, 2], [31, 2], [30, 2], [29, 2], [28, 2], [27, 2]]],
        [ 10, 0, [[32, 2], [33, 2], [34, 2], [35, 2], [36, 2], [37, 2], [36, 2], [35, 2], [34, 2], [33, 2]]],
        [ 10, 0, [[38, 2], [39, 2], [40, 2], [41, 2], [42, 2], [43, 2], [42, 2], [41, 2], [40, 2], [39, 2]]],
        [ 4, 0, [[76, 4], [77, 4], [78, 4], [79, 4], [0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [ 0, 0], [0, 0]]]
    ];
    for (var i=0;i!=8;++i) {
        var frames = [];
        for (var j=0;j!=10;++j) {
            frames[j] = {
                image: object_anim_data[i][2][j][0],
                ticks: object_anim_data[i][2][j][1]
            };
        }
        object_anims[i] = { 
            num_frames : object_anim_data[i][0],
            restart_frame : object_anim_data[i][1],
            frame : frames
        };
    }
}

function add_object(type, x, y, x_add, y_add, anim, frame) {
    for (var c1 = 0; c1 < env.render.max.OBJECTS; c1++) {
        if (!objects[c1].used) {
            objects[c1].used = true;
            objects[c1].type = type;
            objects[c1].x = x << 16;
            objects[c1].y = y << 16;
            objects[c1].x_add = x_add;
            objects[c1].y_add = y_add;
            objects[c1].x_acc = 0;
            objects[c1].y_acc = 0;
            objects[c1].anim = anim;
            objects[c1].frame = frame;
            if (frame<object_anims[anim].num_frames) {
                objects[c1].ticks = object_anims[anim].frame[frame].ticks;
                objects[c1].image = object_anims[anim].frame[frame].image;
            }
            break;
        }
    }
}

function add_gore(x, y, c2) {
    var c4;
    for (c4 = 0; c4 < 6; c4++)
        add_object(OBJ_FUR, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 44 + c2 * 8);
    for (c4 = 0; c4 < 6; c4++)
        add_object(OBJ_FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 76);
    for (c4 = 0; c4 < 6; c4++)
        add_object(OBJ_FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 77);
    for (c4 = 0; c4 < 8; c4++)
        add_object(OBJ_FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 78);
    for (c4 = 0; c4 < 10; c4++)
        add_object(OBJ_FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 79);
}

function create_butterfly(obj) {
    while (1) {
        var s1 = rnd(LEVEL_WIDTH);
        var s2 = rnd(LEVEL_HEIGHT);
        if (GET_BAN_MAP(s2, s1) == BAN_VOID) {
            add_object(obj, (s1 << LEVEL_SCALE_FACTOR) + 8, (s2 << LEVEL_SCALE_FACTOR) + 8, (rnd(65535) - 32768) * 2, (rnd(65535) - 32768) * 2, 0, 0);
            break;
        }
    }
}

function create_objects() {
    var c1, c2;
    var idx = 0;

    objects = [];
    for (c1 = 0; c1 < env.render.max.OBJECTS; c1++) {
        objects[c1] = { used : false };
    }
    for (c1 = 0; c1 < LEVEL_HEIGHT; c1++) {
        for (c2 = 0; c2 < LEVEL_WIDTH; c2++) {
            if (GET_BAN_MAP(c2, c1) == BAN_SPRING) {
                add_object(OBJ_SPRING, c2 << LEVEL_SCALE_FACTOR, c1 << LEVEL_SCALE_FACTOR, 0, 0, OBJ_ANIM_SPRING, 5);
            }
        }
    }
    create_butterfly(OBJ_YEL_BUTFLY);
    create_butterfly(OBJ_YEL_BUTFLY);
    create_butterfly(OBJ_PINK_BUTFLY);
    create_butterfly(OBJ_PINK_BUTFLY);
    return objects;
}
