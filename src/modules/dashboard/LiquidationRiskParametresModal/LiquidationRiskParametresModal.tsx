import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';

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
      <Typography variant="h2" mb={6}>
        <Trans>Liquidation risk parameters</Trans>
      </Typography>
      <Typography mb={6}>
        <Trans>
          Your health factor and loan to value determine the assurance of your collateral. To avoid
          liquidations you can supply more collateral or repay borrow positions.
        </Trans>{' '}
        <Link
          href="https://docs.aave.com/faq/"
          sx={{ textDecoration: 'underline' }}
          color="text.primary"
          variant="description"
        >
          <Trans>Learn more</Trans>
        </Link>
      </Typography>

      <InfoWrapper
        topTitle={<Trans>Health factor</Trans>}
        topDescription={
          <Trans>
            Safety of your deposited collateral against the borrowed assets and its underlying
            value.
          </Trans>
        }
        topValue={
          <HealthFactorNumber
            value={healthFactor}
            variant="main12"
            sx={{ color: 'common.white' }}
          />
        }
        bottomText={
          <Trans>
            If the health factor goes below 1, the liquidation of your collateral might be
            triggered.
          </Trans>
        }
        isWarning={+healthFactor <= 3 && +healthFactor > 1.1}
        isError={+healthFactor <= 1.1}
      >
        <HFContent healthFactor={healthFactor} />
      </InfoWrapper>

      <InfoWrapper
        topTitle={<Trans>Current LTV</Trans>}
        topDescription={
          <Trans>Your current loan to value based on your collateral supplied.</Trans>
        }
        topValue={
          <FormattedNumber
            value={loanToValue}
            percent
            variant="main12"
            color="common.white"
            symbolsColor="common.white"
          />
        }
        bottomText={
          <Box
            sx={{
              color: 'error.main',
            }}
          >
            <Trans>
              If your loan to value goes above the liquidation threshold your collateral supplied
              may be liquidated.
            </Trans>
          </Box>
        }
        isWarning={
          +loanToValue * 100 < +currentLoanToValue * 100 &&
          +loanToValue * 100 > +currentLoanToValue * 100 - (+currentLoanToValue * 100) / 2
        }
        isError={+loanToValue * 100 > +currentLiquidationThreshold * 100}
      >
        <LTVContent
          loanToValue={loanToValue}
          currentLoanToValue={currentLoanToValue}
          currentLiquidationThreshold={currentLiquidationThreshold}
        />
      </InfoWrapper>
    </BasicModal>
  );
};
