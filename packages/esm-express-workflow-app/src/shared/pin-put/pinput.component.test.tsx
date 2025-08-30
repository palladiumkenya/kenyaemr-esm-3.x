import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PinPut from './pinput.component';

describe('PinPut Component', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    numInputs: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<PinPut {...defaultProps} />);

    // Should render 5 input fields by default
    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(5);
  });

  it('renders with custom number of inputs', () => {
    render(<PinPut {...defaultProps} numInputs={6} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs).toHaveLength(6);
  });

  it('displays label when provided', () => {
    const label = 'Enter your PIN';
    render(<PinPut {...defaultProps} label={label} />);

    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<PinPut {...defaultProps} onChange={onChange} />);

    const firstInput = screen.getAllByRole('textbox')[0];
    await user.type(firstInput, '1');

    expect(onChange).toHaveBeenCalledWith('1');
  });

  it('handles obscureText prop correctly', () => {
    render(<PinPut {...defaultProps} obscureText={true} />);

    const inputs = screen.getAllByDisplayValue('');
    inputs.forEach((input) => {
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  it('handles centerBoxes prop correctly', () => {
    render(<PinPut {...defaultProps} centerBoxes={true} />);

    // The centerBoxes prop affects styling, so we just verify it renders
    expect(screen.getAllByRole('textbox')).toHaveLength(5);
  });

  it('displays error message when provided', () => {
    const errorMessage = 'Invalid PIN';
    render(<PinPut {...defaultProps} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByText(errorMessage)).toHaveClass('errorMessage');
  });

  it('displays helper text when provided', () => {
    const helperText = 'Enter the 6-digit code';
    render(<PinPut {...defaultProps} helperText={helperText} />);

    expect(screen.getByText(helperText)).toBeInTheDocument();
    expect(screen.getByText(helperText)).toHaveClass('helperText');
  });

  it('applies error styling when invalid prop is true', () => {
    render(<PinPut {...defaultProps} invalid={true} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toHaveClass('inputError');
    });
  });

  it('applies error styling when error prop is provided', () => {
    render(<PinPut {...defaultProps} error="Some error" />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toHaveClass('inputError');
    });
  });

  it('handles disabled state correctly', () => {
    render(<PinPut {...defaultProps} disabled={true} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
      expect(input).toHaveClass('inputDisabled');
    });
  });

  it('calls onComplete when all inputs are filled', async () => {
    const onComplete = jest.fn();

    // Test with a pre-filled value that matches the number of inputs
    render(<PinPut {...defaultProps} numInputs={3} onComplete={onComplete} value="123" />);

    // The onComplete should be called when the component mounts with a complete value
    expect(onComplete).toHaveBeenCalledWith('123');
  });

  it('calls onFocus when input gains focus', async () => {
    const onFocus = jest.fn();
    const user = userEvent.setup();

    render(<PinPut {...defaultProps} onFocus={onFocus} />);

    const firstInput = screen.getAllByRole('textbox')[0];
    await user.click(firstInput);

    expect(onFocus).toHaveBeenCalled();
  });

  it('calls onBlur when input loses focus', async () => {
    const onBlur = jest.fn();
    const user = userEvent.setup();

    render(<PinPut {...defaultProps} onBlur={onBlur} />);

    const firstInput = screen.getAllByRole('textbox')[0];
    const secondInput = screen.getAllByRole('textbox')[1];

    await user.click(firstInput);
    await user.click(secondInput);

    expect(onBlur).toHaveBeenCalled();
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-pin-input';
    render(<PinPut {...defaultProps} className={customClass} />);

    const container = screen.getByRole('group');
    expect(container).toHaveClass('container', customClass);
  });

  it('handles value prop correctly', () => {
    const value = '12345';
    render(<PinPut {...defaultProps} value={value} />);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toHaveValue('1');
    expect(inputs[1]).toHaveValue('2');
    expect(inputs[2]).toHaveValue('3');
    expect(inputs[3]).toHaveValue('4');
    expect(inputs[4]).toHaveValue('5');
  });

  it('maintains accessibility attributes', () => {
    const label = 'Security Code';
    const error = 'Invalid code';

    render(<PinPut {...defaultProps} label={label} error={error} numInputs={4} />);

    const inputs = screen.getAllByRole('textbox');

    inputs.forEach((input, index) => {
      expect(input).toHaveAttribute('aria-label', `${label} input ${index + 1} of 4`);
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    // Check that error message has proper ARIA attributes
    const errorMessage = screen.getByText(error);
    expect(errorMessage).toHaveAttribute('role', 'alert');
    expect(errorMessage).toHaveAttribute('aria-live', 'polite');
  });

  it('handles keyboard navigation correctly', async () => {
    const user = userEvent.setup();

    render(<PinPut {...defaultProps} numInputs={3} />);

    const inputs = screen.getAllByRole('textbox');

    // Focus first input
    await user.click(inputs[0]);
    expect(inputs[0]).toHaveFocus();

    // Tab to next input
    await user.tab();
    expect(inputs[1]).toHaveFocus();

    // Tab to next input
    await user.tab();
    expect(inputs[2]).toHaveFocus();
  });

  it('renders separators between inputs', () => {
    render(<PinPut {...defaultProps} />);

    const separators = screen.getAllByText('-');
    expect(separators).toHaveLength(4); // 5 inputs = 4 separators
  });

  it('handles empty value gracefully', () => {
    render(<PinPut {...defaultProps} value="" />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toHaveValue('');
    });
  });

  it('handles undefined value gracefully', () => {
    render(<PinPut {...defaultProps} value={undefined} />);

    const inputs = screen.getAllByRole('textbox');
    inputs.forEach((input) => {
      expect(input).toHaveValue('');
    });
  });
});
