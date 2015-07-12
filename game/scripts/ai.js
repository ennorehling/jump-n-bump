
function AI(keyboard_state) {

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
            var deltax = player[j].x - player[i].x;
            var deltay = player[j].y - player[i].y;
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

            var cur_posx = current_player.x >> 16;
            var cur_posy = current_player.y >> 16;
            var tar_posx = target.x >> 16;
            var tar_posy = target.y >> 16;

            /* nearest player found, get him */
            /* here goes the artificial intelligence code */
            var lm, rm;

            /* X-axis movement */
            if (tar_posx > cur_posx) { // if true target is on the right side
                // go after him
                lm = false;
                rm = true;
            } else { // target on the left side
                lm = true;
                rm = false;
            }

            if (cur_posy - tar_posy < 32 && cur_posy - tar_posy > 0
                && tar_posx - cur_posx < 32 + 8 && tar_posx - cur_posx > -32) {
                lm = !lm;
                rm = !rm;
            }
            else if (tar_posx - cur_posx < 4 + 8 && tar_posx - cur_posx > -4) {      // makes the bunnies less "nervous"
                lm = false;
                lm = false;
            }

            var jm = should_jump(current_player, cur_posx, cur_posy, tar_posx, tar_posy, lm, rm);

            press_keys(i, lm, rm, jm);
        }
    }

    function should_jump(current_player, cur_posx, cur_posy, tar_posx, tar_posy, lm, rm) {
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
        else if (cur_posy - tar_posy < 32 && cur_posy - tar_posy > 0 &&
            tar_posx - cur_posx < 32 + 8 && tar_posx - cur_posx > -32) { // don't jump - running away
            return false;
        }

        else if (tar_posy <= cur_posy) {  // target on the upper side
            return true;
        } else {  // target below
            return false;
        }
        return jm;
    }

    function press_keys(i, lm, rm, jm) {
        if (lm) {
            keyboard_state.addkey(i, 0);
        } else {
            keyboard_state.delkey(i, 0);
        }

        if (rm) {
            keyboard_state.addkey(i, 1);
        } else {
            keyboard_state.delkey(i, 1);
        }

        if (jm) {
            keyboard_state.addkey(i, 2);
        } else {
            keyboard_state.delkey(i, 2);
        }
    }
    
};