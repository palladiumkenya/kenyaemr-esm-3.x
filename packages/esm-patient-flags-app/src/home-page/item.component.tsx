import React from 'react';
import styles from './item.scss';

const Item = ({ item }) => {
  return (
    <div className={styles.itemContainer}>
      <a href={item.link} className={styles.itemLink}>
        <div className={styles.tileItems}>
          {item.icon && <div className={styles.itemImg}>{item.icon}</div>}
          {item.app && <p className={styles.itemText}>{item.app}</p>}
        </div>
      </a>
    </div>
  );
};
export default Item;
