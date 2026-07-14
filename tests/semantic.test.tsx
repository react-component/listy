import React from 'react';
import { render, act } from '@testing-library/react';
import Listy, { type ListyRef } from '@rc-component/listy';
import GroupHeader from '../src/GroupHeader';
import useStickyGroupHeader from '../src/VirtualList/useStickyGroupHeader';
import { toTaggedKey } from '../src/util';

jest.mock('@rc-component/virtual-list', () => {
  const ReactMock = require('react');
  const extraInfo = {
    start: 0,
    end: 0,
    virtual: true,
    offsetX: 0,
    scrollTop: 0,
    offsetY: 0,
    rtl: false,
    getSize: () => ({ top: 0, bottom: 0 }),
  };

  const MockVirtualList = ReactMock.forwardRef((props: any, ref: any) => {
    ReactMock.useImperativeHandle(ref, () => ({ scrollTo: () => {} }));
    return (
      <div
        data-testid="mock-virtual-list"
        className={props.className}
        style={props.style}
      >
        {props.extraRender ? props.extraRender(extraInfo) : null}
        {props.data.map((row: any, index: number) => (
          <div key={`${row.type}-${index}`}>{props.children(row, index)}</div>
        ))}
      </div>
    );
  });

  return { __esModule: true, default: MockVirtualList };
});

const GROUPED_ITEMS = [
  { id: 1, group: 'A' },
  { id: 2, group: 'A' },
  { id: 3, group: 'B' },
];

const group = {
  key: (item: { group: string }) => item.group,
  title: (key: React.Key) => <span>Group {String(key)}</span>,
};

const CLASSNAMES = { root: 'my-root', item: 'my-item', groupHeader: 'my-header' };
const STYLES = {
  root: { background: 'rgb(1, 2, 3)' },
  item: { color: 'rgb(4, 5, 6)' },
  groupHeader: { color: 'rgb(7, 8, 9)' },
};

