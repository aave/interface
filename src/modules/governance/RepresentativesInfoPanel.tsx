import { Representative, Rpresented } from '@aave/contract-helpers';
import { PlusIcon } from '@heroicons/react/outline';
import { ExternalLinkIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { Box, Button, IconButton, Paper, Stack, SvgIcon, Typography } from '@mui/material';
import { CompactableTypography, CompactMode } from 'src/components/CompactableTypography';
import { Link } from 'src/components/primitives/Link';
import { useRepresentatives } from 'src/hooks/governance/useRepresentatives';
// import { useIsContractAddress } from 'src/hooks/useIsContractAddress';
import { useModalContext } from 'src/hooks/useModal';
import { useRootStore } from 'src/store/root';
import { networkConfigs } from 'src/ui-config/networksConfig';

import { ZERO_ADDRESS } from './utils/formatProposal';

// Setting up a representative is only useful for smart contract wallets.
// If connected account is an EOA, this section is hidden.

// If an account has representatives, then we assume that there is no need to set up a representative,
// and it will show the addresses that have selected the current account to represent them.
export const RepresentativesInfoPanel = () => {
  const { openGovRepresentatives } = useModalContext();
  const account = useRootStore((state) => state.account);

  const { data } = useRepresentatives(account);

  {
    //   const { data: isContractAddress, isFetching: fetchingIsContractAddress } =
    // useIsContractAddress(account);
  }

  const isAddressSelectedAsRepresentative = data?.Represented.some(
    (r) => r.votersRepresented.length > 0
  );

  // if (!isContractAddress) {
  //   return null;
  // }

  return (
    <Paper sx={{ mt: 2 }}>
      <Box sx={{ px: 6, pb: 6, pt: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography typography="h3">
            <Trans>Linked addresses</Trans>
          </Typography>
          {isAddressSelectedAsRepresentative ? null : (
            <Button onClick={() => openGovRepresentatives(data?.Representatives || [])}>
              <Typography typography="subheader1">
                <Trans>Edit</Trans>
              </Typography>
            </Button>
          )}
        </Stack>
        <Stack gap={8} sx={{ mt: 2 }}>
          <Stack direction="column">
            <Typography variant="description" color="text.secondary">
              {isAddressSelectedAsRepresentative ? (
                <Trans>
                  Representing smart contract wallet (ie. Safe) addresses on other chains.
                </Trans>
              ) : (
                <Trans>
                  Representative smart contract wallet (ie. Safe) addresses on other chains.
                </Trans>
              )}
            </Typography>
          </Stack>
          <Stack alignItems="start" gap={6}>
            {isAddressSelectedAsRepresentative ? (
              <Representing representing={data?.Represented || []} />
            ) : (
              <Representatives
                representatives={data?.Representatives || []}
                onOpenRepresentatives={() => openGovRepresentatives(data?.Representatives || [])}
              />
            )}
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
};

const Representatives = ({
  representatives,
  onOpenRepresentatives,
}: {
  representatives: Representative[];
  onOpenRepresentatives: () => void;
}) => {
  return (
    <>
      {representatives.map((representative, i) => (
        <Stack gap={4} key={i} direction="column" alignItems="self-start">
          <Network
            networkLogoPath={networkConfigs[representative.chainId].networkLogoPath}
            networkName={networkConfigs[representative.chainId].name}
          />
          {representative.representative === ZERO_ADDRESS ? (
            <Stack direction="row" gap={1} alignItems="center">
              <IconButton
                sx={(theme) => ({
                  height: '24px',
                  width: '24px',
                  background: theme.palette.background.disabled,
                })}
                onClick={onOpenRepresentatives}
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
            <AddressLink
              explorerLink={networkConfigs[representative.chainId].explorerLink}
              address={representative.representative}
            />
          )}
        </Stack>
      ))}
    </>
  );
};

const Representing = ({ representing }: { representing: Rpresented[] }) => {
  return (
    <>
      {representing.map((representing, i) => (
        <Stack gap={4} key={i} direction="column" alignItems="self-start">
          <Network
            networkLogoPath={networkConfigs[representing.chainId].networkLogoPath}
            networkName={networkConfigs[representing.chainId].name}
          />
          {representing.votersRepresented.length === 0 ? (
            <Typography sx={{ ml: 4 }} color="text.secondary">
              <Trans>None</Trans>
            </Typography>
          ) : (
            representing.votersRepresented.map((voter, i) => (
              <AddressLink
                key={i}
                explorerLink={networkConfigs[representing.chainId].explorerLink}
                address={voter}
              />
            ))
          )}
        </Stack>
      ))}
    </>
  );
};

const Network = ({
  networkLogoPath,
  networkName,
}: {
  networkLogoPath: string;
  networkName: string;
}) => {
  return (
    <Stack direction="row" alignItems="center" gap={2}>
      <img src={networkLogoPath} height="16px" width="16px" alt="network logo" />
      <Typography variant="subheader1">{networkName}</Typography>
    </Stack>
  );
};

const AddressLink = ({ explorerLink, address }: { explorerLink: string; address: string }) => {
  return (
    <Link href={`${explorerLink}/address/${address}`}>
      <Stack direction="row" alignItems="center" gap={1}>
        <CompactableTypography
          variant="subheader1"
          compactMode={CompactMode.MD}
          compact
          sx={{ ml: 4 }}
        >
          {address}
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
  );
};
