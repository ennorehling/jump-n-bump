import { player } from "../game/game";

export function Keyboard(key_function_mappings) {
    "use strict";
    var self = this;
    var keys_pressed = {}
    this.key_pressed = function(key) {
        return keys_pressed[key];
    }

    this.addkey = function(player, k) {
        keys_pressed[player.keys[k]] = true;
    }

    this.delkey = function(player, k) {
        keys_pressed[player.keys[k]] = false;
    }
    
    this.onKeyDown = function(evt) {
        keys_pressed[evt.keyCode] = true;
    }

    this.onKeyUp = function(evt) {
        keys_pressed[evt.keyCode] = false;
        var uppercase_string = String.fromCharCode(evt.keyCode);
        if (evt.keyCode >= 49 && evt.keyCode <= 52) {
            var i = evt.keyCode - 49;
            if (evt.altKey) toggle_ai_enabled(i);
            else toggle_player_enabled(i);
        } else {
            var action = key_function_mappings[uppercase_string];
            if (action != null) action();
        }
    }

    function toggle_player_enabled(playerIndex) {
        player[playerIndex].enabled = !player[playerIndex].enabled;
    }
    
    function toggle_ai_enabled(playerIndex) {
        var p = player[playerIndex];
        p.ai = !p.ai;
        self.delkey(p, 0);
        self.delkey(p, 1);
        self.delkey(p, 2);
    }
}