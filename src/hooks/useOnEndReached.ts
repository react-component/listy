import * as React from 'react';

export interface UseOnEndReachedParams {
  enabled: boolean;
  onEndReached?: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

export function useOnEndReached(params: UseOnEndReachedParams) {
  const { enabled, onEndReached, containerRef } = params;

  const hasReachedRef = React.useRef(false);

  const onScroll = React.useCallback<React.UIEventHandler<HTMLElement>>(
    (e) => {
      const target = e.currentTarget;

      const { scrollTop, clientHeight, scrollHeight } = target;
      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

      if (!enabled || !onEndReached) {
        hasReachedRef.current = false;
        return;
      }

      if (distanceToBottom <= 0) {
        if (!hasReachedRef.current) {
          hasReachedRef.current = true;
          onEndReached();
        }
      } else {
        hasReachedRef.current = false;
      }
    },
    [enabled, onEndReached],
  );

  return onScroll;
}

export default useOnEndReached;
