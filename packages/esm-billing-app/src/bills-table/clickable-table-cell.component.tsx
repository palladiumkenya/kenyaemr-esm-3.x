import { ConfigurableLink, interpolateUrl, navigate, showModal } from '@openmrs/esm-framework';
import React from 'react';
import { MappedBill } from '../types';
import { useClockInStatus } from '../payment-points/use-clock-in-status';
import { Loading } from '@carbon/react';

type ClickableTableCellProps = {
  bill: MappedBill;
  itemToString: (bill: MappedBill) => string;
};

const ClickableTableCell: React.FC<ClickableTableCellProps> = ({ bill, itemToString }) => {
  const { isClockedInSomewhere, isLoading } = useClockInStatus();

  const billingUrl = '${openmrsSpaBase}/home/billing/patient/${patientUuid}/${uuid}';

  if (isLoading) {
    return <Loading withOverlay={false} small />;
  }

  return (
    <ConfigurableLink
      style={{ textDecoration: 'none', maxWidth: '50%' }}
      to={billingUrl}
      onClick={(e) => {
        e.preventDefault();
        if (!isClockedInSomewhere) {
          const dispose = showModal('clock-in-modal', {
            closeModal: () => dispose(),
            onSuccess: () =>
              navigate({ to: billingUrl, templateParams: { patientUuid: bill.patientUuid, uuid: bill.uuid } }),
          });
        } else {
          navigate({ to: billingUrl, templateParams: { patientUuid: bill.patientUuid, uuid: bill.uuid } });
        }
      }}>
      {itemToString(bill)}
    </ConfigurableLink>
  );
};

export default ClickableTableCell;
