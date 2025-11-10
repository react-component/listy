import React, { useState } from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react';
import Listy, { type ListyRef } from '@rc-component/listy';

const DEFAULT_HEIGHT = 200;
const DEFAULT_ITEM_HEIGHT = 30;

const createItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: i }));

const mockScroll = (
  element: Element,
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number,
) => {
  Object.defineProperty(element, 'scrollTop', {
    value: scrollTop,
    writable: true,
  });
  Object.defineProperty(element, 'scrollHeight', {
    value: scrollHeight,
    writable: true,
  });
  Object.defineProperty(element, 'clientHeight', {
    value: clientHeight,
    writable: true,
  });
};

const scrollToBottom = (
  element: Element,
  itemCount: number,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  clientHeight = DEFAULT_HEIGHT,
) => {
  const scrollHeight = itemCount * itemHeight;
  const scrollTop = Math.max(scrollHeight - clientHeight, 0);
  mockScroll(element, scrollTop, scrollHeight, clientHeight);
  fireEvent.scroll(element);
};

describe('Listy - onEndReached', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    it('should trigger onEndReached when scrolled to bottom', () => {
      const onEndReached = jest.fn();
      const items = createItems(20);

      const { container } = render(
        <Listy
          items={items}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      scrollToBottom(scrollContainer, items.length);

      expect(onEndReached).toHaveBeenCalledTimes(1);
    });

    it('should not trigger onEndReached when not at bottom', () => {
      const onEndReached = jest.fn();
      const items = createItems(20);

      const { container } = render(
        <Listy
          items={items}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      // Not at bottom: scrollTop + clientHeight < scrollHeight
      mockScroll(
        scrollContainer,
        100,
        items.length * DEFAULT_ITEM_HEIGHT,
        DEFAULT_HEIGHT,
      );
      fireEvent.scroll(scrollContainer);

      expect(onEndReached).not.toHaveBeenCalled();
    });

    it('should not trigger when onEndReached is not provided', () => {
      const items = createItems(20);

      const { container } = render(
        <Listy
          items={items}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      // Should not throw error
      mockScroll(
        scrollContainer,
        400,
        items.length * DEFAULT_ITEM_HEIGHT,
        DEFAULT_HEIGHT,
      );
      expect(() => {
        fireEvent.scroll(scrollContainer);
      }).not.toThrow();
    });
  });

  describe('Prevent duplicate triggers', () => {
    it('should not trigger multiple times when staying at bottom with same scrollHeight', () => {
      const onEndReached = jest.fn();
      const items = createItems(20);

      const { container } = render(
        <Listy
          items={items}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      // Scroll to bottom
      scrollToBottom(scrollContainer, items.length);
      expect(onEndReached).toHaveBeenCalledTimes(1);

      // Trigger scroll event again with same scrollHeight
      fireEvent.scroll(scrollContainer);
      expect(onEndReached).toHaveBeenCalledTimes(1); // Still only called once

      // Multiple scroll events with same scrollHeight
      fireEvent.scroll(scrollContainer);
      fireEvent.scroll(scrollContainer);
      expect(onEndReached).toHaveBeenCalledTimes(1); // Still only called once
    });

    it('should trigger again when scrollHeight changes (new data loaded)', () => {
      const onEndReached = jest.fn();
      const itemHeight = DEFAULT_ITEM_HEIGHT;
      const clientHeight = DEFAULT_HEIGHT;
      let itemCount = 20;
      const renderList = (count: number) => (
        <Listy
          items={createItems(count)}
          height={clientHeight}
          itemHeight={itemHeight}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />
      );

      const { container, rerender } = render(renderList(itemCount));
      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      const scrollToBottomWithCount = () => {
        scrollToBottom(scrollContainer, itemCount, itemHeight, clientHeight);
      };

      // First trigger at bottom
      scrollToBottomWithCount();
      expect(onEndReached).toHaveBeenCalledTimes(1);

      // Simulate new data loaded: scrollHeight increases
      itemCount = 40;
      act(() => {
        rerender(renderList(itemCount));
      });
      scrollToBottomWithCount();
      expect(onEndReached).toHaveBeenCalledTimes(2);

      // Load more data again
      itemCount = 60;
      act(() => {
        rerender(renderList(itemCount));
      });
      scrollToBottomWithCount();
      expect(onEndReached).toHaveBeenCalledTimes(3);
    });

    it('should trigger again after scrollHeight decreases (data removed)', () => {
      const onEndReached = jest.fn();
      const itemHeight = DEFAULT_ITEM_HEIGHT;
      const clientHeight = DEFAULT_HEIGHT;
      let itemCount = 20;
      const renderList = (count: number) => (
        <Listy
          items={createItems(count)}
          height={clientHeight}
          itemHeight={itemHeight}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />
      );

      const { container, rerender } = render(renderList(itemCount));
      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      const scrollToBottomWithCount = () => {
        scrollToBottom(scrollContainer, itemCount, itemHeight, clientHeight);
      };

      // First trigger
      scrollToBottomWithCount();
      expect(onEndReached).toHaveBeenCalledTimes(1);

      // Simulate data removed: scrollHeight decreases
      itemCount = 10;
      act(() => {
        rerender(renderList(itemCount));
      });
      scrollToBottomWithCount();
      expect(onEndReached).toHaveBeenCalledTimes(2);
    });
  });

  describe('State management with dynamic data', () => {
    it('should work correctly with dynamic item loading', () => {
      const LoadMoreComponent = () => {
        const [items, setItems] = useState(createItems(10));
        const [callCount, setCallCount] = useState(0);

        const handleEndReached = () => {
          setCallCount((prev) => prev + 1);
          // Simulate loading more items
          setItems((prev) => [
            ...prev,
            ...Array.from({ length: 10 }, (_, i) => ({ id: prev.length + i })),
          ]);
        };

        return (
          <div>
            <div data-testid="call-count">{callCount}</div>
            <Listy
              items={items}
              height={DEFAULT_HEIGHT}
              itemHeight={DEFAULT_ITEM_HEIGHT}
              rowKey="id"
              itemRender={(item) => (
                <div data-testid={`item-${item.id}`}>{item.id}</div>
              )}
              onEndReached={handleEndReached}
            />
          </div>
        );
      };

      const { container, getByTestId } = render(<LoadMoreComponent />);
      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      // Initial state
      expect(getByTestId('call-count').textContent).toBe('0');

      // Scroll to bottom - should trigger load
      scrollToBottom(scrollContainer, 10);

      expect(getByTestId('call-count').textContent).toBe('1');

      // Stay at bottom with same scroll position - should not trigger again
      fireEvent.scroll(scrollContainer);
      expect(getByTestId('call-count').textContent).toBe('1');
    });

    it('should trigger when scrollTo repeatedly jumps to the end', async () => {
      const ScrollToEndComponent = () => {
        const listRef = React.useRef<ListyRef>(null);
        const [items, setItems] = useState(createItems(20));
        const [callCount, setCallCount] = useState(0);

        const handleEndReached = () => {
          setCallCount((prev) => prev + 1);
          setItems((prev) => [
            ...prev,
            ...Array.from({ length: 10 }, (_, i) => ({
              id: prev.length + i,
            })),
          ]);
        };

        const handleScrollToEnd = () => {
          const lastItem = items[items.length - 1];
          if (lastItem) {
            listRef.current?.scrollTo({
              key: lastItem.id,
              align: 'bottom',
            });
          }
        };

        return (
          <div>
            <button type="button" onClick={handleScrollToEnd}>
              Scroll To End
            </button>
            <div data-testid="call-count">{callCount}</div>
            <div data-testid="item-count">{items.length}</div>
            <Listy
              ref={listRef}
              items={items}
              height={DEFAULT_HEIGHT}
              itemHeight={DEFAULT_ITEM_HEIGHT}
              rowKey="id"
              itemRender={(item) => (
                <div data-testid={`item-${item.id}`}>{item.id}</div>
              )}
              onEndReached={handleEndReached}
            />
          </div>
        );
      };

      const { container, getByTestId, getByRole } = render(
        <ScrollToEndComponent />,
      );
      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;
      const scrollButton = getByRole('button', { name: /scroll to end/i });

      const getCallCount = () => Number(getByTestId('call-count').textContent);
      const getItemCount = () => Number(getByTestId('item-count').textContent);

      const triggerScrollToEnd = async () => {
        const prevItemCount = getItemCount();
        const prevCallCount = getCallCount();

        act(() => {
          fireEvent.click(scrollButton);
        });

        act(() => {
          scrollToBottom(scrollContainer, prevItemCount);
        });

        await waitFor(() => expect(getCallCount()).toBe(prevCallCount + 1));
        await waitFor(() =>
          expect(getItemCount()).toBeGreaterThan(prevItemCount),
        );
      };

      await triggerScrollToEnd();
      await triggerScrollToEnd();
      await triggerScrollToEnd();

      expect(getCallCount()).toBe(3);
    });
  });

  describe('Edge cases', () => {
    it('should handle initial position at bottom', () => {
      const onEndReached = jest.fn();
      const items = createItems(5); // Few items

      const { container } = render(
        <Listy
          items={items}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      // Content height equals container height (already at bottom)
      mockScroll(
        scrollContainer,
        0,
        items.length * DEFAULT_ITEM_HEIGHT,
        DEFAULT_HEIGHT,
      );
      fireEvent.scroll(scrollContainer);

      expect(onEndReached).toHaveBeenCalledTimes(1);
    });

    it('should handle zero scrollHeight', () => {
      const onEndReached = jest.fn();

      const { container } = render(
        <Listy
          items={[]}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item: any) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      mockScroll(scrollContainer, 0, 0, DEFAULT_HEIGHT);
      fireEvent.scroll(scrollContainer);

      // Should trigger when scrollHeight is 0 (empty list at bottom)
      expect(onEndReached).toHaveBeenCalledTimes(1);
    });

    it('should handle slightly past bottom (distanceToBottom < 0)', () => {
      const onEndReached = jest.fn();
      const items = createItems(20);

      const { container } = render(
        <Listy
          items={items}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      // Slightly past bottom (can happen during animation)
      const scrollHeight = items.length * DEFAULT_ITEM_HEIGHT;
      mockScroll(
        scrollContainer,
        Math.max(scrollHeight - DEFAULT_HEIGHT, 0) + 5,
        scrollHeight,
        DEFAULT_HEIGHT,
      ); // scrollTop + clientHeight > scrollHeight
      fireEvent.scroll(scrollContainer);

      expect(onEndReached).toHaveBeenCalledTimes(1);
    });
  });

  describe('Scroll up and down scenarios', () => {
    it('should trigger again after scrolling up and then back to bottom with new data', () => {
      const onEndReached = jest.fn();
      const itemHeight = DEFAULT_ITEM_HEIGHT;
      const clientHeight = DEFAULT_HEIGHT;
      let itemCount = 20;
      const renderList = (count: number) => (
        <Listy
          items={createItems(count)}
          height={clientHeight}
          itemHeight={itemHeight}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
        />
      );

      const { container, rerender } = render(renderList(itemCount));
      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      const scrollTo = (scrollTop: number) => {
        const scrollHeight = itemCount * itemHeight;
        mockScroll(scrollContainer, scrollTop, scrollHeight, clientHeight);
        fireEvent.scroll(scrollContainer);
      };
      const scrollToBottom = () => {
        scrollTo(Math.max(itemCount * itemHeight - clientHeight, 0));
      };

      // 1. Scroll to bottom
      scrollToBottom();
      expect(onEndReached).toHaveBeenCalledTimes(1);

      // 2. Scroll up (away from bottom)
      scrollTo(100);
      expect(onEndReached).toHaveBeenCalledTimes(1); // No new call

      // 3. Scroll back to bottom (same scrollHeight)
      scrollToBottom();
      expect(onEndReached).toHaveBeenCalledTimes(1); // No new call (same scrollHeight)

      // 4. New data loaded (scrollHeight increases)
      itemCount = 40;
      act(() => {
        rerender(renderList(itemCount));
      });
      scrollTo(400);
      expect(onEndReached).toHaveBeenCalledTimes(1); // Still no call (not at bottom)

      // 5. Scroll to new bottom
      scrollToBottom();
      expect(onEndReached).toHaveBeenCalledTimes(2); // Now triggers!
    });
  });

  describe('Integration with group feature', () => {
    it('should work correctly with grouped items', () => {
      const onEndReached = jest.fn();
      const items = createItems(20).map((item) => ({
        ...item,
        group: `Group ${Math.floor(item.id / 5)}`,
      }));

      const { container } = render(
        <Listy
          items={items}
          height={DEFAULT_HEIGHT}
          itemHeight={DEFAULT_ITEM_HEIGHT}
          rowKey="id"
          itemRender={(item) => <div>{item.id}</div>}
          onEndReached={onEndReached}
          group={{
            key: (item) => item.group,
            title: (key) => <div>{key}</div>,
          }}
        />,
      );

      const scrollContainer = container.querySelector(
        '.rc-virtual-list-holder',
      )!;

      // Scroll to bottom with groups (items + headers)
      const groupCount = new Set(items.map((item) => item.group)).size;
      scrollToBottom(scrollContainer, items.length + groupCount);
      fireEvent.scroll(scrollContainer);

      expect(onEndReached).toHaveBeenCalledTimes(1);
    });
  });
});
