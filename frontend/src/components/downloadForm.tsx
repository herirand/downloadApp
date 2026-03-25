import { useState } from "react";
import { downloadFile } from "../service/downloadService";
import '../styles/downloadForm.css';

export const DownloadForm = () => {
	const [url, setUrl] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [progress, SetProgress] = useState<number | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setSuccess('');
		setLoading(true);
		SetProgress(0);

		try {
			if (!url.trim()) {
				throw new Error("Veuillez entrer une URL");
			}

			const result = await downloadFile(url, (percent) => SetProgress(percent));
			setSuccess(`${result.fileName} telecharger acec succes!`);
			setUrl('');
		} catch (err) {
			setError(`${err instanceof Error ? err.message : 'Erreur'}`);
		} finally {
			setLoading(false);
			setTimeout(() => SetProgress(null), 1000); //apres 1s
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
							placeholder="https://exemple.com/video.mp4"
							disabled={loading}
						/>
					</div>

					<button
						onClick={handleSubmit}
						disabled={progress !== null}
						type="submit"
						// disabled={loading}
						className={loading ? 'loading' : ''}
					>
						telecharger
					</button>
					{progress !== null && (
						<div style={{ marginTop: 8, background: '#eee', borderRadius: 4, height: 8 }}>
							<div style={{
								width: `${progress}%`,
								background: '#3b82f6',
								height: '100%',
								borderRadius: 4,
								transition: 'width 0.2s ease',
							}} />
						</div>
					)}
				</form>

				{error && <div className="error-message">{error}</div>}
				{success && <div className="success-message">{success}</div>}
			</div>
		</div>
	)
};
