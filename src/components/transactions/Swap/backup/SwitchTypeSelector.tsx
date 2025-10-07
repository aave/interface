// import { Trans } from '@lingui/macro';
// import { Box, Typography } from '@mui/material';
// import { StyledTxModalToggleButton } from 'src/components/StyledToggleButton';
// import { StyledTxModalToggleGroup } from 'src/components/StyledToggleButtonGroup';
// import { useRootStore } from 'src/store/root';
// import { SWITCH_MODAL } from 'src/utils/events';
// import { useShallow } from 'zustand/shallow';

// export enum SwitchType {
//   MARKET,
//   LIMIT,
// }
// export function SwitchTypeSelector({
//   switchType,
//   setSwitchType,
// }: {
//   switchType: SwitchType;
//   setSwitchType: (type: SwitchType) => void;
// }) {
//   const [trackEvent] = useRootStore(
//     useShallow((store) => [store.trackEvent, store.currentMarketData])
//   );

//   return (
//     <Box sx={{ mb: 6 }}>
//       <StyledTxModalToggleGroup
//         color="primary"
//         value={switchType}
//         exclusive
//         onChange={(_, value) => setSwitchType(value)}
//       >
//         <StyledTxModalToggleButton
//           value={SwitchType.MARKET}
//           disabled={switchType === SwitchType.MARKET}
//           onClick={() => trackEvent(SWITCH_MODAL.SWITCH_TYPE, { repayType: 'Market order' })}
//         >
//           <Typography variant="buttonM">
//             <Trans>Market </Trans>
//           </Typography>
//         </StyledTxModalToggleButton>

//         <StyledTxModalToggleButton
//           value={SwitchType.LIMIT}
//           disabled={switchType === SwitchType.LIMIT}
//           onClick={() => trackEvent(SWITCH_MODAL.SWITCH_TYPE, { repayType: 'Limit order' })}
//         >
//           <Typography variant="buttonM">
//             <Trans>Limit</Trans>
//           </Typography>
//         </StyledTxModalToggleButton>
//       </StyledTxModalToggleGroup>
//     </Box>
//   );
// }
