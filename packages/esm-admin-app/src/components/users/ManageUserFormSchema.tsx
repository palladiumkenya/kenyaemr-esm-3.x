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
    gender: z.enum(['Male', 'Female'], {
      errorMap: () => ({
        message: t('genderRequired', 'Gender is required'),
      }),
    }),
    phoneNumber: z.string().optional(),
    email: z.string().optional(),
    providerIdentifiers: z.boolean().optional(),
    systemId: z.string().nonempty(t('systemIdRequired', 'System ID is required')),
    username: z.string().nonempty(t('usernameRequired', 'Username is required')),
    password: z.string().min(8, t('passwordRequirements', 'Password must meet complexity requirements')),
    confirmPassword: z.string(),
    //   .refine((val, ctx) => val === ctx?.parent.password, {
    //     message: t('passwordMismatch', 'Passwords must match'),
    //   }),
    forcePasswordChange: z.boolean().optional(),
    adminRoles: z.array(z.string()).optional(),
    billingRoles: z.array(z.string()).optional(),
    clinicalRoles: z.array(z.string()).optional(),
    inventoryRoles: z.array(z.string()).optional(),
    investigationRoles: z.array(z.string()).optional(),
    pharmacistRoles: z.array(z.string()).optional(),
    recordRoles: z.array(z.string()).optional(),
    primaryRole: z.string().optional(),
  });

  return { manageUserFormSchema };
};

export default useManageUserFormSchema;
