import { env } from "../interaction/game_session";
import { BAN_VOID, BAN_SPRING, GET_BAN_MAP } from "../game/level";
import { LEVEL_HEIGHT, LEVEL_WIDTH, LEVEL_SCALE_FACTOR } from "../asset_data/default_levelmap";

export function Objects(rnd) {
    "use strict";
    var self = this;
    this.objects = [];

    this.SPRING = 0;
    this.SPLASH = 1;
    this.SMOKE = 2;
    this.YEL_BUTFLY = 3;
    this.PINK_BUTFLY = 4;
    this.FUR = 5;
    this.FLESH = 6;
    this.FLESH_TRACE = 7;

    this.ANIM_SPRING = 0;
    this.ANIM_SPLASH = 1;
    this.ANIM_SMOKE = 2;
    this.ANIM_YEL_BUTFLY_RIGHT = 3;
    this.ANIM_YEL_BUTFLY_LEFT = 4;
    this.ANIM_PINK_BUTFLY_RIGHT = 5;
    this.ANIM_PINK_BUTFLY_LEFT = 6;
    this.ANIM_FLESH_TRACE = 7;

    this.add = function (type, x, y, x_add, y_add, anim, frame) {
        for (var c1 = 0; c1 < env.MAX_OBJECTS; c1++) {
            if (!this.objects[c1].used) {
                this.objects[c1].used = true;
                this.objects[c1].type = type;
                this.objects[c1].x = { pos: x << 16, velocity: x_add, acceleration: 0 };
                this.objects[c1].y = { pos: y << 16, velocity: y_add, acceleration: 0 };
                this.objects[c1].anim = anim;
                this.objects[c1].frame = frame;
                if (frame < env.animation_data.objects[anim].num_frames) {
                    this.objects[c1].ticks = env.animation_data.objects[anim].frame[frame].ticks;
                    this.objects[c1].image = env.animation_data.objects[anim].frame[frame].image;
                }
                break;
            }
        }
    }

    this.add_gore = function (x, y, c2) {
        var c4;
        for (c4 = 0; c4 < 6; c4++)
            this.add(this.FUR, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 44 + c2 * 8);
        for (c4 = 0; c4 < 6; c4++)
            this.add(this.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 76);
        for (c4 = 0; c4 < 6; c4++)
            this.add(this.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 77);
        for (c4 = 0; c4 < 8; c4++)
            this.add(this.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 78);
        for (c4 = 0; c4 < 10; c4++)
            this.add(this.FLESH, (x >> 16) + 6 + rnd(5), (y >> 16) + 6 + rnd(5), (rnd(65535) - 32768) * 3, (rnd(65535) - 32768) * 3, 0, 79);
    }

    var create_butterfly = function (obj) {
        while (1) {
            var s1 = rnd(LEVEL_WIDTH);
            var s2 = rnd(LEVEL_HEIGHT);
            if (GET_BAN_MAP(s2, s1) == BAN_VOID) {
                self.add(obj, (s1 << LEVEL_SCALE_FACTOR) + 8, (s2 << LEVEL_SCALE_FACTOR) + 8, (rnd(65535) - 32768) * 2, (rnd(65535) - 32768) * 2, 0, 0);
                break;
            }
        }
    }

    this.reset_objects = function () {
        var c1, c2;
        var idx = 0;

        this.objects = [];
        for (c1 = 0; c1 < env.MAX_OBJECTS; c1++) {
            this.objects[c1] = { used: false };
        }
        for (c1 = 0; c1 < LEVEL_HEIGHT; c1++) {
            for (c2 = 0; c2 < LEVEL_WIDTH; c2++) {
                if (GET_BAN_MAP(c2, c1) == BAN_SPRING) {
                    this.add(this.SPRING, c2 << LEVEL_SCALE_FACTOR, c1 << LEVEL_SCALE_FACTOR, 0, 0, this.ANIM_SPRING, 5);
                }
            }
        }
        create_butterfly(this.YEL_BUTFLY);
        create_butterfly(this.YEL_BUTFLY);
        create_butterfly(this.PINK_BUTFLY);
        create_butterfly(this.PINK_BUTFLY);
        return objects;
    }
}
    