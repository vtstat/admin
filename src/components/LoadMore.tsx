import { Progress } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";

type Props = {
  disabled: boolean;
  onReach: () => void;
};

const LoadMore: React.FC<Props> = ({ disabled, onReach }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;

    const obs = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) onReach();
    });

    obs.observe(ref.current!);

    return () => obs.disconnect();
  }, [disabled]);

  return <Progress ref={ref} size="xs" isIndeterminate />;
};

export default LoadMore;
