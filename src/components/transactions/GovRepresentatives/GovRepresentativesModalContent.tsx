import { ChainId } from '@aave/contract-helpers';
import { t, Trans } from '@lingui/macro';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box, Checkbox, FormControlLabel, OutlinedInput, Stack, Typography } from '@mui/material';
import { isAddress, parseUnits } from 'ethers/lib/utils';
import { useState } from 'react';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ZERO_ADDRESS } from 'src/modules/governance/utils/formatProposal';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { figVars } from 'src/utils/figmaColors';
import { getNetworkConfig, networkConfigs } from 'src/utils/marketsAndNetworksConfig';
import { useShallow } from 'zustand/shallow';

import { BaseSuccessView } from '../FlowCommons/BaseSuccess';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { GovRepresentativesActions } from './GovRepresentativesActions';

export interface UIRepresentative {
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
  const { mainTxState, txError } = useModalContext();
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context();
  const [currentNetworkConfig, currentChainId] = useRootStore(
    useShallow((state) => [state.currentNetworkConfig, state.currentChainId])
  );
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
    currentNetworkConfig.underlyingChainId === governanceV3Config.coreChainId
      ? currentChainId
      : governanceV3Config.coreChainId;
  const isWrongNetwork = connectedChainId !== govChain;

  const networkConfig = getNetworkConfig(govChain);

  const handleChange = (value: string, i: number) => {
    const valid = isAddress(value);

    setReps((prev) => {
      const newReps = [...prev];
      newReps[i].representative = value;
      newReps[i].invalid = value !== '' && !valid;
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

  if (mainTxState.success) {
    return (
      <BaseSuccessView txHash={mainTxState.txHash}>
        <></>
      </BaseSuccessView>
    );
  }

  return (
    <Box sx={{ m: -3 }}>
      <Box sx={{ p: 3 }}>
        <TxModalTitle title="Edit address" sx={{ mb: 0 }} />
      </Box>
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          autoSwitchOnMount={true}
          networkName={networkConfig.name}
          chainId={govChain}
        />
      )}
      <Stack>
        {reps.map((r, i) => (
          <Box
            key={i}
            sx={{
              border: r.remove ? `1px solid ${figVars['fg-3']}` : '1px solid transparent',
              borderRadius: '8px',
              background: r.remove ? figVars['bg-2'] : 'transparent',
            }}
          >
            <Stack gap={2} sx={{ px: 3, py: 2 }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" gap={2}>
                  <img
                    src={networkConfigs[r.chainId].networkLogoPath}
                    height="16px"
                    width="16px"
                    alt="network logo"
                  />
                  <Typography variant="description" color="fg-2">
                    {networkConfigs[r.chainId].name}
                  </Typography>
                </Stack>
                <FormControlLabel
                  sx={{ m: 0 }}
                  label={
                    <Typography sx={{ mr: 1 }} variant="subheader1" color="error.main">
                      <Trans>Remove</Trans>
                    </Typography>
                  }
                  labelPlacement="start"
                  control={
                    <Checkbox
                      sx={{ p: 0 }}
                      checked={r.remove}
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
                placeholder={t`Enter ETH address`}
                value={r.representative}
                error={r.invalid && !r.remove}
                disabled={r.remove}
                fullWidth
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
              {r.invalid && !r.remove && (
                <Typography variant="helperText" color="error.main">
                  <Trans>Can&apos;t validate the wallet address. Try again.</Trans>
                </Typography>
              )}
            </Stack>
          </Box>
        ))}
      </Stack>
      <Box sx={{ px: 3, pb: 3 }}>
        <GasStation
          disabled={blocked || !isDirty}
          gasLimit={parseUnits('1000000', 'wei')}
          chainId={governanceV3Config.coreChainId}
        />
        {txError && <GasEstimationError txError={txError} />}
        <GovRepresentativesActions
          blocked={blocked || !isDirty}
          isWrongNetwork={false}
          representatives={reps}
        />
      </Box>
    </Box>
  );
};
