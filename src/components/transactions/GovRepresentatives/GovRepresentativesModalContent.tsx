import { ChainId } from '@aave/contract-helpers';
import { Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Checkbox, FormControlLabel, OutlinedInput, Stack, Typography } from '@mui/material';
import { isAddress } from 'ethers/lib/utils';
import { useState } from 'react';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { governanceConfig } from 'src/ui-config/governanceConfig';
import { getNetworkConfig, networkConfigs } from 'src/utils/marketsAndNetworksConfig';

import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovRepresentativesActions } from './GovRepresentativesActions';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

interface UIRepresentative {
  chainId: ChainId;
  representative: string;
  remove: boolean;
  invalid?: boolean;
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
    representatives.map((r) => {
      if (r.representative === ZERO_ADDRESS) {
        return { ...r, representative: '', remove: false };
      } else {
        return { ...r, remove: false };
      }
    })
  );

  // is Network mismatched
  const govChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceConfig.chainId
      ? currentChainId
      : governanceConfig.chainId;
  const isWrongNetwork = connectedChainId !== govChain;

  const networkConfig = getNetworkConfig(govChain);

  const handleChange = (value: string, i: number) => {
    const valid = isAddress(value);

    setReps((prev) => {
      const newReps = [...prev];
      newReps[i].representative = value;
      newReps[i].invalid = !valid;
      return newReps;
    });
  };

  const blocked = reps.some(
    (r) => r.representative !== '' && !r.remove && !isAddress(r.representative)
  );

  const isDirty = reps.some((r) => {
    const rep = representatives.find((re) => re.chainId === r.chainId);
    // dirty if remvoing or changing address from initial value
    if (!rep) return false;

    return (
      (r.remove && rep.representative !== ZERO_ADDRESS) ||
      (rep.representative !== r.representative && r.representative !== '')
    );
  });

  return (
    <Box sx={{ m: -3 }}>
      <Box sx={{ p: 3 }}>
        <TxModalTitle title="Edit address" />
      </Box>
      {/* {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )} */}
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
                endAdornment={
                  r.representative === '' || r.invalid ? null : (
                    <CheckRoundedIcon fontSize="small" color="success" />
                  )
                }
                onChange={(e) => {
                  handleChange(e.target.value, i);
                }}
              />
              <Typography
                sx={{ visibility: r.invalid && !r.remove ? 'visible' : 'hidden' }}
                variant="helperText"
                color="error.main"
              >
                <Trans>Can&apos;t validate the wallet address. Try again.</Trans>
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
      <Box sx={{ p: 3 }}>
        <GovRepresentativesActions blocked={blocked || !isDirty} isWrongNetwork={false} />
      </Box>
    </Box>
  );
};
