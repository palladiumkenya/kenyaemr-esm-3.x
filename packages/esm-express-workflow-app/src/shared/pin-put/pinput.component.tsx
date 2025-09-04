import classNames from 'classnames';
import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import OtpInput, { OTPInputProps } from 'react-otp-input';
import styles from './pinput.scss';

export interface PinPutProps extends Partial<Omit<OTPInputProps, 'inputType' | 'renderInput' | 'containerStyle'>> {
  obscureText?: boolean;
  centerBoxes?: boolean;
  label?: string;
  error?: string;
  invalid?: boolean;
  helperText?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
  onComplete?: (value: string) => void;
  onChange?: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PinPut: React.FC<PinPutProps> = ({
  numInputs = 5,
  centerBoxes = false,
  obscureText = false,
  label,
  error,
  invalid = false,
  helperText,
  disabled = false,
  autoFocus = false,
  className,
  onComplete,
  onChange,
  onFocus,
  onBlur,
  value = '',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [componentId] = useState(() => Math.random().toString(36).substr(2, 9));
  const errorId = `error-${componentId}`;
  const helperId = `helper-${componentId}`;
  const labelId = `label-${componentId}`;

  useEffect(() => {
    if (autoFocus && firstInputRef.current && !disabled) {
      const timer = setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [autoFocus, disabled]);

  useEffect(() => {
    if (value && value.length === numInputs && onComplete) {
      onComplete(value);
    }
  }, [value, numInputs, onComplete]);

  const containerStyle = useMemo(
    () => ({
      display: 'flex',
      gap: '8px',
      justifyContent: centerBoxes ? 'center' : 'flex-start',
      alignItems: 'center',
    }),
    [centerBoxes],
  );

  const handleChange = useCallback(
    (newValue: string) => {
      onChange?.(newValue);
    },
    [onChange],
  );

  const renderInput = useCallback(
    (inputProps: any, index: number) => {
      const isFirstInput = index === 0;

      const setCombinedRef = (el: HTMLInputElement | null) => {
        const rp = inputProps?.ref;
        if (typeof rp === 'function') {
          rp(el);
        } else if (rp && 'current' in rp) {
          (rp as React.MutableRefObject<HTMLInputElement | null>).current = el;
        }
        if (isFirstInput) {
          firstInputRef.current = el!;
        }
      };

      return (
        <input
          {...inputProps}
          ref={setCombinedRef}
          className={classNames(styles.input, {
            [styles.inputError]: invalid || !!error,
            [styles.inputDisabled]: disabled,
          })}
          aria-label={`${label || 'PIN'} input ${index + 1} of ${numInputs}`}
          aria-invalid={invalid || !!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          disabled={disabled}
          maxLength={1}
          inputMode="numeric"
          pattern="[0-9]*"
          onFocus={(e) => {
            inputProps.onFocus?.(e);
            onFocus?.();
          }}
          onBlur={(e) => {
            inputProps.onBlur?.(e);
            onBlur?.();
          }}
        />
      );
    },
    [label, numInputs, invalid, error, disabled, onFocus, onBlur, errorId, helperId],
  );

  return (
    <div
      ref={containerRef}
      className={classNames(styles.container, className)}
      role="group"
      aria-labelledby={label ? labelId : undefined}>
      {label && (
        <label id={labelId} className={styles.label}>
          {label}
        </label>
      )}

      <OtpInput
        value={value}
        onChange={handleChange}
        numInputs={numInputs}
        inputType={obscureText ? 'password' : 'text'}
        renderInput={renderInput}
        renderSeparator={<span className={styles.separator}>-</span>}
        containerStyle={containerStyle}
        skipDefaultStyles={true}
        shouldAutoFocus={autoFocus && !disabled}
        placeholder=""
        {...props}
      />

      {(error || helperText) && (
        <div className={styles.messageContainer}>
          {error && (
            <div id={errorId} className={styles.errorMessage} role="alert" aria-live="polite">
              {error}
            </div>
          )}
          {helperText && !error && (
            <div id={helperId} className={styles.helperText}>
              {helperText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PinPut;
