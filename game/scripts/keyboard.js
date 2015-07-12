
function Keyboard(sound_player) {
    var keys_pressed = {}
    this.key_pressed = function(key) {
        return keys_pressed[key];
    }

    this.addkey = function(i, k) {
        keys_pressed[player[i].keys[k]] = true;
    }

    this.delkey = function(i, k) {
        keys_pressed[player[i].keys[k]] = false;
    }
    
    this.onKeyDown = function(evt) {
        keys_pressed[evt.keyCode] = true;
    }

    this.onKeyUp = function(evt) {
        keys_pressed[evt.keyCode] = false;
        if (evt.keyCode >= 49 && evt.keyCode <= 52) {
            var i = evt.keyCode - 49;
            if (evt.altKey) toggle_ai_enabled(i);
            else toggle_player_enabled(i);
        } else if (evt.keyCode == 77) { // 'm'
            sound_player.toggle_sound();
            debug(evt.keyCode);
        }
    }

    function debug(str) {
        document.getElementById('debug').innerHTML = str;
    }

    function toggle_player_enabled(playerIndex) {
        player[playerIndex].enabled = !player[playerIndex].enabled;
    }
    
    function toggle_ai_enabled(playerIndex) {
        player[playerIndex].ai = !player[playerIndex].ai;
        player[playerIndex].direction = 0;
    }
}