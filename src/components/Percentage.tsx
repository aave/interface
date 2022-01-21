import React from 'react';

export const Percentage: React.FC<{ value: string }> = ({ value }) => (
  <>
    <b>{value}</b> %
  </>
);
