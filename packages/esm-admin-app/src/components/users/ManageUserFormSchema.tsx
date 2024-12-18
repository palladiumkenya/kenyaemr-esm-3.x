import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const useManageUserFormSchema = () => {
  const { t } = useTranslation();
  const userFormSchema = z.object({
    name: z.string().min(1, 'Role name is required'),
    description: z.string().optional(),
  });

  const manageUserFormSchema = z.object({
    givenName: z.string().nonempty(t('givenNameRequired', 'Given name is required')),
    middleName: z.string().optional(),
    familyName: z.string().nonempty(t('familyNameRequired', 'Family name is required')),
    gender: z.enum(['M', 'F'], {
      errorMap: () => ({
        message: t('genderRequired', 'Gender is required'),
      }),
    }),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    providerIdentifiers: z.boolean().optional(),
    username: z.string().nonempty(t('usernameRequired', 'Username is required')),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    forcePasswordChange: z.boolean().optional(),
    roles: z
      .array(
        z.object({
          uuid: z.string().min(1, 'UUI is required'),
          display: z.string().min(1, 'Role name is required'),
          description: z.string().nullable().optional(),
        }),
      )
      .optional(),
    primaryRole: z.string().optional(),
  });

  return { manageUserFormSchema };
};

export default useManageUserFormSchema;