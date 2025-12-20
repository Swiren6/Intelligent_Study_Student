import { useState, useRef } from 'react';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { useAPI } from '../../hooks/useApi';
import { useToast } from '../../hooks/useToast';
import API_CONFIG from '../../config/api.config';
import PropTypes from 'prop-types';

export default function PDFUploader({ onClose, onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [semestre, setSemestre] = useState('');
  const fileInputRef = useRef(null);
  const api = useAPI();
  const { showError } = useToast();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    // Vérifier que c'est un PDF
    if (selectedFile.type !== 'application/pdf') {
      showError('Veuillez sélectionner un fichier PDF');
      return;
    }

    // Vérifier la taille (max 16MB)
    if (selectedFile.size > 16 * 1024 * 1024) {
      showError('Le fichier est trop volumineux (max 16MB)');
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      showError('Veuillez sélectionner un fichier');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simuler la progression
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await api.upload(
        API_CONFIG.ENDPOINTS.SCHEDULES.BASE + '/upload',
        file,
        { semestre }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setTimeout(() => {
          onUploadComplete(result.data);
        }, 500);
      } else {
        showError(result.error || 'Erreur lors de l\'upload');
        setUploading(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showError('Erreur lors de l\'upload du fichier');
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📄 Importer un emploi du temps</h2>
          <button onClick={onClose} className="close-btn" disabled={uploading}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Zone de drop */}
          <div
            className={`drop-zone ${dragActive ? 'active' : ''} ${file ? 'has-file' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !file && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleChange}
              style={{ display: 'none' }}
              disabled={uploading}
            />

            {file ? (
              <div className="file-preview">
                <FileText className="file-icon" />
                <div className="file-info">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {!uploading && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="remove-file-btn"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <>
                <Upload className="drop-icon" />
                <p className="drop-text">
                  <span className="drop-text-primary">Cliquez pour sélectionner</span>
                  {' '}ou glissez-déposez votre fichier
                </p>
                <p className="drop-hint">PDF (max. 16MB)</p>
              </>
            )}
          </div>

          {/* Informations supplémentaires */}
          <div className="form-group">
            <label className="form-label">
              Semestre / Période (optionnel)
            </label>
            <input
              type="text"
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="form-input"
              placeholder="Ex: Semestre 5, Janvier-Juin 2024..."
              disabled={uploading}
            />
          </div>

          {/* Barre de progression */}
          {uploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="progress-text">{uploadProgress}%</p>
            </div>
          )}

          {/* Info */}
          <div className="info-box">
            <AlertCircle className="info-icon" />
            <div className="info-text">
              <strong>Astuce :</strong> Pour de meilleurs résultats, assurez-vous que votre 
              PDF est lisible et contient un tableau d'emploi du temps structuré.
            </div>
          </div>

          {/* Actions */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="cancel-btn"
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="upload-btn"
              disabled={!file || uploading}
            >
              {uploading ? 'Upload en cours...' : 'Importer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

PDFUploader.propTypes = {
  onClose: PropTypes.func.isRequired,
  onUploadComplete: PropTypes.func.isRequired,
};