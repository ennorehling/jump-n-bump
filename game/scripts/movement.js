function steer_player(p)
{
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
			p.anim = 0;
			p.frame = 0;
			p.frame_tick = 0;
			p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
		}
	}
	if (jetpack == 0) {
		/* no jetpack */
		if (pogostick == 1 || (p.jump_ready == 1 && p.action_up)) {
			s1 = (p.x >> 16);
			s2 = (p.y >> 16);
			if (s2 < -16)
				s2 = -16; //Allow player to jump off screen but not negative overflow if using jetpack
			/* jump */
			if (GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY(s1, (s2 + 16)) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), (s2 + 16)) == BAN_ICE) {
				p.y_add = -280000;
				p.anim = 2;
				p.frame = 0;
				p.frame_tick = 0;
				p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
				p.jump_ready = 0;
				p.jump_abort = 1;
				if (pogostick == 0)
					dj_play_sfx(SFX_JUMP, (SFX_JUMP_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
				else
					dj_play_sfx(SFX_SPRING, (SFX_SPRING_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
			}
			/* jump out of water */
			if (GET_BAN_MAP_IN_WATER(s1, s2)) {
				p.y_add = -196608;
				p.in_water = 0;
				p.anim = 2;
				p.frame = 0;
				p.frame_tick = 0;
				p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
				p.jump_ready = 0;
				p.jump_abort = 1;
				if (pogostick == 0)
					dj_play_sfx(SFX_JUMP, (SFX_JUMP_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
				else
					dj_play_sfx(SFX_SPRING, (SFX_SPRING_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
			}
		}
		/* fall down by gravity */
		if (pogostick == 0 && (!p.action_up)) {
			p.jump_ready = 1;
			if (p.in_water == 0 && p.y_add < 0 && p.jump_abort == 1) {
				if (bunnies_in_space == 0)
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
		p.anim = 2;
		p.frame = 0;
		p.frame_tick = 0;
		p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
		p.jump_ready = 0;
		p.jump_abort = 0;
		for (c2 = 0; c2 < NUM_OBJECTS; c2++) {
			if (objects[c2].used == 1 && objects[c2].type == OBJ_SPRING) {
				if (GET_BAN_MAP_XY((s1 + 8), (s2 + 15)) == BAN_SPRING) {
					if ((objects[c2].x >> 20) == ((s1 + 8) >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
						objects[c2].frame = 0;
						objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
						objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
						break;
					}
				} else {
					if (GET_BAN_MAP_XY(s1, (s2 + 15)) == BAN_SPRING) {
						if ((objects[c2].x >> 20) == (s1 >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
							objects[c2].frame = 0;
							objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
							objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
							break;
						}
					} else if (GET_BAN_MAP_XY((s1 + 15), (s2 + 15)) == BAN_SPRING) {
						if ((objects[c2].x >> 20) == ((s1 + 15) >> 4) && (objects[c2].y >> 20) == ((s2 + 15) >> 4)) {
							objects[c2].frame = 0;
							objects[c2].ticks = object_anims[objects[c2].anim].frame[objects[c2].frame].ticks;
							objects[c2].image = object_anims[objects[c2].anim].frame[objects[c2].frame].image;
							break;
						}
					}
				}
			}
		}
		dj_play_sfx(SFX_SPRING, (SFX_SPRING_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
	}
	s1 = (p.x >> 16);
	s2 = (p.y >> 16);
	if (s2 < 0)
		s2 = 0;
	if (GET_BAN_MAP_XY(s1, s2) == BAN_SOLID || GET_BAN_MAP_XY(s1, s2) == BAN_ICE || GET_BAN_MAP_XY(s1, s2) == BAN_SPRING || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SOLID || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_ICE || GET_BAN_MAP_XY((s1 + 15), s2) == BAN_SPRING) {
		p.y = (((s2 + 16) & 0xfff0)) << 16;
		p.y_add = 0;
		p.anim = 0;
		p.frame = 0;
		p.frame_tick = 0;
		p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
	}
	s1 = (p.x >> 16);
	s2 = (p.y >> 16);
	if (s2 < 0)
		s2 = 0;
	if (GET_BAN_MAP_XY((s1 + 8), (s2 + 8)) == BAN_WATER) {
		if (p.in_water == 0) {
			/* falling into water */
			p.in_water = 1;
			p.anim = 4;
			p.frame = 0;
			p.frame_tick = 0;
			p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
			if (p.y_add >= 32768) {
				add_object(OBJ_SPLASH, (p.x >> 16) + 8, ((p.y >> 16) & 0xfff0) + 15, 0, 0, OBJ_ANIM_SPLASH, 0);

				if (blood_is_thicker_than_water == 0)
					dj_play_sfx(SFX_SPLASH, (SFX_SPLASH_FREQ + rnd(2000) - 1000), 64, 0, 0, -1);
				else
					dj_play_sfx(SFX_SPLASH, (SFX_SPLASH_FREQ + rnd(2000) - 5000), 64, 0, 0, -1);
			}
		}
		/* slowly move up to water surface */
		p.y_add -= 1536;
		if (p.y_add < 0 && p.anim != 5) {
			p.anim = 5;
			p.frame = 0;
			p.frame_tick = 0;
			p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
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
			p.anim = 0;
			p.frame = 0;
			p.frame_tick = 0;
			p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
		}
	} else {
		if (p.in_water == 0) {
			if (bunnies_in_space == 0)
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
		p.anim = 3;
		p.frame = 0;
		p.frame_tick = 0;
		p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
	}
}