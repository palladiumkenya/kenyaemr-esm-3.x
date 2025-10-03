import React from 'react';
import { Select, SelectItem, FormGroup } from '@carbon/react';
import styles from './time-picker-dropdown.scss';

interface TimePickerDropdownProps {
  id: string;
  labelText: string;
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  invalidText?: string;
  existingTimeEntries?: Array<{ hour: number; time: string }>; // Array of existing time entries
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
  // Parse current value or default to empty
  const [hours, minutes] = value && value.includes(':') ? value.split(':') : ['', ''];

  // Find the latest time entry to determine minimum allowed time
  const getLatestTimeEntry = () => {
    if (existingTimeEntries.length === 0) {
      return null;
    }

    // Sort entries by actual time value to find the truly latest entry
    const sortedEntries = existingTimeEntries.sort((a, b) => {
      const aTime = a.time.split(':').map(Number);
      const bTime = b.time.split(':').map(Number);
      const aTimeInMinutes = aTime[0] * 60 + aTime[1];
      const bTimeInMinutes = bTime[0] * 60 + bTime[1];
      return aTimeInMinutes - bTimeInMinutes;
    });

    return sortedEntries[sortedEntries.length - 1]; // Get the latest entry
  };

  const latestEntry = getLatestTimeEntry();

  // Function to check if a time is disabled (earlier than or equal to latest entry)
  const isTimeDisabled = (hour: string, minute: string) => {
    if (!latestEntry) {
      return false;
    }

    const currentHour = parseInt(hour);
    const currentMinute = parseInt(minute);
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);
    const latestTimeInMinutes = latestHour * 60 + latestMinute;

    // Block any time that is equal to or before the latest entry
    return currentTimeInMinutes <= latestTimeInMinutes;
  };

  // Generate hour options (00-23) with improved disabled logic
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    let isDisabled = false;
    let disableReason = '';

    if (existingTimeEntries && existingTimeEntries.length > 0 && latestEntry) {
      const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);

      // Only disable hours that are completely before the latest entry
      // If current hour is less than latest hour, disable it completely
      // If current hour equals latest hour, don't disable it (let minutes handle the logic)
      if (i < latestHour) {
        isDisabled = true;
        disableReason = 'before latest entry';
      }

      // Check if this hour is disabled (must be after latest hour)
    }

    const displayText = isDisabled ? `${hour} 🚫 ${disableReason}` : hour;
    return {
      value: hour,
      text: displayText,
      disabled: isDisabled,
      reason: disableReason,
    };
  });

  // Generate minute options (00-59, every 5 minutes) with improved disabled logic
  const minuteOptions = Array.from({ length: 12 }, (_, i) => {
    const minute = (i * 5).toString().padStart(2, '0');
    let isDisabled = false;
    let disableReason = '';

    if (hours && existingTimeEntries.length > 0 && latestEntry) {
      const currentHour = parseInt(hours);
      const currentMinute = i * 5;
      const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);

      // Only disable minutes if we're in the same hour as the latest entry
      // and the minute is less than or equal to the latest minute
      if (currentHour === latestHour && currentMinute <= latestMinute) {
        isDisabled = true;
        disableReason = `≤ ${latestMinute} min`;
      }
    }

    const displayText = isDisabled ? `${minute} ❌ ${disableReason}` : minute;
    return { value: minute, text: displayText, disabled: isDisabled };
  });

  const handleHourChange = (selectedHour: string) => {
    // Prevent selection of disabled hours
    if (!selectedHour || selectedHour === '') {
      return;
    }

    // Check if this hour is disabled
    const hourOption = hourOptions.find((opt) => opt.value === selectedHour);
    if (hourOption && hourOption.disabled) {
      alert(`This hour (${selectedHour}) cannot be selected as it is before a previous entry.`);
      return;
    }

    // When selecting a new hour, reset to 00 minutes
    // But if this is the same hour as latest entry, we'll need to pick valid minutes
    let defaultMinute = '00';
    if (existingTimeEntries.length > 0 && latestEntry) {
      const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);
      const selectedHourInt = parseInt(selectedHour);

      // If we're selecting the same hour as latest entry, start with next valid minute
      if (selectedHourInt === latestHour) {
        // Find next available 5-minute increment after latest minute
        const nextValidMinute = Math.ceil((latestMinute + 1) / 5) * 5;
        if (nextValidMinute < 60) {
          defaultMinute = nextValidMinute.toString().padStart(2, '0');
        } else {
          // If no valid minutes in this hour, don't allow selection
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

    // Validate that the selected time is not disabled using the same logic as minute options
    if (existingTimeEntries.length > 0 && latestEntry && hours) {
      const currentHour = parseInt(hours);
      const currentMinute = parseInt(selectedMinute);
      const [latestHour, latestMinute] = latestEntry.time.split(':').map(Number);

      // Block if we're in the same hour as latest entry and minute is <= latest minute
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
                  value={option.disabled ? '' : option.value} // Don't allow disabled values
                  text={option.text}
                  disabled={option.disabled}
                  style={
                    option.disabled
                      ? {
                          backgroundColor: '#f4f4f4',
                          color: '#8d8d8d',
                          fontStyle: 'italic',
                          cursor: 'not-allowed',
                        }
                      : undefined
                  }
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
            <strong>⚠️ Time Restrictions:</strong>
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
            <small>🚫 You can only select times after the latest entry</small>
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
