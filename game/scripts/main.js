var env = {
    JNB_MAX_PLAYERS: 4,
    MAX_OBJECTS: 200,
    animation_data: new Animation_Data()
};


var keys_pressed = {}
function key_pressed(key) {
    return keys_pressed[key];
}

function addkey(i, k) {
    keys_pressed[player[i].keys[k]] = true;
}

function delkey(i, k) {
    keys_pressed[player[i].keys[k]] = false;
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

function init() {
    var canvas = document.getElementById('screen');
    var img = {};
    img.level = document.getElementById('level');
    img.mask = document.getElementById('mask');
    img.rabbits = document.getElementById('rabbits');
    img.objects = document.getElementById('objects');
    img.numbers = document.getElementById('numbers');

    var settings = {
        pogostick: gup('pogostick') == '1',
        jetpack: gup('jetpack') == '1',
        bunnies_in_space: gup('space') == '1',
        flies_enabled: false,
        blood_is_thicker_than_water: false,
        no_gore: false
    };
    var muted = gup('nosound') == '1';

    var sound_player = new Sound_Player(muted);
    var sfx = new Sfx(sound_player);
    movement = new Movement(sfx, settings);
    
    var game = new Game(canvas, img, movement, sound_player);
    document.onkeydown = game.onKeyDown;
    document.onkeyup = game.onKeyUp;
    sfx.music();
    game.start();
}

function rnd(max_value) {
    return Math.floor(Math.random()*max_value);
}

var player = [];