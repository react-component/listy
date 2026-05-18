import React from 'react';
import { act, render } from '@testing-library/react';
import type {
  ListProps as VirtualListProps,
  ListRef as VirtualListRef,
} from '@rc-component/virtual-list';
import Listy, { type ListyRef, type ListyProps } from '@rc-component/listy';
import RawList from '../src/RawList';

type ExtraRenderInfo = Parameters<
  NonNullable<VirtualListProps<unknown>['extraRender']>
>[0];

jest.mock('@rc-component/virtual-list', () => {
  const React = require('react');
  let extraInfo = {
    start: 0,
    end: 0,
    virtual: true,
    offsetX: 0,
    scrollTop: 0,
    offsetY: 0,
    rtl: false,
    getSize: () => ({ top: 0, bottom: 0 }),
  };
  let scrollHandler = (config: any) => {};
  let lastProps = null;

  const MockVirtualList = React.forwardRef((props: any, ref: any) => {
    lastProps = props;
    React.useImperativeHandle(ref, () => ({
      scrollTo: (config: any) => {
        scrollHandler(config);
      },
    }));

    return (
      <div data-testid="mock-virtual-list">
        {props.extraRender ? (
          <div data-testid="extra-render">{props.extraRender(extraInfo)}</div>
        ) : null}
        {props.data.map((row: any, index: number) => (
          <div key={`${row.type}-${index}`}>{props.children(row, index)}</div>
        ))}
      </div>
    );
  });

  (MockVirtualList as any).__setExtraInfo = (
    info: Partial<ExtraRenderInfo>,
  ) => {
    // @ts-ignore
    extraInfo = { ...extraInfo, ...info };
  };
  (MockVirtualList as any).__setScrollHandler = (
    handler: (config: any) => void,
  ) => {
    scrollHandler = handler;
  };
  (MockVirtualList as any).__getLastProps = () => lastProps;

  return {
    __esModule: true,
    default: MockVirtualList,
  };
});

type MockedVirtualListComponent = React.ForwardRefExoticComponent<any> & {
  __setExtraInfo(info: Partial<ExtraRenderInfo>): void;
  __setScrollHandler(handler: (config: any) => void): void;
  __getLastProps(): any;
};

const MockedVirtualList = require('@rc-component/virtual-list')
  .default as MockedVirtualListComponent;

