function Dat_Level_Loader() {
    "use strict";
    var self = this;
    this.on_loaded_event_text = "level_loaded";
    this.flip = false;
    var datafile_buffer;

    this.load = function (dat_filename) {
        var reader = new FileReader();
        reader.onload = function (e) {
            //TODO consider supporting gzipped files too
            datafile_buffer = new Uint8Array(reader.result);
            this.file_name = dat_filename;
            document.dispatchEvent(new Event(self.on_loaded_event_text));
        }
        reader.readAsArrayBuffer(dat_filename);
    }

    this.read_level = function() {
        var chr;
        var ban_map = new Array(LEVEL_WIDTH * LEVEL_HEIGHT);

        var level_map_offset = dat_open("levelmap.txt");

        if (level_map_offset == 0) {
            throw "Error loading 'levelmap.txt', aborting...\n";
        }

        for (var y = 0; y < LEVEL_HEIGHT; y++) {
            for (var x = 0; x < LEVEL_WIDTH; x++) {
                while (true) {
                    var chr = datafile_buffer[level_map_offset++] - ("0".charCodeAt(0));
                    if (level_map_offset > datafile_buffer.length) {
                        throw "End of file reached at co-ords: " + x + ", " + y;
                    }
                    else if (chr >= 0 && chr <= 4) {
                        break;
                    }
                }
                var x_dest = this.flip ? 21 - x : x;

                ban_map[x_dest + y * LEVEL_WIDTH] = chr;
            }
        }

        for (var x = 0; x < 22; x++) {
            ban_map[x + LEVEL_HEIGHT * LEVEL_WIDTH] = BAN_SOLID;
        }

        return ban_map;

    }

    function dat_open(requested_file_name) {
        if (datafile_buffer == null) {
            return 0;
        }

        var name = "";
        var sizeof_name = 21;
        var ofs = 0;
        var ptr = 0;
        
        var num_files_contained = read_four_byte_int(ptr);
        ptr += 4;

        for (var file_number = 0; file_number < num_files_contained; file_number++) {

            var file_name = String.fromCharCode.apply(null, datafile_buffer.subarray(ptr, ptr + 12));
            ptr += 12;

            if (file_name.toUpperCase() === requested_file_name.toUpperCase()) {
                var requested_file_offset = read_four_byte_int(ptr);
                if (requested_file_offset > datafile_buffer.length) return 0;
                return requested_file_offset;
            }
            ptr += 8;
        }

        return 0;
    }

    function read_four_byte_int(ptr) {
        return ((datafile_buffer[ptr + 0] << 0) +
                    (datafile_buffer[ptr + 1] << 8) +
                    (datafile_buffer[ptr + 2] << 16) +
                    (datafile_buffer[ptr + 3] << 24));
    }
}