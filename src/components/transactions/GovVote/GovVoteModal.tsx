import React from 'react';
import { ModalType, useModalContext } from 'src/hooks/useModal';

import { BasicModal } from '../../primitives/BasicModal';
import { GovVoteModalContent } from './GovVoteModalContent';

export const GovVoteModal = () => {
  const { type, close, args } = useModalContext();
  return (
    <BasicModal open={type === ModalType.GovVote} setOpen={close}>
      {args?.proposalId && args?.support !== undefined && (
        <GovVoteModalContent
          proposalId={args.proposalId}
          support={args.support}
          handleClose={close}
        />
      )}
    </BasicModal>
  );
};
