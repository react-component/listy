import * as React from 'react';
import { toTaggedKey } from '../util';
import type { Group, GroupSegmentItem } from '../hooks/useGroupSegments';

// ============================== Types ===============================
export type Row<T, K extends React.Key = React.Key> = (
  { type: 'group'; groupKey: K } | { type: 'item'; item: T; index: number }
) & {
  taggedKey: string;
};

export interface FlattenRowsResult<T, K extends React.Key = React.Key> {
  rows: Row<T, K>[];
  groupKeys: K[];
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
  getItemKey: (item: T) => React.Key,
  group?: Group<T, K>,
): FlattenRowsResult<T, K> {
  return React.useMemo(() => {
    // ============================== Init ================================
    const flatRows: Row<T, K>[] = [];
    const groupKeys: K[] = [];
    const groupKeyToItems = new Map<K, T[]>();

    const itemRow = (item: T, index: number): Row<T, K> => ({
      type: 'item',
      item,
      index,
      taggedKey: toTaggedKey(getItemKey(item), 'item'),
    });

    // ============================ No Group ==============================
    if (!group) {
      data.forEach((item, index) => {
        flatRows.push(itemRow(item, index));
      });

      return { rows: flatRows, groupKeys, groupKeyToItems };
    }

    // ============================= Flatten ==============================
    groupData.forEach((groupItems, groupKey) => {
      groupKeyToItems.set(
        groupKey,
        groupItems.map(({ item }) => item),
      );

      groupKeys.push(groupKey);
      flatRows.push({
        type: 'group',
        groupKey,
        taggedKey: toTaggedKey(groupKey, 'group'),
      });

      groupItems.forEach(({ item, index }) => {
        flatRows.push(itemRow(item, index));
      });
    });

    // ============================== Return ==============================
    return { rows: flatRows, groupKeys, groupKeyToItems };
  }, [data, group, groupData, getItemKey]);
}
