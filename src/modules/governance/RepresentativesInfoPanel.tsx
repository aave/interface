import { PlusIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { Link } from 'src/components/primitives/Link';
import { useRepresentatives } from 'src/hooks/governance/useRepresentatives';
import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { networkConfigs } from 'src/ui-config/networksConfig';

import { ZERO_ADDRESS } from './utils/formatProposal';

const userWithRepChosen = '0xAd9A211D227d2D9c1B5573f73CDa0284b758Ac0C';

export const RepresentativesInfoPanel = () => {
  const { openGovRepresentatives } = useModalContext();
  const account = useRootStore((state) => state.account);

  const { data } = useRepresentatives(account);

  const { data: isContractAddress, isFetching: fetchingIsContractAddress } =
    useIsContractAddress(account);

  console.log(isContractAddress, fetchingIsContractAddress);

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ px: 6, pb: 6, pt: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography typography="h3">
            <Trans>Linked addresses</Trans>
          </Typography>
          <Button onClick={() => openGovRepresentatives(data?.Representatives || [])}>
            <Typography typography="subheader1">
              <Trans>Edit</Trans>
            </Typography>
          </Button>
        </Stack>
        <Stack gap={8} sx={{ mt: 2 }}>
          <Stack direction="column">
            <Typography variant="description" color="text.secondary">
              <Trans>
                Representative smart contract wallet (ie. Safe) addresses on other chains.
              </Trans>
            </Typography>
          </Stack>
          <Stack alignItems="start" gap={6}>
            {data?.Representatives.map((representative, i) => (
              <Stack gap={4} key={i} direction="column" alignItems="self-start">
                <Stack direction="row" alignItems="center" gap={2}>
                  <img
                    src={networkConfigs[representative.chainId].networkLogoPath}
                    height="16px"
                    width="16px"
                    alt="network logo"
                  />
                  <Typography variant="subheader1">
                    {networkConfigs[representative.chainId].name}
                  </Typography>
                </Stack>
                {representative.representative === ZERO_ADDRESS ? (
                  <Stack direction="row" gap={1} alignItems="center">
                    <IconButton
                      sx={(theme) => ({
                        height: '24px',
                        width: '24px',
                        background: theme.palette.background.disabled,
                      })}
                      onClick={() => openGovRepresentatives(data?.Representatives || [])}
                    >
                      <SvgIcon sx={{ p: 1 }}>
                        <PlusIcon />
                      </SvgIcon>
                    </IconButton>
                    <Typography variant="subheader1" color="text.muted">
                      <Trans>Connect</Trans>
                    </Typography>
                  </Stack>
                ) : (
                  <Link
                    href={`${networkConfigs[representative.chainId].explorerLink}/address/${
                      representative.representative
                    }`}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <CompactableTypography
                        variant="subheader1"
                        compactMode={CompactMode.MD}
                        compact
                        sx={{ ml: 4 }}
                      >
                        {representative.representative}
                      </CompactableTypography>
                      <SvgIcon
                        sx={(theme) => ({
                          width: 14,
                          height: 14,
                          ml: 0.5,
                          color: theme.palette.text.muted,
                        })}
                      >
                        <ExternalLinkIcon />
                      </SvgIcon>
                    </Stack>
                  </Link>
                )}
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};
