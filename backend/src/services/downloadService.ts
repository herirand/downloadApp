import { FastifyRequest, FastifyReply } from "fastify";

async function downloadService(request: FastifyRequest, reply: FastifyReply) {
	// console.log(`request body == ${request.body}`)
	try {
		const { url } = request.body as { url: string };
		console.log("url == ", url);
		reply.code(200).send({
			succes: true,
			message: 'Fichier telecharger',
			// filepath,
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
