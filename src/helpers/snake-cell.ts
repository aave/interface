import { beginCell, BitBuilder, BitReader, Cell } from '@ton/core';

function bufferToChunks(buff: Buffer, chunkSize: number) {
  const chunks: Buffer[] = [];

  while (buff.byteLength > 0) {
    chunks.push(buff.slice(0, chunkSize));
    buff = buff.slice(chunkSize);
  }

  return chunks;
}

export function makeSnakeCell(data: Buffer): Cell {
  const chunks = bufferToChunks(data, 127);

  if (chunks.length === 0) {
    return beginCell().endCell();
  }

  if (chunks.length === 1) {
    return beginCell().storeUint(0, 8).storeBuffer(chunks[0]).endCell();
  }

  let curCell = beginCell();

  curCell.storeUint(0, 8);

  for (let i = chunks.length - 1; i >= 0; i--) {
    const chunk = chunks[i];

    curCell.storeBuffer(chunk);

    if (i - 1 >= 0) {
      const nextCell = beginCell();
      curCell.storeRef(nextCell);
      curCell = nextCell;
    }
  }

  return curCell.endCell();
}

export function flattenSnakeCell(cell: Cell): Buffer {
  let c: Cell | null = cell;

  const bitResult = new BitBuilder();
  while (c) {
    const cs = c.beginParse();
    if (cs.remainingBits === 0) {
      break;
    }

    const data = cs.loadBits(cs.remainingBits);
    bitResult.writeBits(data);
    c = c.refs && c.refs[0];
  }

  const endBits = bitResult.build();
  const reader = new BitReader(endBits);

  return reader.loadBuffer(reader.remaining / 8);
}
