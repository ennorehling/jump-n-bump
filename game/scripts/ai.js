
function AI(enabledForPlayer) {

    function map_tile(x, y) {
        return GET_BAN_MAP(x >> 4, y >> 4);
    }
    
    this.toggleForPlayer = function(playerIndex)
    {
        enabledForPlayer[playerIndex] = !enabledForPlayer[playerIndex];
        player[playerIndex].direction = 0;
    }

    this.cpu_move = function() {
        var lm, rm, jm;
        var i, j;
        var cur_posx, cur_posy, tar_posx, tar_posy;
        var players_distance;
        var deltax, deltay;
        var target, key;
        var nearest_distance;

        for (i = 0; i < env.JNB_MAX_PLAYERS; i++) {
            nearest_distance = -1;
            target = null;
            if (enabledForPlayer[i] && player[i].enabled) {
                for (j = 0; j < env.JNB_MAX_PLAYERS; j++) {
                    if (i == j || !player[j].enabled) {
                        continue;
                    }
                    deltax = player[j].x - player[i].x;
                    deltay = player[j].y - player[i].y;
                    players_distance = deltax * deltax + deltay * deltay;

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

                /* Y-axis movement */
                if (map_tile(cur_posx, cur_posy + 16) != BAN_VOID &&
                    key_pressed(player[i].keys[2]))
                    jm = false;   // if we are on ground and jump key is being pressed,
                    //first we have to release it or else we won't be able to jump more than once

                else if (map_tile(cur_posx, cur_posy - 8) != BAN_VOID &&
                    map_tile(cur_posx, cur_posy - 8) != BAN_WATER) {
                    jm = false;   // don't jump if there is something over it
                }
                else if (map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy) != BAN_VOID &&
                    map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy) != BAN_WATER &&
                    cur_posx > 16 && cur_posx < 352 - 16 - 8)  // obstacle, jump
                    jm = true;   // if there is something on the way, jump over it

                else if (key_pressed(player[i].keys[2]) &&
                                (map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy + 8) != BAN_VOID &&
                                map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy + 8) != BAN_WATER)) {
                    jm = true;   // this makes it possible to jump over 2 tiles
                }
                else if (cur_posy - tar_posy < 32 && cur_posy - tar_posy > 0 &&
                  tar_posx - cur_posx < 32 + 8 && tar_posx - cur_posx > -32) { // don't jump - running away
                    jm = false;
                }

                else if (tar_posy <= cur_posy) {  // target on the upper side
                    jm = true;
                } else {  // target below
                    jm = false;
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

                if (jm) {
                    addkey(i, 2);
                } else {
                    delkey(i, 2);
                }
            }
        }
    }
};