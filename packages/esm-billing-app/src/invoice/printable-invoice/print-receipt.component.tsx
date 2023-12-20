import { ConfigurableLink } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './print-receipt.scss';
import { Button } from '@carbon/react';
import { Printer } from '@carbon/react/icons';

interface PrintReceiptProps {
  billId: number;
}
const PrintReceipt: React.FC<PrintReceiptProps> = ({ billId }) => {
  const { t } = useTranslation();
  return (
    <Button
      kind="secondary"
      className={styles.button}
      size="md"
      renderIcon={(props) => <Printer size={24} {...props} />}>
      <ConfigurableLink
        className={styles.configurableLink}
        to={`\${openmrsBase}/ws/rest/v1/cashier/receipt?billId=${billId}`}>
        {t('printReceipt', 'Print receipt')}
      </ConfigurableLink>{' '}
    </Button>
  );
};

export default PrintReceipt;
