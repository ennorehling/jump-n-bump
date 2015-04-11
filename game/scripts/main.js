var next_time = 0;

var jetpack = 0;
var pogostick = 0;
var bunnies_in_space = 0;
var flies_enabled = 0;
var blood_is_thicker_than_water = 0;
var is_server = true;

var JNB_MAX_PLAYERS = 4;

var NUM_POBS = 200;
var NUM_FLIES = 20;
var NUM_LEFTOVERS = 50;

var SFX_JUMP_FREQ = 15000;
var SFX_LAND_FREQ = 15000;
var SFX_DEATH_FREQ = 20000;
var SFX_SPRING_FREQ = 15000;
var SFX_SPLASH_FREQ = 12000;
var SFX_FLY_FREQ = 12000;
var leftovers = { num_pobs: 0, pobs:[]};
var ai = [ false, false, false, true ];
var img_objects;
var img_rabbits;
var img_level;
var img_mask;
var img_numbers;

function rnd(max_value) {
    return Math.floor(Math.random()*max_value);
}

var main_info = {
    draw_page : null,
    music_no_sound : false,
    no_gore : false,
    page_info : {
        num_pobs : 0,
        pobs : []
    }
};

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
        if (ai[i] && player[i].enabled) player[i].enabled = false;
        else if (player[i].enabled) ai[i] = true;
        else {
            player[i].enabled = true;
            ai[i] = false;
        }
    } else if (evt.keyCode==77) { // 'm'
        main_info.music_no_sound = !main_info.music_no_sound;
        if (main_info.music_no_sound) {
            silence_all();
        } else {
            play_sound(SFX_MUSIC, true);
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
        dj_play_sfx(SFX_DEATH, (SFX_DEATH_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
        player[c1].bumps++;
        player[c1].bumped[c2]++;
        s1 = player[c1].bumps % 100;
        if (s1 % 10 == 0) {
            add_leftovers(360, 34 + c1 * 64, img_numbers, number_gobs[Math.floor(s1/10)%10]);
        }
        add_leftovers(376, 34 + c1 * 64, img_numbers, number_gobs[s1 % 10]);
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
function map_tile(x, y) {
    return GET_BAN_MAP(x>>4, y>>4);
}

function addkey(i, k) {
    keys_pressed[player[i].keys[k]] = true;
}

function delkey(i, k) {
    keys_pressed[player[i].keys[k]] = false;
}

function cpu_move() {
    var lm, rm, jm;
    var i, j;
    var cur_posx, cur_posy, tar_posx, tar_posy;
    var players_distance;
    var deltax, deltay;
    var target, key;
    var nearest_distance;

    for (i = 0; i < JNB_MAX_PLAYERS; i++) {
        nearest_distance = -1;
        target = null;
        if (ai[i] && player[i].enabled) {
            for (j = 0; j < JNB_MAX_PLAYERS; j++) {
                if (i == j || !player[j].enabled) {
                    continue;
                }
                deltax = player[j].x - player[i].x;
                deltay = player[j].y - player[i].y;
                players_distance = deltax*deltax + deltay*deltay;

                if (players_distance < nearest_distance || nearest_distance == -1) {
                    target = player[j];
                    nearest_distance = players_distance;
                }
            }

            if (target == null)
                continue;

            cur_posx = player[i].x >> 16;
            cur_posy = player[i].y >> 16;
            tar_posx = target.x >> 16;
            tar_posy = target.y >> 16;

            /* nearest player found, get him */
            /* here goes the artificial intelligence code */

            /* X-axis movement */
            if(tar_posx > cur_posx) { // if true target is on the right side
                // go after him
                lm=false;
                rm=true;
            } else { // target on the left side
                lm=true;
                rm=false;
            }

            if (cur_posy - tar_posy < 32 && cur_posy - tar_posy > 0
                && tar_posx - cur_posx < 32+8 && tar_posx - cur_posx > -32) {
                lm = !lm;
                rm = !rm;
            }
            else if(tar_posx - cur_posx < 4+8 && tar_posx - cur_posx > -4)
                {      // makes the bunnies less "nervous"
                lm=false;
                lm=false;
                }

            /* Y-axis movement */
            if(map_tile(cur_posx, cur_posy+16) != BAN_VOID &&
                key_pressed(player[i].keys[2]))
                    jm=false;   // if we are on ground and jump key is being pressed,
                                    //first we have to release it or else we won't be able to jump more than once

            else if(map_tile(cur_posx, cur_posy-8) != BAN_VOID &&
                map_tile(cur_posx, cur_posy-8) != BAN_WATER) {
                    jm=false;   // don't jump if there is something over it
            }
            else if(map_tile(cur_posx-(lm*8)+(rm*16), cur_posy) != BAN_VOID &&
                map_tile(cur_posx-(lm*8)+(rm*16), cur_posy) != BAN_WATER &&
                cur_posx > 16 && cur_posx < 352-16-8)  // obstacle, jump
                    jm=true;   // if there is something on the way, jump over it

            else if(key_pressed(player[i].keys[2]) &&
                            (map_tile(cur_posx-(lm*8)+(rm*16), cur_posy+8) != BAN_VOID &&
                            map_tile(cur_posx-(lm*8)+(rm*16), cur_posy+8) != BAN_WATER)) {
                jm=true;   // this makes it possible to jump over 2 tiles
            }
            else if(cur_posy - tar_posy < 32 && cur_posy - tar_posy > 0 &&
              tar_posx - cur_posx < 32+8 && tar_posx - cur_posx > -32) { // don't jump - running away
                jm=false;
            }

            else if(tar_posy <= cur_posy) {  // target on the upper side
                jm=true;
            } else {  // target below
                jm=false;
            }

            /** Artificial intelligence done, now apply movements */
            if (lm) {
                addkey(i, 0);
            } else {
                delkey(i, 0);
            }

            if (rm) {
                addkey(i, 1);
            } else {
                delkey(i, 1);
            }

            if(jm) {
                addkey(i, 2);
            } else {
                delkey(i, 2);
            }
        }
    }
}

function steer_players() {  
    cpu_move();
    update_player_actions();
    for (var c1=0;c1!=player.length;++c1) {
        var p = player[c1];
        if (p.enabled) {
            if (!p.dead_flag) {
                if (p.action_left && p.action_right) {
                    if (p.direction == 0) {
                        if (p.action_right) {
                            player_action_right(p);
                        }
                    } else {
                        if (p.action_left) {
                            player_action_left(p);
                        }
                    }
                } else if (p.action_left) {
                    player_action_left(p);
                } else if (p.action_right) {
                    player_action_right(p);
                } else if ((!p.action_left) && (!p.action_right)) {
                    var below_left, below, below_right;

                    s1 = (p.x >> 16);
                    s2 = (p.y >> 16);
                    below_left = GET_BAN_MAP_XY(s1, s2 + 16);
                    below = GET_BAN_MAP_XY(s1 + 8, s2 + 16);
                    below_right = GET_BAN_MAP_XY(s1 + 15, s2 + 16);
                    if (below == BAN_SOLID || below == BAN_SPRING || (((below_left == BAN_SOLID || below_left == BAN_SPRING) && below_right != BAN_ICE) || (below_left != BAN_ICE && (below_right == BAN_SOLID || below_right == BAN_SPRING)))) {
                        if (p.x_add < 0) {
                            p.x_add += 16384;
                            if (p.x_add > 0)
                                p.x_add = 0;
                        } else {
                            p.x_add -= 16384;
                            if (p.x_add < 0)
                                p.x_add = 0;
                        }
                        if (p.x_add != 0 && GET_BAN_MAP_XY((s1 + 8), (s2 + 16)) == BAN_SOLID)
                            add_object(OBJ_SMOKE, (p.x >> 16) + 2 + rnd(9), (p.y >> 16) + 13 + rnd(5), 0, -16384 - rnd(8192), OBJ_ANIM_SMOKE, 0);
                    }
                    if (p.anim == 1) {
                        p.anim = 0;
                        p.frame = 0;
                        p.frame_tick = 0;
                        p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                    }
                }
                if (jetpack == 0) {
                    /* no jetpack */
                    if (pogostick == 1 || (p.jump_ready == 1 && p.action_up)) {
                        s1 = (p.x >> 16);
                        s2 = (p.y >> 16);
                        if (s2 < -16)
                            s2 = -16; //Allow player to jump off screen but not negative overflow if using jetpack
                        /* jump */
                        if (GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_ICE) {
                            p.y_add = -280000;
                            p.anim = 2;
                            p.frame = 0;
                            p.frame_tick = 0;
                            p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                            p.jump_ready = 0;
                            p.jump_abort = 1;
                            if (pogostick == 0)
                                dj_play_sfx(SFX_JUMP, (SFX_JUMP_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
                            else
                                dj_play_sfx(SFX_SPRING, (SFX_SPRING_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
                        }
                        /* jump out of water */
                        if (GET_BAN_MAP_IN_WATER(s1, s2)) {
                            p.y_add = -196608;
                            p.in_water = 0;
                            p.anim = 2;
                            p.frame = 0;
                            p.frame_tick = 0;
                            p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                            p.jump_ready = 0;
                            p.jump_abort = 1;
                            if (pogostick == 0)
                                dj_play_sfx(SFX_JUMP, (SFX_JUMP_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
                            else
                                dj_play_sfx(SFX_SPRING, (SFX_SPRING_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
                        }
                    }
                    /* fall down by gravity */
                    if (pogostick == 0 && (!p.action_up)) {
                        p.jump_ready = 1;
                        if (p.in_water == 0 && p.y_add < 0 && p.jump_abort == 1) {
                            if (bunnies_in_space == 0)
                                /* normal gravity */
                                p.y_add += 32768;
                            else
                                /* light gravity */
                                p.y_add += 16384;
                            if (p.y_add > 0)
                                p.y_add = 0;
                        }
                    }
                } else {
                    /* with jetpack */
                    if (p.action_up) {
                        p.y_add -= 16384;
                        if (p.y_add < -400000)
                            p.y_add = -400000;
                        if (GET_BAN_MAP_IN_WATER(s1, s2))
                            p.in_water = 0;
                        if (rnd(100) < 50)
                            add_object(OBJ_SMOKE, (p.x >> 16) + 6 + rnd(5), (p.y >> 16) + 10 + rnd(5), 0, 16384 + rnd(8192), OBJ_ANIM_SMOKE, 0);
                    }
                }

                p.x += p.x_add;
                if ((p.x >> 16) < 0) {
                    p.x = 0;
                    p.x_add = 0;
                }
                if ((p.x >> 16) + 15 > 351) {
                    p.x = 336 << 16;
                    p.x_add = 0;
                }
                {
                    if (p.y > 0) {
                        s2 = (p.y >> 16);
                    } else {
                        /* check top line only */
                        s2 = 0;
                    }

                    s1 = (p.x >> 16);
                    if (GET_BAN_MAP_XY(s1, s2) == BAN_SOLID || GET_BAN_MAP_XY(s1, s2) == BAN_ICE || GET_BAN_MAP_XY(s1, s2) == BAN_SPRING || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING) {
                        p.x = (((s1 + 16) & 0xfff0)) << 16;
                        p.x_add = 0;
                    }

                    s1 = (p.x >> 16);
                    if (GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
                        p.x = (((s1 + 16) & 0xfff0) - 16) << 16;
                        p.x_add = 0;
                    }
                }

                p.y += p.y_add;

                s1 = (p.x >> 16);
                s2 = (p.y >> 16);
                if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN_SPRING || ((GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING && GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) != BAN_SOLID) || (GET_BAN_MAP_XY(s1, (s2 + 15)) != BAN_SOLID && GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING))) {
                    p.y = ((p.y >> 16) & 0xfff0) << 16;
                    p.y_add = -400000;
                    p.anim = 2;
                    p.frame = 0;
                    p.frame_tick = 0;
                    p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                    p.jump_ready = 0;
                    p.jump_abort = 0;
                    for (c2 = 0; c2 < NUM_OBJECTS; c2++) {
                        if (objects[c2].used == 1 && objects[c2].type == OBJ_SPRING) {
                            if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN_SPRING) {
                                if ((objects[c2].x >> 20) == ((s1 + 8) >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
                                    objects[c2].frame = 0;
                                    objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
                                    objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
                                    break;
                                }
                            } else {
                                if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING) {
                                    if ((objects[c2].x >> 20) == (s1 >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
                                        objects[c2].frame = 0;
                                        objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
                                        objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
                                        break;
                                    }
                                } else if (GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
                                    if ((objects[c2].x >> 20) == ((s1 + 15) >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
                                        objects[c2].frame = 0;
                                        objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
                                        objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    dj_play_sfx(SFX_SPRING, (SFX_SPRING_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
                }
                s1 = (p.x >> 16);
                s2 = (p.y >> 16);
                if (s2 < 0)
                    s2 = 0;
                if (GET_BAN_MAP_XY(s1, s2) == BAN_SOLID || GET_BAN_MAP_XY(s1, s2) == BAN_ICE || GET_BAN_MAP_XY(s1, s2) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SPRING) {
                    p.y = (((s2 + 16) & 0xfff0)) << 16;
                    p.y_add = 0;
                    p.anim = 0;
                    p.frame = 0;
                    p.frame_tick = 0;
                    p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                }
                s1 = (p.x >> 16);
                s2 = (p.y >> 16);
                if (s2 < 0)
                    s2 = 0;
                if (GET_BAN_MAP_XY((s1 + 8), (s2 + 8)) == BAN_WATER) {
                    if (p.in_water == 0) {
                        /* falling into water */
                        p.in_water = 1;
                        p.anim = 4;
                        p.frame = 0;
                        p.frame_tick = 0;
                        p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                        if (p.y_add >= 32768) {
                            add_object(OBJ_SPLASH, (p.x >> 16) + 8, ((p.y >> 16) & 0xfff0) + 15, 0, 0, OBJ_ANIM_SPLASH, 0);

                            if (blood_is_thicker_than_water == 0)
                                dj_play_sfx(SFX_SPLASH, (SFX_SPLASH_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
                            else
                                dj_play_sfx(SFX_SPLASH, (SFX_SPLASH_FREQ + rnd(2000) - 5000), 64, 0, 0, -1);
                        }
                    }
                    /* slowly move up to water surface */
                    p.y_add -= 1536;
                    if (p.y_add < 0 && p.anim != 5) {
                        p.anim = 5;
                        p.frame = 0;
                        p.frame_tick = 0;
                        p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                    }
                    if (p.y_add < -65536)
                        p.y_add = -65536;
                    if (p.y_add > 65535)
                        p.y_add = 65535;
                    if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_ICE) {
                        p.y = (((s2 + 16) & 0xfff0) - 16) << 16;
                        p.y_add = 0;
                    }
                } else if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
                    p.in_water = 0;
                    p.y = (((s2 + 16) & 0xfff0) - 16) << 16;
                    p.y_add = 0;
                    if (p.anim != 0 && p.anim != 1) {
                        p.anim = 0;
                        p.frame = 0;
                        p.frame_tick = 0;
                        p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                    }
                } else {
                    if (p.in_water == 0) {
                        if (bunnies_in_space == 0)
                            p.y_add += 12288;
                        else
                            p.y_add += 6144;
                        if (p.y_add > 327680)
                            p.y_add = 327680;
                    } else {
                        p.y = (p.y & 0xffff0000) + 0x10000;
                        p.y_add = 0;
                    }
                    p.in_water = 0;
                }
                if (p.y_add > 36864 && p.anim != 3 && p.in_water == 0) {
                    p.anim = 3;
                    p.frame = 0;
                    p.frame_tick = 0;
                    p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
                }

            }

            p.frame_tick++;
            if (p.frame_tick >= player_anims[p.anim].frame[p.frame].ticks) {
                p.frame++;
                if (p.frame >= player_anims[p.anim].num_frames) {
                    if (p.anim != 6)
                        p.frame = player_anims[p.anim].restart_frame;
                    else
                        position_player(c1);
                }
                p.frame_tick = 0;
            }
            p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;

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
    leftovers.pobs[leftovers.num_pobs] = { x : x, y : y, gob : gob, image : image };
    leftovers.num_pobs++;
}

function add_pob(x, y, image, gob) {
    var page_info = main_info.page_info;
    if (page_info.num_pobs >= NUM_POBS) {
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
    for (var c1 = 0; c1!=leftovers.num_pobs; ++c1) {
        var pob = leftovers.pobs[c1];
        put_pob(ctx, pob.x, pob.y, pob.gob, pob.image);
    }
}

function update_objects() {
    var c1;
    var s1 = 0;

    for (c1 = 0; c1 < NUM_OBJECTS; c1++) {
        var obj = objects[c1];
        if (obj.used) {
            switch (obj.type) {
            case OBJ_SPRING:
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames) {
                        obj.frame--;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                    } else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_SPLASH:
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.used = false;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_SMOKE:
                obj.x += obj.x_add;
                obj.y += obj.y_add;
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.used = false;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_YEL_BUTFLY:
            case OBJ_PINK_BUTFLY:
                obj.x_acc += rnd(128) - 64;
                if (obj.x_acc < -1024)
                    obj.x_acc = -1024;
                if (obj.x_acc > 1024)
                    obj.x_acc = 1024;
                obj.x_add += obj.x_acc;
                if (obj.x_add < -32768)
                    obj.x_add = -32768;
                if (obj.x_add > 32768)
                    obj.x_add = 32768;
                obj.x += obj.x_add;
                if ((obj.x >> 16) < 16) {
                    obj.x = 16 << 16;
                    obj.x_add = -obj.x_add >> 2;
                    obj.x_acc = 0;
                } else if ((obj.x >> 16) > 350) {
                    obj.x = 350 << 16;
                    obj.x_add = -obj.x_add >> 2;
                    obj.x_acc = 0;
                }
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0) {
                    if (obj.x_add < 0) {
                        obj.x = (((obj.x >> 16) + 16) & 0xfff0) << 16;
                    } else {
                        obj.x = ((((obj.x >> 16) - 16) & 0xfff0) + 15) << 16;
                    }
                    obj.x_add = -obj.x_add >> 2;
                    obj.x_acc = 0;
                }
                obj.y_acc += rnd(64) - 32;
                if (obj.y_acc < -1024)
                    obj.y_acc = -1024;
                if (obj.y_acc > 1024)
                    obj.y_acc = 1024;
                obj.y_add += obj.y_acc;
                if (obj.y_add < -32768)
                    obj.y_add = -32768;
                if (obj.y_add > 32768)
                    obj.y_add = 32768;
                obj.y += obj.y_add;
                if ((obj.y >> 16) < 0) {
                    obj.y = 0;
                    obj.y_add = -obj.y_add >> 2;
                    obj.y_acc = 0;
                } else if ((obj.y >> 16) > 255) {
                    obj.y = 255 << 16;
                    obj.y_add = -obj.y_add >> 2;
                    obj.y_acc = 0;
                }
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0) {
                    if (obj.y_add < 0) {
                        obj.y = (((obj.y >> 16) + 16) & 0xfff0) << 16;
                    } else {
                        obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                    }
                    obj.y_add = -obj.y_add >> 2;
                    obj.y_acc = 0;
                }
                if (obj.type == OBJ_YEL_BUTFLY) {
                    if (obj.x_add < 0 && obj.anim != OBJ_ANIM_YEL_BUTFLY_LEFT) {
                        obj.anim = OBJ_ANIM_YEL_BUTFLY_LEFT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    } else if (obj.x_add > 0 && obj.anim != OBJ_ANIM_YEL_BUTFLY_RIGHT) {
                        obj.anim = OBJ_ANIM_YEL_BUTFLY_RIGHT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                } else {
                    if (obj.x_add < 0 && obj.anim != OBJ_ANIM_PINK_BUTFLY_LEFT) {
                        obj.anim = OBJ_ANIM_PINK_BUTFLY_LEFT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    } else if (obj.x_add > 0 && obj.anim != OBJ_ANIM_PINK_BUTFLY_RIGHT) {
                        obj.anim = OBJ_ANIM_PINK_BUTFLY_RIGHT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.frame = object_anims[obj.anim].restart_frame;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_FUR:
                if (rnd(100) < 30)
                    add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 0);
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 0) {
                    obj.y_add += 3072;
                    if (obj.y_add > 196608)
                        obj.y_add = 196608;
                } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 2) {
                    if (obj.x_add < 0) {
                        if (obj.x_add < -65536)
                            obj.x_add = -65536;
                        obj.x_add += 1024;
                        if (obj.x_add > 0)
                            obj.x_add = 0;
                    } else {
                        if (obj.x_add > 65536)
                            obj.x_add = 65536;
                        obj.x_add -= 1024;
                        if (obj.x_add < 0)
                            obj.x_add = 0;
                    }
                    obj.y_add += 1024;
                    if (obj.y_add < -65536)
                        obj.y_add = -65536;
                    if (obj.y_add > 65536)
                        obj.y_add = 65536;
                }
                obj.x += obj.x_add;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1 || GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3)) {
                    if (obj.x_add < 0) {
                        obj.x = (((obj.x >> 16) + 16) & 0xfff0) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    } else {
                        obj.x = ((((obj.x >> 16) - 16) & 0xfff0) + 15) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    }
                }
                obj.y += obj.y_add;
                if ((obj.x >> 16) < -5 || (obj.x >> 16) > 405 || (obj.y >> 16) > 260)
                    obj.used = false;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0)) {
                    if (obj.y_add < 0) {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 2) {
                            obj.y = (((obj.y >> 16) + 16) & 0xfff0) << 16;
                            obj.x_add >>= 2;
                            obj.y_add = -obj.y_add >> 2;
                        }
                    } else {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1) {
                            if (obj.y_add > 131072) {
                                obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                                obj.x_add >>= 2;
                                obj.y_add = -obj.y_add >> 2;
                            } else
                                obj.used = false;
                        } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3) {
                            obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                            if (obj.y_add > 131072)
                                obj.y_add = -obj.y_add >> 2;
                            else
                                obj.y_add = 0;
                        }
                    }
                }
                if (obj.x_add < 0 && obj.x_add > -16384)
                    obj.x_add = -16384;
                if (obj.x_add > 0 && obj.x_add < 16384)
                    obj.x_add = 16384;
                if (obj.used) {
                    s1 = Math.floor(Math.atan2(obj.y_add, obj.x_add) * 4 / Math.PI);
                    if (s1 < 0)
                        s1 += 8;
                    if (s1 < 0)
                        s1 = 0;
                    if (s1 > 7)
                        s1 = 7;
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.frame + s1]);
                }
                break;
            case OBJ_FLESH:
                if (rnd(100) < 30) {
                    if (obj.frame == 76)
                        add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 1);
                    else if (obj.frame == 77)
                        add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 2);
                    else if (obj.frame == 78)
                        add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 3);
                }
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 0) {
                    obj.y_add += 3072;
                    if (obj.y_add > 196608)
                        obj.y_add = 196608;
                } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 2) {
                    if (obj.x_add < 0) {
                        if (obj.x_add < -65536)
                            obj.x_add = -65536;
                        obj.x_add += 1024;
                        if (obj.x_add > 0)
                            obj.x_add = 0;
                    } else {
                        if (obj.x_add > 65536)
                            obj.x_add = 65536;
                        obj.x_add -= 1024;
                        if (obj.x_add < 0)
                            obj.x_add = 0;
                    }
                    obj.y_add += 1024;
                    if (obj.y_add < -65536)
                        obj.y_add = -65536;
                    if (obj.y_add > 65536)
                        obj.y_add = 65536;
                }
                obj.x += obj.x_add;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1 || GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3)) {
                    if (obj.x_add < 0) {
                        obj.x = (((obj.x >> 16) + 16) & 0xfff0) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    } else {
                        obj.x = ((((obj.x >> 16) - 16) & 0xfff0) + 15) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    }
                }
                obj.y += obj.y_add;
                if ((obj.x >> 16) < -5 || (obj.x >> 16) > 405 || (obj.y >> 16) > 260)
                    obj.used = false;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0)) {
                    if (obj.y_add < 0) {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 2) {
                            obj.y = (((obj.y >> 16) + 16) & 0xfff0) << 16;
                            obj.x_add >>= 2;
                            obj.y_add = -obj.y_add >> 2;
                        }
                    } else {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1) {
                            if (obj.y_add > 131072) {
                                obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                                obj.x_add >>= 2;
                                obj.y_add = -obj.y_add >> 2;
                            } else {
                                if (rnd(100) < 10) {
                                    s1 = rnd(4) - 2;
                                    add_leftovers(obj.x >> 16, (obj.y >> 16) + s1, img_objects, object_gobs[obj.frame]);
                                }
                                obj.used = false;
                            }
                        } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3) {
                            obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                            if (obj.y_add > 131072)
                                obj.y_add = -obj.y_add >> 2;
                            else
                                obj.y_add = 0;
                        }
                    }
                }
                if (obj.x_add < 0 && obj.x_add > -16384)
                    obj.x_add = -16384;
                if (obj.x_add > 0 && obj.x_add < 16384)
                    obj.x_add = 16384;
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.frame]);
                break;
            case OBJ_FLESH_TRACE:
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.used = false;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            }
        }
    }
}


