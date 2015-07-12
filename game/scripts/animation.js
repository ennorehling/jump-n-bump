function Animation(renderer, img, objects) {

    function advance_frame(obj, pause_at_end)
    {
        obj.frame++;
        if (obj.frame >= env.animation_data.objects[obj.anim].num_frames) {
            if (pause_at_end) {
                obj.frame--;
                obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
            }
            else {
                obj.used = false;
            }
        } else {
            obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
            obj.image = env.animation_data.objects[obj.anim].frame[obj.frame].image;
        }
    }

    function tick(obj, pause_at_end) {
        obj.ticks--;
        if (obj.ticks <= 0) {
            advance_frame(obj, pause_at_end);
        }
        if (obj.used)
            renderer.add_pob(obj.x >> 16, obj.y >> 16, img.objects, object_gobs[obj.image]);
    }


    this.update_object = function () {
        var c1;
        var s1 = 0;

        for (c1 = 0; c1 < env.MAX_OBJECTS; c1++) {
            var obj = objects.objects[c1];
            if (obj.used) {
                switch (obj.type) {
                    case objects.SPRING:
                        tick(obj, true);
                        break;
                    case objects.SPLASH:
                    case objects.SMOKE:
                    case objects.FLESH_TRACE:
                        tick(obj, false);
                        break;
                    case objects.YEL_BUTFLY:
                    case objects.PINK_BUTFLY:
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
                        if (obj.type == objects.YEL_BUTFLY) {
                            if (obj.x_add < 0 && obj.anim != objects.ANIM_YEL_BUTFLY_LEFT) {
                                obj.anim = objects.ANIM_YEL_BUTFLY_LEFT;
                                obj.frame = 0;
                                obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
                                obj.image = env.animation_data.objects[obj.anim].frame[obj.frame].image;
                            } else if (obj.x_add > 0 && obj.anim != objects.ANIM_YEL_BUTFLY_RIGHT) {
                                obj.anim = objects.ANIM_YEL_BUTFLY_RIGHT;
                                obj.frame = 0;
                                obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
                                obj.image = env.animation_data.objects[obj.anim].frame[obj.frame].image;
                            }
                        } else {
                            if (obj.x_add < 0 && obj.anim != objects.ANIM_PINK_BUTFLY_LEFT) {
                                obj.anim = objects.ANIM_PINK_BUTFLY_LEFT;
                                obj.frame = 0;
                                obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
                                obj.image = env.animation_data.objects[obj.anim].frame[obj.frame].image;
                            } else if (obj.x_add > 0 && obj.anim != objects.ANIM_PINK_BUTFLY_RIGHT) {
                                obj.anim = objects.ANIM_PINK_BUTFLY_RIGHT;
                                obj.frame = 0;
                                obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
                                obj.image = env.animation_data.objects[obj.anim].frame[obj.frame].image;
                            }
                        }
                        obj.ticks--;
                        if (obj.ticks <= 0) {
                            obj.frame++;
                            if (obj.frame >= env.animation_data.objects[obj.anim].num_frames)
                                obj.frame = env.animation_data.objects[obj.anim].restart_frame;
                            else {
                                obj.ticks = env.animation_data.objects[obj.anim].frame[obj.frame].ticks;
                                obj.image = env.animation_data.objects[obj.anim].frame[obj.frame].image;
                            }
                        }
                        if (obj.used)
                            renderer.add_pob(obj.x >> 16, obj.y >> 16, img.objects, object_gobs[obj.image]);
                        break;
                    case objects.FUR:
                        if (rnd(100) < 30)
                            objects.add(objects.FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, objects.ANIM_FLESH_TRACE, 0);
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
                            renderer.add_pob(obj.x >> 16, obj.y >> 16, img.objects, object_gobs[obj.frame + s1]);
                        }
                        break;
                    case objects.FLESH:
                        if (rnd(100) < 30) {
                            if (obj.frame == 76)
                                objects.add(objects.FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, objects.ANIM_FLESH_TRACE, 1);
                            else if (obj.frame == 77)
                                objects.add(objects.FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, objects.ANIM_FLESH_TRACE, 2);
                            else if (obj.frame == 78)
                                objects.add(objects.FLESH_TRACE, obj.x >> 16, obj.y >> 16, 0, 0, objects.ANIM_FLESH_TRACE, 3);
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
                                            renderer.add_leftovers(obj.x >> 16, (obj.y >> 16) + s1, img.objects, object_gobs[obj.frame]);
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
                            renderer.add_pob(obj.x >> 16, obj.y >> 16, img.objects, object_gobs[obj.frame]);
                        break;
                }
            }
        }
    }
}