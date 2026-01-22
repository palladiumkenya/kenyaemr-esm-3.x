import { useConfig } from '@openmrs/esm-framework';
import { useCallback } from 'react';
import { CarePanelConfig } from '../config-schema';

const useCareProgramForms = () => {
  const { careProgramForms } = useConfig<CarePanelConfig>();
  const getProgramForms = useCallback(
    (programUuid: string) => {
      const program = careProgramForms.find((p) => p.programUuid === programUuid);
      if (!program) {
        return [];
      }
      return program.forms;
    },
    [careProgramForms],
  );

  const getProgramEnrollmentForm = useCallback(
    (programUuid: string) => {
      const forms = getProgramForms(programUuid);
      return forms.find((form) => form.tags.includes('enrollment'));
    },
    [getProgramForms],
  );
  return { careProgramForms, getProgramForms, getProgramEnrollmentForm };
};

export default useCareProgramForms;
