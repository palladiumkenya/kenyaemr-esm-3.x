import React from 'react';
import { InlineLoading, Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
export type BaseOrderButtonProps = {
  isDisabled: boolean;
  isLoading: boolean;
  buttonText: string;
  onClick: () => void;
  kind?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'tertiary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  Icon?;
};

export const BaseOrderButton: React.FC<BaseOrderButtonProps> = ({
  isDisabled,
  isLoading,
  buttonText,
  onClick,
  kind = 'primary',
  size = 'md',
  className = '',
  Icon,
}) => {
  const { t } = useTranslation();

  return (
    <Button
      kind={isLoading ? 'ghost' : kind}
      renderIcon={!isLoading ? Icon : undefined}
      className={className}
      size={size}
      disabled={isLoading || isDisabled}
      onClick={onClick}>
      {isLoading ? (
        <InlineLoading description={t('verifyingBillStatus', 'Verifying bill status...')} status="active" />
      ) : (
        buttonText
      )}
    </Button>
  );
};
