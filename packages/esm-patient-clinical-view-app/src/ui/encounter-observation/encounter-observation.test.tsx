import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { mapConceptToFormLabel } from '../encounter-list/encounter-list-utils';
import EncounterObservations from './encounter-observation.component';
import { formConceptMap, observationsMockData } from '../../../../../__mocks__/encounter-observations.mock';

const testProps = {
  observations: observationsMockData,
  formConceptMap: formConceptMap,
};

const nullTestProps = {
  observations: [],
  formConceptMap: formConceptMap,
};

const emptyTestProps = {
  observations: [],
  formConceptMap: [],
};

describe('EncounterObservations Component', () => {
  it('renders observations correctly', () => {
    render(<EncounterObservations {...testProps} />);
    expect(screen.getByText('Estimated date of Delivery')).toBeInTheDocument();
    expect(screen.getByText('22-Nov-2023')).toBeInTheDocument();
    expect(screen.getByText('Resuscitation Done:')).toBeInTheDocument();
    expect(screen.getByText('Delivery Conducted By:')).toBeInTheDocument();
    expect(screen.getByText('Next appointment date:')).toBeInTheDocument();
    expect(screen.getByText('Was mother on HAART during ANC?')).toBeInTheDocument();
    expect(screen.getByText('Condition of Mother after delivery:')).toBeInTheDocument();
    expect(screen.getByText('Alive')).toBeInTheDocument();
  });

  it('renders "No observations found" message when observations array is empty', async () => {
    render(<EncounterObservations {...nullTestProps} />);
    await screen.findByText('No observations found');
    expect(screen.getByText('No observations found')).toBeInTheDocument();
  });

  describe('mapConceptToFormLabel', () => {
    it('returns defaultValue when formConceptMap is undefined', () => {
      const result = mapConceptToFormLabel('conceptUuid', {}, 'Alive');
      expect(result).toBe('Alive');
    });
  });
});
