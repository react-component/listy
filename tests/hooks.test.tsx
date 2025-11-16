import React from 'react';
import { render, renderHook } from '@testing-library/react';
import type { ListRef } from 'rc-virtual-list';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';

import { useGroupSegments, useStickyGroupHeader } from '../src/hooks';
import type { StickyHeaderParams } from '../src/hooks/useStickyGroupHeader';

interface GroupedItem {
  id: number;
  group: string;
}

const createRenderInfo = (
  overrides: Partial<ExtraRenderInfo> = {},
): ExtraRenderInfo => ({
  start: 0,
  end: 0,
  virtual: true,
  offsetX: 0,
  offsetY: 0,
  rtl: false,
  getSize: () => ({ top: 0, bottom: 0 }),
  ...overrides,
});

const StickyHeaderTester = ({
  params,
  info,
}: {
  params: StickyHeaderParams<GroupedItem>;
  info: ExtraRenderInfo;
}) => {
  const extraRender = useStickyGroupHeader<GroupedItem>(params);
  return <>{extraRender(info)}</>;
};

const createRefObject = <T extends HTMLElement>(
  element: T,
): React.RefObject<T> =>
  ({
    current: element,
  } as React.RefObject<T>);

const createListRef = (
  overrides: Partial<ListRef> = {},
): React.RefObject<ListRef> => {
  const defaultHolder = document.createElement('div');
  const base: ListRef = {
    nativeElement: defaultHolder,
    getScrollInfo: () => ({ x: 0, y: 0 }),
    scrollTo: () => {},
  };

  return {
    current: {
      ...base,
      ...overrides,
      nativeElement: overrides.nativeElement ?? base.nativeElement,
    },
  } as React.RefObject<ListRef>;
};

describe('useGroupSegments', () => {
  it('creates segments for contiguous group keys', () => {
    const items: GroupedItem[] = [
      { id: 0, group: 'A' },
      { id: 1, group: 'A' },
      { id: 2, group: 'B' },
      { id: 3, group: 'B' },
      { id: 4, group: 'C' },
    ];

    const { result } = renderHook(() =>
      useGroupSegments(items, {
        key: (item) => item.group,
        title: () => null,
      }),
    );

    expect(result.current).toEqual([
      { key: 'A', startIndex: 0, endIndex: 1 },
      { key: 'B', startIndex: 2, endIndex: 3 },
      { key: 'C', startIndex: 4, endIndex: 4 },
    ]);
  });

  it('supports static group keys and empty states', () => {
    const staticGroup = { key: 'static', title: () => null };
    const { result: staticResult } = renderHook(() =>
      useGroupSegments([{ id: 1, group: 'unused' }], staticGroup),
    );

    expect(staticResult.current).toEqual([
      { key: 'static', startIndex: 0, endIndex: 0 },
    ]);

    const { result: noGroup } = renderHook(() =>
      useGroupSegments([{ id: 1, group: 'A' }], undefined),
    );
    expect(noGroup.current).toEqual([]);

    const { result: noItems } = renderHook(() =>
      useGroupSegments<GroupedItem>([], {
        key: (item) => item.group,
        title: () => null,
      }),
    );
    expect(noItems.current).toEqual([]);
  });

  it('handles inconsistent length lookups', () => {
    const trickyItems: any = { 0: { id: 9, group: 'Z' }, __calls: 0 };
    Object.defineProperty(trickyItems, 'length', {
      get() {
        this.__calls += 1;
        return this.__calls === 1 ? 1 : 0;
      },
    });

    const { result } = renderHook(() =>
      useGroupSegments(trickyItems as GroupedItem[], {
        key: (item) => item?.group ?? 'fallback',
        title: () => null,
      }),
    );

    expect(result.current).toEqual([]);
  });
});

