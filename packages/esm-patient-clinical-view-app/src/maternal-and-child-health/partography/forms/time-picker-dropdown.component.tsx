import React, { useMemo } from 'react';
import { Select, SelectItem, FormGroup } from '@carbon/react';
import styles from './time-picker-dropdown.scss';

interface TimePickerDropdownProps {
  id: string;
  labelText: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  invalidText?: string;
  existingTimeEntries?: Array<{ hour: number; time: string }>;
}

const TimePickerDropdown: React.FC<TimePickerDropdownProps> = ({
  id,
  labelText,
  value,
  onChange,
  invalid = false,
  invalidText,
  existingTimeEntries = [],
}) => {
  const [hours, minutes] = value && value.includes(':') ? value.split(':') : ['', ''];

  // Memoize sorted entries and latest entry to avoid re-sorting on every render
  const latestEntry = useMemo(() => {
    if (!existingTimeEntries || existingTimeEntries.length === 0) {
      return null;
    }
    const sorted = existingTimeEntries.slice().sort((a, b) => {
      const aTime = a.time.split(':').map(Number);
      const bTime = b.time.split(':').map(Number);
      const aTimeInMinutes = aTime[0] * 60 + aTime[1];
      const bTimeInMinutes = bTime[0] * 60 + bTime[1];
      return aTimeInMinutes - bTimeInMinutes;
    });
    return sorted[sorted.length - 1];
  }, [existingTimeEntries]);

  const isTimeDisabled = (hour: string, minute: string) => {
    if (!latestEntry) {
      return false;
    }
    const currentHour = parseInt(hour);
    const currentMinute = parseInt(minute);
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);
    const latestTimeInMinutes = latestHour * 60 + latestMinute;
    return currentTimeInMinutes <= latestTimeInMinutes;
  };

  // Memoize options generation so we don't recreate arrays on every render
  const hourOptions = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0');
      let isDisabled = false;
      let disableReason = '';
      if (existingTimeEntries && existingTimeEntries.length > 0 && latestEntry) {
        const [latestHour] = latestEntry.time.split(':').map(Number);
        if (i < latestHour) {
          isDisabled = true;
          disableReason = 'before latest entry';
        }
      }
      const displayText = isDisabled ? `${hour} ${disableReason}` : hour;
      return {
        value: hour,
        text: displayText,
        disabled: isDisabled,
        reason: disableReason,
      };
    });
  }, [existingTimeEntries, latestEntry]);

  const minuteOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const minute = (i * 5).toString().padStart(2, '0');
      let isDisabled = false;
      let disableReason = '';
      if (hours && existingTimeEntries.length > 0 && latestEntry) {
        const currentHour = parseInt(hours);
        const currentMinute = i * 5;
        const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);
        if (currentHour === latestHour && currentMinute <= latestMinute) {
          isDisabled = true;
          disableReason = `≤ ${latestMinute} min`;
        }
      }
      const displayText = isDisabled ? `${minute} ${disableReason}` : minute;
      return { value: minute, text: displayText, disabled: isDisabled };
    });
  }, [hours, existingTimeEntries, latestEntry]);

  const handleHourChange = (selectedHour: string) => {
    if (!selectedHour || selectedHour === '') {
      return;
    }
    const hourOption = hourOptions.find((opt) => opt.value === selectedHour);
    if (hourOption && hourOption.disabled) {
      alert(`This hour (${selectedHour}) cannot be selected as it is before a previous entry.`);
      return;
    }
    let defaultMinute = '00';
    if (existingTimeEntries.length > 0 && latestEntry) {
      const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);
      const selectedHourInt = parseInt(selectedHour);
      if (selectedHourInt === latestHour) {
        const nextValidMinute = Math.ceil((latestMinute + 1) / 5) * 5;
        if (nextValidMinute < 60) {
          defaultMinute = nextValidMinute.toString().padStart(2, '0');
        } else {
          alert(`Hour ${selectedHour} has no available time slots after ${latestEntry.time}`);
          return;
        }
      }
    }
    const newTime = `${selectedHour}:${defaultMinute}`;
    onChange(newTime);
  };

  const handleMinuteChange = (selectedMinute: string) => {
    const newTime = `${hours || '00'}:${selectedMinute}`;
    if (existingTimeEntries.length > 0 && latestEntry && hours) {
      const currentHour = parseInt(hours);
      const currentMinute = parseInt(selectedMinute);
      const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);
      if (currentHour === latestHour && currentMinute <= latestMinute) {
        alert(`Cannot select ${selectedMinute} minutes. Must select a time after ${latestEntry.time}`);
        return;
      }
    }
    onChange(newTime);
  };

  return (
    <div className={styles.timePickerContainer}>
      <FormGroup legendText={labelText} invalid={invalid}>
        <div className={styles.timeInputsWrapper}>
          <div className={styles.timeInput}>
            <Select
              id={`${id}-hours`}
              labelText="Hours (HH)"
              value={hours}
              onChange={(e) => handleHourChange((e.target as HTMLSelectElement).value)}
              invalid={invalid}>
              <SelectItem value="" text="HH" />
              {hourOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.disabled ? '' : option.value}
                  text={option.text}
                  disabled={option.disabled}
                  className={option.disabled ? styles.disabledOption : undefined}
                />
              ))}
            </Select>
          </div>

          <div className={styles.separator}>:</div>

          <div className={styles.timeInput}>
            <Select
              id={`${id}-minutes`}
              labelText="Minutes (MM)"
              value={minutes}
              onChange={(e) => handleMinuteChange((e.target as HTMLSelectElement).value)}
              invalid={invalid}>
              <SelectItem value="" text="MM" />
              {minuteOptions.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  text={option.text}
                  disabled={option.disabled}
                  className={option.disabled ? styles.disabledOption : undefined}
                />
              ))}
            </Select>
          </div>
        </div>

        {invalid && invalidText && <div className={styles.errorText}>{invalidText}</div>}

        {latestEntry && (
          <div className={styles.timeConstraint}>
            Latest entry: <strong>{latestEntry.time}</strong> - Next measurement must be after this time
          </div>
        )}

        {existingTimeEntries.length > 0 && (
          <div className={styles.usedTimesIndicator}>
            <strong>Time Restrictions:</strong>
            <br />
            <strong>Used Times:</strong> {existingTimeEntries.map((entry) => entry.time).join(', ')}
            <br />
            <strong>Blocked Hours:</strong>{' '}
            {hourOptions
              .filter((opt) => opt.disabled)
              .map((opt) => opt.value)
              .join(', ')}{' '}
            (grayed out)
            <br />
            <small>You can only select times after the latest entry</small>
          </div>
        )}

        {value && (
          <div className={styles.timePreview}>
            Selected Time: <strong>{value}</strong>
          </div>
        )}
      </FormGroup>
    </div>
  );
};

export default TimePickerDropdown;
