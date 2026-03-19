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

		// Dossier temporaire
		const tempDir = path.join(os.tmpdir(), `ytdlp-${Date.now()}`);

		// Créer dossier temporaire
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
			console.log("******* dossier Temporaire : ", tempDir);
		}

		// Télécharger dans le dossier temporaire
		const result = await ytdlp.downloadAsync(url, {
			output: path.join(tempDir, '%(title)s.%(ext)s')
		});
		console.log("******* téléchargement réussi : ", result);

		// Trouver le fichier
		const files = fs.readdirSync(tempDir);
		if (files.length === 0) {
			throw new Error('File not found');
		}
		console.log("******* fichier téléchargé : ", files);

		const fileName = files[0];
		const filePath = path.join(tempDir, fileName);

		// STREAMING - Envoyer le fichier au client
		const stream = createReadStream(filePath);

		// Configurer les headers
		reply.type('application/octet-stream');
		reply.header('Content-Disposition', `attachment; filename="${fileName}"`);

		// Envoyer le stream
		reply.send(stream);

		// Supprimer le fichier temporaire APRES envoi
		stream.on('end', () => {
			try {
				fs.rmSync(tempDir, { recursive: true, force: true });
				console.log("++++++++++++++++++++++++++++++fichier supprimé avec succès");
			} catch (err) {
				console.log("Erreur suppression:", err);
			}
		});

		stream.on('error', (err) => {
			console.error('Erreur stream:', err);
		});

	} catch (err) {
		reply.code(400).send({
			statusCode: 400,
			message: 'Erreur lors du téléchargement',
			error: String(err),
		});
	}
}

export default downloadService;