describe('useStickyGroupHeader', () => {
  const baseItems: GroupedItem[] = [
    { id: 0, group: 'Group 1' },
    { id: 1, group: 'Group 1' },
    { id: 2, group: 'Group 1' },
    { id: 3, group: 'Group 2' },
    { id: 4, group: 'Group 2' },
    { id: 5, group: 'Group 2' },
  ];
  const headerRows = [
    { groupKey: 'Group 1', rowIndex: 0 },
    { groupKey: 'Group 2', rowIndex: 4 },
  ];
  const baseItemsMap = new Map<React.Key, GroupedItem[]>([
    ['Group 1', baseItems.slice(0, 3)],
    ['Group 2', baseItems.slice(3, 6)],
  ]);

  it('renders sticky portal for the active header row', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const containerRef = createRefObject(container);

    const title = jest
      .fn()
      .mockImplementation((key: React.Key, groupItems: GroupedItem[]) => (
        <span data-testid="sticky-title">
          {String(key)}-{groupItems.length}
        </span>
      ));
    const info = createRenderInfo({ start: 5 });
    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title,
      },
      headerRows,
      groupKeyToItems: baseItemsMap,
      containerRef,
      listRef: createListRef({
        nativeElement: container,
        getScrollInfo: () => ({ x: 0, y: info.start }),
      }),
      prefixCls: 'rc-listy',
    };

    const { unmount } = render(
      <StickyHeaderTester params={params} info={info} />,
    );

    const stickyHeader = container.querySelector('.rc-listy-sticky-header');
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group 2-3');
    expect(title).toHaveBeenCalledWith('Group 2', baseItems.slice(3, 6));

    unmount();
    document.body.removeChild(container);
  });

  it('skips portal rendering when virtual list is disabled', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const containerRef = createRefObject(container);

    const info = createRenderInfo({ virtual: false });
    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title: () => <span>noop</span>,
      },
      headerRows,
      groupKeyToItems: baseItemsMap,
      containerRef,
      listRef: createListRef({ nativeElement: container }),
      prefixCls: 'rc-listy',
    };

    const { unmount } = render(<StickyHeaderTester params={params} info={info} />);

    const stickyHeader = container.querySelector('.rc-listy-sticky-header');
    expect(stickyHeader).toBeNull();

    unmount();
    document.body.removeChild(container);
  });

  it('syncs sticky header with scrollTop even if start index is stale', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const containerRef = createRefObject(container);
    const listRef = createListRef({ getScrollInfo: () => ({ x: 0, y: 80 }) });

    const title = jest.fn().mockImplementation((key: React.Key) => (
      <span data-testid="sticky-title">{String(key)}</span>
    ));

    const info = createRenderInfo({
      start: 3,
      getSize: (key: React.Key) => {
        if (key === 'Group 1') {
          return { top: 0, bottom: 60 };
        }
        if (key === 'Group 2') {
          return { top: 80, bottom: 120 };
        }
        return { top: 0, bottom: 0 };
      },
    });

    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title,
      },
      headerRows,
      groupKeyToItems: baseItemsMap,
      containerRef,
      listRef,
      prefixCls: 'rc-listy',
    };

    const { unmount } = render(
      <StickyHeaderTester params={params} info={info} />,
    );

    const stickyHeader = container.querySelector('.rc-listy-sticky-header');
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group 2');
    expect(title).toHaveBeenCalledWith('Group 2', baseItems.slice(3, 6));

    unmount();
    document.body.removeChild(container);
  });

  it('prefers holder scrollTop over virtual start', () => {
    const holder = document.createElement('div');
    holder.className = 'rc-virtual-list-holder';
    holder.scrollTop = 80;

    const container = document.createElement('div');
    container.appendChild(holder);
    document.body.appendChild(container);

    const containerRef = createRefObject(container);
    const listRef = createListRef({
      nativeElement: container,
      getScrollInfo: () => ({ x: 0, y: 0 }),
    });

    const title = jest.fn().mockImplementation((key: React.Key) => (
      <span data-testid="sticky-title">{String(key)}</span>
    ));

    const info = createRenderInfo({
      start: 3,
      getSize: (key: React.Key) => {
        if (key === 'Group 1') {
          return { top: 0, bottom: 60 };
        }
        if (key === 'Group 2') {
          return { top: 80, bottom: 120 };
        }
        return { top: 0, bottom: 0 };
      },
    });

    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title,
      },
      headerRows,
      groupKeyToItems: baseItemsMap,
      containerRef,
      listRef,
      prefixCls: 'rc-listy',
    };

    const { unmount } = render(
      <StickyHeaderTester params={params} info={info} />,
    );

    const stickyHeader = container.querySelector('.rc-listy-sticky-header');
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group 2');

    unmount();
    document.body.removeChild(container);
  });
});
