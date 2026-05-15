import * as React from 'react';

export interface Group<T, K extends React.Key = React.Key> {
  key: (item: T) => K;
  title: (groupKey: K, items: T[]) => React.ReactNode;
}

export interface GroupDataItem<T> {
  item: T;
  index: number;
}

/**
 * Build a lookup map from group key to all matching data items and their
 * original indexes.
 * This groups by key across the full data set and does not require items with
 * the same key to be contiguous.
 */
export default function useGroupData<T, K extends React.Key = React.Key>(
  data: T[],
  group?: Group<T, K>,
): Map<K, GroupDataItem<T>[]> {
  return React.useMemo(() => {
    const map = new Map<K, GroupDataItem<T>[]>();

    if (!group) {
      return map;
    }

    data.forEach((item, index) => {
      const groupKey = group.key(item);
      const groupItems = map.get(groupKey);
      const groupDataItem = { item, index };

      if (groupItems) {
        groupItems.push(groupDataItem);
      } else {
        map.set(groupKey, [groupDataItem]);
      }
    });

    return map;
  }, [data, group]);
}
