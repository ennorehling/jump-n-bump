

var main_info = {
    draw_page : null,
    music_no_sound : false,
    no_gore : false,
    page_info : {
        num_pobs : 0,
        pobs : []
    }
};


var env =
{
    JNB_MAX_PLAYERS: 4,
    next_time: 0,
    settings:
        {
            is_server: true,
            jetpack: 0,
            pogostick: 0,
            bunnies_in_space: 0,
            flies_enabled: 0,
            blood_is_thicker_than_water: 0
        },
    sfx: new Sfx(new Sound_Player()),
    ai:
        {
            
            enabledForPlayer: [ false, false, false, true ],
        },
    render:
        {
            leftovers: { num_pobs: 0, pobs:[]},
            canvas_scale: 1,
            img:
                {
                   //objects,
                   //rabbits,
                   //level,
                   //mask,
                   //numbers
                },
            max:
                {
                    
                    OBJECTS: 200,
                    POBS: 200,
                    FLIES: 20,
                    LEFTOVERS: 50,
                }

        }

};

function rnd(max_value) {
    return Math.floor(Math.random()*max_value);
}

var player = [];
function create_player(keys) {
    return {
        action_left : false,
        action_up : false,
        action_right : false,
        enabled : false,
        dead_flag : false,
        bumps : false,
        bumped : [],
        x : 0, y : 0,
        x_add : 0, y_add : 0,
        direction : 0,
        jump_ready : false,
        jump_abort : false,
        in_water : false,
        anim : 0,
        frame : 0,
        frame_tick : 0,
        image : 0,
        keys : keys
    };
}

function timeGetTime() {
    return new Date().getTime();
}

var keys_pressed = {}
function onKeyDown(evt) {
    keys_pressed[evt.keyCode] = true;
}

function onKeyUp(evt) {
    keys_pressed[evt.keyCode] = false;
    if (evt.keyCode>=49 && evt.keyCode<=52) {
        var i = evt.keyCode-49;
        if (env.ai.enabledForPlayer[i] && player[i].enabled) player[i].enabled = false;
        else if (player[i].enabled) env.ai.enabledForPlayer[i] = true;
        else {
            player[i].enabled = true;
            env.ai.enabledForPlayer[i] = false;
        }
    } else if (evt.keyCode==77) { // 'm'
        main_info.music_no_sound = !main_info.music_no_sound;
        if (main_info.music_no_sound) {
            env.sfx.silence_all();
        } else {
            env.sfx.music();
        }
        debug(evt.keyCode);
    }
}

