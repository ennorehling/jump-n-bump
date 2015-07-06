function Player(playerIndex, keys) {
    this.action_left = false;
    this.action_up = false;
    this.action_right = false;
    this.enabled = true;
    this.dead_flag = false;
    this.bumps = false;
    this.bumped = [];
    this.x = 0; y = 0;
    this.x_add = 0; y_add = 0;
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

    this.update_player_animation = function() {
        this.frame_tick++;
        if (this.frame_tick >= player_anims[this.anim].frame[this.frame].ticks) {
            this.frame++;
            if (this.frame >= player_anims[this.anim].num_frames) {
                if (this.anim != 6)
                    this.frame = player_anims[this.anim].restart_frame;
                else
                    position_player(playerIndex);
            }
            this.frame_tick = 0;
        }
    }
    this.get_image = function () { return player_anims[this.anim].frame[this.frame].image + this.direction * 9; };
    this.keys = keys
};