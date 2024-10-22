import { Tag } from '@carbon/react';
import React from 'react';
import { colorsArray } from '../../constants';
import { useServiceTypes } from '../billable-service.resource';
import styles from './payment-history.scss';

export const AppliedFilterTags = ({ appliedFilters }: { appliedFilters: Array<string> }) => {
  const { serviceTypes } = useServiceTypes();

  const getRandomTagColor = () => {
    const randomIndex = Math.floor(Math.random() * colorsArray.length);
    return colorsArray[randomIndex];
  };

  const tags = appliedFilters
    .filter((f) => Boolean(f))
    .map((f) => {
      const serviceType = serviceTypes.find((sT) => sT.uuid === f);
      const isServiceTypeUUID = Boolean(serviceType);
      return isServiceTypeUUID ? serviceType.display : f;
    });

  if (tags.length === 0) {
    return;
  }

  return (
    <div className={styles.tagWrapper}>
      {tags.map((tag, index) => (
        <Tag key={index} type={getRandomTagColor()}>
          {tag}
        </Tag>
      ))}
    </div>
  );
};
