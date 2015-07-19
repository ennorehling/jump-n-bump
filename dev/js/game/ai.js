function AI(keyboard_state) {
    "use strict";

    function map_tile(x, y) {
        return GET_BAN_MAP(x >> 4, y >> 4);
    }

    function nearest_player(i) {
        var nearest_distance = -1;
        var target = null;
        for (var j = 0; j < env.JNB_MAX_PLAYERS; j++) {
            if (i == j || !player[j].enabled) {
                continue;
            }
            var deltax = player[j].x.pos - player[i].x.pos;
            var deltay = player[j].y.pos - player[i].y.pos;
            var players_distance = deltax * deltax + deltay * deltay;

            if (players_distance < nearest_distance || nearest_distance == -1) {
                target = player[j];
                nearest_distance = players_distance;
            }
        }
        return target;
    }

    this.cpu_move = function() {
        for (var i = 0; i < env.JNB_MAX_PLAYERS; i++) {
            
            var current_player = player[i];
            if (!current_player.enabled || !current_player.ai) continue;
            var target = nearest_player(i);
            if (target == null) continue;

            move(current_player, target);
        }
    }

    function move(current_player, target) {
        var cur_posx = current_player.x.pos >> 16;
        var cur_posy = current_player.y.pos >> 16;
        var tar_posx = target.x.pos >> 16;
        var tar_posy = target.y.pos >> 16;

        var tar_dist_above = cur_posy - tar_posy;
        var tar_dist_right = tar_posx - cur_posx;
        var tar_is_right = tar_dist_right > 0;

        var tar_above_nearby = tar_dist_above > 0 && tar_dist_above < 32
            && tar_dist_right < 32 + 8 && tar_dist_right > -32;

        var same_vertical_line = tar_dist_right < 4 + 8 && tar_dist_right > -4;

        var rm = should_move_direction(tar_above_nearby, !same_vertical_line, tar_is_right);
        var lm = should_move_direction(tar_above_nearby, !same_vertical_line, !tar_is_right);
        var jm = should_jump(current_player, cur_posx, cur_posy, tar_dist_above, tar_above_nearby, lm, rm);

        press_keys(current_player, lm, rm, jm);
    }

    function should_move_direction(running_away, allowed_to_chase, dir_of_target) {
        return (running_away ^ dir_of_target)
            && (running_away || allowed_to_chase); // Prevents "nervous" bunnies that keep changing direction as soon as the player does.
    }

    function should_jump(current_player, cur_posx, cur_posy, tar_dist_above, running_away, lm, rm) {
        if (map_tile(cur_posx, cur_posy + 16) != BAN_VOID &&
            keyboard_state.key_pressed(current_player.keys[2]))
            return false;   // if we are on ground and jump key is being pressed,
            //first we have to release it or else we won't be able to jump more than once

        else if (map_tile(cur_posx, cur_posy - 8) != BAN_VOID &&
            map_tile(cur_posx, cur_posy - 8) != BAN_WATER) {
            return false;   // don't jump if there is something over it
        }
        else if (map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy) != BAN_VOID &&
            map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy) != BAN_WATER &&
            cur_posx > 16 && cur_posx < 352 - 16 - 8)  // obstacle, jump
            return true;   // if there is something on the way, jump over it

        else if (keyboard_state.key_pressed(current_player.keys[2]) &&
                        (map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy + 8) != BAN_VOID &&
                        map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy + 8) != BAN_WATER)) {
            return true;   // this makes it possible to jump over 2 tiles
        }
        else if (running_away) {
            return false;
        }

        else if (tar_dist_above >= 0 && tar_dist_above < 32) {  // Try to get higher than the target
            return true;
        } else {  // target below
            return false;
        }
        return jm;
    }

    function press_keys(p, lm, rm, jm) {
        if (lm) {
            keyboard_state.addkey(p, 0);
        } else {
            keyboard_state.delkey(p, 0);
        }

        if (rm) {
            keyboard_state.addkey(p, 1);
        } else {
            keyboard_state.delkey(p, 1);
        }

        if (jm) {
            keyboard_state.addkey(p, 2);
        } else {
            keyboard_state.delkey(p, 2);
        }
    }
    
};