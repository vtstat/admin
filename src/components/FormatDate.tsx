import { Tooltip } from "@chakra-ui/react";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import React from "react";

type Props = {
  children: Date | string | number | null | undefined;
};

const FormatDate: React.FC<Props> = ({ children }) => {
  if (!children) return null;

  if (typeof children === "string") children = parseISO(children);

  return (
    <Tooltip label={formatDistanceToNowStrict(children, { addSuffix: true })}>
      {format(children, "MM-dd HH:mm, E")}
    </Tooltip>
  );
};

export default FormatDate;
