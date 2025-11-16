import React from 'react';
import { act, render } from '@testing-library/react';
import type { ExtraRenderInfo } from 'rc-virtual-list/lib/interface';
import Listy, { type ListyRef, type ListyProps } from '@rc-component/listy';
import type { FlattenRowsResult } from '../src/hooks/useFlattenRows';

jest.mock('rc-virtual-list', () => {
  const React = require('react');
  let extraInfo = {
    start: 0,
    end: 0,
    virtual: true,
    offsetX: 0,
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

const MockedVirtualList = require('rc-virtual-list')
  .default as MockedVirtualListComponent;

let mockFlattenRows: FlattenRowsResult<any> | null = null;

jest.mock('../src/hooks/useFlattenRows', () => {
  const actual = jest.requireActual('../src/hooks/useFlattenRows');
  return {
    __esModule: true,
    default: (items: any[], group: any, segments: any) =>
      mockFlattenRows ?? actual.default(items, group, segments),
  };
});

describe('Listy behaviors', () => {
  beforeEach(() => {
    MockedVirtualList.__setExtraInfo({
      start: 0,
      end: 0,
      virtual: true,
    });
    MockedVirtualList.__setScrollHandler(() => {});
    mockFlattenRows = null;
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

    return render(
      <Listy
        ref={ref}
        {...rest}
        items={resolvedItems}
        rowKey="id"
        itemHeight={20}
        height={100}
        itemRender={(item) => (
          <div data-testid={`item-${item.id}`}>{item.id}</div>
        )}
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
    expect(stickyHeader).not.toBeNull();
    expect(stickyHeader).toHaveTextContent('Group Group A');
    expect(title).toHaveBeenCalled();
  });
});
