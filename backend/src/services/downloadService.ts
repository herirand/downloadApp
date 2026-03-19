import { FastifyRequest, FastifyReply } from "fastify";
import { YtDlp } from "ytdlp-nodejs";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";

async function downloadService(request: FastifyRequest, reply: FastifyReply) {
	// console.log(`request body == ${request.body}`)
	const yltdp = new YtDlp();
	try {
		const { url } = request.body as { url: string };
		console.log("url == ", url);

		//dossier temp
		const tempDir = path.join(os.tmpdir(), `yltdp-${Date.now()}`);

		//creat dir temp
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
			console.log("******* dossier Tempooraire : ", tempDir);
		}

		//down in a temp directory
		const result = await yltdp.downloadAsync(url, {
			output: path.join(tempDir, '%(title)s.%(ext)s')
		});
		console.log("*******  telechargement reussi  : ", result);

		//find a file 
		const files = fs.readdirSync(tempDir);
		if (files.length == 0) {
			throw new Error('File not found');
		}
		console.log("******* fichier telecharger : ", files);

		const fileName = files[0];
		const filePath = path.join(tempDir, fileName);

		await reply.sendFile(filePath, fileName);

		//delete file tmp
		reply.raw.on('finish', () => {
			try {
				fs.rmSync(tempDir, { recursive: true, force: true });
			} catch (err) {
				console.log(err);
			}
		})

		reply.code(200).send({
			succes: true,
			message: 'Fichier telecharger ' + result,
		});
	} catch (err) {
		reply.code(400).send({
			statusCode: 400,
			message: 'Erreur lors de la telechargement',
			error: String(err),
		});
	}
};

export default downloadService;
