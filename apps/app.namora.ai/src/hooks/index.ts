import { useRef } from "react";

export const useScrollToBottom = () => {
  const divRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (divRef?.current) {
      const divScrollHeight = divRef.current.scrollHeight;
      const scroll = divScrollHeight - divRef.current.clientHeight;
      if (scroll !== 0) {
        // setTimeout(() => divRef?.current?.scrollTo(0, divScrollHeight), 1000)
        divRef?.current?.scrollTo(0, divScrollHeight);
      }
    }
  };

  return { divRef, scrollToBottom };
};
