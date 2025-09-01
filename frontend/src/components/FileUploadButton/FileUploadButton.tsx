import React, { useRef } from 'react';
import Button from '../Button/Button';

type FileUploadButtonProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  buttonType?: React.ComponentProps<typeof Button>['buttonType'];
  children: React.ReactNode;
};

function FileUploadButton({
  onChange,
  accept,
  multiple,
  disabled,
  className,
  buttonType,
  children,
}: FileUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        disabled={disabled}
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
      <Button
        onClick={handleClick}
        disabled={disabled}
        className={className}
        buttonType={buttonType}
      >
        {children}
      </Button>
    </>
  );
}

export default FileUploadButton;
