import { FastifyRequest, FastifyReply } from "fastify";
import { YtDlp } from "ytdlp-nodejs";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { pipeline } from "stream/promises";

async function downloadService(request: FastifyRequest, reply: FastifyReply) {
	const ytdlp = new YtDlp();
	const tempDir = path.join(os.tmpdir(), `ytdlp-${Date.now()}`);

	try {
		const { url } = request.body as { url: string };
		console.log("URL reçue:", url);

		fs.mkdirSync(tempDir, { recursive: true });

		console.log("Téléchargement en cours...");
		await ytdlp.downloadAsync(url, {
			output: path.join(tempDir, "%(title)s.%(ext)s"),
		});

		// Trouver le fichier final (ignorer les .part)
		const files = fs.readdirSync(tempDir).filter(
			(f) => !f.endsWith(".part") && !f.endsWith(".ytdl")
		);

		if (files.length === 0) throw new Error("Aucun fichier téléchargé");

		const fileName = files[0];
		const filePath = path.join(tempDir, fileName);
		const stats = fs.statSync(filePath);

		if (stats.size === 0) throw new Error("Fichier vide (0 bytes)");

		console.log(`Fichier: ${fileName} (${stats.size} bytes)`);

		// Encoder le nom proprement pour les caractères spéciaux
		const encodedName = encodeURIComponent(fileName);

		const origin = request.headers.origin ?? 'http://localhost:4000';

		reply.raw.writeHead(200, {
			//  Headers CORS obligatoires quand on utilise reply.raw
			"Access-Control-Allow-Origin": origin,
			"Access-Control-Allow-Credentials": "true",
			"Access-Control-Expose-Headers": "Content-Disposition, Content-Length",
			// Headers fichier
			"Content-Type": "application/octet-stream",
			"Content-Length": stats.size,
			"Content-Disposition": `attachment; filename="${encodedName}"; filename*=UTF-8''${encodedName}`,
			"Cache-Control": "no-store",
			"Accept-Ranges": "bytes",
		});

		const stream = fs.createReadStream(filePath, {
			highWaterMark: 1024 * 1024, // chunks de 1MB
		});

		console.log("📤 Streaming au client...");

		// pipeline gère proprement la fin ET les erreurs
		await pipeline(stream, reply.raw);

		console.log("Fichier envoye");
	} catch (err) {
		console.error("Erreur:", err);
		if (!reply.raw.headersSent) {
			reply.code(500).send({
				statusCode: 500,
				message: "Erreur lors du téléchargement",
				error: String(err),
			});
		}
	} finally {
		// Nettoyage garanti même si erreur
		setTimeout(() => {
			try {
				fs.rmSync(tempDir, { recursive: true, force: true });
				console.log("Dossier temporaire supprimé");
			} catch (e) {
				console.error("Erreur cleanup:", e);
			}
		}, 2000);
	}
}

export default downloadService;
