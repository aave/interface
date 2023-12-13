import { Trans } from '@lingui/macro';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { useRepresentatives } from 'src/hooks/governance/useRepresentatives';
import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { networkConfigs } from 'src/ui-config/networksConfig';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const userWithRepChosen = '0xAd9A211D227d2D9c1B5573f73CDa0284b758Ac0C';

export const RepresentativesInfoPanel = () => {
  const { openGovRepresentatives } = useModalContext();
  const account = useRootStore((state) => state.account);

  const { data } = useRepresentatives(userWithRepChosen);
  console.log(data);

  const { data: isContractAddress, isFetching: fetchingIsContractAddress } =
    useIsContractAddress(userWithRepChosen);

  console.log(isContractAddress, fetchingIsContractAddress);

  const representatives =
    data?.Representatives.filter((r) => r.representative !== ZERO_ADDRESS) ?? [];

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ px: 6, pb: 6, pt: 4 }}>
        <Typography typography="h3">
          <Trans>Representative</Trans>
        </Typography>
        <Stack gap={8} sx={{ mt: 6 }}>
          <Stack direction="column">
            <Typography variant="description" color="text.secondary">
              <Trans>Selected you as a representative</Trans>
            </Typography>
          </Stack>
          <Stack>
            <Typography variant="description" color="text.secondary">
              <Trans>Your representative</Trans>
            </Typography>
            {representatives.map((representative, i) => (
              <Stack gap={2} key={i} direction="row" alignItems="center">
                <img
                  src={networkConfigs[representative.chainId].networkLogoPath}
                  height="16px"
                  width="16px"
                  alt="network logo"
                />
                <CompactableTypography compactMode={CompactMode.MD} compact>
                  {representative.representative}
                </CompactableTypography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>
      <Button
        size="large"
        sx={{ width: '100%' }}
        variant="contained"
        onClick={() => openGovRepresentatives()}
      >
        <Trans>Set up reps</Trans>
      </Button>
    </Paper>
  );
};
