import { Progress } from "@chakra-ui/react";
import React, { useEffect, useRef } from "react";

type Props = {
  disabled: boolean;
  onReach: () => void;
};

const LoadMore: React.FC<Props> = ({ disabled }) => {
  const disableRef = useRef<boolean>();
  disableRef.current = disabled;

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(() => {});

    obs.observe(ref.current!);

    return () => obs.unobserve(ref.current!);
  }, []);

  return <Progress ref={ref} size="xs" isIndeterminate />;
};

export default LoadMore;
