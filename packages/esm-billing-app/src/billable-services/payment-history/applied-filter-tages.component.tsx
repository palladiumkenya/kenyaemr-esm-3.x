import { Tag } from '@carbon/react';
import React from 'react';
import { colorsArray } from '../../constants';
import styles from './payment-history.scss';

export const AppliedFilterTags = ({ tags }: { tags: { type: string; tag: string }[] }) => {
  const getRandomTagColor = () => {
    const randomIndex = Math.floor(Math.random() * colorsArray.length);
    return colorsArray[randomIndex];
  };

  if (tags.length === 0) {
    return;
  }

  return (
    <div className={styles.tagWrapper}>
      {tags.map((tag, index) => (
        <Tag key={index} type={getRandomTagColor()}>
          {tag.tag}
        </Tag>
      ))}
    </div>
  );
};
