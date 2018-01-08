import { env } from "../interaction/game_session";
import { BAN_SOLID, BAN_VOID, BAN_ICE, GET_BAN_MAP } from "../game/level";
import { LEVEL_HEIGHT, LEVEL_WIDTH, LEVEL_SCALE_FACTOR } from "../asset_data/default_levelmap";
import { player } from "../game/game";

export function Player(playerIndex, keys, is_server, rnd) {
    "use strict";
    this.player_index = playerIndex;
    this.action_left = false;
    this.action_up = false;
    this.action_right = false;
    this.enabled = true;
    this.dead_flag = false;
    this.bumps = false;
    this.bumped = [];
    this.x = { pos: 0 };
    this.y = { pos: 0 };
    this.x.velocity = 0;
    this.y.velocity = 0;
    this.direction = 0;
    this.jump_ready = false;
    this.jump_abort = false;
    this.in_water = false;
    this.anim = 0;
    this.frame = 0;
    this.frame_tick = 0;
    this.set_anim = function (animIndex) {
        this.anim = animIndex;
        this.frame = 0;
        this.frame_tick = 0;
    };

    this.update_player_animation = function () {
        this.frame_tick++;
        if (this.frame_tick >= env.animation_data.players[this.anim].frame[this.frame].ticks) {
            this.frame++;
            if (this.frame >= env.animation_data.players[this.anim].num_frames) {
                if (this.anim != 6)
                    this.frame = env.animation_data.players[this.anim].restart_frame;
                else
                    this.position_player(playerIndex);
            }
            this.frame_tick = 0;
        }
    }
    this.get_image = function () { return env.animation_data.players[this.anim].frame[this.frame].image + this.direction * 9; };
    this.keys = keys

    this.position_player = function(player_num) {
        var c1;
        var s1, s2;

        while (1) {
            while (1) {
                s1 = rnd(LEVEL_WIDTH);
                s2 = rnd(LEVEL_HEIGHT);
                if (GET_BAN_MAP(s1, s2) == BAN_VOID && (GET_BAN_MAP(s1, s2 + 1) == BAN_SOLID || GET_BAN_MAP(s1, s2 + 1) == BAN_ICE))
                    break;
            }
            for (c1 = 0; c1 < env.JNB_MAX_PLAYERS; c1++) {
                if (c1 != player_num && player[c1].enabled) {
                    if (Math.abs((s1 << LEVEL_SCALE_FACTOR) - (player[c1].x.pos >> 16)) < 32 && Math.abs((s2 << LEVEL_SCALE_FACTOR) - (player[c1].y.pos >> 16)) < 32)
                        break;
                }
            }
            if (c1 == env.JNB_MAX_PLAYERS) {
                player[player_num].x.pos = s1 << 20;
                player[player_num].y.pos = s2 << 20;
                player[player_num].x.velocity = player[player_num].y.velocity = 0;
                player[player_num].direction = 0;
                player[player_num].jump_ready = 1;
                player[player_num].in_water = 0;
                player[player_num].set_anim(0);

                if (is_server) {
                    player[player_num].dead_flag = 0;
                }

                break;
            }
        }

    };
};