function key_pressed(key) {
    return keys_pressed[key];
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

function processKill(c1, c2, x, y)
{
    var s1 = 0;

    player[c1].y_add = -player[c1].y_add;
    if (player[c1].y_add > -262144)
        player[c1].y_add = -262144;
    player[c1].jump_abort = true;
    player[c2].dead_flag = true;
    if (player[c2].anim != 6) {
        player[c2].anim = 6;
        player[c2].frame = 0;
        player[c2].frame_tick = 0;
        player[c2].image = player_anims[player[c2].anim].frame[player[c2].frame].image + player[c2].direction * 9;
        if (main_info.no_gore == 0) {
            add_gore(x, y, c2);
        }
        env.sfx.death();
        player[c1].bumps++;
        player[c1].bumped[c2]++;
        s1 = player[c1].bumps % 100;
        if (s1 % 10 == 0) {
            add_leftovers(360, 34 + c1 * 64, env.render.img.numbers, number_gobs[Math.floor(s1/10)%10]);
        }
        add_leftovers(376, 34 + c1 * 64, env.render.img.numbers, number_gobs[s1 % 10]);
    }
}

function player_kill(c1, c2) {
    processKill(c1, c2, player[c2].x, player[c2].y);
}

function update_player_actions() {
    for (var i=0;i!=player.length;++i) {
        player[i].action_left = key_pressed(player[i].keys[0]);
        player[i].action_right = key_pressed(player[i].keys[1]);
        player[i].action_up = key_pressed(player[i].keys[2]);
    }
}

function player_action_left(p) {
    var s1 = 0, s2 = 0;
    var below_left, below, below_right;

    s1 = (p.x >> 16);
    s2 = (p.y >> 16);
    below_left = GET_BAN_MAP_XY(s1, s2 + 16);
    below = GET_BAN_MAP_XY(s1 + 8, s2 + 16);
    below_right = GET_BAN_MAP_XY(s1 + 15, s2 + 16);

    if (below == BAN_ICE) {
        if (p.x_add > 0) {
            p.x_add -= 1024;
        } else {
            p.x_add -= 768;
        }
    } else if ((below_left != BAN_SOLID && below_right == BAN_ICE) || (below_left == BAN_ICE && below_right != BAN_SOLID)) {
        if (p.x_add > 0) {
            p.x_add -= 1024;
        } else {
            p.x_add -= 768;
        }
    } else {
        if (p.x_add > 0) {
            p.x_add -= 16384;
            if (p.x_add > -98304 && p.in_water == 0 && below == BAN_SOLID) {
                add_object(OBJ_SMOKE, (p.x >> 16) + 2 + rnd(9), (p.y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM_SMOKE, 0);
            }
        } else {
            p.x_add -= 12288;
        }
    }
    if (p.x_add < -98304) {
        p.x_add = -98304;
    }
    p.direction = 1;
    if (p.anim == 0) {
        p.anim = 1;
        p.frame = 0;
        p.frame_tick = 0;
        p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
    }
}

function player_action_right(p) {
    var s1 = 0, s2 = 0;
    var below_left, below, below_right;

    s1 = (p.x >> 16);
    s2 = (p.y >> 16);
    below_left = GET_BAN_MAP_XY(s1, s2 + 16);
    below = GET_BAN_MAP_XY(s1 + 8, s2 + 16);
    below_right = GET_BAN_MAP_XY(s1 + 15, s2 + 16);

    if (below == BAN_ICE) {
        if (p.x_add < 0) {
            p.x_add += 1024;
        } else {
            p.x_add += 768;
        }
    } else if ((below_left != BAN_SOLID && below_right == BAN_ICE) || (below_left == BAN_ICE && below_right != BAN_SOLID)) {
        if (p.x_add > 0) {
            p.x_add += 1024;
        } else {
            p.x_add += 768;
        }
    } else {
        if (p.x_add < 0) {
            p.x_add += 16384;
            if (p.x_add < 98304 && p.in_water == 0 && below == BAN_SOLID) {
                add_object(OBJ_SMOKE, (p.x >> 16) + 2 + rnd(9), (p.y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM_SMOKE, 0);
            }
        } else {
            p.x_add += 12288;
        }
    }
    if (p.x_add > 98304) {
        p.x_add = 98304;
    }
    p.direction = 0;
    if (p.anim == 0) {
        p.anim = 1;
        p.frame = 0;
        p.frame_tick = 0;
        p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
    }
}

function addkey(i, k) {
    keys_pressed[player[i].keys[k]] = true;
}

function delkey(i, k) {
    keys_pressed[player[i].keys[k]] = false;
}

function steer_players() {  
    cpu_move();
    update_player_actions();
    for (var playerIndex=0;playerIndex!=player.length;++playerIndex) {
        var p = player[playerIndex];
        if (p.enabled) {
            if (!p.dead_flag) {
                steer_player(p);
            }
            update_player_animation(p, playerIndex);
        }
    }
}

function collision_check() {
    var c1 = 0, c2 = 0, c3 = 0;
    var l1;

    /* collision check */
    for (c3 = 0; c3 < 6; c3++) {
        if (c3 == 0) {
            c1 = 0;
            c2 = 1;
        } else if (c3 == 1) {
            c1 = 0;
            c2 = 2;
        } else if (c3 == 2) {
            c1 = 0;
            c2 = 3;
        } else if (c3 == 3) {
            c1 = 1;
            c2 = 2;
        } else if (c3 == 4) {
            c1 = 1;
            c2 = 3;
        } else if (c3 == 5) {
            c1 = 2;
            c2 = 3;
        }
        if (player[c1].enabled && player[c2].enabled) {
            if (Math.abs(player[c1].x - player[c2].x) < 0xC0000 && Math.abs(player[c1].y - player[c2].y) < 0xC0000) {
                if ((Math.abs(player[c1].y - player[c2].y) >> 16) > 5) {
                    if (player[c1].y < player[c2].y) {
                        player_kill(c1,c2);
                    } else {
                        player_kill(c2,c1);
                    }
                } else {
                    if (player[c1].x < player[c2].x) {
                        if (player[c1].x_add > 0)
                            player[c1].x = player[c2].x - 0xC0000;
                        else if (player[c2].x_add < 0)
                            player[c2].x = player[c1].x + 0xC0000;
                        else {
                            player[c1].x -= player[c1].x_add;
                            player[c2].x -= player[c2].x_add;
                        }
                        l1 = player[c2].x_add;
                        player[c2].x_add = player[c1].x_add;
                        player[c1].x_add = l1;
                        if (player[c1].x_add > 0)
                            player[c1].x_add = -player[c1].x_add;
                        if (player[c2].x_add < 0)
                            player[c2].x_add = -player[c2].x_add;
                    } else {
                        if (player[c1].x_add > 0)
                            player[c2].x = player[c1].x - 0xC0000;
                        else if (player[c2].x_add < 0)
                            player[c1].x = player[c2].x + 0xC0000;
                        else {
                            player[c1].x -= player[c1].x_add;
                            player[c2].x -= player[c2].x_add;
                        }
                        l1 = player[c2].x_add;
                        player[c2].x_add = player[c1].x_add;
                        player[c1].x_add = l1;
                        if (player[c1].x_add < 0)
                            player[c1].x_add = -player[c1].x_add;
                        if (player[c2].x_add > 0)
                            player[c2].x_add = -player[c2].x_add;
                    }
                }
            }
        }
    }
}

function add_leftovers(x, y, image, gob) {
    env.render.leftovers.pobs[env.render.leftovers.num_pobs] = { x: x, y: y, gob: gob, image: image };
    env.render.leftovers.num_pobs++;
}

function add_pob(x, y, image, gob) {
    var page_info = main_info.page_info;
    if (page_info.num_pobs >= env.render.max.POBS) {
        return;
    }
    page_info.pobs[page_info.num_pobs] = { x : x, y : y, gob : gob, image : image };
    page_info.num_pobs++;
}

function put_pob(ctx, x, y, gob, img) {
    var sx, sy, sw, sh, hs_x, hs_y;
    sx = gob.x;
    sy = gob.y;
    sw = gob.width;
    sh = gob.height;
    hs_x = gob.hotspot_x;
    hs_y = gob.hotspot_y;
    ctx.drawImage(img, sx, sy, sw, sh, x-hs_x, y-hs_y, sw, sh);
}

function draw_pobs(ctx) {
    var page_info = main_info.page_info;

    for (var c1 = page_info.num_pobs - 1; c1 >= 0; c1--) {
        var pob = page_info.pobs[c1];
        put_pob(ctx, pob.x, pob.y, pob.gob, pob.image);
    }
}

function draw_leftovers(ctx) {
    for (var c1 = 0; c1 != env.render.leftovers.num_pobs; ++c1) {
        var pob = env.render.leftovers.pobs[c1];
        put_pob(ctx, pob.x, pob.y, pob.gob, pob.image);
    }
}

function draw() {
    var ctx = main_info.draw_page;

    ctx.drawImage(env.render.img.level, 0, 0);

    var page_info = main_info.page_info;

    for (var i = 0; i < env.JNB_MAX_PLAYERS; i++) {
        if (player[i].enabled) {
            add_pob(player[i].x >> 16, player[i].y >> 16, env.render.img.rabbits, rabbit_gobs[player[i].image + i * 18]);
        }
    }
    draw_leftovers(ctx);
    draw_pobs(ctx);

    ctx.drawImage(env.render.img.mask, 0, 0);
}

function game_loop() {
    steer_players();
    collision_check();
    main_info.page_info.num_pobs = 0;
    update_object_animations();
    draw();
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

        if (time_diff>0) {
            // we have time left
            setTimeout("pump()", time_diff);
            break;
        }
        // debug("frametime exceeded: " + (-time_diff));
    }
}

function resize_canvas()
{
	var canvas = document.getElementById('screen');
    var ctx = canvas.getContext('2d');
	var x_scale = window.innerWidth / env.render.img.level.width;
	var y_scale = window.innerHeight / env.render.img.level.height;
	var new_scale = Math.floor(Math.min(x_scale, y_scale));
	
	if (env.render.canvas_scale != new_scale)
	{
	    env.render.canvas_scale = new_scale;
		canvas.width = 0;
		canvas.height = 0;
		canvas.width = env.render.img.level.width * env.render.canvas_scale;
		canvas.height = env.render.img.level.height * env.render.canvas_scale;
		ctx.scale(env.render.canvas_scale, env.render.canvas_scale);
	}
}

function position_player(player_num)
{
    var c1;
    var s1, s2;

    while (1) {
        while (1) {
            s1 = rnd(LEVEL_WIDTH);
            s2 = rnd(LEVEL_HEIGHT);
            if (GET_BAN_MAP(s1, s2) == BAN_VOID && (GET_BAN_MAP(s1, s2+1) == BAN_SOLID || GET_BAN_MAP(s1, s2+1) == BAN_ICE))
                break;
        }
        for (c1 = 0; c1 < env.JNB_MAX_PLAYERS; c1++) {
            if (c1 != player_num && player[c1].enabled) {
                if (Math.abs((s1 << LEVEL_SCALE_FACTOR) - (player[c1].x >> 16)) < 32 && Math.abs((s2 << LEVEL_SCALE_FACTOR) - (player[c1].y >> 16)) < 32)
                    break;
            }
        }
        if (c1 == env.JNB_MAX_PLAYERS) {
            player[player_num].x = s1 << 20;
            player[player_num].y = s2 << 20;
            player[player_num].x_add = player[player_num].y_add = 0;
            player[player_num].direction = 0;
            player[player_num].jump_ready = 1;
            player[player_num].in_water = 0;
            player[player_num].anim = 0;
            player[player_num].frame = 0;
            player[player_num].frame_tick = 0;
            player[player_num].image = player_anims[player[player_num].anim].frame[player[player_num].frame].image;

            if (env.settings.is_server) {
                player[player_num].dead_flag = 0;
            }

            break;
        }
    }

}

function init_level() {
    create_map();
    create_object_anims();
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
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return "";
  else
    return results[1];
}

function init() {
    if (gup('nosound')=='1') main_info.music_no_sound = true;
    if (gup('pogostick') == '1') env.settings.pogostick = 1;
    if (gup('jetpack')=='1') env.settings.jetpack = 1;
    if (gup('space') == '1') env.settings.bunnies_in_space = 1;
    env.render.img.level = document.getElementById('level');
    env.render.img.mask = document.getElementById('mask');
    env.render.img.rabbits = document.getElementById('rabbits');
    env.render.img.objects = document.getElementById('objects');
    env.render.img.numbers = document.getElementById('numbers');

    var canvas = document.getElementById('screen');
    var ctx = canvas.getContext('2d');
    main_info.draw_page = ctx;
    ctx.mozImageSmoothingEnabled = false;
    
    player = [];
    player[0] = create_player([37,39,38]);
    player[1] = create_player([65,68,87]);
    player[2] = create_player([100,102,104]);
    player[3] = create_player([74,76,73]);
    player[0].enabled = true;
    player[1].enabled = true;
    player[2].enabled = true;
    player[3].enabled = true;

    init_level();

    document.onkeydown = onKeyDown;
    document.onkeyup = onKeyUp;
    env.next_time = timeGetTime() + 1000;

    env.sfx.music();
    pump();
}
