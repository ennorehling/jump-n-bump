function Sound_Player(muted) {
    var sounds = [];
    var sfx_extension;
    
    function toggle_pause(audio) {
        if (muted) audio.pause();
        else if (audio.loop) audio.play();
    };

    this.toggle_sound = function () {
        muted = !muted;
        for (var i in sounds) {
            toggle_pause(sounds[i].audio);
        }
    };
    
    this.play_sound = function(sfx_name, loop) {
        if (muted) {
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
};