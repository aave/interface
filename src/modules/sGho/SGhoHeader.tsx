import { Trans } from '@lingui/macro';
import { Box, Button, Stack, Typography, useMediaQuery, useTheme } from '@mui/material';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { TopInfoPanel } from 'src/components/TopInfoPanel/TopInfoPanel';
import { useStakeDataSummary, useUmbrellaSummary } from 'src/hooks/stake/useUmbrellaSummary';
import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { MarketDataType } from 'src/ui-config/marketsConfig';
import { GENERAL } from 'src/utils/events';
import { useShallow } from 'zustand/shallow';

import { Link } from '../../components/primitives/Link';
import { TopInfoPanelItem } from '../../components/TopInfoPanel/TopInfoPanelItem';
import { MarketSwitcher } from './UmbrellaMarketSwitcher';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useGeneralStakeUiData, StakeTokenFormatted } from 'src/hooks/stake/useGeneralStakeUiData';
import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';
import { useEffect } from 'react';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';

export const SGHOHeader: React.FC = () => {
    const theme = useTheme();
    const { currentAccount } = useWeb3Context();
    const [currentMarketData, trackEvent] = useRootStore(
        useShallow((store) => [store.currentMarketData, store.trackEvent])
    );

    const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);

    const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } =
        useGeneralStakeUiData(currentMarketData);

    const { data: stakeAPR, isLoading: isLoadingStakeAPR, error: errorStakeAPR } = useStakeTokenAPR();

    useEffect(() => {
        trackEvent('Page Viewed', {
            'Page Name': 'sGHO',
        });
    }, [trackEvent]);


    let stkGho: StakeTokenFormatted | undefined;

    if (stakeGeneralResult && Array.isArray(stakeGeneralResult)) {
        [, , stkGho,] = stakeGeneralResult;
    }


    let stkGhoUserData: StakeUIUserData | undefined;
    if (stakeUserResult && Array.isArray(stakeUserResult)) {
        [, , stkGhoUserData,] = stakeUserResult;
    }


    const upToLG = useMediaQuery(theme.breakpoints.up('lg'));
    const downToSM = useMediaQuery(theme.breakpoints.down('sm'));
    const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

    const valueTypographyVariant = downToSM ? 'main16' : 'main21';
    const symbolsTypographyVariant = downToSM ? 'secondary16' : 'secondary21';

    console.log('stkGho header', stkGho);
    if (!stkGho) return null;

    return (
        <TopInfoPanel
            titleComponent={
                <Box mb={4}>
                    {/* <ChainAvailabilityText wrapperSx={{ mb: 4 }} chainId={ChainId.mainnet} /> */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        {/* <img src={`/aave-logo-purple.svg`} width="64px" height="64px" alt="" /> */}
                        <Typography
                            variant={downToXSM ? 'h2' : upToLG ? 'display1' : 'h1'}
                            sx={{ ml: 2, mr: 3 }}
                        >
                            <Trans>Savings GHO</Trans>
                        </Typography>
                    </Box>

                    <Typography sx={{ color: '#8E92A3', maxWidth: '824px' }}>
                        <Trans>
                            Deposit GHO into savings GHO (sGHO) and earn <Box component="span" sx={{ color: '#338E3C', fontWeight: 'bold' }}>{(stakeAPR?.aprPercentage || 0).toFixed(2)}%</Box> APR on your GHO holdings. Your funds are safe with no risk of slashing, and you can withdraw anytime instantly without penalties or delays. Simply deposit GHO, receive sGHO tokens representing your balance, and watch your savings earning claimable rewards from merit.

                        </Trans>{' '}
                        <Link
                            href="https://aave.com/docs/primitives/umbrella"
                            sx={{ textDecoration: 'underline', color: '#8E92A3' }}
                            onClick={() =>
                                trackEvent(GENERAL.EXTERNAL_LINK, {
                                    Link: 'Staking Risks',
                                })
                            }
                        >
                            <Trans>Learn more about the risks.</Trans>
                        </Link>
                    </Typography>
                </Box>
            }
        >
            {currentAccount ? (
                <UmbrellaHeaderUserDetails
                    currentMarketData={currentMarketData}
                    valueTypographyVariant={valueTypographyVariant}
                    symbolsTypographyVariant={symbolsTypographyVariant}
                    stkGho={stkGho}
                />
            ) : (
                <UmbrellaHeaderDefault
                    currentMarketData={currentMarketData}
                    valueTypographyVariant={valueTypographyVariant}
                    symbolsTypographyVariant={symbolsTypographyVariant}
                />
            )}
        </TopInfoPanel>
    );
};

