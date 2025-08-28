import classNames from 'classnames';
import React from 'react';
import OtpInput, { OTPInputProps } from 'react-otp-input';
import styles from './pinput.scss';

type Props = Partial<Omit<OTPInputProps, 'inputType' | 'renderInput' | 'containerStyle'>> & {
  obsecureText?: boolean;
  centerBoxes?: boolean;
  label?: string;
};

const PinPut = ({ numInputs = 5, centerBoxes, obsecureText, label, ...props }: Props) => {
  return (
    <div className={styles.container}>
      {label && <p className={styles.label}> {label}</p>}
      <OtpInput
        renderSeparator={<span>-</span>}
        {...props}
        inputType={obsecureText ? 'password' : 'text'}
        numInputs={numInputs}
        renderInput={(props) => <input {...props} className={classNames(props.className, styles.input)} />}
        skipDefaultStyles
        value={props.value ?? ''}
        onChange={props.onChange}
        containerStyle={{ gap: '4px', justifyContent: centerBoxes ? 'center' : undefined }}
      />
    </div>
  );
};

export default PinPut;
