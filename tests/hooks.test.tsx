import React from 'react';
import { render, renderHook } from '@testing-library/react';
import type { ListRef } from 'rc-virtual-list';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';

import useFlattenRows from '../src/hooks/useFlattenRows';
import useGroupSegments from '../src/hooks/useGroupSegments';
import useStickyGroupHeader from '../src/hooks/useStickyGroupHeader';
import type { StickyHeaderParams } from '../src/hooks/useStickyGroupHeader';

const PREFIX_CLS = 'rc-listy';

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
  it('groups items by key across the full data set', () => {
    const items: GroupedItem[] = [
      { id: 0, group: 'A' },
      { id: 1, group: 'A' },
      { id: 2, group: 'B' },
      { id: 3, group: 'B' },
      { id: 4, group: 'A' },
    ];

    const { result } = renderHook(() =>
      useGroupSegments(items, {
        key: (item) => item.group,
        title: () => null,
      }),
    );

    expect(result.current).toEqual(
      new Map([
        [
          'A',
          [
            { item: items[0], index: 0 },
            { item: items[1], index: 1 },
            { item: items[4], index: 4 },
          ],
        ],
        [
          'B',
          [
            { item: items[2], index: 2 },
            { item: items[3], index: 3 },
          ],
        ],
      ]),
    );
  });

  it('supports empty states', () => {
    const staticGroup = { key: () => 'static', title: () => null };
    const { result: staticResult } = renderHook(() =>
      useGroupSegments([{ id: 1, group: 'unused' }], staticGroup),
    );

    expect(staticResult.current).toEqual(
      new Map([['static', [{ item: { id: 1, group: 'unused' }, index: 0 }]]]),
    );

    const { result: noGroup } = renderHook(() =>
      useGroupSegments([{ id: 1, group: 'A' }], undefined),
    );
    expect(noGroup.current).toEqual(new Map());

    const { result: noItems } = renderHook(() =>
      useGroupSegments<GroupedItem>([], {
        key: (item) => item.group,
        title: () => null,
      }),
    );
    expect(noItems.current).toEqual(new Map());
  });
});

describe('useFlattenRows', () => {
  it('flattens grouped data into header and item rows', () => {
    const items: GroupedItem[] = [
      { id: 0, group: 'A' },
      { id: 1, group: 'B' },
      { id: 2, group: 'A' },
    ];
    const group = {
      key: (item: GroupedItem) => item.group,
      title: () => null,
    };

    const { result } = renderHook(() => {
      const groupData = useGroupSegments(items, group);
      return useFlattenRows(items, groupData, group);
    });

    expect(result.current.rows).toEqual([
      { type: 'header', groupKey: 'A' },
      { type: 'item', item: items[0], index: 0 },
      { type: 'item', item: items[2], index: 2 },
      { type: 'header', groupKey: 'B' },
      { type: 'item', item: items[1], index: 1 },
    ]);
    expect(result.current.headerRows).toEqual([
      { groupKey: 'A', rowIndex: 0 },
      { groupKey: 'B', rowIndex: 3 },
    ]);
    expect(result.current.groupKeyToItems).toEqual(
      new Map([
        ['A', [items[0], items[2]]],
        ['B', [items[1]]],
      ]),
    );
  });

  it('flattens ungrouped data without headers', () => {
    const items: GroupedItem[] = [
      { id: 0, group: 'A' },
      { id: 1, group: 'B' },
    ];

    const { result } = renderHook(() => {
      const groupData = useGroupSegments(items);
      return useFlattenRows(items, groupData);
    });

    expect(result.current).toEqual({
      rows: [
        { type: 'item', item: items[0], index: 0 },
        { type: 'item', item: items[1], index: 1 },
      ],
      headerRows: [],
      groupKeyToItems: new Map(),
    });
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
      prefixCls: PREFIX_CLS,
    };

    const { unmount } = render(
      <StickyHeaderTester params={params} info={info} />,
    );

    const stickyHeader = container.querySelector(`.${PREFIX_CLS}-sticky-header`);
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
      prefixCls: PREFIX_CLS,
    };

    const { unmount } = render(<StickyHeaderTester params={params} info={info} />);

    const stickyHeader = container.querySelector(`.${PREFIX_CLS}-sticky-header`);
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
      prefixCls: PREFIX_CLS,
    };

    const { unmount } = render(
      <StickyHeaderTester params={params} info={info} />,
    );

    const stickyHeader = container.querySelector(`.${PREFIX_CLS}-sticky-header`);
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group 2');
    expect(title).toHaveBeenCalledWith('Group 2', baseItems.slice(3, 6));

    unmount();
    document.body.removeChild(container);
  });

  it('prefers holder scrollTop over virtual start', () => {
    const holder = document.createElement('div');
    holder.className = `${PREFIX_CLS}-holder`;
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
      prefixCls: PREFIX_CLS,
    };

    const { unmount } = render(
      <StickyHeaderTester params={params} info={info} />,
    );

    const stickyHeader = container.querySelector(`.${PREFIX_CLS}-sticky-header`);
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group 2');

    unmount();
    document.body.removeChild(container);
  });
});
