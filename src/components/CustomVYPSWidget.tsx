import { useEffect, useState } from 'react';

import { useTheme } from '@mui/system';
import { SecurityWidget } from '@reputation.link/vyps-kit';

import { useProtocolDataContext } from 'src/hooks/useProtocolDataContext';

const CustomPVEWidget = ({
  allowedChainIDs = [1],
  token,
}: {
  allowedChainIDs?: number[];
  token?: string | undefined;
}) => {
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []); // Bypass bug in dependency of dependency

  const {
    palette: {
      mode,
      background: { header: lightColor, surface: darkColor },
    },
  } = useTheme();
  const { currentChainId } = useProtocolDataContext();

  if (!isLoaded) {
    return null;
  }

  // Oracle Reputation's PVE Implementation doesn't support Polygon or Avalanche yet
  const show = !!allowedChainIDs.find((id) => id === currentChainId);
  return (
    <>
      {show && (
        <SecurityWidget
          inset={[5, 5]}
          style={{ zIndex: 50 }}
          left
          variant="sm"
          color={mode === 'dark' ? darkColor : lightColor}
          startOpen
          protocol="aave"
          meta={{ token }}
        />
      )}
    </>
  );
};

export default CustomPVEWidget;
