import { Trans } from '@lingui/macro';
import { Box, Button, Typography } from '@mui/material';
import React, { ReactNode } from 'react';

import { HealthFactorNumber } from '../../../components/HealthFactorNumber';
import { BasicModal } from '../../../components/primitives/BasicModal';
import { FormattedNumber } from '../../../components/primitives/FormattedNumber';
import { Link } from '../../../components/primitives/Link';
import { HFContent } from './components/HFContent';
import { InfoWrapper } from './components/InfoWrapper';
import { LTVContent } from './components/LTVContent';

interface LiquidationRiskParametresInfoModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  healthFactor: string;
  loanToValue: string;
  currentLoanToValue: string;
  currentLiquidationThreshold: string;
}

const Row = ({ title, children }: { title: ReactNode; children: ReactNode }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        mb: 1,
      }}
    >
      <Typography variant="h4">{title}</Typography>
      {children}
    </Box>
  );
};

export const LiquidationRiskParametresInfoModal = ({
  open,
  setOpen,
  healthFactor,
  loanToValue,
  currentLoanToValue,
  currentLiquidationThreshold,
}: LiquidationRiskParametresInfoModalProps) => {
  return (
    <BasicModal open={open} setOpen={setOpen}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ mb: 2 }}>
          <Trans>Liquidation risk parametres</Trans>
        </Typography>
        <Typography>
          <Trans>
            Your health factor and loan to value determine the assurance of your collateral. To
            avoid liquidations you can supply more collateral or repay borrow positions.
          </Trans>{' '}
          <Link
            href="https://docs.aave.com/risk/asset-risk/risk-parameters#risk-parameters-analysis"
            sx={{ fontWeight: 500, color: 'secondary.main' }}
          >
            <Trans>Learn more</Trans>
          </Link>
        </Typography>
      </Box>

      <InfoWrapper
        topContent={
          <Row title={<Trans>Health factor</Trans>}>
            <HealthFactorNumber value={healthFactor} variant="h4" />
          </Row>
        }
        topText={
          <Trans>
            Safety of your supplied collateral against the borrowed assets and its underlying value.
          </Trans>
        }
        bottomText={
          <Trans>
            * If the health factor goes below 1, the liquidation of your collateral might be
            triggered.
          </Trans>
        }
      >
        <HFContent healthFactor={healthFactor} />
      </InfoWrapper>

      <InfoWrapper
        topContent={
          <Row title={<Trans>Current LTV</Trans>}>
            <FormattedNumber value={loanToValue} percent variant="h4" />
          </Row>
        }
        topText={<Trans>Your current loan to value based on your collateral supplied.</Trans>}
        bottomText={
          <Trans>
            ** If your loan to value goes above the liquidation threshold your collateral supplied
            may be liquidated.
          </Trans>
        }
      >
        <LTVContent
          loanToValue={loanToValue}
          currentLoanToValue={currentLoanToValue}
          currentLiquidationThreshold={currentLiquidationThreshold}
        />
      </InfoWrapper>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 8 }}>
        <Button variant="contained" onClick={() => setOpen(false)}>
          <Trans>Ok, I got it</Trans>
        </Button>
      </Box>
    </BasicModal>
  );
};
