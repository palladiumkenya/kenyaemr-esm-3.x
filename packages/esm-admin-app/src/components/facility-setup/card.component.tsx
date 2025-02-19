import React from 'react';

type CardProps = {
  label: string;
  value?: string;
};

const Card: React.FC<CardProps> = ({ label, value }) => {
  return (
    <p>
      <strong>{label}:</strong> {value ?? '--'}
    </p>
  );
};

export default Card;
