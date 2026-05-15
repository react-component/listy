import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import Listy from '@rc-component/listy';

const PREFIX_CLS = 'rc-listy';

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

describe('Listy - onScroll', () => {
  it('forwards scroll events from the internal holder', () => {
    let scrollTarget: EventTarget | null = null;
    const onScroll = jest.fn((event: React.UIEvent<HTMLElement>) => {
      scrollTarget = event.currentTarget;
    });
    const items = createItems(20);

    const { container } = render(
      <Listy
        items={items}
        height={200}
        itemHeight={30}
        rowKey="id"
        itemRender={(item) => <div>{item.id}</div>}
        onScroll={onScroll}
      />,
    );

    const scrollContainer = container.querySelector(`.${PREFIX_CLS}-holder`)!;

    mockScroll(scrollContainer, 100, 600, 200);
    fireEvent.scroll(scrollContainer);

    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(scrollTarget).toBe(scrollContainer);
  });

  it('lets callers implement end-reached behavior from the scroll event', () => {
    const handleReachEnd = jest.fn();
    const items = createItems(20);

    const { container } = render(
      <Listy
        items={items}
        height={200}
        itemHeight={30}
        rowKey="id"
        itemRender={(item) => <div>{item.id}</div>}
        onScroll={(event) => {
          const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;

          if (scrollHeight - (scrollTop + clientHeight) <= 0) {
            handleReachEnd();
          }
        }}
      />,
    );

    const scrollContainer = container.querySelector(`.${PREFIX_CLS}-holder`)!;

    mockScroll(scrollContainer, 100, 600, 200);
    fireEvent.scroll(scrollContainer);
    expect(handleReachEnd).not.toHaveBeenCalled();

    mockScroll(scrollContainer, 400, 600, 200);
    fireEvent.scroll(scrollContainer);
    expect(handleReachEnd).toHaveBeenCalledTimes(1);
  });
});
