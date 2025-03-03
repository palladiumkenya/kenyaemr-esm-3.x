import React from 'react';
import { Button } from '@carbon/react';
import { closeOverlay } from '../../../hook/overlay';

const SimpleOverlayContent: React.FC = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center', background: 'blue' }}>
      <h2>Overlay Title</h2>
      <p>This is a simple overlay content component.</p>
      <Button onClick={closeOverlay}>Close</Button>
    </div>
  );
};

export default SimpleOverlayContent;
