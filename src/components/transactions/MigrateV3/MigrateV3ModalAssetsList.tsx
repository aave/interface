import { Box, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { TokenIcon } from 'src/components/primitives/TokenIcon';

export type Asset = {
  underlyingAsset: string;
  iconSymbol: string;
  symbol: string;
  amount: string;
  amountInUSD: string;
};

interface MigrateV3ModalAssetsListProps {
  caption: ReactNode;
  assets: (Asset | undefined)[];
}

export const MigrateV3ModalAssetsList = ({ caption, assets }: MigrateV3ModalAssetsListProps) => {
  return (
    <Row
      caption={caption}
      captionVariant="description"
      align="flex-start"
      sx={{ mb: 6, '&:last-of-type': { mb: 0 } }}
    >
      {!!assets.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {assets.map((asset) =>
            asset ? (
              <Box
                key={asset.underlyingAsset}
                sx={{ mb: 2, display: 'flex', alignItems: 'flex-end', flexDirection: 'column' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TokenIcon symbol={asset.iconSymbol} sx={{ mr: 1, fontSize: '16px' }} />
                  <FormattedNumber value={asset.amount} variant="secondary14" compact />
                  <Typography ml={1} variant="secondary14">
                    {asset.symbol}
                  </Typography>
                </Box>
                <FormattedNumber
                  value={asset.amountInUSD}
                  variant="helperText"
                  compact
                  symbol="USD"
                  color="text.secondary"
                />
              </Box>
            ) : (
              <></>
            )
          )}
        </Box>
      ) : (
        <Typography>—</Typography>
      )}
    </Row>
  );
};
