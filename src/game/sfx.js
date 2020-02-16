export function Sfx(sound_player) {
    "use strict";
    function playOnce(filename_without_extension) {
        return function () { sound_player.play_sound(filename_without_extension, false); };
    };

    this.jump = playOnce("jump");
    this.land = playOnce("land");
    this.death = playOnce("death");
    this.spring = playOnce("spring");
    this.splash = playOnce("splash");
    this.fly = playOnce("fly");
    this.music = function() { sound_player.play_sound("bump", true); };
};