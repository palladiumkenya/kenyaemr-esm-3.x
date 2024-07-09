import React from 'react';
import { ReferralsHeader } from './header/referrals-header.component';
import CommunityReferralTabs from './community-referrals/community-referral-tabs/community-referrals-tabs.component';

const ReferralWrap: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <ReferralsHeader />
      <CommunityReferralTabs />
    </div>
  );
};

export default ReferralWrap;
