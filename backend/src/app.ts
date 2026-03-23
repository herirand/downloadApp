import Fastify from 'fastify'
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import downloadRoute from './routes/downloadRoute';
import fastifyStatic from '@fastify/static';
import fastifyCors from '@fastify/cors';

const app = Fastify({
	logger: true
});


app.register(fastifyCors, {
	origin: 'http://localhost:4000',
	credentials: true
})

// === Config swagger ===
app.register(fastifySwagger, {
	swagger: {
		info: {
			title: 'Local API Web',
			description: 'Test',
			version: '1.0.0',
		},
		host: 'localhost:3000',
		schemes: ['http']
	}
});

app.register(fastifySwaggerUi, {
	routePrefix: '/api-docs',
})

app.register(fastifyStatic, {
	root: '/',
})

app.register(downloadRoute, { prefix: '/api/v1' })

const port = 3000;

const start = async () => {
	try {
		await app.listen({ port: 3000, host: '0.0.0.0' });
		console.log(`server listening in ${port}`);
	} catch (err) {
		console.log(`error : ${err}`);
		process.exit(1);
	}
}
start();
