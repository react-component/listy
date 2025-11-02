import * as React from 'react';
import type { Group } from '../interface';
import type { GroupSegment } from './useGroupSegments';

export type Row<T> =
  | { type: 'header'; groupKey: React.Key }
  | { type: 'item'; item: T; index: number };

export interface FlattenRowsResult<T> {
  rows: Array<Row<T>>;
  headerRows: Array<{ groupKey: React.Key; rowIndex: number }>;
  groupKeyToSeg: Map<React.Key, { startIndex: number; endIndex: number }>;
}

export function useFlattenRows<T>(
  items: T[],
  group: Group<T> | undefined,
  segments: GroupSegment[],
): FlattenRowsResult<T> {
  return React.useMemo(() => {
    const flatRows: Row<T>[] = [];
    const headerRows: Array<{ groupKey: React.Key; rowIndex: number }> = [];
    const groupKeyToSeg = new Map<React.Key, { startIndex: number; endIndex: number }>();

    if (!group || !segments.length) {
      for (let i = 0; i < items.length; i += 1) {
        flatRows.push({ type: 'item', item: items[i], index: i });
      }
      return { rows: flatRows, headerRows, groupKeyToSeg };
    }

    for (let s = 0; s < segments.length; s += 1) {
      const seg = segments[s];
      groupKeyToSeg.set(seg.key, { startIndex: seg.startIndex, endIndex: seg.endIndex });

      headerRows.push({ groupKey: seg.key, rowIndex: flatRows.length });
      flatRows.push({ type: 'header', groupKey: seg.key });

      for (let i = seg.startIndex; i <= seg.endIndex; i += 1) {
        flatRows.push({ type: 'item', item: items[i], index: i });
      }
    }

    return { rows: flatRows, headerRows, groupKeyToSeg };
  }, [items, group, segments]);
}

export default useFlattenRows;


