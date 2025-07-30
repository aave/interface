import { ChainId } from '@aave/contract-helpers';
import { GetUserStakeUIDataHumanized } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { RefreshIcon } from '@heroicons/react/outline';
import { Trans } from '@lingui/macro';
import {
    Box,
    Button,
    Paper,
    Stack,
    SvgIcon,
    Typography,
    useMediaQuery,
    useTheme,
    Divider
} from '@mui/material';
import { BigNumber } from 'ethers';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import React from 'react';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { DarkTooltip } from 'src/components/infoTooltips/DarkTooltip';
import { TokenContractTooltip } from 'src/components/infoTooltips/TokenContractTooltip';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TokenIcon } from 'src/components/primitives/TokenIcon';
import { SecondsToString } from 'src/components/SecondsToString';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { useCurrentTimestamp } from 'src/hooks/useCurrentTimestamp';
import { useModalContext } from 'src/hooks/useModal';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { GENERAL } from 'src/utils/events';
import { Link } from 'src/components/primitives/Link';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';


import { PanelRow, PanelTitle } from '../reserve-overview/ReservePanels';


import { StakeActionBox } from '../staking/StakeActionBox';
import { StakingPanelSkeleton } from '../staking/StakingPanelSkeleton';

export interface SGHODepositPanelProps {
    onStakeAction?: () => void;
    onStakeRewardClaimAction?: () => void;
    onCooldownAction?: () => void;
    onUnstakeAction?: () => void;
    stakeData?: StakeTokenFormatted;
    stakeUserData?: GetUserStakeUIDataHumanized['stakeUserData'][0];
    description?: React.ReactNode;
    headerAction?: React.ReactNode;
    stakeTitle: string;
    stakedToken: string;
    maxSlash: string;
    icon: string;
    children?: React.ReactNode;
}

export const SGHODepositPanel: React.FC<SGHODepositPanelProps> = ({
    onStakeAction,
    onStakeRewardClaimAction,
    onCooldownAction,
    onUnstakeAction,
    headerAction,
    stakedToken,
    stakeTitle,
    icon,
    stakeData,
    stakeUserData,
    maxSlash,
    children,
}) => {
    const { breakpoints } = useTheme();
    const xsm = useMediaQuery(breakpoints.up('xsm'));
    const now = useCurrentTimestamp(1);
    const { openSwitch } = useModalContext();
    const { data: stakeAPR, isLoading: isLoadingStakeAPR, error: errorStakeAPR } = useStakeTokenAPR();


    if (!stakeData || !stakeUserData) {
        return <StakingPanelSkeleton />;
    }

    const handleSwitchClick = () => {
        openSwitch('', ChainId.mainnet);
    };

    // Cooldown logic
    const stakeCooldownSeconds = stakeData?.stakeCooldownSeconds || 0;
    const userCooldown = stakeUserData?.userCooldownTimestamp || 0;
    const stakeUnstakeWindow = stakeData?.stakeUnstakeWindow || 0;

    const userCooldownDelta = now - userCooldown;
    const isCooldownActive = userCooldownDelta < stakeCooldownSeconds + stakeUnstakeWindow;
    const isUnstakeWindowActive =
        isCooldownActive &&
        userCooldownDelta > stakeCooldownSeconds &&
        userCooldownDelta < stakeUnstakeWindow + stakeCooldownSeconds;

    // Others
    const availableToStake = formatEther(
        BigNumber.from(stakeUserData?.underlyingTokenUserBalance || '0')
    );

    const availableToReactivateCooldown =
        isCooldownActive &&
        BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || 0).gt(
            stakeUserData?.userCooldownAmount || 0
        );

    const stakedUSD = formatUnits(
        BigNumber.from(stakeUserData?.stakeTokenRedeemableAmount || '0').mul(
            stakeData?.stakeTokenPriceUSD || '0'
        ),
        18 + 8 // userBalance (18), stakedTokenPriceUSD (8)
    );

    const claimableUSD = formatUnits(
        BigNumber.from(stakeUserData?.userIncentivesToClaim || '0').mul(
            stakeData?.rewardTokenPriceUSD || '0'
        ),
        18 + 8 // incentivesBalance (18), rewardTokenPriceUSD (8)
    );

    // let aavePerMonth = '0';
    // if (stakeData?.stakeTokenTotalSupply !== '0') {
    //   aavePerMonth = formatEther(
    //     valueToBigNumber(stakeUserData?.stakeTokenRedeemableAmount || '0')
    //       .dividedBy(stakeData?.stakeTokenTotalSupply || '1')
    //       .multipliedBy(stakeData?.distributionPerSecond || '0')
    //       .multipliedBy('2592000') // NOTE: Monthly distribution
    //       .toFixed(0)
    //   );
    // }

    // const distributionEnded = Date.now() / 1000 > Number(stakeData.distributionEnd);

    return (
        <>


            <Box>
                <Typography variant="h3">
                    Deposit GHO

                </Typography>
            </Box>
            <Box>
                <Typography gutterBottom>
                    <Trans>
                        Deposit GHO and earn 8% APR
                    </Trans>
                </Typography>

            </Box>



            <Box sx={{ display: 'flex', width: '100%' }}>
                <Typography
                    variant={xsm ? 'subheader2' : 'description'}
                    color={xsm ? 'text.secondary' : 'text.primary'}
                >
                    <Trans>Deposit APR </Trans>
                </Typography>
                <FormattedNumber value={stakeAPR?.apr || 0} percent />

            </Box>
            <Box>
                <Button>Deposit</Button>

            </Box>


        </>
    );
};
