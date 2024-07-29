/* eslint-disable no-console */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from '@carbon/react/icons';
import { ClickableTile } from '@carbon/react';
import styles from './providers-header.scss';
import { Button, TextInput, Modal, Search, DatePickerInput, DatePicker } from '@carbon/react';
import { searchUsers } from '../api/api';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

const MetricsHeader = () => {
  const { t } = useTranslation();
  const metricsTitle = t('providersSummary', 'Providers Summary');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [query, setQuery] = useState('');

  const handleSearch = async (searchQuery) => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const response = await searchUsers(searchQuery.toLowerCase());

    if (response) {
      setSearchResults(response);
    } else {
      console.error('Error fetching users:');
    }
  };

  const handleSearchOnEnter = (e) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setLicenseNumber('');
    setExpiryDate('');
    setIsModalOpen(true);
    setSearchResults([]);
  };

  return (
    <div className={styles.metricsContainer}>
      <span className={styles.metricsTitle}>{metricsTitle}</span>
      <div className={styles.actionBtn}>
        <Button
          kind="tertiary"
          renderIcon={(props) => <ArrowRight size={16} {...props} />}
          iconDescription={t('enroll', 'Add new Provider')}
          onClick={() => setIsModalOpen(true)}>
          {t('enroll', 'ENROLL NEW PROVIDER')}
        </Button>
      </div>
      <Modal
        primaryButtonText="ADD NEW PROVIDER"
        secondaryButtonText="CANCEL"
        open={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        modalHeading="NEW PROVIDER"
        hasScrollingContent>
        <div style={{ paddingBottom: '8px' }}>
          <Search
            id="userSearch"
            autoFocus
            placeHolderText={t('searchUser', 'Search User')}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearchOnEnter}
          />
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            {searchResults.map((user) => (
              <ClickableTile
                key={user.id}
                onClick={() => handleUserSelect(user.person)}
                style={{ marginBottom: '8px' }}>
                <span>{user.person.display}</span>
              </ClickableTile>
            ))}
          </div>
        )}
        <TextInput
          data-modal-primary-focus
          id="full-name-input"
          labelText="Full Names*"
          placeholder="Full Names"
          required
          value={selectedUser?.display || ''}
          readOnly
          style={{ marginBottom: '1rem' }}
        />
        <TextInput
          data-modal-primary-focus
          id="gender-input"
          labelText="Gender*"
          placeholder="Gender"
          required
          value={selectedUser?.gender || ''}
          readOnly
          style={{ marginBottom: '1rem' }}
        />
        <div style={{ marginBottom: '20px' }}>
          <TextInput
            id="license-number-input"
            labelText="License Number*"
            placeholder="Enter License Number"
            required
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            style={{ marginBottom: '1rem' }}
          />
          <DatePicker datePickerType="single" dateFormat="m/d/Y" onChange={(date) => setExpiryDate(date[0] || '')}>
            <DatePickerInput
              placeholder="mm/dd/yyyy"
              labelText="License Expiry Date"
              id="date-picker-single"
              value={expiryDate}
            />
          </DatePicker>
        </div>
      </Modal>
    </div>
  );
};

export default MetricsHeader;
