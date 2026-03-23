import { FastifyRequest, FastifyReply } from "fastify";
import { YtDlp } from "ytdlp-nodejs";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { createReadStream } from "fs";

async function downloadService(request: FastifyRequest, reply: FastifyReply) {
	const ytdlp = new YtDlp();
	try {
		const { url } = request.body as { url: string };
		console.log("url == ", url);

		const result = await ytdlp.downloadAsync(url, {
			output: '-',
			quiet: true,
			noWarnings: true
		});
		console.log("telechargement via pipe");

		// Configurer les headers
		reply.type('application/octet-stream');
		reply.header('Content-Disposition', `attachment; filename="${result}.mp4"`);

		reply.send(result);

	} catch (err) {
		reply.code(400).send({
			statusCode: 400,
			message: 'Erreur lors du téléchargement',
			error: String(err),
		});
	}
}

export default downloadService;
