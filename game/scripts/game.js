function Game(canvas, img, movement, sound_player, is_server) {
    var next_time = 0;
    var canvas_scale = 1;
    var ctx = canvas.getContext('2d');
    var renderer = new Renderer(ctx, img);
    var ai = new AI([false, false, false, true]);

    reset_players();
    reset_level();

    function reset_players() {
        player = [
        new Player(0, [37, 39, 38], is_server),
        new Player(1, [65, 68, 87], is_server),
        new Player(2, [100, 102, 104], is_server),
        new Player(3, [74, 76, 73], is_server)
        ];
    }

    function reset_level() {
        create_map();
        create_objects();

        for (var c1 = 0; c1 < env.JNB_MAX_PLAYERS; c1++) {
            if (player[c1].enabled) {
                player[c1].bumps = 0;
                for (var c2 = 0; c2 < env.JNB_MAX_PLAYERS; c2++) {
                    player[c1].bumped[c2] = 0;
                }
                player[c1].position_player(c1);
            }
        }
    }

    function timeGetTime() {
        return new Date().getTime();
    }

    function onKeyDown(evt) {
        keys_pressed[evt.keyCode] = true;
    }

    function togglePlayerEnabled(playerIndex) {
        player[playerIndex].enabled = !player[playerIndex].enabled;
    }

    function onKeyUp(evt) {
        keys_pressed[evt.keyCode] = false;
        if (evt.keyCode >= 49 && evt.keyCode <= 52) {
            var i = evt.keyCode - 49;
            if (evt.altKey) ai.toggleForPlayer(i);
            else togglePlayerEnabled(i);
        } else if (evt.keyCode == 77) { // 'm'
            sound_player.toggle_sound();
            debug(evt.keyCode);
        }
    }

    function update_player_actions() {
        for (var i = 0; i != player.length; ++i) {
            player[i].action_left = key_pressed(player[i].keys[0]);
            player[i].action_right = key_pressed(player[i].keys[1]);
            player[i].action_up = key_pressed(player[i].keys[2]);
        }
    }

    function steer_players() {
        ai.cpu_move();
        update_player_actions();
        for (var playerIndex = 0; playerIndex != player.length; ++playerIndex) {
            var p = player[playerIndex];
            if (p.enabled) {
                if (!p.dead_flag) {
                    movement.steer_player(p);
                }
                p.update_player_animation();
            }
        }
    }


    function game_iteration() {
        steer_players();
        movement.collision_check(renderer, img);
        update_object_animations(renderer, img);
        renderer.draw();
    }

    function debug(str) {
        document.getElementById('debug').innerHTML = str;
    }

    function pump() {
        while (1) {

            resize_canvas();
            game_iteration();
            var now = timeGetTime();
            var time_diff = next_time - now;
            next_time += (1000 / 60);

            if (time_diff > 0) {
                // we have time left
                setTimeout(pump, time_diff);
                break;
            }
            // debug("frametime exceeded: " + (-time_diff));
        }
    }

    function resize_canvas() {
        var x_scale = window.innerWidth / img.level.width;
        var y_scale = window.innerHeight / img.level.height;
        var new_scale = Math.floor(Math.min(x_scale, y_scale));

        if (canvas_scale != new_scale) {
            canvas_scale = new_scale;
            canvas.width = 0;
            canvas.height = 0;
            canvas.width = img.level.width * canvas_scale;
            canvas.height = img.level.height * canvas_scale;
            ctx.scale(canvas_scale, canvas_scale);
        }
    }

    this.start = function () {
        next_time = timeGetTime() + 1000;
        pump();
    }
}