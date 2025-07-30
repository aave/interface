import dynamic from 'next/dynamic';
import { Trans } from '@lingui/macro';

import { useEffect } from 'react';
import { ContentContainer } from 'src/components/ContentContainer';
import { MainLayout } from 'src/layouts/MainLayout';
import { Typography, Paper, Box, useTheme, useMediaQuery } from '@mui/material';
import { UmbrellaAssetsListContainer } from 'src/modules/umbrella/StakeAssets/UmbrellaAssetsListContainer';
import { UmrellaAssetsDefaultListContainer } from 'src/modules/umbrella/UmbrellaAssetsDefault';
import { SGHOHeader } from 'src/modules/sGho/SGhoHeader';
import { useRootStore } from 'src/store/root';
import { GhoStakingPanel } from 'src/modules/staking/GhoStakingPanel';
import { Grid } from '@mui/material';
import { SAFETY_MODULE } from 'src/utils/events';
import { StakeUIUserData } from '@aave/contract-helpers/dist/esm/V3-uiStakeDataProvider-contract/types';

import { useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from '../src/libs/hooks/useWeb3Context';
import { useUserStakeUiData } from 'src/hooks/stake/useUserStakeUiData';
import { useStakeTokenAPR } from 'src/hooks/useStakeTokenAPR';
import { SGHODepositPanel } from 'src/modules/sGho/SGhoDepositPanel';
import { StakeTokenFormatted, useGeneralStakeUiData } from 'src/hooks/stake/useGeneralStakeUiData';
import { SavingsGhoCard } from 'src/modules/sGho/SavingsGhoCard';


const SavingsGhoDepositModal = dynamic(() =>
    import('../src/components/transactions/SavingsGho/SavingsGhoDepositModal').then(
        (module) => module.SavingsGhoDepositModal
    )
);
const SavingsGhoWithdrawModal = dynamic(() =>
    import('../src/components/transactions/SavingsGho/SavingsGhoWithdrawModal').then(
        (module) => module.SavingsGhoWithdrawModal
    )
);

export default function SavingsGho() {

    const {

        openSavingsGhoDeposit,
        openSavingsGhoWithdraw,
    } = useModalContext();
    const { currentAccount } = useWeb3Context();
    const trackEvent = useRootStore((store) => store.trackEvent);
    const currentMarketData = useRootStore((store) => store.currentMarketData);
    const { data: stakeAPR, isLoading: isLoadingStakeAPR, error: errorStakeAPR } = useStakeTokenAPR();
    const { breakpoints } = useTheme();
    const downToXsm = useMediaQuery(breakpoints.down('xsm'));
    console.log('stakeAPR', stakeAPR);
    const { data: stakeUserResult } = useUserStakeUiData(currentMarketData);

    const { data: stakeGeneralResult, isLoading: stakeGeneralResultLoading } =
        useGeneralStakeUiData(currentMarketData);

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

    return (
        <>
            <SGHOHeader />
            <ContentContainer>
                {/* {currentAccount ? <UmbrellaAssetsListContainer /> : <UmrellaAssetsDefaultListContainer />} */}

                {/* <Grid
                    item
                    xs={12}
                    lg={6}
                    sx={{ display: { xs: 'block', lg: 'block' } }}
                >
                    <SGHODepositPanel
                        stakeTitle="Savings GHO"
                        stakedToken="GHO"
                        icon="sgho"
                        maxSlash={'0'}
                        stakeData={stkGho}
                        stakeUserData={stkGhoUserData}
                        onStakeAction={() => {
                            trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                action: SAFETY_MODULE.OPEN_STAKE_MODAL,
                                asset: 'GHO',
                                stakeType: 'Safety Module',
                            });
                            openSavingsGhoDeposit();
                        }}
                        onCooldownAction={() => {
                            trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                                asset: 'GHO',
                                stakeType: 'Safety Module',
                            });
                            openSavingsGhoWithdraw();
                        }}
                        onUnstakeAction={() => {
                            trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                                asset: 'GHO',
                                stakeType: 'Safety Module',
                            });
                            openSavingsGhoWithdraw();
                        }}
                        onStakeRewardClaimAction={() => {
                            trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                action: SAFETY_MODULE.OPEN_CLAIM_MODAL,
                                asset: 'GHO',
                                stakeType: 'Safety Module',
                                rewardType: 'Claim',
                            });
                            openStakeRewardsClaim(Stake.gho, 'AAVE');
                        }}
                    />
                </Grid> */}

                <Paper sx={{ pt: 4, pb: 20, px: downToXsm ? 4 : 6 }}>
                    <Box
                    // sx={{
                    //     display: 'flex',
                    //     alignItems: 'center',
                    //     gap: 6,
                    //     flexWrap: 'wrap',
                    //     mb:
                    //         '36px',
                    // }}
                    >
                        <Typography variant="h3">
                            <Trans>Savings GHO (sGHO)</Trans>
                        </Typography>

                        <SGHODepositPanel
                            stakeTitle="sGHO (formerly stkGHO)"
                            stakedToken="GHO"
                            icon="sgho"
                            maxSlash={stkGho?.maxSlashablePercentageFormatted || '0'}
                            stakeData={stkGho}
                            stakeUserData={stkGhoUserData}
                            onStakeAction={() => {
                                trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                    action: SAFETY_MODULE.OPEN_STAKE_MODAL,
                                    asset: 'GHO',
                                    stakeType: 'Safety Module',
                                });
                                openSavingsGhoDeposit();
                            }}
                            onCooldownAction={() => {
                                trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                    action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                                    asset: 'GHO',
                                    stakeType: 'Safety Module',
                                });
                                openSavingsGhoWithdraw();
                            }}
                            onUnstakeAction={() => {
                                trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                    action: SAFETY_MODULE.OPEN_WITHDRAW_MODAL,
                                    asset: 'GHO',
                                    stakeType: 'Safety Module',
                                });
                                openSavingsGhoWithdraw();
                            }}
                            onStakeRewardClaimAction={() => {
                                trackEvent(SAFETY_MODULE.STAKE_SAFETY_MODULE, {
                                    action: SAFETY_MODULE.OPEN_CLAIM_MODAL,
                                    asset: 'GHO',
                                    stakeType: 'Safety Module',
                                    rewardType: 'Claim',
                                });
                                openStakeRewardsClaim(Stake.gho, 'AAVE');
                            }}
                        />
                    </Box>

                </Paper>
            </ContentContainer>
        </>
    );
}

SavingsGho.getLayout = function getLayout(page: React.ReactElement) {
    return (
        <MainLayout>
            {page}
            {/** Modals */}
            <SavingsGhoDepositModal />
            <SavingsGhoWithdrawModal />
            {/** End of modals */}
        </MainLayout>
    );
};
