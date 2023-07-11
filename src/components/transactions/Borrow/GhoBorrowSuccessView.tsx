import { InterestRate } from '@aave/contract-helpers';
import { ExternalLinkIcon } from '@heroicons/react/outline';
import { CheckIcon } from '@heroicons/react/solid';
import { Trans } from '@lingui/macro';
import { ContentCopyOutlined, Twitter } from '@mui/icons-material';
import { Box, Button, SvgIcon, Typography } from '@mui/material';
import { ReactNode, useRef, useState } from 'react';
import { LensterIcon } from 'src/components/icons/LensterIcon';
import { compactNumber, FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Link } from 'src/components/primitives/Link';
import { Base64Token } from 'src/components/primitives/TokenIcon';
import { useModalContext } from 'src/hooks/useModal';
import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { ERC20TokenType } from 'src/libs/web3-data-provider/Web3Provider';

import { GhoSuccessImage } from './GhoSuccessImage';

// import LensterIcon from '/public/icons/lenster.svg';

export type SuccessTxViewProps = {
  txHash?: string;
  action?: ReactNode;
  amount: string;
  symbol?: string;
  collateral?: boolean;
  rate?: InterestRate;
  addToken: ERC20TokenType;
  customAction?: ReactNode;
  customText?: ReactNode;
};

const ExtLinkIcon = () => (
  <SvgIcon sx={{ ml: '2px', fontSize: '11px' }}>
    <ExternalLinkIcon />
  </SvgIcon>
);

export const GhoBorrowSuccessView = ({
  txHash,
  action,
  amount,
  symbol,
  addToken,
}: SuccessTxViewProps) => {
  const [generatedImage, setGeneratedImage] = useState<string | undefined>();
  const { close, mainTxState } = useModalContext();
  const { addERC20Token } = useWeb3Context();
  const { currentNetworkConfig } = useProtocolDataContext();
  const [base64, setBase64] = useState('');
  // const theme = useTheme();
  // const sm = useMediaQuery(theme.breakpoints.down('xsm'));
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const compactedNumber = compactNumber({ value: amount, visibleDecimals: 2, roundDown: true });
  const finalNumber = `${compactedNumber.prefix}${compactedNumber.postfix}`;
  const isFirefox = navigator.userAgent.indexOf('Firefox') > -1;

  const onCopyImage = () => {
    if (generatedImage) {
      fetch(generatedImage).then((img) => {
        img.blob().then((blob) => {
          navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
        });
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
          });
        };
        img.src = `data:image/svg+xml;utf8,${encodeURIComponent(svg.outerHTML)}`;
      }
    }
  };

  // const bannerTextVariant = sm ? 'subheader1' : 'h4';

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
            mt: 8,
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
          startIcon={
            <SvgIcon sx={{ width: '14px', height: '14px' }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                />
              </svg>
            </SvgIcon>
          }
          onClick={() => {
            addERC20Token({
              address: addToken.address,
              decimals: addToken.decimals,
              symbol: addToken.aToken ? `a${addToken.symbol}` : addToken.symbol,
              image: !/_/.test(addToken.symbol) ? base64 : undefined,
            });
          }}
        >
          <Typography variant="buttonS">
            <Trans>Add token to wallet</Trans>
          </Typography>
        </Button>
        <Typography sx={{ mt: 6, mb: 4 }} variant="h2">
          <Trans>Save and share</Trans>
        </Typography>
        <canvas style={{ display: 'none' }} width={1134} height={900} ref={canvasRef} />
        {generatedImage ? (
          <img src={generatedImage} alt="minted gho" style={{ maxWidth: '100%' }} />
        ) : (
          <>
            <div style={{ visibility: 'hidden', position: 'absolute' }}>
              <GhoSuccessImage onSuccessEditing={transformImage} text={finalNumber} />
            </div>
          </>
        )}
        <Button
          onClick={onCopyImage}
          sx={{ mt: 3, display: isFirefox ? 'none' : 'flex' }}
          variant="outlined"
          size="small"
          startIcon={<ContentCopyOutlined style={{ fontSize: 16 }} />}
        >
          <Typography variant="buttonS">
            <Trans>COPY IMAGE TO CLIPBOARD</Trans>
          </Typography>
        </Button>
        <Box
          sx={{
            display: 'flex',
            gap: 3,
            width: '100%',
            mt: 8,
          }}
        >
          <Button
            target="_blank"
            href={`https://lenster.xyz/?url=${
              window.location.href
            }&text=${`I just minted ${finalNumber} GHO`}&hashtags=Aave&preview=true`}
            sx={{ width: '100%' }}
            variant="contained"
            startIcon={<LensterIcon />}
          >
            <Trans>Share on Lenster</Trans>
          </Button>
          <Button
            target="_blank"
            href={`https://twitter.com/intent/tweet?text=I Just minted ${finalNumber} GHO`}
            sx={{ width: '100%' }}
            variant="contained"
            startIcon={<Twitter />}
          >
            <Trans>Share on Twitter</Trans>
          </Button>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Link
          variant="helperText"
          href={currentNetworkConfig.explorerLinkBuilder({
            tx: txHash ? txHash : mainTxState.txHash,
          })}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'right',
            mt: 6,
            mb: 3,
          }}
          underline="hover"
          target="_blank"
          rel="noreferrer noopener"
        >
          <Trans>Review tx details</Trans>
          <ExtLinkIcon />
        </Link>
        <Button
          onClick={close}
          variant="contained"
          size="large"
          sx={{ minHeight: '44px' }}
          data-cy="closeButton"
        >
          <Trans>Done</Trans>
        </Button>
      </Box>

      <Base64Token symbol={addToken.symbol} onImageGenerated={setBase64} aToken={addToken.aToken} />
    </>
  );
};
