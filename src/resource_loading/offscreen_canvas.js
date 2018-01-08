export function Offscreen_Canvas(width, height) {
    "use strict";
    var self = this;
    var offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = width;
    offscreenCanvas.height = height;
    this.context = offscreenCanvas.getContext("2d");

    this.draw_image_data_array = function (image_data_array) {
        var img_data = this.context.createImageData(width, height);
        img_data.data.set(image_data_array);
        this.context.putImageData(img_data, 0, 0);
    }

    this.draw_masked = function (image, mask) {
        this.context.drawImage(image, 0, 0);
        this.context.globalCompositeOperation = "destination-out";
        this.context.drawImage(mask, 0, 0);
        this.context.globalCompositeOperation = 'source-over';
    }

    this.to_image = function () {
        var img = new Image(width, height);
        img.src = offscreenCanvas.toDataURL();
        return img;
    }
}