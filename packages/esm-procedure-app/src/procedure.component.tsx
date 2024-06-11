import React from 'react';
import { ProcedureHeader } from './header/procedure-header.component';
import ProcedureSummaryTiles from './summary-tiles/procedure-summary-tiles.component';
import ProcedureOrdersList from './procedures-ordered/procedure-tabs.component';
import Overlay from './components/overlay/overlay.component';

const Procedure: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ProcedureHeader />
      <ProcedureSummaryTiles />
      <ProcedureOrdersList />
      <Overlay />
    </div>
  );
};

export default Procedure;
