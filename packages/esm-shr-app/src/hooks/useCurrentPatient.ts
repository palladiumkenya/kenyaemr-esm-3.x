import { useLocation } from 'react-router-dom';

const isUUID = (value) => {
  const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;
  return regex.test(value);
};

const useCurrentPatient = () => {
  const { pathname } = location;
  const patientUUid = pathname.split('/').find(isUUID);
  return patientUUid;
};

export default useCurrentPatient;
