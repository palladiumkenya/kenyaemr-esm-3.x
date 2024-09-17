import React from 'react';
import { Tag } from '@carbon/react';
import styles from './payment-history.scss';

export const AppliedFilterTags = ({ tags }: { tags: { type: string; tag: string }[] }) => {
  const colorsArray = [
    'red',
    'magenta',
    'purple',
    'blue',
    'cyan',
    'teal',
    'green',
    'gray',
    'cool-gray',
    'warm-gray',
    'high-contrast',
    'outline',
  ];

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
