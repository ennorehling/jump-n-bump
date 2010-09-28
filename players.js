function create_player_anims() {
    var player_anim_data = [
        1, 0, 0, 0x7fff, 0, 0, 0, 0, 0, 0,
        4, 0, 0, 4, 1, 4, 2, 4, 3, 4,
        1, 0, 4, 0x7fff, 0, 0, 0, 0, 0, 0,
        4, 2, 5, 8, 6, 10, 7, 3, 6, 3,
        1, 0, 6, 0x7fff, 0, 0, 0, 0, 0, 0,
        2, 1, 5, 8, 4, 0x7fff, 0, 0, 0, 0,
        1, 0, 8, 5, 0, 0, 0, 0, 0, 0
    ];

    var player_anims = [];
	for (var c1 = 0; c1 < 7; c1++) {
        player_anims[c1] = { frame : [] };
		player_anims[c1].num_frames = player_anim_data[c1 * 10];
		player_anims[c1].restart_frame = player_anim_data[c1 * 10 + 1];
		for (var c2 = 0; c2 < 4; c2++) {
            player_anims[c1].frame[c2] = {};
			player_anims[c1].frame[c2].image = player_anim_data[c1 * 10 + c2 * 2 + 2];
			player_anims[c1].frame[c2].ticks = player_anim_data[c1 * 10 + c2 * 2 + 3];
		}
	}
    return player_anims;
}

var player_anims = create_player_anims();
