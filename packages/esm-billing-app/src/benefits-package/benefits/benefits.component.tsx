import { Accordion, AccordionItem, Layer } from '@carbon/react';
import React from 'react';
import styles from './benefits.scss';
import { CheckmarkFilled } from '@carbon/react/icons';
import { useBenefitsData } from '../benefits-package.mock';
import BenefitsHeader from './benefits-header.component';

const Benefits: React.FC = () => {
  const benefitsData = useBenefitsData();

  return (
    <div className={`omrs-main-content`}>
      <BenefitsHeader />
      {benefitsData.map((benefit) => (
        <Accordion key={benefit.title}>
          <AccordionItem title={benefit.title}>
            <Layer className={styles.accordionLayer}>
              {benefit.description && (
                <p className={styles.description}>
                  <strong>Description:</strong> {benefit?.description}
                </p>
              )}
              <span>
                <strong>Allocation: </strong>
                {benefit.allocation}
              </span>
              <span>
                <strong>Expenditure: </strong>
                {benefit.expenditure}
              </span>
              <span>
                <strong>Balance: </strong>
                {benefit.balance}
              </span>
              <hr />
              <span className={styles.activeContainer}>
                <CheckmarkFilled className={benefit.isActive ? styles.activeIcon : styles.inactiveIcon} />
                <span className={benefit.isActive ? '' : styles.inactiveIcon}>
                  {benefit.isActive ? 'Active' : 'Inactive'}
                </span>
              </span>
            </Layer>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default Benefits;
