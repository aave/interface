import { Trans } from '@lingui/macro';
import { Box, Typography } from '@mui/material';
import { BigNumber, Contract, utils } from 'ethers';
import React from 'react';
import { ReactNode } from 'react-markdown/lib/ast-to-react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import MANEKI_LEVERAGER_V2_ABI from 'src/maneki/abi/leveragerV2ABI';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';
import { manekiParseUnits } from 'src/maneki/utils/stringConverter';
import { marketsData } from 'src/ui-config/marketsConfig';

interface LeverageInfoDisplayProps {
  amount: string;
}

export default function LeverageInfoDisplay({ amount }: LeverageInfoDisplayProps) {
  const { provider } = useWeb3Context();
  const { leverage, currentCollateral, borrowAssets, borrowAmount, setBorrowAmount } =
    useLeverageContext();
  const [apr, setApr] = React.useState<number>(0);

  const LEVERAGER_V2_ADDR = marketsData.arbitrum_mainnet_v3.addresses.LEVERAGER_V2 as string;

  React.useEffect(() => {
    const ratio = [5000, 5000];
    const contract = new Contract(LEVERAGER_V2_ADDR, MANEKI_LEVERAGER_V2_ABI, provider);
    const convertedAmount = manekiParseUnits(amount, currentCollateral.decimals);

    const promises = [];
    promises.push(
      contract.calculateFlashLoanTokens(
        currentCollateral.address,
        convertedAmount,
        [borrowAssets.unstable, borrowAssets.stable],
        ratio,
        leverage
      )
    );

    Promise.all(promises)
      .then((data) => {
        const dataAmount = data[0][1] as BigNumber[];
        setBorrowAmount({
          unstable: dataAmount[0],
          stable: dataAmount[1],
        });
      })
      .catch((e) => {
        console.log('Leverage Info Display Error:', e);
      });
    //eslint-disable-next-line
  }, [provider, amount, currentCollateral, leverage]);

  React.useEffect(() => {
    const contract = new Contract(LEVERAGER_V2_ADDR, MANEKI_LEVERAGER_V2_ABI, provider);
    const getApr = async () => {
      const promise: BigNumber = await contract.calculateApr(leverage);
      setApr(promise.toNumber() / 100);
    };

    getApr();
    //eslint-disable-next-line
  }, [provider, leverage]);

  return (
    <Box sx={{ padding: '10px', borderRadius: '15px' }}>
      <Box>
        <Typography variant="h3" sx={{ fontWeight: '700', lineHeight: '1.8', fontSize: '16px' }}>
          <Trans>Your Borrowed Assets:</Trans>
        </Typography>
        <ValueBox>
          <Typography variant="h3" sx={{ fontWeight: '600', lineHeight: '1.8', fontSize: '16px' }}>
            <Trans>Unstable Coin:</Trans>
          </Typography>
          <FormattedNumber
            sx={{ fontWeight: '700' }}
            symbolSx={{ fontWeight: '700' }}
            value={utils.formatUnits(borrowAmount.unstable, 18)}
            symbol="ETH"
          />
        </ValueBox>
        <ValueBox>
          <Typography variant="h3" sx={{ fontWeight: '600', lineHeight: '1.8', fontSize: '16px' }}>
            <Trans>Stable Coin:</Trans>
          </Typography>
          <FormattedNumber
            sx={{ fontWeight: '700' }}
            symbolSx={{ fontWeight: '700' }}
            value={utils.formatUnits(borrowAmount.stable, 6)}
            symbol="USDC"
          />
        </ValueBox>
      </Box>
      <ValueBox>
        <Typography variant="h3" sx={{ fontWeight: '600', lineHeight: '1.8', fontSize: '16px' }}>
          APR:
        </Typography>
        <FormattedNumber
          sx={{ fontWeight: '700' }}
          symbolSx={{ fontWeight: '700' }}
          value={apr}
          symbol="%"
        />
      </ValueBox>
    </Box>
  );
}

function ValueBox({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      {children}
    </Box>
  );
}
