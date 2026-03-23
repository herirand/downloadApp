const API_BASE_URL = 'http://localhost:3000/api/v1';

export const downloadFile = async (url: string) => {
	try {
		const response = await fetch(`${API_BASE_URL}/download`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ url }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message);
		}

		const blob = await response.blob();

		//nom du fichier
		const contentDisposition = response.headers.get('content-disposition');
		console.log(`contentDisposition: ${contentDisposition}`);
		const fileName = contentDisposition
			? contentDisposition.split('filename=')[1].replace(/"/g, '')
			: 'download.mp4';

		//lien de telechargement 
		const downloadUrl = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = downloadUrl;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();

		//clear
		window.URL.revokeObjectURL(downloadUrl);
		document.body.removeChild(a);

		return { success: true, fileName };

	} catch (error) {
		throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
	}
}
