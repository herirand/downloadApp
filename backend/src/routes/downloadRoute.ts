import { FastifyInstance } from "fastify";
import { DownloadInputSchema, DownloadResponeSchema } from "../schemas/downloadSchemas";
import downloadService from "../services/downloadService";

function downloadRoute(app: FastifyInstance) {
	app.post('/download', {
		schema: {
			body: DownloadInputSchema,
			response: {
				200: DownloadResponeSchema,
				400: { type: 'object' }
			}
		}
	}, downloadService);
}

export default downloadRoute;
