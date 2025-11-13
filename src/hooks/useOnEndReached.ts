import * as React from 'react';
import { useEvent } from '@rc-component/util';

export interface UseOnEndReachedParams {
  enabled: boolean;
  onEndReached?: () => void;
}

export default function useOnEndReached(params: UseOnEndReachedParams) {
  const { enabled, onEndReached } = params;

  const lastTriggeredScrollHeightRef = React.useRef<number>(null);

  const onScroll = useEvent<React.UIEventHandler<HTMLElement>>((e) => {
    if (!enabled) {
      lastTriggeredScrollHeightRef.current = null;
      return;
    }

    const target = e.currentTarget;

    const { scrollTop, clientHeight, scrollHeight } = target;
    const distanceToBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceToBottom <= 0) {
      if (lastTriggeredScrollHeightRef.current !== scrollHeight) {
        onEndReached();
        lastTriggeredScrollHeightRef.current = scrollHeight;
      }
    }
  });

  return onScroll;
}
