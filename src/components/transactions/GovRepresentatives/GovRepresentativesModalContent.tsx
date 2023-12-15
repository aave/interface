import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import { Box, Checkbox, FormControlLabel, OutlinedInput, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig, networkConfigs } from 'src/utils/marketsAndNetworksConfig';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovRepresentativesActions } from './GovRepresentativesActions';

interface UIRepresentative {
  chainId: ChainId;
  representative: string;
  remove: boolean;
}

export const GovRepresentativesContent = ({
  representatives,
}: {
  representatives: Array<{ chainId: ChainId; representative: string }>;
}) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const [currentNetworkConfig, currentChainId] = useRootStore((state) => [
    state.currentNetworkConfig,
    state.currentChainId,
  ]);
  const [reps, setReps] = useState<UIRepresentative[]>(
    representatives.map((r) => ({ ...r, remove: false }))
  );

  // is Network mismatched
  const govChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId
      ? currentChainId
      : governanceConfig.chainId;
  const isWrongNetwork = connectedChainId !== govChain;

  const networkConfig = getNetworkConfig(govChain);

  return (
    <Box sx={{ m: -3 }}>
      <Box sx={{ p: 3 }}>
        <TxModalTitle title="Edit address" />
      </Box>
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      <Stack direction="column" gap={2}>
        {reps.map((r, i) => (
          <Box
            key={i}
            sx={(theme) => ({
              border: reps[i].remove
                ? `1px solid ${theme.palette.text.secondary}`
                : '1px solid transparent',
              borderRadius: '8px',
              background: reps[i].remove ? theme.palette.background.default : 'transparent',
            })}
          >
            <Stack gap={2} sx={{ px: 3, py: 3 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={2}>
                  <img
                    src={networkConfigs[r.chainId].networkLogoPath}
                    height="16px"
                    width="16px"
                    alt="network logo"
                  />
                  <Typography variant="description" color="text.secondary">
                    {networkConfigs[r.chainId].name}
                  </Typography>
                </Stack>
                <FormControlLabel
                  sx={{ mr: 0 }}
                  label={
                    <Typography sx={{ mr: 1 }} variant="subheader1" color="error.main">
                      <Trans>Remove</Trans>
                    </Typography>
                  }
                  labelPlacement="start"
                  control={
                    <Checkbox
                      sx={{ width: '16px', height: '16px' }}
                      checked={reps[i].remove}
                      onChange={(e) => {
                        setReps((prev) => {
                          const newReps = [...prev];
                          newReps[i].remove = e.target.checked;
                          return newReps;
                        });
                      }}
                      size="small"
                    />
                  }
                />
              </Stack>
              <OutlinedInput
                sx={{ height: '44px' }}
                value={r.representative}
                disabled={r.remove}
                inputProps={{ sx: { py: 2, px: 3, fontSize: '14px' } }}
              />
            </Stack>
          </Box>
        ))}
      </Stack>
      <Box sx={{ p: 3 }}>
        <GovRepresentativesActions blocked={false} isWrongNetwork={false} />
      </Box>
    </Box>
  );
};
