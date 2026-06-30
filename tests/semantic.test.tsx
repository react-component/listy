import React from 'react';
import { render } from '@testing-library/react';
import Listy from '@rc-component/listy';
import GroupHeader from '../src/GroupHeader';
import useStickyGroupHeader from '../src/VirtualList/useStickyGroupHeader';

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

    it('merges item style with the sticky scroll-margin (no overwrite)', () => {
      const { container } = renderRaw({ sticky: true });
      const item = container.querySelector('.rc-listy-item') as HTMLElement;
      // custom style survives...
      expect(item).toHaveStyle({ color: 'rgb(4, 5, 6)' });
      // ...alongside the internal sticky scroll margin.
      expect(item.style.scrollMarginTop).toBe(
        'var(--rc-listy-item-scroll-margin-top, 0px)',
      );
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
  });
});
