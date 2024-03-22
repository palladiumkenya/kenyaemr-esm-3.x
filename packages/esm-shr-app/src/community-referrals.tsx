import React from 'react';
import { CommunityReferralsHeader } from './header/community-referrals-header.component';
import CommunityReferralTabs from './community-referrals/community-referral-tabs/community-referrals-tabs.component';

const CommunityReferral: React.FC = () => {
  return (
    <div className={`omrs-main-content`}>
      <CommunityReferralsHeader />
      <CommunityReferralTabs />
    </div>
  );
};

export default CommunityReferral;
