import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './pin-counter.scss';

interface OTPCountdownProps {
  expiryMinutes: number;
  onExpired?: () => void;
  isActive?: boolean;
  variant?: 'default' | 'warning' | 'danger';
  showIcon?: boolean;
  resetTrigger?: number;
}

const OTPCountdown: React.FC<OTPCountdownProps> = ({
  expiryMinutes,
  onExpired,
  isActive = true,
  variant = 'default',
  showIcon = true,
  resetTrigger = 0,
}) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(expiryMinutes * 60);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    setTimeLeft(expiryMinutes * 60);
    setIsExpired(false);
  }, [expiryMinutes, resetTrigger]);

  useEffect(() => {
    if (!isActive || isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          setIsExpired(true);
          onExpired?.();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, isExpired, onExpired]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVariantClass = (): string => {
    if (isExpired) return styles.expired;
    if (timeLeft <= 60) return styles.danger;
    if (timeLeft <= 120) return styles.warning;
    return styles.default;
  };

  const getStatusText = (): string => {
    if (isExpired) {
      return t('otpExpired', 'OTP Expired');
    }
    if (timeLeft <= 60) {
      return t('otpExpiringSoon', 'Expiring Soon');
    }
    return t('otpTimeRemaining', 'Time Remaining');
  };

  if (!isActive && timeLeft === expiryMinutes * 60) {
    return null;
  }

  return (
    <div className={`${styles.countdownContainer} ${getVariantClass()}`}>
      <div className={styles.countdownContent}>
        <span className={styles.timeDisplay}>{formatTime(timeLeft)}</span>
        <span className={styles.statusText}>{getStatusText()}</span>
      </div>
      {timeLeft <= 30 && !isExpired && <div className={styles.urgentPulse} />}
    </div>
  );
};

export default OTPCountdown;
