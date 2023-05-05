import React, { useEffect, useState } from "react";

type Props = {
  children: JSX.Element;
  waitBeforeHide?: number;
};

export function WaitBeforeHide({
  children,
  waitBeforeHide = 500,
}: Props): JSX.Element | null {
  const [isShown, setIsShown] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(false);
    }, waitBeforeHide);
    return () => clearTimeout(timer);
  }, [waitBeforeHide]);

  return isShown ? <>{children}</> : null;
}
