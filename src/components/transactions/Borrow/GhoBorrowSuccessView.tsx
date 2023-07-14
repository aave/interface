import { InterestRate } from '@aave/contract-helpers';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { ContentCopyOutlined, Twitter } from '@mui/icons-material';
import {
  Box,
  Button,
  IconButton,
  Skeleton,
  styled,
  SvgIcon,
  SvgIconProps,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import dynamic from 'next/dynamic.js';
import { ReactNode, useRef, useState } from 'react';
import { LensterIcon } from 'src/components/icons/LensterIcon';
import { compactNumber, FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

const GhoSuccessImage = dynamic(() => import('./GhoSuccessImage'));

const CopyImageButton = styled(Button)(() => ({
  minWidth: 139,
  borderRadius: 32,
  background:
    'linear-gradient(252.63deg, rgba(255, 255, 255, 0.2) 33.91%, rgba(255, 255, 255, 0.08) 73.97%), linear-gradient(0deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))',
  transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  height: 48,
  '&:hover': {
    background:
      'linear-gradient(252.63deg, rgba(255, 255, 255, 0.2) 33.91%, rgba(255, 255, 255, 0.08) 73.97%), linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2))',
    transform: 'translateY(-3px)',
    border: '1px solid #FFFFFF20',
  },
  '&:disabled': {
    border: '1px solid #FFFFFF20',
  },
  backdropFilter: 'blur(5px)',
  border: '1px solid #FFFFFF20',
}));

const IconButtonCustom = styled(IconButton)(() => ({
  backgroundColor: 'white',
  width: 48,
  height: 48,
  transition: 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
  '&:hover': {
    backgroundColor: 'white',
    transform: 'translateY(-3px)',
    boxShadow: '0px 4px 4px 0px #00000040',
  },
})) as typeof IconButton;

const ImageContainer = styled(Box)(() => ({
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    '.image-bar': {
      display: 'flex',
      bottom: 30,
    },
  },
}));

const ImageBar = styled(Box)(() => ({
  transition: 'bottom 0.3s',
  position: 'absolute',
  bottom: -50,
  display: 'flex',
  width: '100%',
  alignItems: 'center',
  paddingLeft: 16,
  paddingRight: 16,
  '@media (hover: none)': {
    bottom: 30,
  },
}));

export type SuccessTxViewProps = {
  txHash?: string;
  action?: ReactNode;
  amount: string;
  symbol?: string;
  collateral?: boolean;
  rate?: InterestRate;
  customAction?: ReactNode;
  customText?: ReactNode;
};

const ExtLinkIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <ExternalLinkIcon />
  </SvgIcon>
);

const COPY_IMAGE_TIME = 5000;

export const GhoBorrowSuccessView = ({ txHash, action, amount, symbol }: SuccessTxViewProps) => {
  const [generatedImage, setGeneratedImage] = useState<string | undefined>();
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>();
  const [clickedCopyImage, setClickedCopyImage] = useState(false);
  const { mainTxState } = useModalContext();
  const { currentNetworkConfig } = useProtocolDataContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const downToXSM = useMediaQuery(theme.breakpoints.down('xsm'));

  const compactedNumber = compactNumber({ value: amount, visibleDecimals: 2, roundDown: true });
  const finalNumber = `${compactedNumber.prefix}${compactedNumber.postfix}`;
  const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

  const onCopyImage = () => {
    if (generatedBlob) {
      navigator.clipboard
        .write([
          new ClipboardItem({
            [generatedBlob.type]: generatedBlob,
          }),
        ])
        .then(() => {
          setClickedCopyImage(true);
          setTimeout(() => {
            setClickedCopyImage(false);
          }, COPY_IMAGE_TIME);
        });
    }
  };

  const transformImage = (svg: SVGSVGElement) => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        const img = new Image();
        img.onload = () => {
          document.fonts.ready.then(() => {
            context.drawImage(img, 0, 0);
            setGeneratedImage(canvasRef.current?.toDataURL('png', 1));
            canvasRef.current?.toBlob((blob) => setGeneratedBlob(blob), 'png');
          });
        };
        img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg.outerHTML)}`;
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            width: '48px',
            height: '48px',
            bgcolor: 'success.200',
            borderRadius: '50%',
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <SvgIcon sx={{ color: 'success.main', fontSize: '32px' }}>
            <CheckIcon />
          </SvgIcon>
        </Box>

        <Typography sx={{ mt: 4 }} variant="h2">
          <Trans>All done!</Trans>
        </Typography>

        <Box
          sx={{
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {action && amount && symbol && (
            <Typography>
              <Trans>
                You {action}{' '}
                <FormattedNumber value={Number(amount)} compact variant="secondary14" /> {symbol}
              </Trans>
            </Typography>
          )}
        </Box>
        <Button
          sx={{ mt: 4 }}
          variant="outlined"
          size="small"
          endIcon={<ExtLinkIcon style={{ fontSize: 12 }} />}
          href={currentNetworkConfig.explorerLinkBuilder({
            tx: txHash ? txHash : mainTxState.txHash,
          })}
          target="_blank"
        >
          <Typography variant="buttonS">
            <Trans>Review tx details</Trans>
          </Typography>
        </Button>
        <Typography sx={{ mt: 6, mb: 4 }} variant="h2">
          <Trans>Save and share</Trans>
        </Typography>
        <canvas style={{ display: 'none' }} width={1169} height={900} ref={canvasRef} />
        {generatedImage ? (
          <ImageContainer>
            <img src={generatedImage} alt="minted gho" style={{ maxWidth: '100%' }} />
            <ImageBar className="image-bar">
              <CopyImageButton
                disabled={clickedCopyImage}
                onClick={onCopyImage}
                sx={{
                  display: isFirefox ? 'none' : 'flex',
                }}
                variant="outlined"
                size="large"
                startIcon={
                  clickedCopyImage ? (
                    <SvgIcon sx={{ color: 'white', fontSize: 16 }}>
                      <CheckIcon />
                    </SvgIcon>
                  ) : (
                    <ContentCopyOutlined style={{ fontSize: 16, fill: 'white' }} />
                  )
                }
              >
                <Typography variant="buttonS" color="white">
                  {clickedCopyImage ? <Trans>COPIED!</Trans> : <Trans>COPY IMAGE</Trans>}
                </Typography>
              </CopyImageButton>
              <IconButtonCustom
                target="_blank"
                href={`https://lenster.xyz/?url=${
                  window.location.href
                }&text=${`I just minted ${finalNumber} GHO`}&hashtags=Aave&preview=true`}
                size="small"
                sx={{ ml: 'auto' }}
              >
                <LensterIcon sx={{ fill: '#845EEE' }} fontSize="small" />
              </IconButtonCustom>
              <IconButtonCustom
                target="_blank"
                href={`https://twitter.com/intent/tweet?text=I Just minted ${finalNumber} GHO`}
                sx={{ ml: 2 }}
              >
                <Twitter fontSize="small" sx={{ fill: '#33CEFF' }} />
              </IconButtonCustom>
            </ImageBar>
          </ImageContainer>
        ) : (
          <>
            <Skeleton height={downToXSM ? 240 : 286} sx={{ borderRadius: 4, width: '100%' }} />
            <div style={{ visibility: 'hidden', position: 'absolute' }}>
              <GhoSuccessImage onSuccessEditing={transformImage} text={finalNumber} />
            </div>
          </>
        )}
      </Box>
    </>
  );
};
