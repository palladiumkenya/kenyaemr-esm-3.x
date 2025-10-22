import React, { useState } from 'react';
import { ReferralsHeader } from './header/referrals-header.component';
import ReferralTabs from './referrals/referral-tabs/referrals-tabs.component';
import { mutate } from 'swr';
import { pullFacilityReferrals } from './referrals/refferals.resource';

const ReferralWrap: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ReferralsHeader />
      <ReferralTabs />
    </div>
  );
};

export default ReferralWrap;