describe('Listy behaviors', () => {
  beforeEach(() => {
    MockedVirtualList.__setExtraInfo({
      start: 0,
      end: 0,
      virtual: true,
    });
    MockedVirtualList.__setScrollHandler(() => {});
  });

  const renderList = (
    overrideProps: Partial<ListyProps<any>> & {
      ref?: React.Ref<ListyRef>;
    } = {},
  ) => {
    const { ref, ...rest } = overrideProps;
    const resolvedItems = Object.prototype.hasOwnProperty.call(rest, 'items')
      ? rest.items
      : [
          { id: 1, group: 'Group A' },
          { id: 2, group: 'Group A' },
        ];
    const resolvedItemRender =
      rest.itemRender ||
      ((item) => <div data-testid={`item-${item.id}`}>{item.id}</div>);

    return render(
      <Listy
        ref={ref}
        {...rest}
        items={resolvedItems}
        rowKey="id"
        itemHeight={20}
        height={100}
        itemRender={resolvedItemRender}
      />,
    );
  };

  it('forwards scrollTo via ref', () => {
    const scrollHandler = jest.fn();
    MockedVirtualList.__setScrollHandler(scrollHandler);

    const ref = React.createRef<ListyRef>();
    renderList({ ref });

    act(() => {
      ref.current?.scrollTo({ key: 2 });
    });

    expect(scrollHandler).toHaveBeenCalledWith({ key: 2 });
  });

  it('treats missing items prop as empty array', () => {
    renderList({ items: undefined });

    const lastProps = MockedVirtualList.__getLastProps();
    expect(lastProps.data).toEqual([]);
  });

  it('applies sticky class when virtual list is disabled', () => {
    const title = jest.fn((key: React.Key) => <span>Group {String(key)}</span>);
    const { container } = renderList({
      sticky: true,
      virtual: false,
      group: {
        key: (item) => item.group,
        title,
      },
    });

    const stickyHeader = container.querySelector(
      '.rc-listy-group-header-sticky',
    );
    const groupSections = container.querySelectorAll('.rc-listy-group-section');

    expect(container.querySelector('[data-testid="mock-virtual-list"]')).toBeNull();
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveClass('rc-listy-group-header');
    expect(stickyHeader).toHaveTextContent('Group Group A');
    expect(groupSections).toHaveLength(1);
    expect(groupSections[0]).toContainElement(stickyHeader as HTMLElement);
    expect(title).toHaveBeenCalled();
  });

  it('scrolls raw list group sections by group key', () => {
    const ref = React.createRef<ListyRef>();
    const { container } = renderList({
      ref,
      virtual: false,
      items: [
        { id: 1, group: 'Group A' },
        { id: 2, group: 'Group A' },
        { id: 3, group: 'Group B' },
      ],
      group: {
        key: (item) => item.group,
        title: (groupKey) => <span>Group {String(groupKey)}</span>,
      },
    });

    const holder = container.querySelector('.rc-listy-holder') as HTMLDivElement;
    const groupSections = container.querySelectorAll('.rc-listy-group-section');
    const groupBSection = groupSections[1] as HTMLElement;

    Object.defineProperty(holder, 'clientHeight', {
      configurable: true,
      value: 100,
    });
    holder.getBoundingClientRect = () =>
      ({ top: 10, bottom: 110 } as DOMRect);
    groupBSection.getBoundingClientRect = () =>
      ({ top: 210, bottom: 270 } as DOMRect);

    act(() => {
      ref.current?.scrollTo({
        groupKey: 'Group B',
        align: 'top',
        offset: 5,
      });
    });

    expect(holder.scrollTop).toBe(195);
  });

  it('supports raw list scroll APIs without grouping', () => {
    const ref = React.createRef<ListyRef>();
    const { container } = renderList({
      ref,
      virtual: false,
      items: [
        { id: 1, name: 'One' },
        { id: 2, name: 'Two' },
      ],
      itemRender: (item) => item.name,
    });

    const holder = container.querySelector('.rc-listy-holder') as HTMLDivElement;
    const itemNodes = container.querySelectorAll(
      '.rc-listy-holder-inner > div',
    );
    const secondItem = itemNodes[1] as HTMLElement;

    Object.defineProperty(holder, 'clientHeight', {
      configurable: true,
      value: 50,
    });
    Object.defineProperty(secondItem, 'offsetHeight', {
      configurable: true,
      value: 30,
    });
    holder.getBoundingClientRect = () => ({ top: 10 } as DOMRect);
    secondItem.getBoundingClientRect = () => ({ top: 100 } as DOMRect);

    act(() => {
      ref.current?.scrollTo();
      ref.current?.scrollTo(24);
    });
    expect(holder.scrollTop).toBe(24);

    act(() => {
      ref.current?.scrollTo({ left: 7, top: 12 });
    });
    expect(holder.scrollLeft).toBe(7);
    expect(holder.scrollTop).toBe(12);

    act(() => {
      ref.current?.scrollTo({ left: 8 });
    });
    expect(holder.scrollLeft).toBe(8);
    expect(holder.scrollTop).toBe(12);

    act(() => {
      ref.current?.scrollTo({ top: 13 });
    });
    expect(holder.scrollLeft).toBe(8);
    expect(holder.scrollTop).toBe(13);

    holder.scrollTop = 0;
    act(() => {
      ref.current?.scrollTo({ key: 2 });
    });
    expect(holder.scrollTop).toBe(90);

    act(() => {
      ref.current?.scrollTo({ index: 99 });
    });
    expect(holder.scrollTop).toBe(90);

    holder.scrollTop = 12;
    act(() => {
      ref.current?.scrollTo({ index: 1, align: 'bottom', offset: 3 });
    });
    expect(holder.scrollTop).toBe(85);

    holder.scrollTop = 50;
    secondItem.getBoundingClientRect = () => ({ top: 0 } as DOMRect);
    act(() => {
      ref.current?.scrollTo({ index: 1, align: 'auto', offset: 4 });
    });
    expect(holder.scrollTop).toBe(36);

    holder.scrollTop = 10;
    secondItem.getBoundingClientRect = () => ({ top: 100 } as DOMRect);
    act(() => {
      ref.current?.scrollTo({ index: 1, align: 'auto', offset: 4 });
    });
    expect(holder.scrollTop).toBe(84);

    holder.scrollTop = 20;
    secondItem.getBoundingClientRect = () => ({ top: 10 } as DOMRect);
    act(() => {
      ref.current?.scrollTo({ index: 1, align: 'auto', offset: 4 });
    });
    expect(holder.scrollTop).toBe(20);
  });

  it('exposes raw list scroll info', () => {
    const ref = React.createRef<VirtualListRef>();
    const { container, unmount } = render(
      <RawList
        ref={ref}
        data={[{ id: 1 }]}
        group={undefined}
        groupData={new Map()}
        groupKeyToItems={new Map()}
        getKey={(row) => (row.type === 'item' ? row.item.id : row.groupKey)}
        itemRender={(item) => <div>{item.id}</div>}
        prefixCls="rc-listy"
      />,
    );

    const holder = container.querySelector('.rc-listy-holder') as HTMLDivElement;
    holder.scrollLeft = 11;
    holder.scrollTop = 22;

    expect(ref.current?.nativeElement).toBe(holder);
    expect(ref.current?.getScrollInfo()).toEqual({ x: 11, y: 22 });

    const rawListRef = ref.current;
    unmount();
    expect(rawListRef?.getScrollInfo()).toEqual({ x: 0, y: 0 });
  });

  it('passes empty group items when raw group item map is missing', () => {
    const title = jest.fn(() => null);

    render(
      <RawList
        data={[]}
        group={{
          key: (item: { id: number; group: string }) => item.group,
          title,
        }}
        groupData={
          new Map([
            [
              'Group A',
              [{ item: { id: 1, group: 'Group A' }, index: 0 }],
            ],
          ])
        }
        groupKeyToItems={new Map()}
        getKey={(row) => (row.type === 'item' ? row.item.id : row.groupKey)}
        itemRender={(item) => <div>{item.id}</div>}
        prefixCls="rc-listy"
      />,
    );

    expect(title).toHaveBeenCalledWith('Group A', []);
  });

  it('scroll to group', () => {
    const scrollHandler = jest.fn();
    MockedVirtualList.__setScrollHandler(scrollHandler);
  
    const ref = React.createRef<ListyRef>();
    renderList({
      ref,
      group: {
        key: (item) => item.group,
        title: () => null,
      },
    });
  
    act(() => {
      ref.current?.scrollTo({ groupKey: 'Group A', align: 'bottom', offset: 12 });
    });
  
    expect(scrollHandler).toHaveBeenCalledWith({
      key: 'Group A',
      align: 'bottom',
      offset: 12,
    });
  });  
});
