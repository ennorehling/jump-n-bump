
function update_player_animation(p, playerIndex) {
	p.frame_tick++;
	if (p.frame_tick >= player_anims[p.anim].frame[p.frame].ticks) {
		p.frame++;
		if (p.frame >= player_anims[p.anim].num_frames) {
			if (p.anim != 6)
				p.frame = player_anims[p.anim].restart_frame;
			else
				position_player(playerIndex);
		}
		p.frame_tick = 0;
	}
	p.image = player_anims[p.anim].frame[p.frame].image + p.direction * 9;
}

function update_object_animations() {
    var c1;
    var s1 = 0;

    for (c1 = 0; c1 < NUM_OBJECTS; c1++) {
        var obj = objects[c1];
        if (obj.used) {
            switch (obj.type) {
            case OBJ_SPRING:
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames) {
                        obj.frame--;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                    } else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_SPLASH:
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.used = false;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_SMOKE:
                obj.x += obj.x_add;
                obj.y += obj.y_add;
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.used = false;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_YEL_BUTFLY:
            case OBJ_PINK_BUTFLY:
                obj.x_acc += rnd(128) - 64;
                if (obj.x_acc < -1024)
                    obj.x_acc = -1024;
                if (obj.x_acc > 1024)
                    obj.x_acc = 1024;
                obj.x_add += obj.x_acc;
                if (obj.x_add < -32768)
                    obj.x_add = -32768;
                if (obj.x_add > 32768)
                    obj.x_add = 32768;
                obj.x += obj.x_add;
                if ((obj.x >> 16) < 16) {
                    obj.x = 16 << 16;
                    obj.x_add = -obj.x_add >> 2;
                    obj.x_acc = 0;
                } else if ((obj.x >> 16) > 350) {
                    obj.x = 350 << 16;
                    obj.x_add = -obj.x_add >> 2;
                    obj.x_acc = 0;
                }
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0) {
                    if (obj.x_add < 0) {
                        obj.x = (((obj.x >> 16) + 16) & 0xfff0) << 16;
                    } else {
                        obj.x = ((((obj.x >> 16) - 16) & 0xfff0) + 15) << 16;
                    }
                    obj.x_add = -obj.x_add >> 2;
                    obj.x_acc = 0;
                }
                obj.y_acc += rnd(64) - 32;
                if (obj.y_acc < -1024)
                    obj.y_acc = -1024;
                if (obj.y_acc > 1024)
                    obj.y_acc = 1024;
                obj.y_add += obj.y_acc;
                if (obj.y_add < -32768)
                    obj.y_add = -32768;
                if (obj.y_add > 32768)
                    obj.y_add = 32768;
                obj.y += obj.y_add;
                if ((obj.y >> 16) < 0) {
                    obj.y = 0;
                    obj.y_add = -obj.y_add >> 2;
                    obj.y_acc = 0;
                } else if ((obj.y >> 16) > 255) {
                    obj.y = 255 << 16;
                    obj.y_add = -obj.y_add >> 2;
                    obj.y_acc = 0;
                }
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0) {
                    if (obj.y_add < 0) {
                        obj.y = (((obj.y >> 16) + 16) & 0xfff0) << 16;
                    } else {
                        obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                    }
                    obj.y_add = -obj.y_add >> 2;
                    obj.y_acc = 0;
                }
                if (obj.type == OBJ_YEL_BUTFLY) {
                    if (obj.x_add < 0 && obj.anim != OBJ_ANIM_YEL_BUTFLY_LEFT) {
                        obj.anim = OBJ_ANIM_YEL_BUTFLY_LEFT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    } else if (obj.x_add > 0 && obj.anim != OBJ_ANIM_YEL_BUTFLY_RIGHT) {
                        obj.anim = OBJ_ANIM_YEL_BUTFLY_RIGHT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                } else {
                    if (obj.x_add < 0 && obj.anim != OBJ_ANIM_PINK_BUTFLY_LEFT) {
                        obj.anim = OBJ_ANIM_PINK_BUTFLY_LEFT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    } else if (obj.x_add > 0 && obj.anim != OBJ_ANIM_PINK_BUTFLY_RIGHT) {
                        obj.anim = OBJ_ANIM_PINK_BUTFLY_RIGHT;
                        obj.frame = 0;
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.frame = object_anims[obj.anim].restart_frame;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            case OBJ_FUR:
                if (rnd(100) < 30)
                    add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 0);
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 0) {
                    obj.y_add += 3072;
                    if (obj.y_add > 196608)
                        obj.y_add = 196608;
                } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 2) {
                    if (obj.x_add < 0) {
                        if (obj.x_add < -65536)
                            obj.x_add = -65536;
                        obj.x_add += 1024;
                        if (obj.x_add > 0)
                            obj.x_add = 0;
                    } else {
                        if (obj.x_add > 65536)
                            obj.x_add = 65536;
                        obj.x_add -= 1024;
                        if (obj.x_add < 0)
                            obj.x_add = 0;
                    }
                    obj.y_add += 1024;
                    if (obj.y_add < -65536)
                        obj.y_add = -65536;
                    if (obj.y_add > 65536)
                        obj.y_add = 65536;
                }
                obj.x += obj.x_add;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1 || GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3)) {
                    if (obj.x_add < 0) {
                        obj.x = (((obj.x >> 16) + 16) & 0xfff0) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    } else {
                        obj.x = ((((obj.x >> 16) - 16) & 0xfff0) + 15) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    }
                }
                obj.y += obj.y_add;
                if ((obj.x >> 16) < -5 || (obj.x >> 16) > 405 || (obj.y >> 16) > 260)
                    obj.used = false;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0)) {
                    if (obj.y_add < 0) {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 2) {
                            obj.y = (((obj.y >> 16) + 16) & 0xfff0) << 16;
                            obj.x_add >>= 2;
                            obj.y_add = -obj.y_add >> 2;
                        }
                    } else {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1) {
                            if (obj.y_add > 131072) {
                                obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                                obj.x_add >>= 2;
                                obj.y_add = -obj.y_add >> 2;
                            } else
                                obj.used = false;
                        } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3) {
                            obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                            if (obj.y_add > 131072)
                                obj.y_add = -obj.y_add >> 2;
                            else
                                obj.y_add = 0;
                        }
                    }
                }
                if (obj.x_add < 0 && obj.x_add > -16384)
                    obj.x_add = -16384;
                if (obj.x_add > 0 && obj.x_add < 16384)
                    obj.x_add = 16384;
                if (obj.used) {
                    s1 = Math.floor(Math.atan2(obj.y_add, obj.x_add) * 4 / Math.PI);
                    if (s1 < 0)
                        s1 += 8;
                    if (s1 < 0)
                        s1 = 0;
                    if (s1 > 7)
                        s1 = 7;
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.frame + s1]);
                }
                break;
            case OBJ_FLESH:
                if (rnd(100) < 30) {
                    if (obj.frame == 76)
                        add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 1);
                    else if (obj.frame == 77)
                        add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 2);
                    else if (obj.frame == 78)
                        add_object(OBJ_FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, OBJ_ANIM_FLESH_TRACE, 3);
                }
                if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 0) {
                    obj.y_add += 3072;
                    if (obj.y_add > 196608)
                        obj.y_add = 196608;
                } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 2) {
                    if (obj.x_add < 0) {
                        if (obj.x_add < -65536)
                            obj.x_add = -65536;
                        obj.x_add += 1024;
                        if (obj.x_add > 0)
                            obj.x_add = 0;
                    } else {
                        if (obj.x_add > 65536)
                            obj.x_add = 65536;
                        obj.x_add -= 1024;
                        if (obj.x_add < 0)
                            obj.x_add = 0;
                    }
                    obj.y_add += 1024;
                    if (obj.y_add < -65536)
                        obj.y_add = -65536;
                    if (obj.y_add > 65536)
                        obj.y_add = 65536;
                }
                obj.x += obj.x_add;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1 || GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3)) {
                    if (obj.x_add < 0) {
                        obj.x = (((obj.x >> 16) + 16) & 0xfff0) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    } else {
                        obj.x = ((((obj.x >> 16) - 16) & 0xfff0) + 15) << 16;
                        obj.x_add = -obj.x_add >> 2;
                    }
                }
                obj.y += obj.y_add;
                if ((obj.x >> 16) < -5 || (obj.x >> 16) > 405 || (obj.y >> 16) > 260)
                    obj.used = false;
                if ((obj.y >> 16) > 0 && (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 0)) {
                    if (obj.y_add < 0) {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) != 2) {
                            obj.y = (((obj.y >> 16) + 16) & 0xfff0) << 16;
                            obj.x_add >>= 2;
                            obj.y_add = -obj.y_add >> 2;
                        }
                    } else {
                        if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 1) {
                            if (obj.y_add > 131072) {
                                obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                                obj.x_add >>= 2;
                                obj.y_add = -obj.y_add >> 2;
                            } else {
                                if (rnd(100) < 10) {
                                    s1 = rnd(4) - 2;
                                    add_leftovers(obj.x >> 16, (obj.y >> 16) + s1, img_objects, object_gobs[obj.frame]);
                                }
                                obj.used = false;
                            }
                        } else if (GET_BAN_MAP(obj.x >> 20, obj.y >> 20) == 3) {
                            obj.y = ((((obj.y >> 16) - 16) & 0xfff0) + 15) << 16;
                            if (obj.y_add > 131072)
                                obj.y_add = -obj.y_add >> 2;
                            else
                                obj.y_add = 0;
                        }
                    }
                }
                if (obj.x_add < 0 && obj.x_add > -16384)
                    obj.x_add = -16384;
                if (obj.x_add > 0 && obj.x_add < 16384)
                    obj.x_add = 16384;
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.frame]);
                break;
            case OBJ_FLESH_TRACE:
                obj.ticks--;
                if (obj.ticks <= 0) {
                    obj.frame++;
                    if (obj.frame >= object_anims[obj.anim].num_frames)
                        obj.used = false;
                    else {
                        obj.ticks = object_anims[obj.anim].frame[obj.frame].ticks;
                        obj.image = object_anims[obj.anim].frame[obj.frame].image;
                    }
                }
                if (obj.used)
                    add_pob(obj.x >> 16, obj.y >> 16, img_objects, object_gobs[obj.image]);
                break;
            }
        }
    }
}