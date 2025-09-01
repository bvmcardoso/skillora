import React from 'react';
import styles from './Button.module.scss';

const BUTTON_TYPE_CLASSES = {
  inverted: 'inverted',
  upload: 'upload',
} as const;

type ButtonType = keyof typeof BUTTON_TYPE_CLASSES;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  buttonType?: ButtonType;
};

const Button: React.FC<ButtonProps> = ({ children, buttonType, className, ...otherProps }) => {
  const base = styles['button-container'];
  const variantKey = buttonType ? BUTTON_TYPE_CLASSES[buttonType] : undefined;
  const variant = variantKey && styles[variantKey] ? styles[variantKey] : '';

  return (
    <button
      type="button"
      className={[base, variant, className].filter(Boolean).join(' ')}
      {...otherProps}
    >
      {children}
    </button>
  );
};

export default Button;
