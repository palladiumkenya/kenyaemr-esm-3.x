import { Accordion, AccordionItem, Layer } from '@carbon/react';
import React from 'react';
import BenefitsHeader from './benefits-header.components';
import styles from './benefits-package.scss';
import { CheckmarkFilled } from '@carbon/react/icons';
import BenefitsTable from './table/benefits-table.component';

const BenefitsPackage = () => {
  return (
    <div className={`omrs-main-content `}>
      <BenefitsHeader />
      <BenefitsTable />
    </div>
  );
};

export default BenefitsPackage;
