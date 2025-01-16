import { useTranslation } from 'react-i18next';
import { optional, z } from 'zod';

const UserManagementFormSchema = () => {
  const { t } = useTranslation();

  const userManagementFormSchema = z.object({
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
    systemId: z.string().optional(),
    primaryFacility: z.string().optional(),
    providerLicense: z.string().optional(),
    licenseExpiryDate: z.string().optional(),
    permanent: z.boolean().optional(),
    enabled: z.boolean().optional(),
    stockOperation: z
      .array(
        z.object({
          operationTypeName: z.string().optional(),
          operationTypeUuid: z.string().optional(),
        }),
      )
      .optional(),
    operationLocation: z
      .array(
        z.object({
          locationName: z.string().optional(),
          locationUuid: z.string().optional(),
        }),
      )
      .optional(),

    activeTo: z.string().optional(),
    activeFrom: z.string().optional(),
  });

  return { userManagementFormSchema };
};

export default UserManagementFormSchema;