function draw() {
    var ctx = main_info.draw_page;

    ctx.drawImage(img_level, 0, 0);

    var page_info = main_info.page_info;

    for (var i = 0; i < JNB_MAX_PLAYERS; i++) {
        if (player[i].enabled) {
            add_pob(player[i].x >> 16, player[i].y >> 16, img_rabbits, rabbit_gobs[player[i].image + i * 18]);
        }
    }
    draw_leftovers(ctx);
    draw_pobs(ctx);

    ctx.drawImage(img_mask, 0, 0);
}

function game_loop() {
    steer_players();
    collision_check();
    main_info.page_info.num_pobs = 0;
    update_objects();
    draw();
}

function debug(str) {
    document.getElementById('debug').innerHTML = str;
}

function pump() {
    while (1) {
       
        game_loop();
        var now = timeGetTime();
        var time_diff = next_time - now;
        next_time += (1000 / 60);

        if (time_diff>0) {
            // we have time left
            setTimeout("pump()", time_diff);
            break;
        }
        // debug("frametime exceeded: " + (-time_diff));
    }
}

function position_player(player_num)
{
    var c1;
    var s1, s2;

    while (1) {
        while (1) {
            s1 = rnd(22);
            s2 = rnd(16);
            if (GET_BAN_MAP(s1, s2) == BAN_VOID && (GET_BAN_MAP(s1, s2+1) == BAN_SOLID || GET_BAN_MAP(s1, s2+1) == BAN_ICE))
                break;
        }
        for (c1 = 0; c1 < JNB_MAX_PLAYERS; c1++) {
            if (c1 != player_num && player[c1].enabled) {
                if (Math.abs((s1 << 4) - (player[c1].x >> 16)) < 32 && Math.abs((s2 << 4) - (player[c1].y >> 16)) < 32)
                    break;
            }
        }
        if (c1 == JNB_MAX_PLAYERS) {
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

            if (is_server) {
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
    
    for (var c1 = 0; c1 < JNB_MAX_PLAYERS; c1++) {
        if (player[c1].enabled) {
            player[c1].bumps = 0;
            for (var c2 = 0; c2 < JNB_MAX_PLAYERS; c2++) {
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
    if (gup('pogostick')=='1') pogostick = 1;
    if (gup('jetpack')=='1') jetpack = 1;
    if (gup('space')=='1') bunnies_in_space = 1;
    img_level = document.getElementById('level');
    img_mask = document.getElementById('mask');
    img_rabbits = document.getElementById('rabbits');
    img_objects = document.getElementById('objects');
    img_numbers = document.getElementById('numbers');

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
    next_time = timeGetTime() + 1000;

    play_sound(SFX_MUSIC, true);
    pump();
}
