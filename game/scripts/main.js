

var main_info = {
    draw_page : null,
    music_no_sound : false,
    no_gore : false,
    page_info : {
        num_pobs : 0,
        pobs : []
    }
};


var env = {
    JNB_MAX_PLAYERS: 4,
    next_time: 0,
    settings: {
            is_server: true,
            jetpack: 0,
            pogostick: 0,
            bunnies_in_space: 0,
            flies_enabled: 0,
            blood_is_thicker_than_water: 0
        },
    sfx: new Sfx(new Sound_Player()),
    ai: new AI([false, false, false, true]),
    render: {
        canvas_scale: 1,
        max: {
            OBJECTS: 200,
            POBS: 200,
            FLIES: 20,
            LEFTOVERS: 50,
        }
    },
    animation_data: new Animation_Data()
};


var keys_pressed = {}
function key_pressed(key) {
    return keys_pressed[key];
}

function addkey(i, k) {
    keys_pressed[player[i].keys[k]] = true;
}

function delkey(i, k) {
    keys_pressed[player[i].keys[k]] = false;
}


function init() {
    var canvas = document.getElementById('screen');
    var img = {};
    img.level = document.getElementById('level');
    img.mask = document.getElementById('mask');
    img.rabbits = document.getElementById('rabbits');
    img.objects = document.getElementById('objects');
    img.numbers = document.getElementById('numbers');

    var game = new Game(canvas, img);
    game.start();

}

function rnd(max_value) {
    return Math.floor(Math.random()*max_value);
}

var player = [];

function Game(canvas, img) {

    var ctx = canvas.getContext('2d');
    var renderer = new Renderer(ctx, img);

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
            if (evt.altKey) env.ai.toggleForPlayer(i);
            else togglePlayerEnabled(i);
        } else if (evt.keyCode == 77) { // 'm'
            main_info.music_no_sound = !main_info.music_no_sound;
            if (main_info.music_no_sound) {
                env.sfx.silence_all();
            } else {
                env.sfx.music();
            }
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
        env.ai.cpu_move();
        update_player_actions();
        for (var playerIndex = 0; playerIndex != player.length; ++playerIndex) {
            var p = player[playerIndex];
            if (p.enabled) {
                if (!p.dead_flag) {
                    steer_player(p);
                }
                p.update_player_animation();
            }
        }
    }


    function game_loop() {
        steer_players();
        collision_check(renderer, img);
        main_info.page_info.num_pobs = 0;
        update_object_animations(renderer, img);
        renderer.draw();
    }

    function debug(str) {
        document.getElementById('debug').innerHTML = str;
    }

    function pump() {
        while (1) {

            resize_canvas();
            game_loop();
            var now = timeGetTime();
            var time_diff = env.next_time - now;
            env.next_time += (1000 / 60);

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

        if (env.render.canvas_scale != new_scale) {
            env.render.canvas_scale = new_scale;
            canvas.width = 0;
            canvas.height = 0;
            canvas.width = img.level.width * env.render.canvas_scale;
            canvas.height = img.level.height * env.render.canvas_scale;
            ctx.scale(env.render.canvas_scale, env.render.canvas_scale);
        }
    }

    function init_level() {
        create_map();
        create_objects();

        for (var c1 = 0; c1 < env.JNB_MAX_PLAYERS; c1++) {
            if (player[c1].enabled) {
                player[c1].bumps = 0;
                for (var c2 = 0; c2 < env.JNB_MAX_PLAYERS; c2++) {
                    player[c1].bumped[c2] = 0;
                }
                position_player(c1);
            }
        }
    }

    function gup(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return "";
        else
            return results[1];
    }

    this.start = function() {
        if (gup('nosound') == '1') main_info.music_no_sound = true;
        if (gup('pogostick') == '1') env.settings.pogostick = 1;
        if (gup('jetpack') == '1') env.settings.jetpack = 1;
        if (gup('space') == '1') env.settings.bunnies_in_space = 1;

        ctx.mozImageSmoothingEnabled = false;

        player = [];
        player[0] = new Player(0, [37, 39, 38]);
        player[1] = new Player(1, [65, 68, 87]);
        player[2] = new Player(2, [100, 102, 104]);
        player[3] = new Player(3, [74, 76, 73]);

        init_level();

        document.onkeydown = onKeyDown;
        document.onkeyup = onKeyUp;
        env.next_time = timeGetTime() + 1000;

        env.sfx.music();
        pump();
    }
}