// 🔘 src/components/common/Button.jsx
import PropTypes from "prop-types";
import "../../styles/Button.css";

/**
 * 🎨 Composant Button réutilisable pour Taskora
 * 
 * @example
 * <Button label="Connexion" variant="primary" onClick={handleClick} />
 * <Button label="Annuler" variant="secondary" fullWidth={false} />
 * <Button label="Supprimer" variant="danger" loading />
 */
export default function Button({
  label,
  type = "button",
  onClick,
  variant = "primary",
  size = "md",
  fullWidth = true,
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  className = "",
}) {
  const sizeClasses = {
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  };

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    danger: "btn-danger",
    success: "btn-success",
    warning: "btn-warning",
    info: "btn-info",
    outline: "btn-outline",
    ghost: "btn-ghost",
  };

  const classes = [
    "btn",
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && "btn-full",
    loading && "btn-loading",
    disabled && "btn-disabled",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading && (
        <span className="btn-spinner">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </span>
      )}

      {!loading && icon && iconPosition === "left" && (
        <span className="btn-icon btn-icon-left">{icon}</span>
      )}

      <span className="btn-label">{loading ? "Chargement..." : label}</span>

      {!loading && icon && iconPosition === "right" && (
        <span className="btn-icon btn-icon-right">{icon}</span>
      )}
    </button>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  onClick: PropTypes.func,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "success",
    "warning",
    "info",
    "outline",
    "ghost",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(["left", "right"]),
  className: PropTypes.string,
};