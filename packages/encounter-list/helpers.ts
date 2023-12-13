import { OHRIFormSchema, SessionMode } from '@openmrs/openmrs-form-engine-lib';
import { launchForm } from '../../utils/ohri-forms-commons';
import { capitalize } from 'lodash-es';

type LaunchAction = 'add' | 'view' | 'edit';

export function launchEncounterForm(
  form: OHRIFormSchema,
  moduleName: string,
  action: LaunchAction = 'add',
  onFormSave: () => void,
  title?: string,
  encounterUuid?: string,
  intent: string = '*',
  workspaceWindowSize?: 'minimized' | 'maximized',
) {
  const defaultTitle = capitalize(action) + ' ' + form.name;
  launchForm(
    form,
    action === 'add' ? 'enter' : action,
    moduleName,
    title || defaultTitle,
    encounterUuid,
    intent,
    onFormSave,
    workspaceWindowSize,
  );
}
