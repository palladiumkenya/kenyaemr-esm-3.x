import { Accordion, AccordionItem, Layer } from '@carbon/react';
import React from 'react';
import styles from './benefits.scss';
import { CheckmarkFilled } from '@carbon/react/icons';
import BenefitsHeader from './benefits-header.component';

const Benefits = () => {
  return (
    <div className={`omrs-main-content `}>
      <BenefitsHeader />
      <Accordion>
        <AccordionItem title="Outpatient Overall">
          <Layer className={styles.accordionLayer}>
            <span>
              <strong>Allocation: </strong>Ksh. 100, 1000
            </span>
            <span>
              <strong>Expenditure: </strong>Ksh. 100, 1000
            </span>
            <span>
              <strong>Balance: </strong>Ksh. 100, 1000
            </span>
            <hr />
            <span className={styles.activeContainer}>
              <CheckmarkFilled className={styles.activeIcon} /> Active
            </span>
          </Layer>
        </AccordionItem>
      </Accordion>
      <Accordion>
        <AccordionItem title="Outpatient Dental">
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestiae deleniti nesciunt placeat animi
            voluptates dolor explicabo provident, quasi voluptatum! Architecto ut aut temporibus illum eos! Sit soluta
            delectus laborum ea.
          </p>
        </AccordionItem>
      </Accordion>
      <Accordion>
        <AccordionItem title="In patient profile">
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestiae deleniti nesciunt placeat animi
            voluptates dolor explicabo provident, quasi voluptatum! Architecto ut aut temporibus illum eos! Sit soluta
            delectus laborum ea.
          </p>
        </AccordionItem>
      </Accordion>
      <Accordion>
        <AccordionItem title="Family Planning">
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Molestiae deleniti nesciunt placeat animi
            voluptates dolor explicabo provident, quasi voluptatum! Architecto ut aut temporibus illum eos! Sit soluta
            delectus laborum ea.
          </p>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Benefits;
