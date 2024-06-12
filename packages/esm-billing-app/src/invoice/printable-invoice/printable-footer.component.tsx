import React from 'react';
import styles from './printable-footer.scss';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useSession } from '@openmrs/esm-framework';

type PrintableFooterProps = {
  facilityInfo: Record<string, any>;
};

const PrintableFooter: React.FC<PrintableFooterProps> = ({ facilityInfo }) => {
  const { t } = useTranslation();
  const session = useSession();

  return (
    <div className={styles.container}>
      <p className={styles.itemFooter}>{facilityInfo?.display}</p>
      <p className={styles.footDescription}>
        {t(
          'generatedMessage',
          'The invoice has been electronically generated and is a valid document. It was created by {{userName}} on {{date}} at {{time}}',
          {
            userName: `${session?.user?.display}`,
            date: dayjs().format('DD-MM-YYYY'),
            time: dayjs().format('hh:mm A'),
          },
        )}
      </p>
    </div>
  );
};

export default PrintableFooter;
