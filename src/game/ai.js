import { BAN_VOID, BAN_WATER, GET_BAN_MAP } from "./level";
import { env } from "../interaction/game_session";
import { player } from "../game/game";

export function AI(keyboard_state) {
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

    function should_jump(current_player, cur_posx, cur_posy, tar_dist_above, tar_directly_above, lm, rm) {

        var already_jumping = keyboard_state.key_pressed(current_player.keys[2]);
        var tile_below = map_tile(cur_posx, cur_posy + 16);
        var tile_above = map_tile(cur_posx, cur_posy - 8);
        var tile_heading_for = map_tile(cur_posx - (lm * 8) + (rm * 16), cur_posy + (already_jumping * 8));
        var on_ground = tile_below != BAN_VOID;
        var at_map_edge = cur_posx <= 16 || cur_posx + 8 >= 352 - 16

        if (on_ground && already_jumping) {
            return false; //must release key before we can jump again
        } 
        else if (blocks_movement(tile_above)) {
            return false; // don't jump if there is something over it
        }
        else if (blocks_movement(tile_heading_for) && !at_map_edge) {
            return true;   // if there is something on the way, jump over it
        }
        else if (blocks_movement(tile_heading_for) && already_jumping) {
            return true;   // this makes it possible to jump over 2 tiles
        }
        else {
            var could_get_above_target = tar_dist_above >= 0 && tar_dist_above < 32;
            return !tar_directly_above && could_get_above_target;
        }
    }

    function blocks_movement(tile_type) {
        return tile_type != BAN_WATER && tile_type != BAN_VOID;
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