const UmbrellaHeaderUserDetails = ({
    currentMarketData,
    valueTypographyVariant,
    symbolsTypographyVariant,
    stkGho,
}: {
    currentMarketData: MarketDataType;
    valueTypographyVariant: 'main16' | 'main21';
    symbolsTypographyVariant: 'secondary16' | 'secondary21';
    stkGho: StakeTokenFormatted;
}) => {
    const { data: stakedDataWithTokenBalances, loading: isLoadingStakedDataWithTokenBalances } =
        useUmbrellaSummary(currentMarketData);

    const { openUmbrellaClaimAll } = useModalContext();
    const { data: stakeAPR, isLoading: isLoadingStakeAPR, error: errorStakeAPR } = useStakeTokenAPR();


    const totalUSDAggregateStaked = stakedDataWithTokenBalances?.aggregatedTotalStakedUSD;
    const weightedAverageApy = stakedDataWithTokenBalances?.weightedAverageApy;

    const userRewardsUsd = stakedDataWithTokenBalances?.stakeData.reduce((acc, stake) => {
        const totalAvailableToClaim = stake.formattedRewards.reduce(
            (sum, reward) => sum + Number(reward.accruedUsd || '0'),
            0
        );
        return acc + totalAvailableToClaim;
    }, 0);

    const userHasRewards =
        userRewardsUsd !== undefined && userRewardsUsd > 0 && !isLoadingStakedDataWithTokenBalances;

    return (
        <>
            <TopInfoPanelItem
                hideIcon
                title={<Trans>APR</Trans>}
                loading={isLoadingStakedDataWithTokenBalances}
            >
                <FormattedNumber
                    value={stakeAPR?.apr || 0}
                    variant={valueTypographyVariant}
                    symbolsColor="#A5A8B6"
                    visibleDecimals={2}
                    percent
                    symbolsVariant={symbolsTypographyVariant}
                />
            </TopInfoPanelItem>
            <TopInfoPanelItem
                hideIcon
                title={
                    <Stack direction="row" alignItems="center">
                        <Trans>Total Deposited</Trans>
                    </Stack>
                }
                loading={isLoadingStakedDataWithTokenBalances}
            >
                <FormattedNumber
                    value={stkGho?.totalSupplyUSDFormatted || '0'}
                    symbol="USD"
                    variant={valueTypographyVariant}
                    symbolsVariant={symbolsTypographyVariant}
                    symbolsColor="#A5A8B6"
                    visibleDecimals={2}
                />
            </TopInfoPanelItem>
            <TopInfoPanelItem
                hideIcon
                title={
                    <Stack direction="row" alignItems="center">
                        <Trans>Price</Trans>
                    </Stack>
                }
                loading={isLoadingStakedDataWithTokenBalances}
            >
                <FormattedNumber
                    value={stkGho?.stakeTokenPriceUSDFormatted || '0'}
                    symbol="USD"
                    variant={valueTypographyVariant}
                    symbolsVariant={symbolsTypographyVariant}
                    symbolsColor="#A5A8B6"
                    visibleDecimals={2}
                />
            </TopInfoPanelItem>


            {userHasRewards && (
                <TopInfoPanelItem
                    title={<Trans>Available rewards</Trans>}
                    loading={isLoadingStakedDataWithTokenBalances}
                    hideIcon
                >
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: { xs: 'flex-start', xsm: 'center' },
                            flexDirection: { xs: 'column', xsm: 'row' },
                        }}
                    >
                        <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                            <FormattedNumber
                                value={userRewardsUsd}
                                variant={valueTypographyVariant}
                                visibleDecimals={2}
                                compact
                                symbol="USD"
                                symbolsColor="#A5A8B6"
                                symbolsVariant={symbolsTypographyVariant}
                            />
                        </Box>

                        <Button
                            variant="gradient"
                            size="small"
                            onClick={() => openUmbrellaClaimAll()}
                            sx={{ minWidth: 'unset', ml: { xs: 0, xsm: 2 } }}
                        >
                            <Trans>Claim</Trans>
                        </Button>
                    </Box>
                </TopInfoPanelItem>
            )}
        </>
    );
};

const UmbrellaHeaderDefault = ({
    currentMarketData,
    valueTypographyVariant,
    symbolsTypographyVariant,
}: {
    currentMarketData: MarketDataType;
    valueTypographyVariant: 'main16' | 'main21';
    symbolsTypographyVariant: 'secondary16' | 'secondary21';
}) => {
    const { data: stakeData, loading } = useStakeDataSummary(currentMarketData);

    return (
        <>
            <TopInfoPanelItem
                hideIcon
                title={
                    <Stack direction="row" alignItems="center">
                        <Trans>Total amount staked</Trans>
                    </Stack>
                }
                loading={loading}
            >
                <FormattedNumber
                    value={stakeData?.allStakeAssetsToatlSupplyUsd || '0'}
                    symbol="USD"
                    variant={valueTypographyVariant}
                    visibleDecimals={2}
                    compact
                    symbolsColor="#A5A8B6"
                    symbolsVariant={symbolsTypographyVariant}
                />
            </TopInfoPanelItem>
        </>
    );
};
