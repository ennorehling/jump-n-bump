import { LEVEL_HEIGHT, LEVEL_WIDTH } from  "../asset_data/default_levelmap";
import { BAN_SOLID } from "../game/level";
import { Offscreen_Canvas } from "../resource_loading/offscreen_canvas";

export function Dat_Level_Loader() {
    "use strict";
    var self = this;
    this.on_loaded_event_text = "level_loaded";
    this.flip = false;
    var dat_index;
    var datafile_buffer;
    var PIXEL_WIDTH = 400, PIXEL_HEIGHT = 256, PALETTE_256_SIZE = 768;

    this.load = function (dat_filename) {
        var reader = new FileReader();
        reader.onload = function (e) {
            //TODO consider supporting gzipped files too
            datafile_buffer = new Uint8Array(reader.result);
            this.file_name = dat_filename;
            dat_index = read_dat_index();
            document.dispatchEvent(new Event(self.on_loaded_event_text));
        }
        reader.readAsArrayBuffer(dat_filename);
    }

    this.read_level = function() {
        var level = read_level_image();
        return {
            ban_map: read_levelmap(),
            image: level,
            mask: read_mask_image(level)
        }
    }

    function read_levelmap(){
        var chr;
        var ban_map = new Array(LEVEL_WIDTH * LEVEL_HEIGHT);

        var level_map_offset = dat_open("levelmap.txt");
        
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
                var x_dest = self.flip ? 21 - x : x;

                ban_map[x_dest + y * LEVEL_WIDTH] = chr;
            }
        }

        for (var x = 0; x < LEVEL_WIDTH; x++) {
            ban_map[x + LEVEL_HEIGHT * LEVEL_WIDTH] = BAN_SOLID;
        }

        return ban_map;
    }

    function read_level_image() {
        return bitmap_from_pcx_file("level");
    }

    function read_mask_image(image) {
        var mask = bitmap_from_pcx_file("mask", 255*3);
        var offscreen = new Offscreen_Canvas(image.width, image.height);
        offscreen.draw_masked(image, mask);
        return offscreen.to_image();
    }

    function bitmap_from_pcx_file(filename, transparency_sum) {
        var pcx = read_pcx(filename);
        var image_data = new Uint8ClampedArray(pcx.colormap.length * 4);
        //Took some hints from the public domain https://github.com/arcollector/PCX-JS/blob/master/pcx.js#L447
        for (var i = 0; i < pcx.colormap.length; i++) {
            var colorIndex = pcx.colormap[i] * 3;
            var r = pcx.palette[colorIndex];
            var g = pcx.palette[colorIndex + 1];
            var b = pcx.palette[colorIndex + 2];
            var a = r + g + b === transparency_sum ? 0 : 255;
            image_data[i * 4 + 0] = r;
            image_data[i * 4 + 1] = g
            image_data[i * 4 + 2] = b;
            image_data[i * 4 + 3] = a;
        }

        return image_data_array_to_image(image_data, PIXEL_WIDTH, PIXEL_HEIGHT);
    }


    function image_data_array_to_image(image_data_array, width, height) {
        var offscreen = new Offscreen_Canvas(width, height);
        offscreen.draw_image_data_array(image_data_array);
        return offscreen.to_image();
    }

    function read_pcx(filename)
    {
        var handle = dat_open(filename + ".pcx");
        handle += 128; //Assume header says PCX_256_COLORS (8 bits per pixel, 1 plane)
        var buf_len = PIXEL_WIDTH * PIXEL_HEIGHT;
        var colormap = new Uint8Array(PIXEL_WIDTH * PIXEL_HEIGHT);
        var palette = new Uint8Array(PALETTE_256_SIZE);
        var ofs = 0;
        while (ofs < buf_len) {
            var a = datafile_buffer[handle++];
            if ((a & 0xc0) == 0xc0) {
                var b = datafile_buffer[handle++];
                a &= 0x3f;
                for (var c1 = 0; c1 < a && ofs < buf_len; c1++)
                    colormap[ofs++] = b;
            } else {
                colormap[ofs++] = a;
            }
        }
		handle++;
		for (var c1 = 0; c1 < PALETTE_256_SIZE; c1++) {
			palette[c1] = datafile_buffer[handle++];
		}

        return { palette: palette, colormap: colormap };
    }

    function dat_open(requested_file_name) {
        var offset = dat_index[requested_file_name.toUpperCase()];
        if (offset == null) {
            throw "Could not find index for " + requested_file_name;
        }
        return offset;
    }

    function read_dat_index() {
        var dat_index = [];

        var ptr = 0;
        var num_files_contained = read_four_byte_int(ptr);
        ptr += 4;

        for (var file_number = 0; file_number < num_files_contained; file_number++) {

            var file_name = String.fromCharCode.apply(null, datafile_buffer.subarray(ptr, ptr + 12)).replace(/[^\x20-\xFF]/g, '');
            ptr += 12;
            var file_offset = read_four_byte_int(ptr);
            ptr += 8;
            dat_index[file_name.toUpperCase()] = file_offset;
        }

        return dat_index;
    }

    function read_four_byte_int(ptr) {
        return ((datafile_buffer[ptr + 0] << 0) +
                    (datafile_buffer[ptr + 1] << 8) +
                    (datafile_buffer[ptr + 2] << 16) +
                    (datafile_buffer[ptr + 3] << 24));
    }
}