import * as React from 'react';
import Portal from '@rc-component/portal';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';
import type { Group } from '../interface';

export interface StickyHeaderParams<T> {
  enabled: boolean;
  group: Group<T> | undefined;
  headerRows: Array<{ groupKey: React.Key; rowIndex: number }>;
  groupKeyToSeg: Map<React.Key, { startIndex: number; endIndex: number }>;
  items: T[];
  containerRef: React.RefObject<HTMLDivElement>;
  prefixCls: string;
}

export default function useStickyGroupHeader<T>(params: StickyHeaderParams<T>) {
  const {
    enabled,
    group,
    headerRows,
    groupKeyToSeg,
    items,
    containerRef,
    prefixCls,
  } = params;

  const extraRender = React.useCallback(
    (info: ExtraRenderInfo) => {
      const { start, virtual } = info;

      if (!virtual || !enabled || !group || !headerRows.length) {
        return null;
      }

      let currHeaderIdx = 0;
      for (let i = 0; i < headerRows.length; i += 1) {
        if (headerRows[i].rowIndex <= start) {
          currHeaderIdx = i;
        } else {
          break;
        }
      }

      const currHeader = headerRows[currHeaderIdx];
      const seg = groupKeyToSeg.get(currHeader.groupKey);
      const groupItems = seg
        ? items.slice(seg.startIndex, seg.endIndex + 1)
        : [];

      const headerNode = (
        <div className={`${prefixCls}-sticky-header`}>
          {group.title(currHeader.groupKey, groupItems)}
        </div>
      );

      return (
        <Portal open getContainer={() => containerRef.current}>
          {headerNode}
        </Portal>
      );
    },
    [enabled, group, headerRows, groupKeyToSeg, items, containerRef, prefixCls],
  );

  return extraRender;
}
