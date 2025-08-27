import classNames from 'classnames';
import React from 'react';
import OtpInput, { OTPInputProps } from 'react-otp-input';
import styles from './pinput.scss';

type AllowedInputTypes = 'password' | 'text' | 'tel';

type Props = Partial<Omit<OTPInputProps, 'inputType' | 'renderInput' | 'containerStyle'>> & {
  inputType?: AllowedInputTypes;
};

const PinPut = ({ numInputs = 5, ...props }: Props) => {
  return (
    <OtpInput
      renderSeparator={<span>-</span>}
      {...props}
      numInputs={numInputs}
      renderInput={(props) => <input {...props} className={classNames(props.className, styles.input)} />}
      skipDefaultStyles
      value={props.value ?? ''}
      onChange={props.onChange}
      containerStyle={{ justifyContent: 'center' }}
    />
  );
};

export default PinPut;
