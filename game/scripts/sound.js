// sound.js



var sfx_name = ["jump", "land", "death", "spring", "splash", "fly", "bump" ];
var sounds = [];
var sfx_extension;

function silence_all() {
    for (i in sounds) {
        sounds[i].audio.pause();
    }
}

function play_sound(sfx, loop) {
    if (main_info.music_no_sound) {
        return;
    }
    var i, replace = -1;
    var audio;
    for (i in sounds) {
        if (sounds[i].audio.ended) {
            replace = i;
            if (sounds[i].sfx == sfx) {
                audio = sounds[i].audio;
                audio.play();
                return;
            }
        }
    }
    audio = document.createElement('audio');
    sfx_extension = audio.canPlayType('audio/mpeg')?'mp3':'ogg';
    audio.addEventListener('canplaythrough', function(ev) {
        this.removeEventListener('canplaythrough', arguments.callee,false);
        this.play();
    }, false);
    audio.src = "sound/" + sfx_name[sfx] + "." + sfx_extension;
    if (loop) audio.loop = true;
    audio.load();
    for (var i in sounds) {
        if (sounds[i].ended) {
            sounds[i] = audio;
            audio = null;
            break;
        }
    }
    sounds.push({ audio: audio, sfx: sfx });
}

function dj_play_sfx(sfx, freq, volume, panning, delay, channel) {
    play_sound(sfx, false);
}
