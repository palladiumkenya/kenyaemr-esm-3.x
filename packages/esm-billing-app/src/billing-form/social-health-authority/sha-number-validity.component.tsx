import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form, TextInput, Button, InlineLoading, InlineNotification } from '@carbon/react';

type SHANumberValidityProps = {
  paymentMethod: any;
};

const SHANumberValidity: React.FC<SHANumberValidityProps> = ({ paymentMethod }) => {
  const { t } = useTranslation();
  const [shaNumber, setNumber] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validity, setValidity] = useState(false); // TODO: set validity based on api response
  const isSHA = paymentMethod?.name === 'Social Health Insurance Fund (SHA)';

  const handleValidateSHANumber = () => {
    setIsLoading(true);
    const randomNumber = Math.floor(Math.random() * 10) + 1;
    // TODO call api to validate sha number
    setTimeout(() => {
      // TODO: set validity based on api response and update the expiry date based on the response as visit attribute
      randomNumber % 2 === 0 ? setValidity(false) : setValidity(true);
      setMessage(
        randomNumber % 2 === 0
          ? t('invalidSHANumber', 'SHA number is invalid, advice patient to update payment or contact SHA')
          : t('validSHANumber', 'SHA number is valid, proceed with care'),
      );
      setIsLoading(false);
    }, 1500);
  };

  if (!isSHA) {
    return null;
  }

  return (
    <Form>
      <TextInput
        id="sha-number"
        onChange={(e) => setNumber(e.target.value)}
        labelText={t('shaNumber', 'SHA Number')}
        placeholder={t('enterSHANumber', 'Enter SHA Number')}
      />
      {isLoading ? (
        <InlineLoading
          style={{ minHeight: '3rem', marginTop: '0.625rem' }}
          status="active"
          iconDescription="Loading"
          description={t('validatingSHANumber', 'Validating SHA Number')}
        />
      ) : (
        <Button
          disabled={shaNumber.length === 0}
          kind="tertiary"
          style={{ marginTop: '0.625rem' }}
          onClick={handleValidateSHANumber}>
          {t('checkValidity', 'Check Validity')}
        </Button>
      )}
      {message !== '' && (
        <p style={{ marginTop: '0.625rem' }}>
          <InlineNotification
            aria-label="closes notification"
            kind={validity ? 'success' : 'error'}
            statusIconDescription="notification"
            subtitle={message}
            title={validity ? t('valid', 'Valid SHA Number') : t('shaNotValid', 'Invalid SHA Number')}
            lowContrast={true}
          />
        </p>
      )}
    </Form>
  );
};

export default SHANumberValidity;
