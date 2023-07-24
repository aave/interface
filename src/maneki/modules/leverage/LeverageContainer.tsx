// import { Contract } from 'ethers';
import React from 'react';
import { useLeverageContext } from 'src/maneki/hooks/leverage-data-provider/LeverageDataProvider';

const LeverageContainer = () => {
  const { collateralAssets } = useLeverageContext();

  console.log(collateralAssets);
  return <></>;
};

export default LeverageContainer;
