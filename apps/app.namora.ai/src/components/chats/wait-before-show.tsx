import React, { useEffect, useState } from "react";

type Props = {
  children: JSX.Element;
  waitBeforeShow?: number;
};

export function WaitBeforeShow({
  children,
  waitBeforeShow = 500,
}: Props): JSX.Element | null {
  const [isShown, setIsShown] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsShown(false);
    }, waitBeforeShow);
    return () => clearTimeout(timer);
  }, [waitBeforeShow]);

  return isShown ? <>{children}</> : null;
}
