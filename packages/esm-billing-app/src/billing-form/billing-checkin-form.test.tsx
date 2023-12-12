import React from 'react';
import { screen, render } from '@testing-library/react';
import BillingCheckInForm from './billing-checkin-form.component';
import * as billingResource from './billing-form.resource';

const testProps = { patientUuid: 'some-patient-uuid', setBillingInfo: jest.fn() };

describe('BillingCheckInForm', () => {
  test('Should render billing checkin form', () => {
    jest
      .spyOn(billingResource, 'useBillableItems')
      .mockReturnValueOnce({ isLoading: false, lineItems: [], error: null });
    jest.spyOn(billingResource, 'useCashPoint').mockReturnValueOnce({ isLoading: false, cashPoints: [], error: null });
    renderBillingCheckinForm();
  });
});

function renderBillingCheckinForm() {
  render(<BillingCheckInForm {...testProps} />);
}
