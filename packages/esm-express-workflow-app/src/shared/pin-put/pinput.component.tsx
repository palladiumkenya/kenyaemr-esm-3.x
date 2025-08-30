import classNames from 'classnames';
import React, { useCallback, useMemo, useRef, useEffect } from 'react';
import OtpInput, { OTPInputProps } from 'react-otp-input';
import styles from './pinput.scss';

export interface PinPutProps extends Partial<Omit<OTPInputProps, 'inputType' | 'renderInput' | 'containerStyle'>> {
  /** Whether to obscure the input text (password mode) */
  obscureText?: boolean;
  /** Whether to center the input boxes */
  centerBoxes?: boolean;
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Whether the input is in an invalid state */
  invalid?: boolean;
  /** Helper text displayed below the input */
  helperText?: string;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether to auto-focus the first input on mount */
  autoFocus?: boolean;
  /** Custom CSS class name */
  className?: string;
  /** Callback when all inputs are filled */
  onComplete?: (value: string) => void;
  /** Callback when input value changes */
  onChange?: (value: string) => void;
  /** Callback when input is focused */
  onFocus?: () => void;
  /** Callback when input loses focus */
  onBlur?: () => void;
}

/**
 * PinPut Component - A customizable PIN/OTP input component
 *
 * Features:
 * - Configurable number of inputs
 * - Password/Text input modes
 * - Centered or left-aligned layout
 * - Error states and validation
 * - Accessibility support
 * - Auto-focus and keyboard navigation
 * - Custom styling support
 */
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

  // Auto-focus first input on mount if enabled
  useEffect(() => {
    if (autoFocus && firstInputRef.current && !disabled) {
      firstInputRef.current.focus();
    }
  }, [autoFocus, disabled]);

  // Call onComplete when all inputs are filled
  useEffect(() => {
    if (value && value.length === numInputs && onComplete) {
      onComplete(value);
    }
  }, [value, numInputs, onComplete]);

  // Memoized container styles
  const containerStyle = useMemo(
    () => ({
      gap: '8px',
      justifyContent: centerBoxes ? 'center' : 'flex-start',
      alignItems: 'center',
    }),
    [centerBoxes],
  );

  // Handle change with validation
  const handleChange = useCallback(
    (newValue: string) => {
      if (onChange) {
        onChange(newValue);
      }
    },
    [onChange],
  );

  // Handle focus and blur through the renderInput function
  const handleInputFocus = useCallback(
    (index: number) => {
      if (onFocus) {
        onFocus();
      }
    },
    [onFocus],
  );

  const handleInputBlur = useCallback(
    (index: number) => {
      if (onBlur) {
        onBlur();
      }
    },
    [onBlur],
  );

  // Memoized input renderer with ref handling
  const renderInput = useCallback(
    (inputProps: any, index: number) => {
      const isFirstInput = index === 0;
      const inputRef = isFirstInput ? firstInputRef : undefined;

      return (
        <input
          {...inputProps}
          ref={inputRef}
          className={classNames(inputProps.className, styles.input, {
            [styles.inputError]: invalid || error,
            [styles.inputDisabled]: disabled,
            [styles.inputFocused]: inputProps.isFocused,
          })}
          aria-label={`${label || 'PIN'} input ${index + 1} of ${numInputs}`}
          aria-invalid={invalid || !!error}
          aria-describedby={classNames({
            [`${styles.errorId}`]: error,
            [`${styles.helperId}`]: helperText,
          })}
          disabled={disabled}
          onFocus={() => handleInputFocus(index)}
          onBlur={() => handleInputBlur(index)}
        />
      );
    },
    [label, numInputs, invalid, error, disabled, handleInputFocus, handleInputBlur],
  );

  // Generate unique IDs for accessibility
  const errorId = `${styles.errorId}-${Math.random().toString(36).substr(2, 9)}`;
  const helperId = `${styles.helperId}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      ref={containerRef}
      className={classNames(styles.container, className)}
      role="group"
      aria-labelledby={label ? `${styles.labelId}-${Math.random().toString(36).substr(2, 9)}` : undefined}>
      {label && (
        <label id={`${styles.labelId}-${Math.random().toString(36).substr(2, 9)}`} className={styles.label}>
          {label}
        </label>
      )}

      <OtpInput
        {...props}
        value={value}
        onChange={handleChange}
        numInputs={numInputs}
        inputType={obscureText ? 'password' : 'text'}
        renderInput={renderInput}
        renderSeparator={<span className={styles.separator}>-</span>}
        containerStyle={containerStyle}
        skipDefaultStyles
        shouldAutoFocus={autoFocus}
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
