import React from 'react';
import KenyaEMRLink from './kenyaemr-link.component';
import { render, screen } from '@testing-library/react';

describe('KenyaEMR Link', () => {
  test('should display the KenyaEMR link to SPA', () => {
    render(<KenyaEMRLink />);

    const kenyaEMRLink = screen.getByRole('link', { name: /KenyaEMR/i });
    expect(kenyaEMRLink).toBeInTheDocument();
    expect(kenyaEMRLink).toHaveAttribute('href', '/openmrs/kenyaemr/userHome.page?');
  });
});
