import { FastifyRequest, FastifyReply } from "fastify";
import { YtDlp } from "ytdlp-nodejs";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { createReadStream } from "fs";

async function downloadService(request: FastifyRequest, reply: FastifyReply) {
  const ytdlp = new YtDlp();
  const tempDir = path.join(os.tmpdir(), `ytdlp-${Date.now()}`);

  try {
    const { url } = request.body as { url: string };
    console.log("📥 URL reçue:", url);

    fs.mkdirSync(tempDir, { recursive: true });
    console.log("📁 Dossier temporaire:", tempDir);

    console.log("⏳ Téléchargement en cours...");
    await ytdlp.downloadAsync(url, {
      output: path.join(tempDir, "%(title)s.%(ext)s"),
    });

    const files = fs.readdirSync(tempDir);
    if (files.length === 0) throw new Error("Aucun fichier téléchargé");

    const fileName = files[0];
    const filePath = path.join(tempDir, fileName);
    const stats = fs.statSync(filePath);

    console.log(`📦 Fichier: ${fileName} (${stats.size} bytes)`);

    if (stats.size === 0) throw new Error("Le fichier téléchargé est vide");

    // ✅ Encoder le nom pour éviter les problèmes avec les caractères spéciaux
    const encodedFileName = encodeURIComponent(fileName);

    reply.raw.setHeader("Content-Type", "application/octet-stream");
    reply.raw.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`
    );
    reply.raw.setHeader("Content-Length", stats.size.toString());
    // ✅ CRITIQUE : exposer le header au frontend
    reply.raw.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Disposition, Content-Length"
    );

    const stream = createReadStream(filePath);

    // ✅ Cleanup APRÈS que le stream soit fini
    reply.raw.on("finish", () => {
      setTimeout(() => {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log("🗑️ Nettoyé");
      }, 500);
    });

    stream.on("error", (err) => {
      console.error("❌ Erreur stream:", err);
      fs.rmSync(tempDir, { recursive: true, force: true });
    });

    console.log("📤 Streaming au client...");
    // ✅ Utiliser reply.raw pour un contrôle total du stream
    stream.pipe(reply.raw);

  } catch (err) {
    console.error("❌ Erreur:", err);
    fs.rmSync(tempDir, { recursive: true, force: true });
    reply.code(400).send({
      statusCode: 400,
      message: "Erreur lors du téléchargement",
      error: String(err),
    });
  }
}

export default downloadService;