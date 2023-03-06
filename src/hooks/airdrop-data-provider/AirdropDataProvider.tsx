import React from 'react';
import { ReactElement } from 'react-markdown/lib/react-markdown';

interface AirdropData {
  merkleRoot: string;
  setMerkleRoot: (root: string) => void;
  proofs: string[];
  setProofs: (proofs: string[]) => void;
  entryAmount: number;
  setEntryAmout: (entryAmount: number) => void;
  index: number;
  setIndex: (index: number) => void;
  claimIndex: number;
  setClaimIndex: (claimidx: number) => void;
  receiver: string;
  setReceiver: (root: string) => void;
  isClaimed: boolean;
  setIsClaimed: (root: boolean) => void;
}

export const AirdropDataProvider: React.FC<{ children: ReactElement }> = ({ children }) => {
  const [merkleRoot, setMerkleRoot] = React.useState<string>('');
  const [proofs, setProofs] = React.useState<string[]>([]);
  const [entryAmount, setEntryAmout] = React.useState<number>(-1);
  const [index, setIndex] = React.useState<number>(-1);
  const [claimIndex, setClaimIndex] = React.useState<number>(0);
  const [receiver, setReceiver] = React.useState<string>('');
  const [isClaimed, setIsClaimed] = React.useState<boolean>(true);

  return (
    <AirdropContext.Provider
      value={{
        merkleRoot,
        setMerkleRoot,
        proofs,
        setProofs,
        entryAmount,
        setEntryAmout,
        index,
        setIndex,
        claimIndex,
        setClaimIndex,
        receiver,
        setReceiver,
        isClaimed,
        setIsClaimed,
      }}
    >
      {children}
    </AirdropContext.Provider>
  );
};

export const AirdropContext = React.createContext({} as AirdropData);

export const useAirdropContext = () => {
  const airdropData = React.useContext(AirdropContext);

  return airdropData;
};
