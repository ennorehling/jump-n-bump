function Movement(settings) {

    this.steer_player = function(p) {
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
                p.set_anim(0);
            }
        }
        if (settings.jetpack == 0) {
            /* no jetpack */
            if (settings.pogostick == 1 || (p.jump_ready == 1 && p.action_up)) {
                s1 = (p.x >> 16);
                s2 = (p.y >> 16);
                if (s2 < -16)
                    s2 = -16; //Allow player to jump off screen but not negative overflow if using jetpack
                /* jump */
                if (GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_ICE) {
                    p.y_add = -280000;
                    p.set_anim(2);
                    p.jump_ready = 0;
                    p.jump_abort = 1;
                    if (settings.pogostick == 0)
                        env.sfx.jump();
                    else
                        env.sfx.spring();
                }
                /* jump out of water */
                if (GET_BAN_MAP_IN_WATER(s1, s2)) {
                    p.y_add = -196608;
                    p.in_water = 0;
                    p.set_anim(2);
                    p.jump_ready = 0;
                    p.jump_abort = 1;
                    if (settings.pogostick == 0)
                        env.sfx.jump();
                    else
                        env.sfx.spring();
                }
            }
            /* fall down by gravity */
            if (settings.pogostick == 0 && (!p.action_up)) {
                p.jump_ready = 1;
                if (p.in_water == 0 && p.y_add < 0 && p.jump_abort == 1) {
                    if (settings.bunnies_in_space == 0)
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
            p.set_anim(2);
            p.jump_ready = 0;
            p.jump_abort = 0;
            for (c2 = 0; c2 < env.MAX_OBJECTS; c2++) {
                if (objects[c2].used == 1 && objects[c2].type == OBJ_SPRING) {
                    if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN_SPRING) {
                        if ((objects[c2].x >> 20) == ((s1 + 8) >> LEVEL_SCALE_FACTOR) && (objects[c2].y >> 20) == ((s2 + 15) >> LEVEL_SCALE_FACTOR)) {
                            objects[c2].frame = 0;
                            objects[c2].ticks = env.animation_data.objects[objects[c2].anim].frame[objects[c2].frame].ticks;
                            objects[c2].image = env.animation_data.objects[objects[c2].anim].frame[objects[c2].frame].image;
                            break;
                        }
                    } else {
                        if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING) {
                            if ((objects[c2].x >> 20) == (s1 >> LEVEL_SCALE_FACTOR) && (objects[c2].y >> 20) == ((s2 + 15) >> LEVEL_SCALE_FACTOR)) {
                                objects[c2].frame = 0;
                                objects[c2].ticks = env.animation_data.objects[objects[c2].anim].frame[objects[c2].frame].ticks;
                                objects[c2].image = env.animation_data.objects[objects[c2].anim].frame[objects[c2].frame].image;
                                break;
                            }
                        } else if (GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
                            if ((objects[c2].x >> 20) == ((s1 + 15) >> LEVEL_SCALE_FACTOR) && (objects[c2].y >> 20) == ((s2 + 15) >> LEVEL_SCALE_FACTOR)) {
                                objects[c2].frame = 0;
                                objects[c2].ticks = env.animation_data.objects[objects[c2].anim].frame[objects[c2].frame].ticks;
                                objects[c2].image = env.animation_data.objects[objects[c2].anim].frame[objects[c2].frame].image;
                                break;
                            }
                        }
                    }
                }
            }
            env.sfx.spring();
        }
        s1 = (p.x >> 16);
        s2 = (p.y >> 16);
        if (s2 < 0)
            s2 = 0;
        if (GET_BAN_MAP_XY(s1, s2) == BAN_SOLID || GET_BAN_MAP_XY(s1, s2) == BAN_ICE || GET_BAN_MAP_XY(s1, s2) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SPRING) {
            p.y = (((s2 + 16) & 0xfff0)) << 16;
            p.y_add = 0;
            p.set_anim(0);
        }
        s1 = (p.x >> 16);
        s2 = (p.y >> 16);
        if (s2 < 0)
            s2 = 0;
        if (GET_BAN_MAP_XY((s1 + 8), (s2 + 8)) == BAN_WATER) {
            if (p.in_water == 0) {
                /* falling into water */
                p.in_water = 1;
                p.set_anim(4);
                if (p.y_add >= 32768) {
                    add_object(OBJ_SPLASH, (p.x >> 16) + 8, ((p.y >> 16) & 0xfff0) + 15, 0, 0, OBJ_ANIM_SPLASH, 0);

                    if (settings.blood_is_thicker_than_water == 0)
                        env.sfx.splash();
                    else
                        env.sfx.splash();
                }
            }
            /* slowly move up to water surface */
            p.y_add -= 1536;
            if (p.y_add < 0 && p.anim != 5) {
                p.set_anim(5);
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
                p.set_anim(0);
            }
        } else {
            if (p.in_water == 0) {
                if (settings.bunnies_in_space == 0)
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
            p.set_anim(3);
        }
    }


    this.collision_check = function(renderer, img) {
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
                            player_kill(c1, c2, renderer, img);
                        } else {
                            player_kill(c2, c1, renderer, img);
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

    function processKill(c1, c2, x, y, renderer, img) {
        var s1 = 0;

        player[c1].y_add = -player[c1].y_add;
        if (player[c1].y_add > -262144)
            player[c1].y_add = -262144;
        player[c1].jump_abort = true;
        player[c2].dead_flag = true;
        if (player[c2].anim != 6) {
            player[c2].set_anim(6);
            if (main_info.no_gore == 0) {
                add_gore(x, y, c2);
            }
            env.sfx.death();
            player[c1].bumps++;
            player[c1].bumped[c2]++;
            s1 = player[c1].bumps % 100;
            if (s1 % 10 == 0) {
                renderer.add_leftovers(360, 34 + c1 * 64, img.numbers, number_gobs[Math.floor(s1 / 10) % 10]);
            }
            renderer.add_leftovers(376, 34 + c1 * 64, img.numbers, number_gobs[s1 % 10]);
        }
    }

    function player_kill(c1, c2, renderer, img) {
        processKill(c1, c2, player[c2].x, player[c2].y, renderer, img);
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
            p.set_anim(1);
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
            p.set_anim(1);
        }
    }
}