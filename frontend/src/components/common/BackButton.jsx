import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import '../../styles/BackButton.css';

export default function BackButton({ 
  to = '/', 
  label = 'Retour', 
  variant = 'default' 
}) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(to);
  };

  return (
    <button 
      onClick={handleClick}
      className={`back-button back-button-${variant}`}
      aria-label={label}
      type="button"
    >
      <ArrowLeft className="back-button-icon" size={20} />
      <span className="back-button-text">{label}</span>
    </button>
  );
}