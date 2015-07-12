function Renderer(ctx, img) {
    var leftovers = { num_pobs: 0, pobs: [] };
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
        var page_info = main_info.page_info;
        if (page_info.num_pobs >= MAX.POBS) {
            return;
        }
        page_info.pobs[page_info.num_pobs] = { x: x, y: y, gob: gob, image: image };
        page_info.num_pobs++;
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
        var page_info = main_info.page_info;

        for (var c1 = page_info.num_pobs - 1; c1 >= 0; c1--) {
            var pob = page_info.pobs[c1];
            put_pob(pob.x, pob.y, pob.gob, pob.image);
        }
    }

    function draw_leftovers() {
        for (var c1 = 0; c1 != leftovers.num_pobs; ++c1) {
            var pob = leftovers.pobs[c1];
            put_pob(pob.x, pob.y, pob.gob, pob.image);
        }
    }

    this.draw = function() {

        ctx.drawImage(img.level, 0, 0);

        var page_info = main_info.page_info;

        for (var i = 0; i < env.JNB_MAX_PLAYERS; i++) {
            if (player[i].enabled) {
                this.add_pob(player[i].x >> 16, player[i].y >> 16, img.rabbits, rabbit_gobs[player[i].get_image() + i * 18]);
            }
        }
        draw_leftovers();
        draw_pobs();

        ctx.drawImage(img.mask, 0, 0);
    }

};