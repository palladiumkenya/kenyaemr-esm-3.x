import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { HWR_API_NO_CREDENTIALS, RESOURCE_NOT_FOUND, UNKNOWN } from '../constants';

interface HWREmptyModalProps {
  close: () => void;
  errorCode?: string;
}

const HWREmptyModal: React.FC<HWREmptyModalProps> = ({ close, errorCode }) => {
  const { t } = useTranslation();
  let message = t(
    'HealthworkerNotFound',
    'The health worker records could not be found in Health Worker registry, do you want to continue to create an account',
  );
  if (errorCode === RESOURCE_NOT_FOUND) {
    message = t(
      'ResourceNotFound',
      'The Health Work Registry is not reachable, kindly confirm your internet connectivity and try again. Do you want to continue to create an account',
    );
  } else if (errorCode === HWR_API_NO_CREDENTIALS) {
    message = t(
      'noHwrApi',
      'Health Care Worker Registry API credentials not configured,Kindly contact system admin. Do you want to continue to create an account',
    );
  } else if (errorCode === UNKNOWN) {
    message = t(
      'unknownError',
      'An error occured while searching Health Worker Registry, kindly contact system admin. Do you want to continue to create an account ',
    );
  }
  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('healthWorkerRegistryEmpty', 'Create an Account')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>{message}</p>
      </div>
      <div className="cds--modal-footer">
        <Button kind="secondary" onClick={close}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={close}>{t('continue', 'Continue to registration')}</Button>
      </div>
    </>
  );
};

export default HWREmptyModal;
