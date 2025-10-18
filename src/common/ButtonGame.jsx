import styles from "../whack-a-mole/WhackAMole.module.css";

/**
 * ButtonGame - Reusable game button component
 * @param {Object} props
 * @param {Function} props.onClick - Click handler
 * @param {string} props.text - Button text
 * @param {string} props.icon - Button icon (emoji)
 * @param {Object} props.style - Additional inline styles
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.variant - Button variant: 'primary' | 'secondary'
 */
export default function ButtonGame({
    onClick,
    text,
    icon,
    style = {},
    className = "",
    variant = "primary"
}) {
    const variantStyles = {
        primary: {},
        secondary: {
            backgroundColor: "#6366f1",
            border: "3px solid #4f46e5",
            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.4)"
        },
        danger: {
            backgroundColor: "#ef4444",
            border: "3px solid #dc2626",
            boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)"
        },
        success: {
            backgroundColor: "#10b981",
            border: "3px solid #059669",
            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)"
        }
    };

    const combinedStyle = {
        ...variantStyles[variant],
        ...style
    };

    return (
        <button
            className={`${styles.startButton} ${className}`}
            onClick={onClick}
            style={combinedStyle}
        >
            <span className={styles.buttonText}>{text}</span>
            {icon && <span className={styles.buttonIcon}>{icon}</span>}
        </button>
    );
}
