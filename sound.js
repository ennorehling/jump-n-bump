// sound.js

var SFX_JUMP = 0;
var SFX_LAND = 1;
var SFX_DEATH = 2;
var SFX_SPRING = 3;
var SFX_SPLASH = 4;
var SFX_FLY = 5;
var SFX_MUSIC = 6;

var NUM_SFX = 6;

var sfx_name = ["jump", "land", "death", "spring", "splash", "fly", "bump" ];
var sounds = [];

function play_sound(sfx, loop) {
    if (!main_info.music_no_sound) {
        var audio = document.createElement('audio');
        var format = audio.canPlayType('audio/mpeg')?'mp3':'ogg';
        audio.addEventListener('canplaythrough', function(ev) {
            this.removeEventListener('canplaythrough', arguments.callee,false);
            this.play();
        }, false);
        audio.src = "sound/" + sfx_name[sfx] + "." + format;
        if (loop) audio.loop = true;
        audio.load();
        for (var i in sounds) {
            if (sounds[i].ended) {
                sounds[i] = audio;
                audio = null;
                break;
            }
        }
        if (audio) {
            sounds.push(audio);
        }
    }
}

function dj_play_sfx(sfx, freq, volume, panning, delay, channel) {
    play_sound(sfx, false);
}
