const API_BASE_URL = 'http://localhost:3000/api/v1';

export const downloadFile = async (
	url: string,
	onProgress?: (percent: number) => void
) => {
	try {
		const response = await fetch(`${API_BASE_URL}/download`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		// Récupérer le nom du fichier depuis le header
		const contentDisposition = response.headers.get('content-disposition');
		console.log('contentDisposition:', contentDisposition);

		// Supporter les deux formats : filename= et filename*=UTF-8''
		let fileName = 'download';
		if (contentDisposition) {
			const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
			const plainMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
			const raw = utf8Match?.[1] ?? plainMatch?.[1] ?? '';
			fileName = decodeURIComponent(raw) || 'download';
		}

		//taille total de la progression 
		const contenLength = response.headers.get("content-length");
		const total = contenLength ? parseInt(contenLength, 10) : null;

		// Streamer via ReadableStream → Blob partiel → lien direct
		// Évite de charger tout en RAM
		if (!response.body) throw new Error('Pas de body dans la réponse');

		const reader = response.body.getReader();
		const chunks: Uint8Array[] = [];
		let received = 0;

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			chunks.push(value);
			received += value.length;
			if (total) {
				const percent = Math.round((received / total) * 100);
				onProgress?.(percent);
			}
			// console.log(`📥 Reçu: ${(received / 1024 / 1024).toFixed(1)} MB`);
		}

		// Assembler et déclencher le téléchargement
		const blob = new Blob(chunks);
		const downloadUrl = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = downloadUrl;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();

		// Cleanup
		setTimeout(() => {
			window.URL.revokeObjectURL(downloadUrl);
			document.body.removeChild(a);
		}, 100);

		return { success: true, fileName };
	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
	}
};
