import { Stack } from '@carbon/react';
import { Hospital, Logout, Medication, Person, UserServiceDesk } from '@carbon/react/icons';
import React, { PropsWithChildren, useState } from 'react';
import styles from './expansion-pannel.scss';
import ExpansionTile from './expansion-tile.component';

interface ExpansionPannelProps extends PropsWithChildren {}

const ExpansionPannel: React.FC<ExpansionPannelProps> = ({ children }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <Stack className={styles.expansionPannelContainer}>
      <ExpansionTile
        leading={<Person />}
        title="Check-In"
        subTitles={['Nathali Kiribi', '10:53 AM']}
        expanded={expanded}
        onExpandedChange={(e) => setExpanded(e)}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum, ratione amet fugiat corporis unde itaque odit
        odio libero illum. Unde veritatis delectus iure maxime eveniet esse explicabo, repellat incidunt mollitia.
      </ExpansionTile>
      <ExpansionTile
        leading={<Hospital />}
        title="Triage"
        subTitles={['Anya Pierce', '11:14 AM']}
        expanded={expanded}
        onExpandedChange={(e) => setExpanded(e)}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum, ratione amet fugiat corporis unde itaque odit
        odio libero illum. Unde veritatis delectus iure maxime eveniet esse explicabo, repellat incidunt mollitia.
      </ExpansionTile>
      <ExpansionTile
        leading={<UserServiceDesk />}
        title="Consultation"
        subTitles={['Dr. Mwangi', '11:28 AM']}
        expanded={expanded}
        onExpandedChange={(e) => setExpanded(e)}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum, ratione amet fugiat corporis unde itaque odit
        odio libero illum. Unde veritatis delectus iure maxime eveniet esse explicabo, repellat incidunt mollitia.
      </ExpansionTile>
      <ExpansionTile
        leading={<Medication />}
        title="Pharmacy"
        subTitles={['Macelo Write', '01:28 PM']}
        expanded={expanded}
        onExpandedChange={(e) => setExpanded(e)}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum, ratione amet fugiat corporis unde itaque odit
        odio libero illum. Unde veritatis delectus iure maxime eveniet esse explicabo, repellat incidunt mollitia.
      </ExpansionTile>
      <ExpansionTile
        leading={<Logout />}
        title="Check-Out"
        subTitles={['Automatically', '01:28 PM']}
        expanded={expanded}
        onExpandedChange={(e) => setExpanded(e)}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum, ratione amet fugiat corporis unde itaque odit
        odio libero illum. Unde veritatis delectus iure maxime eveniet esse explicabo, repellat incidunt mollitia.
      </ExpansionTile>
    </Stack>
  );
};

export default ExpansionPannel;
