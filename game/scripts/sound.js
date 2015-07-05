// sound.js

var Sfx = function(play_sound) 
{
    this.jump = function() { play_sound("jump", false); };
    this.land = function() { play_sound("land", false); };
    this.death = function() { play_sound("death", false); };
    this.spring = function() { play_sound("spring", false); };
    this.splash = function() { play_sound("splash", false); };
    this.fly = function() { play_sound("fly", false); };
    this.music = function() { play_sound("bump", true); };
};

var Sound = function()
{
    var sounds = [];
    var sfx_extension;
    
    this.silence_all = function() {
        for (i in sounds) {
            sounds[i].audio.pause();
        }
    };
    
    var play_sound = function(sfx_name, loop) {
        if (main_info.music_no_sound) {
            return;
        }
        var i, replace = -1;
        var audio;
        for (i in sounds) {
            if (sounds[i].audio.ended) {
                replace = i;
                if (sounds[i].sfx_name == sfx_name) {
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
        audio.src = "sound/" + sfx_name + "." + sfx_extension;
        if (loop) audio.loop = true;
        audio.load();
        for (var i in sounds) {
            if (sounds[i].ended) {
                sounds[i] = audio;
                audio = null;
                break;
            }
        }
        sounds.push({ audio: audio, sfx_name: sfx_name });
    };
    this.play = new Sfx(play_sound);
};