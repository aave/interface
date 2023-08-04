import { Box } from '@mui/material';
import Image from 'next/image';

interface LeverageBorrwAssetProps {
  isSelected: boolean;
  isLocked: boolean;
  symbol: string;
  handleSelect: () => void;
}

const LeverageBorrwAsset = ({
  isSelected,
  isLocked,
  symbol,
  handleSelect,
}: LeverageBorrwAssetProps) => {
  const handleBoxClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    void event;
    handleSelect();
  };

  return (
    <Box
      sx={{
        position: 'relative',
      }}
    >
      <Box
        sx={{
          display: isLocked ? 'block' : 'none',
          position: 'absolute',
          width: '100%',
          height: '100%',
          top: '0',
          left: '0',
          backgroundColor: 'gray',
          zIndex: '2',
          borderRadius: '15px',
          opacity: '0.4',
        }}
      />
      <Box
        onClick={handleBoxClick}
        sx={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          border: 'solid 2px',
          borderRadius: '15px',
          p: '5px 15px 5px 10px',
          fontSize: '20px',
          borderColor: isSelected ? '#FFA725' : 'black',
          backgroundColor: '#FFA725' + '22',
          cursor: isLocked ? 'auto' : 'pointer',
        }}
      >
        <Image
          alt={`token image for Ethereum`}
          src={`/icons/tokens/${symbol.toLowerCase()}.svg`}
          width={32}
          height={32}
        />
        {symbol}
      </Box>
    </Box>
  );
};

export default LeverageBorrwAsset;
