import { useState } from "react";
import { downloadFile } from "../service/downloadService";
import '../styles/downloadForm.css';

export const DownloadForm = () => {
	const [url, setUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);

		try {
			if (!url.trim()) {
				throw new Error("Veuillez entrer une URL");
			}

			const result = await downloadFile(url);
			setSuccess(`${result.fileName} telecharger acec succes!`);
			setUrl('');
		} catch (err) {
			setError(`${err instanceof Error ? err.message : 'Erreur'}`);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="download-container">
			<div className="download-card">
				<h1>Telechargeur</h1>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="url">URL du fichier:</label>
						<input
							id="url"
							type="text"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://exemple.com/vodeo.mp4"
							disabled={loading}
						/>
					</div>

					<button
						type="submit"
						disabled={loading}
						className={loading ? 'loading' : ''}
					>
						{loading ? 'Telechargement...' : 'Telecharger'}
					</button>
				</form>

				{error && <div className="error-message">{error}</div>}
				{success && <div className="success-message">{success}</div>}
			</div>
		</div>
	)
};
