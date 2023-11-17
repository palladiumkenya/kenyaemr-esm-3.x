import React from 'react';
import { Grid, Column } from '@carbon/react';
import Item from './item.component';

const MenuItems = ({ items }) => {
  return (
    <Grid>
      {items.map((item) => (
        <Column lg={4} md={4} sm={4}>
          <Item item={item} />
        </Column>
      ))}
    </Grid>
  );
};

export default MenuItems;
