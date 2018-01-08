export function Scores_ViewModel(raw_scores) {
    "use strict";
    var player_names = ["Dott", "Jiffy", "Fizz", "Miji"];
    var row_headings = player_names.concat(["Total deaths"]);
    this.player_row = ["    "].concat(player_names).concat(["Total kills"]);
    var scores = raw_scores.map(with_row_sum);
    scores = with_totals_row(scores);
    this.score_rows = row_headings.map(get_row_contents);

    function row_sum(values) {
        if (values == undefined || values.length == 0) return 0;
        return values.reduce(function (prev, cur) { return prev + cur; })
    }
    function with_totals_row(score_grid) {
        if (score_grid == undefined || score_grid.length == 0) return 0;
        var totals_row = [];
        for (var index = 0; index < score_grid.length; index++) {
            totals_row.push(column_sum(score_grid, index));
        }
        return score_grid.concat([totals_row]);
    }
    function column_sum(grid, col_index) {
        return grid.reduce(function (prev, cur) { return prev + cur[col_index]; }, 0);
    }
    function with_row_sum(raw_score_row) {
        var row_total = row_sum(raw_score_row);
        return raw_score_row.concat([row_total]);
    }
    function get_row_contents(row_heading, index) {
        var score_row = scores[index];
        return [row_heading].concat(score_row);
    }
}