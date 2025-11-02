import * as React from 'react';

export interface UseOnEndReachedParams {
  enabled: boolean;
  offsetPx?: number;
  onEndReached?: () => void;
  containerRef?: React.RefObject<HTMLElement>;
}

export function useOnEndReached(params: UseOnEndReachedParams) {
  const { enabled, offsetPx = 0, onEndReached, containerRef } = params;

  const hasReachedRef = React.useRef(false);

  const onScroll = React.useCallback<React.UIEventHandler<HTMLElement>>(
    (e) => {
      const target = (e?.currentTarget as HTMLElement) || containerRef?.current;
      if (!target) return;

      const { scrollTop, clientHeight, scrollHeight } = target;
      const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

      if (!enabled || !onEndReached) {
        hasReachedRef.current = false;
        return;
      }

      if (distanceToBottom <= offsetPx) {
        if (!hasReachedRef.current) {
          hasReachedRef.current = true;
          onEndReached();
        }
      } else {
        hasReachedRef.current = false;
      }
    },
    [enabled, offsetPx, onEndReached, containerRef],
  );

  return onScroll;
}

export default useOnEndReached;


