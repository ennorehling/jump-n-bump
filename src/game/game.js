import { env } from "../interaction/game_session";
import { Player } from "../game/player";
import { SET_BAN_MAP } from "../game/level";

export let player = [];

export function Game(movement, ai, animation, renderer, objects, key_pressed, level, is_server, rnd) {
    "use strict";
    var next_time = 0;
    var playing = false;
    reset_players();
    reset_level();

    function reset_players() {
        player = [
        new Player(0, [37, 39, 38], is_server, rnd),
        new Player(1, [65, 68, 87], is_server, rnd),
        new Player(2, [100, 102, 104], is_server, rnd),
        new Player(3, [74, 76, 73], is_server, rnd)
        ];
        player[3].ai = true;
    }

    function reset_level() {
        SET_BAN_MAP(level.ban_map);
        objects.reset_objects();

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
        movement.collision_check();
        animation.update_object();
        renderer.draw();
    }

    function pump() {
        while (playing) {
            game_iteration();
            var now = timeGetTime();
            var time_diff = next_time - now;
            next_time += (1000 / 60);

            if (time_diff > 0) {
                // we have time left
                setTimeout(pump, time_diff);
                break;
            }
        }
    }

    this.start = function () {
        next_time = timeGetTime() + 1000;
        playing = true;
        pump();
    }

    this.pause = function () {
        playing = false;
    }
}