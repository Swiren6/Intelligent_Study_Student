import PropTypes from 'prop-types';
import '../../styles/Input.css';

export default function Input({
  type = 'text',
  name,
  placeholder,
  value,
  onChange,
  error,
  icon,
  disabled = false,
  ...props
}) {
  return (
    <div className="input-wrapper">
      <div className={`input-container ${error ? 'has-error' : ''}`}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={`auth-input ${icon ? 'with-icon' : ''}`}
          {...props}
        />
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}

Input.propTypes = {
  type: PropTypes.string,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  icon: PropTypes.string,
  disabled: PropTypes.bool,
};