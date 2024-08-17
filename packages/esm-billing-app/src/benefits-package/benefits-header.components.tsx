import React from 'react';
import styles from './benefits-package.scss';

interface BenefitsHeaderProps {}

const BenefitsHeader: React.FC<BenefitsHeaderProps> = () => {
  return (
    <div className={styles.headerContainer}>
      {/* <h4>Benefits</h4> */}
      <div>
        {/* <h6>Social Health Insurance Fund</h6>
        <h6>
          <span>SHIF NUMBER: </span>
          <span>32JFFN23B</span>
        </h6> */}
      </div>
    </div>
  );
};

export default BenefitsHeader;
