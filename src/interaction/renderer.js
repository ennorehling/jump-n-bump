import { player } from "../game/game";
import { env } from "../interaction/game_session";
import { rabbit_gobs } from "../asset_data/rabbit_gobs";

export function Renderer(canvas, img, level) {
    "use strict";
    var main = { num_pobs: 0, pobs: [] };
    var leftovers = { num_pobs: 0, pobs: [] };
    var canvas_scale = 1;
    var ctx = canvas.getContext('2d');

    var MAX = {
        POBS: 200,
        FLIES: 20,
        LEFTOVERS: 50,
    };

    this.add_leftovers = function(x, y, image, gob) {
        leftovers.pobs[leftovers.num_pobs] = { x: x, y: y, gob: gob, image: image };
        leftovers.num_pobs++;
    }

    this.add_pob = function(x, y, image, gob) {
        if (main.num_pobs >= MAX.POBS) {
            return;
        }
        main.pobs[main.num_pobs] = { x: x, y: y, gob: gob, image: image };
        main.num_pobs++;
    }

    function put_pob(x, y, gob, img) {
        var sx, sy, sw, sh, hs_x, hs_y;
        sx = gob.x;
        sy = gob.y;
        sw = gob.width;
        sh = gob.height;
        hs_x = gob.hotspot_x;
        hs_y = gob.hotspot_y;
        ctx.drawImage(img, sx, sy, sw, sh, x - hs_x, y - hs_y, sw, sh);
    }

    function draw_pobs() {
        for (var c1 = main.num_pobs - 1; c1 >= 0; c1--) {
            var pob = main.pobs[c1];
            put_pob(pob.x, pob.y, pob.gob, pob.image);
        }
    }

    function draw_leftovers() {
        for (var c1 = 0; c1 != leftovers.num_pobs; ++c1) {
            var pob = leftovers.pobs[c1];
            put_pob(pob.x, pob.y, pob.gob, pob.image);
        }
    }


    function resize_canvas() {
        var x_scale = window.innerWidth / level.image.width;
        var y_scale = window.innerHeight / level.image.height;
        var new_scale = Math.floor(Math.min(x_scale, y_scale));

        if (canvas_scale != new_scale) {
            canvas_scale = new_scale;
            canvas.width = 0;
            canvas.height = 0;
            canvas.width = level.image.width * canvas_scale;
            canvas.height = level.image.height * canvas_scale;
            ctx.scale(canvas_scale, canvas_scale);
        }
    }

    this.draw = function () {
        resize_canvas();

        ctx.drawImage(level.image, 0, 0);

        for (var i = 0; i < env.JNB_MAX_PLAYERS; i++) {
            if (player[i].enabled) {
                this.add_pob(player[i].x.pos >> 16, player[i].y.pos >> 16, img.rabbits, rabbit_gobs[player[i].get_image() + i * 18]);
            }
        }
        draw_leftovers();
        draw_pobs();

        ctx.drawImage(level.mask, 0, 0);
        main.num_pobs = 0;
    }
};