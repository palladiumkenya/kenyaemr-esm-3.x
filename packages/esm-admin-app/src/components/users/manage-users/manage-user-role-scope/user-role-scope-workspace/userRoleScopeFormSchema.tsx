import { useTranslation } from 'react-i18next';
import { z } from 'zod';

const UserRoleScopeFormSchema = () => {
  const { t } = useTranslation();

  const userRoleScopeFormSchema = z.object({
    forms: z.array(
      z.object({
        userName: z.string().optional(),
        permanent: z.boolean().optional(),
        enabled: z.boolean().optional(),
        operationTypes: z
          .array(
            z.object({
              operationTypeName: z.string().optional(),
              operationTypeUuid: z.string().optional(),
            }),
          )
          .optional(),
        locations: z
          .array(
            z.object({
              locationName: z.string().optional(),
              locationUuid: z.string().optional(),
            }),
          )
          .optional(),
        dateRange: z
          .object({
            activeTo: z.date().optional(),
            activeFrom: z.date().optional(),
          })
          .optional(),
        role: z.string().optional(),
      }),
    ),
  });

  return { userRoleScopeFormSchema };
};

export default UserRoleScopeFormSchema;
