export const DownloadInputSchema = {
	type: 'object',
	required: ['url'],
	properties: {
		url: {
			type: 'string',
			format: 'uri',
		},
	},
};

export const DownloadResponeSchema = {
	type: 'object',
	properties: {
		success: { type: 'boolean' },
		message: { type: 'string' },
		filePath: { type: 'string' },
	},
};
