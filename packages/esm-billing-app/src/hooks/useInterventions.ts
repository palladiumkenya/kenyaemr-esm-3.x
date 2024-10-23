import React, { useMemo } from 'react';
import { intervensions, patientBenefits } from '../benefits-package/benefits-package.mock';
import useSWR from 'swr';
import { FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { _SHAIntervension, SHAIntervension } from '../types';

const useInterventions = (code: string) => {
  // https://hospitals.apeiro-digital.com/api/Benefit/SHA-02'
  const url = `https://hospitals.apeiro-digital.com/api/Benefit/${code}`;
  const { isLoading, error, data } = useSWR<FetchResponse<Array<_SHAIntervension>>>(url, openmrsFetch);
  return {
    isLoading,
    interventions: (data?.data ?? []).map(
      (intervention) =>
        ({
          ...intervention,
          accessCode: intervention.access_code,
          automateManual: intervention.automate_manual,
          categoryHealthFacility: intervention.category_health_facility,
          interventionCode: intervention.intervention_code,
          interventionName: intervention.intervention_name,
          interventionQuantityYear: intervention.intervention_quantity_year,
          limitIndividual: intervention.limit_individual,
          limitIndividualHousehold: intervention.limit_individual_household,
          limitsIndividualHousehold: intervention.limits_individual_household,
          providerPaymentMechanism: intervention.provider_payment_mechanism,
          needsPreAuth: intervention.needs_pre_auth,
          shaCategory: intervention.sha_category,
          subCategoryBenefitsPackage: intervention.sub_category_benefits_package,
          maxAge: intervention.max_age,
          minAge: intervention.min_age,
        } as SHAIntervension),
    ),
    error,
  };
};

export default useInterventions;
