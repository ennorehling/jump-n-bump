// sound.js

var Sound = function()
{
    this.consts =  
    {
        JUMP_FREQ: 15000,
        LAND_FREQ: 15000,
        DEATH_FREQ: 20000,
        SPRING_FREQ: 15000,
        SPLASH_FREQ: 12000,
        FLY_FREQ: 12000,
        
        JUMP: 0,
        LAND: 1,
        DEATH: 2,
        SPRING: 3,
        SPLASH: 4,
        FLY: 5,
        MUSIC: 6,
        NUM_SFX: 6
    };
    
    var sfx_name = ["jump", "land", "death", "spring", "splash", "fly", "bump" ];
    var sounds = [];
    var sfx_extension;
    
    this.silence_all = function() {
        for (i in sounds) {
            sounds[i].audio.pause();
        }
    };
    
    this.play_sound = function(sfx, loop) {
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
    };
    
    this.dj_play_sfx = function(sfx, freq, volume, panning, delay, channel) {
        this.play_sound(sfx, false);
    };
};