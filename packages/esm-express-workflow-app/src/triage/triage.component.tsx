import { Button } from '@carbon/react';
import React from 'react';
import { lauchOtpVerificationModal } from '../shared-components/otp-verification';

const Triage: React.FC = () => {
  return (
    <div>
      Triage
      <Button onClick={() => lauchOtpVerificationModal({ otpLength: 6 })}>Launch</Button>
    </div>
  );
};

export default Triage;
