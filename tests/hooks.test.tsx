import React from 'react';
import { cleanup, render, renderHook } from '@testing-library/react';
import type {
  ListProps as VirtualListProps,
  ListRef as RcVirtualListRef,
} from '@rc-component/virtual-list';

import useGroupSegments from '../src/hooks/useGroupSegments';
import useFlattenRows from '../src/VirtualList/useFlattenRows';
import useStickyGroupHeader from '../src/VirtualList/useStickyGroupHeader';
import type { StickyHeaderParams } from '../src/VirtualList/useStickyGroupHeader';

const PREFIX_CLS = 'rc-listy';

interface GroupedItem {
  id: number;
  group: string;
}

type ExtraRenderInfo = Parameters<
  NonNullable<VirtualListProps<unknown>['extraRender']>
>[0];

const createRenderInfo = (
  overrides: Partial<ExtraRenderInfo> = {},
): ExtraRenderInfo => ({
  start: 0,
  end: 0,
  virtual: true,
  offsetX: 0,
  scrollTop: 0,
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

const createListRef = (
  nativeElement: HTMLElement,
): React.RefObject<RcVirtualListRef | null> =>
  ({ current: { nativeElement } } as unknown as React.RefObject<
    RcVirtualListRef | null
  >);

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
    expect(result.current.groupKeys).toEqual(['A', 'B']);
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
      groupKeys: [],
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
  const groupKeys = ['Group 1', 'Group 2'];
  const baseItemsMap = new Map<React.Key, GroupedItem[]>([
    ['Group 1', baseItems.slice(0, 3)],
    ['Group 2', baseItems.slice(3, 6)],
  ]);

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
  });

  it('renders sticky header for the active header row', () => {
    const title = jest
      .fn()
      .mockImplementation((key: React.Key, groupItems: GroupedItem[]) => (
        <span data-testid="sticky-title">
          {String(key)}-{groupItems.length}
        </span>
      ));
    const info = createRenderInfo({ scrollTop: 5, start: 5 });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title,
      },
      groupKeys,
      groupKeyToItems: baseItemsMap,
      prefixCls: PREFIX_CLS,
      listRef: createListRef(container),
    };

    render(<StickyHeaderTester params={params} info={info} />);

    const stickyHeader = container.querySelector(
      `.${PREFIX_CLS}-group-header-fixed`,
    );
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveClass(`${PREFIX_CLS}-group-header`);
    expect(stickyHeader).toHaveClass(`${PREFIX_CLS}-group-header-fixed`);
    expect(stickyHeader).toHaveTextContent('Group 2-3');
    // Last group, nothing to push it: pinned at the container top.
    expect(stickyHeader).toHaveStyle({ top: '0px' });
    expect(title).toHaveBeenCalledWith('Group 2', baseItems.slice(3, 6));  });

  it('skips sticky header rendering when virtual list is disabled', () => {
    const info = createRenderInfo({ virtual: false });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title: () => <span>noop</span>,
      },
      groupKeys,
      groupKeyToItems: baseItemsMap,
      prefixCls: PREFIX_CLS,
      listRef: createListRef(container),
    };

    render(<StickyHeaderTester params={params} info={info} />);

    const stickyHeader = container.querySelector(
      `.${PREFIX_CLS}-group-header-fixed`,
    );
    expect(stickyHeader).toBeNull();  });

  it('keeps the fixed header pinned at 0 within a group regardless of scroll', () => {
    const title = jest.fn().mockImplementation((key: React.Key) => (
      <span data-testid="sticky-title">{String(key)}</span>
    ));

    // Active group is Group 1, with Group 2's header far below the viewport.
    const info = createRenderInfo({
      scrollTop: 80,
      start: 1,
      getSize: (key: React.Key) =>
        key === 'Group 2' ? { top: 500, bottom: 524 } : { top: 0, bottom: 24 },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title,
      },
      groupKeys,
      groupKeyToItems: baseItemsMap,
      prefixCls: PREFIX_CLS,
      listRef: createListRef(container),
    };

    render(<StickyHeaderTester params={params} info={info} />);

    const stickyHeader = container.querySelector(
      `.${PREFIX_CLS}-group-header-fixed`,
    );
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group 1');
    expect(stickyHeader).toHaveStyle({ top: '0px' });  });

  it('pushes the fixed header away when the next group reaches the top', () => {
    const title = jest.fn().mockImplementation((key: React.Key) => (
      <span data-testid="sticky-title">{String(key)}</span>
    ));

    const info = createRenderInfo({
      scrollTop: 70,
      start: 3,
      getSize: (key: React.Key) => {
        if (key === 'Group 1') {
          return { top: 0, bottom: 20 };
        }
        if (key === 'Group 2') {
          return { top: 80, bottom: 100 };
        }
        return { top: 0, bottom: 0 };
      },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title,
      },
      groupKeys,
      groupKeyToItems: baseItemsMap,
      prefixCls: PREFIX_CLS,
      listRef: createListRef(container),
    };

    render(<StickyHeaderTester params={params} info={info} />);

    const stickyHeader = container.querySelector(
      `.${PREFIX_CLS}-group-header-fixed`,
    );
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group 1');
    expect(stickyHeader).toHaveStyle({ top: '-10px' });  });

  it('activates the current group, not the previous one, when its header sits flush at the top', () => {
    const title = jest.fn().mockImplementation((key: React.Key) => (
      <span data-testid="sticky-title">{String(key)}</span>
    ));

    // Group 2's header sits exactly at the viewport top (scrollTop === its top),
    // while `start` is Group 1's last item row (3) — the row before Group 2's
    // header row (4). This is the off-by-one boundary.
    const info = createRenderInfo({
      scrollTop: 200,
      start: 3,
      getSize: (key: React.Key) =>
        key === 'Group 2' ? { top: 200, bottom: 220 } : { top: 0, bottom: 20 },
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const params: StickyHeaderParams<GroupedItem> = {
      enabled: true,
      group: {
        key: (item) => item.group,
        title,
      },
      groupKeys,
      groupKeyToItems: baseItemsMap,
      prefixCls: PREFIX_CLS,
      listRef: createListRef(container),
    };

    render(<StickyHeaderTester params={params} info={info} />);

    const stickyHeader = container.querySelector(
      `.${PREFIX_CLS}-group-header-fixed`,
    );
    expect(stickyHeader).not.toBeNull();
    // The current group (Group 2), not the previous one (Group 1).
    expect(stickyHeader).toHaveTextContent('Group 2');
    expect(stickyHeader).toHaveStyle({ top: '0px' });
    expect(title).toHaveBeenCalledWith('Group 2', baseItems.slice(3, 6));
  });
});
