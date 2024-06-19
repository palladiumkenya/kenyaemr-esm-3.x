import React from 'react';

interface ContactProfileProps {
  patientUuid: string;
}

const ContactProfile: React.FC<ContactProfileProps> = ({ patientUuid }) => {
  return <div>ContactProfile</div>;
};

export default ContactProfile;
