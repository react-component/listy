import * as React from 'react';
import type { Group } from '../interface';
import type { GroupSegment } from './useGroupSegments';

export type Row<T, K extends React.Key = React.Key> =
  | { type: 'header'; groupKey: K }
  | { type: 'item'; item: T; index: number };

export interface FlattenRowsResult<T, K extends React.Key = React.Key> {
  rows: Row<T, K>[];
  headerRows: { groupKey: K; rowIndex: number }[];
  groupKeyToSeg: Map<K, { startIndex: number; endIndex: number }>;
}

export default function useFlattenRows<T, K extends React.Key = React.Key>(
  items: T[],
  group: Group<T, K> | undefined,
  segments: GroupSegment<K>[],
): FlattenRowsResult<T, K> {
  return React.useMemo(() => {
    const flatRows: Row<T, K>[] = [];
    const headerRows: { groupKey: K; rowIndex: number }[] = [];
    const groupKeyToSeg = new Map<
      K,
      { startIndex: number; endIndex: number }
    >();

    if (!group || !segments.length) {
      for (let i = 0; i < items.length; i += 1) {
        flatRows.push({ type: 'item', item: items[i], index: i });
      }
      return { rows: flatRows, headerRows, groupKeyToSeg };
    }

    for (let s = 0; s < segments.length; s += 1) {
      const seg = segments[s];
      groupKeyToSeg.set(seg.key, {
        startIndex: seg.startIndex,
        endIndex: seg.endIndex,
      });

      headerRows.push({ groupKey: seg.key, rowIndex: flatRows.length });
      flatRows.push({ type: 'header', groupKey: seg.key });

      for (let i = seg.startIndex; i <= seg.endIndex; i += 1) {
        flatRows.push({ type: 'item', item: items[i], index: i });
      }
    }

    return { rows: flatRows, headerRows, groupKeyToSeg };
  }, [items, group, segments]);
}
