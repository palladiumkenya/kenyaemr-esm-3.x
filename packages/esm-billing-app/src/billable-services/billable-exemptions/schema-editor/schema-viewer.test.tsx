import React from 'react';
import { render, screen } from '@testing-library/react';
import SchemaViewer from './schema-viewer-component';
import userEvent from '@testing-library/user-event';

const mockData = {
  services: {
    all: [
      {
        concept: '167441',
        description: 'PCR',
      },
      {
        concept: '162202',
        description: 'GeneXpert',
      },
    ],
    'program:HIV': [
      {
        concept: '1000051',
        description: 'Registration',
      },
    ],
  },
  commodities: {},
};

xdescribe('SchemaViewer', () => {
  test('should render the schema viewer', async () => {
    const user = userEvent.setup();
    render(<SchemaViewer data={JSON.stringify(mockData)} />);

    const treeView = screen.getByRole('tree');
    expect(treeView).toBeInTheDocument();

    // Tree should have 2 nodes
    const nodes = screen.getAllByRole('treeitem');
    expect(nodes).toHaveLength(2);

    const services = screen.getByRole('treeitem', { name: 'services' });
    const toggleButton = services.querySelector('.cds--tree-parent-node__toggle');
    await user.click(toggleButton);

    // Should be able to see all and HIV services
    const allServices = screen.getByRole('treeitem', { name: 'all' });
    const hivServices = screen.getByRole('treeitem', { name: 'program:HIV' });
    expect(allServices).toBeInTheDocument();
    expect(hivServices).toBeInTheDocument();
  });
});
