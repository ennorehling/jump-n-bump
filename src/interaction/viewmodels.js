import { create_default_level } from "../asset_data/default_levelmap";
import { Dat_Level_Loader } from "../resource_loading/dat_level_loader";
import { env, Game_Session } from "../interaction/game_session";
import { Scores_ViewModel } from "../interaction/scores_viewmodel";
import ko from "knockout";

function Enum(obj) {
    return Object.freeze ? Object.freeze(obj) : obj;
}

function ViewModel() {
    "use strict";
    var self = this;
    var loader = new Dat_Level_Loader();
    this.Page = Enum({ Instructions: 0, Game: 1, Scores: 2 });
    this.loading_level = ko.observable(true);
    this.current_level = create_default_level();
    this.current_game = ko.observable(new Game_Session(this.current_level));

    this.current_page = ko.computed(function () {
        return self.current_game().game_state();
    });
    this.scores_viewmodel = ko.computed(function () {
        return new Scores_ViewModel(self.current_game().scores());
    });

    this.restart = function () {
        self.current_game(new Game_Session(self.current_level));
        self.current_game().start();
    }

    this.load_level = function (self) {
        this.loading_level(true);
        var files = document.getElementById("level_input").files;
        if (files.length) {
            var file = files[0];

            document.addEventListener(loader.on_loaded_event_text, function () {
                self.current_level = loader.read_level();
                self.current_game(new Game_Session(self.current_level));
                self.loading_level(false);
            });

            loader.load(file);
        }
    }
};

ko.applyBindings(new ViewModel());