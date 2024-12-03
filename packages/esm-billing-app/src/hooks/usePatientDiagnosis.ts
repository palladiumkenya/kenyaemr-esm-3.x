import { useMemo } from 'react';
import { useVisit } from '../claims/dashboard/form/claims-form.resource';
const usePatientDiagnosis = (patientUUid: string) => {
  const { visits: recentVisit, error, isLoading } = useVisit(patientUUid);

  const diagnoses = useMemo(() => {
    return (
      recentVisit?.encounters?.flatMap(
        (encounter) =>
          encounter.diagnoses.map((diagnosis) => ({
            id: diagnosis.diagnosis.coded.uuid,
            text: diagnosis.display,
            certainty: diagnosis.certainty,
          })) || [],
      ) || []
    );
  }, [recentVisit]);

  const confirmedDiagnoses = useMemo(() => {
    return diagnoses.filter((diagnosis) => diagnosis.certainty === 'CONFIRMED');
  }, [diagnoses]);

  return { error, isLoading, diagnoses: confirmedDiagnoses as Array<{ id: string; text: string; certainty: string }> };
};

export default usePatientDiagnosis;
