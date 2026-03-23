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
		console.log("📥 URL reçue:", url);

		// ✅ Créer dossier temporaire
		const tempDir = path.join(os.tmpdir(), `ytdlp-${Date.now()}`);

		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}
		console.log("📁 Dossier temporaire:", tempDir);

		// ✅ Télécharger
		console.log("⏳ Téléchargement en cours...");
		const result = await ytdlp.downloadAsync(url, {
			output: path.join(tempDir, '%(title)s.%(ext)s')
		});
		console.log("✅ Téléchargement réussi:", result);

		// Trouver le fichier
		const files = fs.readdirSync(tempDir);
		if (files.length === 0) {
			throw new Error('Aucun fichier téléchargé');
		}

		const fileName = files[0];
		const filePath = path.join(tempDir, fileName);

		// Vérifier que le fichier existe et a du contenu
		const stats = fs.statSync(filePath);
		console.log(`📦 Fichier: ${fileName} (${stats.size} bytes)`);

		// ✅ Configurer les headers AVANT d'envoyer
		reply.type('application/octet-stream');
		reply.header('Content-Disposition', `attachment; filename="${fileName}"`);
		reply.header('Content-Length', stats.size.toString());

		// ✅ Créer le stream
		const stream = createReadStream(filePath);

		// ✅ ATTENDRE que l'envoi soit COMPLÈTEMENT terminé
		stream.on('end', () => {
			console.log("✅ Fichier envoyé au client");
			// Le fichier est complètement envoyé, on peut le supprimer
			setTimeout(() => {
				try {
					fs.rmSync(tempDir, { recursive: true, force: true });
					console.log('🗑️ Fichier temporaire supprimé');
				} catch (err) {
					console.error('❌ Erreur suppression:', err);
				}
			}, 500); // Petit délai pour être sûr
		});

		// En cas d'erreur de streaming
		stream.on('error', (err) => {
			console.error('❌ Erreur stream:', err);
			try {
				fs.rmSync(tempDir, { recursive: true, force: true });
			} catch (e) {
				console.error('Erreur cleanup:', e);
			}
		});

		console.log("📤 Streaming au client...");
		reply.send(stream);

	} catch (err) {
		console.error('❌ Erreur:', err);
		reply.code(400).send({
			statusCode: 400,
			message: 'Erreur lors du téléchargement',
			error: String(err),
		});
	}
}

export default downloadService;
