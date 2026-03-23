const API_BASE_URL = 'http://localhost:3000/api/v1';

export const downloadFile = async (url: string) => {
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

    const blob = await response.blob();

    if (blob.size === 0) throw new Error("Fichier reçu vide (0 bytes)");

    // ✅ Récupérer et décoder le nom du fichier
    const contentDisposition = response.headers.get('content-disposition');
    console.log('contentDisposition:', contentDisposition);

    let fileName = 'download.mp4';
    if (contentDisposition) {
      // Essayer d'abord filename* (UTF-8 encodé)
      const filenameStarMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/i);
      if (filenameStarMatch) {
        fileName = decodeURIComponent(filenameStarMatch[1]);
      } else {
        // Fallback sur filename= classique
        const filenameMatch = contentDisposition.match(/filename="?([^";\n]+)"?/i);
        if (filenameMatch) fileName = decodeURIComponent(filenameMatch[1]);
      }
    }

    console.log('📁 Nom fichier:', fileName);

    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(downloadUrl);
    document.body.removeChild(a);

    return { success: true, fileName };

  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Erreur inconnue');
  }
};