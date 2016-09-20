"use strict";

const ImageData   = require("./ImageData");
const gm = require("gm").subClass({ imageMagick: true });

const cropSpec = /(\d+)x(\d+)([+-]\d+)?([+-]\d+)?(%)?/;

class ImageResizer {

    /**
     * Image Resizer
     * resize image with ImageMagick
     *
     * @constructor
     * @param Number width
     */
    constructor(options) {
        this.options = options;
    }

    /**
     * Execute resize
     *
     * @public
     * @param ImageData image
     * @return Promise
     */
    exec(image) {
        const acl = this.options.acl;

        const width = this.options.size || this.options.width;
        const height = this.options.size || this.options.height;

        return new Promise((resolve, reject) => {
            var img = gm(image.data).geometry(this.options.size.toString());
            if ( "gravity" in this.options ) {
                img = img.gravity(this.options.gravity);
            }
            if ( "crop" in this.options ) {
                var cropArgs = this.options.crop.match(cropSpec);
                const cropWidth = cropArgs[1];
                const cropHeight = cropArgs[2];
                const cropX = cropArgs[3];
                const cropY = cropArgs[4];
                const cropPercent = cropArgs[5];
                img = img.crop(cropWidth, cropHeight, cropX, cropY, cropPercent === "%");
            }
            img.toBuffer((err, buffer) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(new ImageData(
                        image.fileName,
                        image.bucketName,
                        buffer,
                        image.headers,
                        acl
                    ));
                }
            });
        });
    }
}

module.exports = ImageResizer;