describe('semantic DOM (classNames / styles)', () => {
  // ============================ Shared part ===========================
  describe('GroupHeader merges custom class with modifiers', () => {
    it('keeps base + modifier classes and appends custom className/style', () => {
      const { container } = render(
        <GroupHeader
          fixed
          group={group as any}
          groupKey="A"
          groupItems={[]}
          prefixCls="rc-listy"
          className="my-header"
          style={{ color: 'rgb(7, 8, 9)' }}
        />,
      );

      const node = container.querySelector('.rc-listy-group-header') as HTMLElement;
      expect(node).toHaveClass('rc-listy-group-header-fixed');
      expect(node).toHaveClass('my-header');
      expect(node).toHaveStyle({ color: 'rgb(7, 8, 9)' });
    });
  });

  // ============================ Native mode ===========================
  describe('native scroll (virtual=false)', () => {
    const renderRaw = (extra?: object) =>
      render(
        <Listy
          virtual={false}
          items={GROUPED_ITEMS}
          rowKey="id"
          height={200}
          group={group}
          classNames={CLASSNAMES}
          styles={STYLES}
          itemRender={(item) => <span>{item.id}</span>}
          {...extra}
        />,
      );

    it('applies root class/style to the scroll container', () => {
      const { container } = renderRaw();
      const root = container.querySelector('.rc-listy') as HTMLElement;
      expect(root).toHaveClass('my-root');
      expect(root).toHaveStyle({ background: 'rgb(1, 2, 3)' });
    });

    it('applies item class/style to every item', () => {
      const { container } = renderRaw();
      const items = container.querySelectorAll('.rc-listy-item');
      expect(items).toHaveLength(3);
      items.forEach((item) => {
        expect(item).toHaveClass('my-item');
        expect(item).toHaveStyle({ color: 'rgb(4, 5, 6)' });
      });
    });

    it('applies groupHeader class/style to headers', () => {
      const { container } = renderRaw();
      const headers = container.querySelectorAll('.rc-listy-group-header');
      expect(headers).toHaveLength(2);
      headers.forEach((header) => {
        expect(header).toHaveClass('my-header');
        expect(header).toHaveStyle({ color: 'rgb(7, 8, 9)' });
      });
    });

    it('applies the scroll margin only during scroll and restores the item afterward', () => {
      const ref = React.createRef<ListyRef>();
      const { container } = renderRaw({ sticky: true, ref });
      const item = container.querySelector('[data-key="item:1"]') as HTMLElement;
      let marginDuringScroll: string | undefined;
      item.scrollIntoView = jest.fn(() => {
        marginDuringScroll = item.style.scrollMarginTop;
      });
      // custom style survives...
      expect(item).toHaveStyle({ color: 'rgb(4, 5, 6)' });

      act(() => {
        ref.current?.scrollTo({ key: 1, align: 'top', offset: 3 });
      });
      // ...the internal margin is applied for the scrollIntoView call...
      expect(marginDuringScroll).toBe('3px');
      // ...then restored (the user set no scroll margin, so back to empty).
      expect(item.style.scrollMarginTop).toBe('');
      expect(item).toHaveStyle({ color: 'rgb(4, 5, 6)' });
    });

    it('restores styles.item.scrollMarginTop after applying the internal offset for the scroll', () => {
      const ref = React.createRef<ListyRef>();
      const { container } = renderRaw({
        sticky: true,
        ref,
        styles: { item: { color: 'rgb(4, 5, 6)', scrollMarginTop: 999 } },
      });
      const item = container.querySelector('[data-key="item:1"]') as HTMLElement;
      let marginDuringScroll: string | undefined;
      item.scrollIntoView = jest.fn(() => {
        marginDuringScroll = item.style.scrollMarginTop;
      });
      // the user's value is present at rest...
      expect(item.style.scrollMarginTop).toBe('999px');

      act(() => {
        ref.current?.scrollTo({ key: 1, align: 'top', offset: 7 });
      });
      // ...the internal offset is applied only for the scroll...
      expect(marginDuringScroll).toBe('7px');
      // ...and the user's value is restored afterward, not clobbered.
      expect(item.style.scrollMarginTop).toBe('999px');
      expect(item).toHaveStyle({ color: 'rgb(4, 5, 6)' });
    });
  });

  // =========================== Virtual mode ===========================
  describe('virtual scroll', () => {
    const renderVirtual = () =>
      render(
        <Listy
          items={GROUPED_ITEMS}
          rowKey="id"
          height={100}
          itemHeight={20}
          group={group}
          classNames={CLASSNAMES}
          styles={STYLES}
          itemRender={(item) => <span>{item.id}</span>}
        />,
      );

    it('passes root class/style down to the virtual list', () => {
      const { container } = renderVirtual();
      const root = container.querySelector(
        '[data-testid="mock-virtual-list"]',
      ) as HTMLElement;
      expect(root).toHaveClass('my-root');
      expect(root).toHaveStyle({ background: 'rgb(1, 2, 3)' });
    });

    it('applies item class/style to the item wrapper', () => {
      const { container } = renderVirtual();
      const items = container.querySelectorAll('.rc-listy-item');
      expect(items).toHaveLength(3);
      items.forEach((item) => {
        expect(item).toHaveClass('my-item');
        expect(item).toHaveStyle({ color: 'rgb(4, 5, 6)' });
      });
    });

    it('applies groupHeader class/style to in-flow header rows', () => {
      const { container } = renderVirtual();
      const headers = container.querySelectorAll('.rc-listy-group-header');
      expect(headers).toHaveLength(2);
      headers.forEach((header) => {
        expect(header).toHaveClass('my-header');
        expect(header).toHaveStyle({ color: 'rgb(7, 8, 9)' });
      });
    });
  });

  // ===================== Virtual sticky clone =========================
  // The pinned clone is a separate node from the in-flow header; the same
  // groupHeader class/style must land on it too (parity with native's single
  // sticky node). Driven via the extraRender directly to avoid mock timing.
  describe('virtual sticky clone', () => {
    it('applies groupHeader class/style to the pinned clone', () => {
      const portalContainer = document.createElement('div');
      document.body.appendChild(portalContainer);
      const listRef = {
        current: { nativeElement: portalContainer },
      } as any;

      let extraRender: any;
      function Harness() {
        extraRender = useStickyGroupHeader({
          enabled: true,
          group: group as any,
          groupKeys: ['A'],
          groupKeyToItems: new Map([['A', []]]),
          prefixCls: 'rc-listy',
          listRef,
          headerClassName: 'my-header',
          headerStyle: { color: 'rgb(7, 8, 9)' },
        });
        return null;
      }
      render(<Harness />);
      render(
        extraRender({
          getSize: () => ({ top: 0, bottom: 24 }),
          scrollTop: 0,
          virtual: true,
        }),
      );

      const clone = portalContainer.querySelector(
        '.rc-listy-group-header-fixed',
      ) as HTMLElement;
      expect(clone).not.toBeNull();
      expect(clone).toHaveClass('my-header');
      expect(clone).toHaveStyle({ color: 'rgb(7, 8, 9)' });

      portalContainer.remove();
    });

    it('does not let headerStyle.top override the computed sticky top', () => {
      const portalContainer = document.createElement('div');
      document.body.appendChild(portalContainer);
      const listRef = {
        current: { nativeElement: portalContainer },
      } as any;

      let extraRender: any;
      function Harness() {
        extraRender = useStickyGroupHeader({
          enabled: true,
          group: group as any,
          groupKeys: ['A', 'B'],
          groupKeyToItems: new Map([
            ['A', []],
            ['B', []],
          ]),
          prefixCls: 'rc-listy',
          listRef,
          headerClassName: 'my-header',
          headerStyle: { top: 999 },
        });
        return null;
      }
      render(<Harness />);
      render(
        extraRender({
          // A is the active header; B is approaching, so the computed top is a
          // negative push offset: min(0, 100 - 24 - 90) = -14.
          getSize: (key: React.Key) =>
            key === toTaggedKey('B', 'group')
              ? { top: 100, bottom: 124 }
              : { top: 0, bottom: 24 },
          scrollTop: 90,
          virtual: true,
        }),
      );

      const clone = portalContainer.querySelector(
        '.rc-listy-group-header-fixed',
      ) as HTMLElement;
      // the computed push offset wins; the user's top:999 must not leak through.
      expect(clone.style.top).toBe('-14px');

      portalContainer.remove();
    });
  });
});
