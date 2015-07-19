function Enum(obj) {
    return Object.freeze ? Object.freeze(obj) : obj;
}
var Page = Enum({ Instructions: 0, Game: 1, Scores: 2 });

function ViewModel() {
    "use strict";
    var self = this;
    this.current_page = ko.observable(Page.Instructions);
    this.loading_level = ko.observable(true);
    var loader = new Dat_Level_Loader();
    
    this.current_game = ko.observable(new Game_Session(create_default_level()));
    this.scores_viewmodel = ko.observable(new Scores_ViewModel([[]]));
    this.start_game = function () {
        this.current_game().start();
        this.current_page(Page.Game);
    }
    this.pause_game = function () {
        this.current_game().pause();
        this.scores_viewmodel(new Scores_ViewModel(this.current_game().scores()));
        this.current_page(Page.Scores);
    }
    this.unpause_game = this.start_game;

    this.load_level = function (self) {
        this.loading_level(true);
        var files = document.getElementById("level_input").files;
        if (files.length) {
            var file = files[0];

            document.addEventListener(loader.on_loaded_event_text, function () {
                self.current_game(new Game_Session(loader.read_level()));
                self.loading_level(false);
            });

            loader.load(file);
        }
    }
};

ko.applyBindings(new ViewModel());