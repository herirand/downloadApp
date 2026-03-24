import ytdlp from 'yt-dlp-exec';
import { EventEmitter } from 'events';

class DownloadService extends EventEmitter {
    constructor() {
        super();
    }

    async download(videoUrl, options = {}) {
        this.emit('start', `Starting download for ${videoUrl}`);

        try {
            const info = await ytdlp(videoUrl, {...options, dumpSingleJson: true});
            this.emit('info', info);

            const output = await this.executeDownload(videoUrl, options);
            this.emit('progress', output);
            this.emit('complete', `Download completed: ${info.title}`);
        } catch (error) {
            this.emit('error', `Error during download: ${error.message}`);
        }
    }

    async executeDownload(videoUrl, options) {
        // Customize the download execution according to your needs
        return await ytdlp(videoUrl, options);
    }
}

export default new DownloadService();