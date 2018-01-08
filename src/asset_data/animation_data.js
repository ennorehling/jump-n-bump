export function Animation_Data() {
    "use strict";
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

        const player_anims = [];
	    for (var c1 = 0; c1 < 7; c1++) {
            player_anims[c1] = {
                frame: [],
	            num_frames: player_anim_data[c1 * 10],
	            restart_frame: player_anim_data[c1 * 10 + 1]
            };
		    
		    for (var c2 = 0; c2 < 4; c2++) {
                player_anims[c1].frame[c2] = {};
			    player_anims[c1].frame[c2].image = player_anim_data[c1 * 10 + c2 * 2 + 2];
			    player_anims[c1].frame[c2].ticks = player_anim_data[c1 * 10 + c2 * 2 + 3];
		    }
	    }
        return player_anims;
    }


    function create_object_anims() {
        var object_anims = [];
        var object_anim_data = [
            [6, 0, [[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [0, 0], [0, 0], [0, 0], [0, 0]]],
            [9, 0, [[6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [13, 2], [14, 2], [0, 0]]],
            [5, 0, [[15, 3], [16, 3], [16, 3], [17, 3], [18, 3], [19, 3], [0, 0], [0, 0], [0, 0], [0, 0]]],
            [10, 0, [[20, 2], [21, 2], [22, 2], [23, 2], [24, 2], [25, 2], [24, 2], [23, 2], [22, 2], [21, 2]]],
            [10, 0, [[26, 2], [27, 2], [28, 2], [29, 2], [30, 2], [31, 2], [30, 2], [29, 2], [28, 2], [27, 2]]],
            [10, 0, [[32, 2], [33, 2], [34, 2], [35, 2], [36, 2], [37, 2], [36, 2], [35, 2], [34, 2], [33, 2]]],
            [10, 0, [[38, 2], [39, 2], [40, 2], [41, 2], [42, 2], [43, 2], [42, 2], [41, 2], [40, 2], [39, 2]]],
            [4, 0, [[76, 4], [77, 4], [78, 4], [79, 4], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]]]
        ];
        for (var i = 0; i != 8; ++i) {
            var frames = [];
            for (var j = 0; j != 10; ++j) {
                frames[j] = {
                    image: object_anim_data[i][2][j][0],
                    ticks: object_anim_data[i][2][j][1]
                };
            }
            object_anims[i] = {
                num_frames: object_anim_data[i][0],
                restart_frame: object_anim_data[i][1],
                frame: frames
            };
        }
        return object_anims;
    }

    this.players = create_player_anims();
    this.objects = create_object_anims();
}
