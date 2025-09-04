import React, { useRef } from 'react';
import styles from './Button.module.scss';

const BUTTON_STYLE_CLASSES = {
  default: 'default',
  upload: 'upload',
} as const;

type ButtonType = keyof typeof BUTTON_STYLE_CLASSES;

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  buttonStyle?: ButtonType;
  accept?: string;
  multiple?: boolean;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

const Button: React.FC<ButtonProps> = ({
  children,
  buttonStyle,
  className,
  accept,
  multiple,
  onFileChange,
  ...otherProps
}) => {
  const base = styles['button-container'];
  const variantKey = buttonStyle ? BUTTON_STYLE_CLASSES[buttonStyle] : undefined;
  const variant = variantKey && styles[variantKey] ? styles[variantKey] : '';

  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (accept) {
      e.preventDefault();
      inputRef.current?.click();
    }
    otherProps.onClick?.(e);
  };
  return (
    <>
      {accept && (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onFileChange}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0,0,0,0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
      )}
      <button
        type={otherProps.type ?? 'button'}
        className={[base, variant, className].filter(Boolean).join(' ')}
        onClick={handleClick}
        {...otherProps}
      >
        {children}
      </button>
    </>
  );
};

export default Button;
