import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';

interface HWREmptyModalProps {
  close: () => void;
}

const HWREmptyModal: React.FC<HWREmptyModalProps> = ({ close }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="cds--modal-header">
        <h3 className="cds--modal-header__heading">{t('healthWorkerRegistryEmpty', 'Create an Account')}</h3>
      </div>
      <div className="cds--modal-content">
        <p>
          {t(
            'HealthworkerNotFound',
            'The health worker records could not be found in Health Worker registry, do you want to continue to create an account',
          )}
        </p>
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
