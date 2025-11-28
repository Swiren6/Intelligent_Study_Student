import '../../styles/Loader.css';

export default function Loader({ fullScreen = true, size = 'md' }) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
  };

  if (fullScreen) {
    return (
      <div className="loader-container">
        <div className="loader-content">
          <div className={`loader ${sizeClasses[size]}`}>
            <div className="loader-spinner"></div>
          </div>
          <p className="loader-text">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`loader ${sizeClasses[size]}`}>
      <div className="loader-spinner"></div>
    </div>
  );
}