import React, { useState, useRef, useEffect } from 'react';
import { TextInput, Layer } from '@carbon/react';
import { Time } from '@carbon/react/icons';
import styles from './time-picker-with-clock.scss';

interface TimePickerWithClockProps {
  id: string;
  labelText: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  invalidText?: string;
}

const TimePickerWithClock: React.FC<TimePickerWithClockProps> = ({
  id,
  labelText,
  placeholder = 'HH:MM',
  value,
  onChange,
  invalid = false,
  invalidText,
}) => {
  const [isClockOpen, setIsClockOpen] = useState(false);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [selectedMinute, setSelectedMinute] = useState<number | null>(null);
  const clockRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse current value to set initial clock state
  useEffect(() => {
    if (value && value.includes(':')) {
      const [hours, minutes] = value.split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        setSelectedHour(hours);
        setSelectedMinute(minutes);
      }
    }
  }, [value]);

  // Close clock when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clockRef.current && !clockRef.current.contains(event.target as Node)) {
        setIsClockOpen(false);
      }
    };

    if (isClockOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClockOpen]);

  const handleInputClick = () => {
    setIsClockOpen(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    onChange(inputValue);
  };

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    if (selectedMinute !== null) {
      const timeString = `${hour.toString().padStart(2, '0')}:${selectedMinute.toString().padStart(2, '0')}`;
      onChange(timeString);
      setIsClockOpen(false);
    }
  };

  const handleMinuteClick = (minute: number) => {
    setSelectedMinute(minute);
    if (selectedHour !== null) {
      const timeString = `${selectedHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      onChange(timeString);
      setIsClockOpen(false);
    }
  };

  const renderClockFace = () => {
    if (selectedHour === null) {
      // Show hours
      return (
        <div className={styles.clockFace}>
          <div className={styles.clockTitle}>Select Hour</div>
          <div className={styles.clockNumbers}>
            {Array.from({ length: 24 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`${styles.clockNumber} ${styles.hourNumber}`}
                onClick={() => handleHourClick(i)}
                style={{
                  transform: `rotate(${i * 15}deg) translate(0, -80px) rotate(-${i * 15}deg)`,
                }}>
                {i.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
      );
    } else {
      // Show minutes
      return (
        <div className={styles.clockFace}>
          <div className={styles.clockTitle}>
            Select Minute
            <button type="button" className={styles.backButton} onClick={() => setSelectedHour(null)}>
              ← Back to Hours
            </button>
          </div>
          <div className={styles.clockNumbers}>
            {Array.from({ length: 12 }, (_, i) => {
              const minute = i * 5;
              return (
                <button
                  key={minute}
                  type="button"
                  className={`${styles.clockNumber} ${styles.minuteNumber}`}
                  onClick={() => handleMinuteClick(minute)}
                  style={{
                    transform: `rotate(${i * 30}deg) translate(0, -80px) rotate(-${i * 30}deg)`,
                  }}>
                  {minute.toString().padStart(2, '0')}
                </button>
              );
            })}
          </div>
        </div>
      );
    }
  };

  return (
    <div className={styles.timePickerContainer}>
      <div
        className={styles.inputWrapper}
        onClick={handleInputClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInputClick();
          }
        }}
        role="button"
        tabIndex={0}>
        <TextInput
          ref={inputRef}
          id={id}
          labelText={labelText}
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          invalid={invalid}
          invalidText={invalidText}
          readOnly
        />
        <div className={styles.clockIcon}>
          <Time size={16} />
        </div>
      </div>

      {isClockOpen && (
        <Layer>
          <div ref={clockRef} className={styles.clockDropdown}>
            {renderClockFace()}
          </div>
        </Layer>
      )}
    </div>
  );
};

export default TimePickerWithClock;
