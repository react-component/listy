import * as React from 'react';
import type { Group } from '../interface';
import type { GroupSegmentItem } from './useGroupSegments';

export type Row<T, K extends React.Key = React.Key> =
  | { type: 'header'; groupKey: K }
  | { type: 'item'; item: T; index: number };

export interface FlattenRowsResult<T, K extends React.Key = React.Key> {
  rows: Row<T, K>[];
  headerRows: { groupKey: K; rowIndex: number }[];
  groupKeyToItems: Map<K, T[]>;
}

/**
 * Flatten grouped data into header and item rows.
 * When grouping is enabled, items follow the insertion order of the group map
 * while preserving their original indexes.
 */
export default function useFlattenRows<T, K extends React.Key = React.Key>(
  data: T[],
  groupData: Map<K, GroupSegmentItem<T>[]>,
  group?: Group<T, K>,
): FlattenRowsResult<T, K> {
  return React.useMemo(() => {
    const flatRows: Row<T, K>[] = [];
    const headerRows: { groupKey: K; rowIndex: number }[] = [];
    const groupKeyToItems = new Map<K, T[]>();

    if (!group) {
      data.forEach((item, index) => {
        flatRows.push({ type: 'item', item, index });
      });

      return { rows: flatRows, headerRows, groupKeyToItems };
    }

    groupData.forEach((groupItems, groupKey) => {
      groupKeyToItems.set(
        groupKey,
        groupItems.map(({ item }) => item),
      );

      headerRows.push({ groupKey, rowIndex: flatRows.length });
      flatRows.push({ type: 'header', groupKey });

      groupItems.forEach(({ item, index }) => {
        flatRows.push({ type: 'item', item, index });
      });
    });

    return { rows: flatRows, headerRows, groupKeyToItems };
  }, [data, group, groupData]);
}
