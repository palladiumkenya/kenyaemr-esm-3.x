import { useState, useEffect } from 'react';

function useCalculateAge(birthDate: string | null | undefined): number {
  const [age, setAge] = useState<number>(0);

  useEffect(() => {
    const calculateAge = (birthDateString: string | null | undefined): number => {
      if (!birthDateString) {
        return 0;
      }

      const today = new Date();
      const birthDate = new Date(birthDateString);

      if (isNaN(birthDate.getTime())) {
        return 0;
      }
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };

    setAge(calculateAge(birthDate));
  }, [birthDate]);

  return age;
}

export default useCalculateAge;
