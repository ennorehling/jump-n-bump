import { Animation_Data } from "../asset_data/animation_data";
import { Renderer } from "../interaction/renderer";
import { Objects } from "../game/objects";
import { Keyboard } from "../game/keyboard";
import { AI } from "../game/ai";
import { Animation } from "../game/animation";
import { Sound_Player } from "../resource_loading/sound_player";
import { Sfx } from "../game/sfx";
import { Movement } from "../game/movement";
import { Game, player } from "../game/game";
import { Scores_ViewModel } from "../interaction/scores_viewmodel";
import ko from "knockout";

export const env = {
    JNB_MAX_PLAYERS: 4,
    MAX_OBJECTS: 200,
    animation_data: new Animation_Data(),
    level: {}
};

function Enum(obj) {
    return Object.freeze ? Object.freeze(obj) : obj;
}
var Game_State = Enum({ Not_Started: 0, Playing: 1, Paused: 2 });

export function Game_Session(level) {
    "use strict";
    var self = this;

    function rnd(max_value) {
        return Math.floor(Math.random() * max_value);
    }

    function gup(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null)
            return "";
        else
            return results[1];
    }

    var canvas = document.getElementById('screen');
    var img = {
        rabbits: document.getElementById('rabbits'),
        objects: document.getElementById('objects'),
        numbers: document.getElementById('numbers')    
    };
    
    
    var settings = {
        pogostick: gup('pogostick') == '1',
        jetpack: gup('jetpack') == '1',
        bunnies_in_space: gup('space') == '1',
        flies_enabled: gup('lordoftheflies') == '1',
        blood_is_thicker_than_water: gup('bloodisthickerthanwater') == '1',
        no_gore: gup('nogore') == '1'
    };
    var muted = gup('nosound') == '1';
    

    var renderer = new Renderer(canvas, img, level);
    var objects = new Objects(rnd);
    var key_action_mappings = [];
    var keyboard = new Keyboard(key_action_mappings);
    var ai = new AI(keyboard);
    var animation = new Animation(renderer, img, objects, rnd);
    this.sound_player = new Sound_Player(muted);
    var sfx = new Sfx(this.sound_player);
    var movement = new Movement(renderer, img, sfx, objects, settings, rnd);
    var game = new Game(movement, ai, animation, renderer, objects, keyboard.key_pressed, level, true, rnd);

    this.scores = ko.observable([[]]);
    this.game_state = ko.observable(Game_State.Not_Started);

    this.pause = function () {
        self.game_state(Game_State.Paused);
        self.sound_player.set_muted(true);
        game.pause();
        self.scores(player.map(function (p) { return p.bumped; }));
    }
    this.unpause = function () {
        self.game_state(Game_State.Playing);
        self.sound_player.set_muted(muted);
        game.start();
    }
    this.start = function () {
        sfx.music();
        self.unpause();
    }

    key_action_mappings["M"] = function () {
        if (self.game_state() === Game_State.Playing) {
            muted = !muted;
            self.sound_player.toggle_sound();
        }
    }
    key_action_mappings["P"] = function () {
        switch(self.game_state()) {
            case Game_State.Not_Started:
                self.start();
                break;
            case Game_State.Paused:
                self.unpause();
                break;
            case Game_State.Playing:
                self.pause();
                break;
        }
    };

    document.onkeydown = keyboard.onKeyDown;
    document.onkeyup = keyboard.onKeyUp;

}