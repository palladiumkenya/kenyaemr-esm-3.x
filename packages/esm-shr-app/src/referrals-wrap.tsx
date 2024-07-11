import React, { useState } from 'react';
import { ReferralsHeader } from './header/referrals-header.component';
import ReferralTabs from './referrals/referral-tabs/referrals-tabs.component';
import { mutate } from 'swr';
import { pullFacilityReferrals } from './referrals/refferals.resource';

const ReferralWrap: React.FC = () => {
  const [isLoadingFacilityReferrals, setIsLoadingFacilityReferrals] = useState(false);

  const pullReferrals = () => {
    setIsLoadingFacilityReferrals(true);
    pullFacilityReferrals()
      .then((r) => {
        mutate(
          (key) => typeof key === 'string' && key.startsWith('/ws/rest/v1/kenyaemril/communityReferrals?status=active'),
        );
        setIsLoadingFacilityReferrals(false);
      })
      .catch((err) => {
        setIsLoadingFacilityReferrals(false);
      });
  };

  return (
    <div className={`omrs-main-content`}>
      <ReferralsHeader />
      <ReferralTabs isLoadingFacilityReferrals />
    </div>
  );
};

export default ReferralWrap;
