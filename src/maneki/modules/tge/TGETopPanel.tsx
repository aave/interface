import { Trans } from '@lingui/macro';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { Link, Typography } from '@mui/material';
import * as React from 'react';

import { TopInfoPanel } from '../../../components/TopInfoPanel/TopInfoPanel';

export const TGETopPanel = () => {
  return (
    <TopInfoPanel pageTitle={<Trans>Maneki Token Generation Event</Trans>}>
      {/* <TGETopPanelLinks title={<Trans>Tokenomics</Trans>} link={'https://docs.maneki.finance'} />
      <TGETopPanelLinks title={<Trans>Guide</Trans>} link={'https://docs.maneki.finance'} /> */}
      {/* <TGETopPanelLinks title={<Trans>Audit Report</Trans>} link={'#'} /> */}
    </TopInfoPanel>
  );
};

interface TGETopPanelLinksProps {
  title: React.ReactNode;
  link: string;
}
const TGETopPanelLinks = ({ title, link }: TGETopPanelLinksProps) => {
  return (
    <Link
      href={link}
      target="_blank"
      underline="none"
      sx={(theme) => ({
        padding: '16px 46px 16px 20px',
        border: `1px solid ${theme.palette.text.primary}`,
        borderRadius: '8px',
        display: 'flex',
        gap: '8px',
        flexDirection: 'row',
        alignItems: 'center',
      })}
    >
      <Typography
        sx={{ fontWeight: '600', fontSize: '24px', lineHeight: '36px', color: 'text.primary' }}
      >
        {title}
      </Typography>
      <ArrowForwardIcon sx={{ color: 'text.primary', width: '24px', height: '24px' }} />
    </Link>
  );
};
void TGETopPanelLinks;
