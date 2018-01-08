export function Sound_Player(muted) {
    var self = this;
    var sounds = [];
    var sfx_extension;
    
    function set_single_audio_muted(audio, val) {
        if (val) audio.pause();
        else if (audio.loop) audio.play();
    };

    this.set_muted = function (val) {
        muted = val;
        for (var i in sounds) {
            set_single_audio_muted(sounds[i].audio, val);
        }
    }

    this.toggle_sound = function () {
        self.set_muted(!muted);
    };
    
    this.play_sound = function(sfx_name, loop) {
        var i, replace = -1;
        var audio;
        for (i in sounds) {
            if (sounds[i].audio.ended) {
                replace = i;
                if (sounds[i].sfx_name == sfx_name) {
                    audio = sounds[i].audio;
                    if (!muted) {
                        audio.play();
                    }
                    return;
                }
            }
        }
        audio = document.createElement('audio');
        sfx_extension = audio.canPlayType('audio/mpeg')?'mp3':'ogg';
        const onPlayThrough = function(ev) {
            this.removeEventListener('canplaythrough', onPlayThrough, false);
            
            if (!muted) {
                this.play();
            }
        };
        audio.addEventListener('canplaythrough', onPlayThrough, false);
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