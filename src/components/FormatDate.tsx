import { Tooltip } from "@chakra-ui/react";
import {
  format,
  formatDistanceToNowStrict,
  isThisWeek,
  isThisYear,
  isToday,
  isTomorrow,
  isYesterday,
  parseISO,
} from "date-fns";
import React from "react";

type Props = {
  children: Date | string | number | null | undefined;
};

const FormatDate: React.FC<Props> = ({ children: date }) => {
  if (!date) return null;

  if (typeof date === "string") date = parseISO(date);

  const duration = formatDistanceToNowStrict(date, { addSuffix: true });

  let msg;
  if (isToday(date)) {
    msg = format(date, "'Today' HH:mm");
  } else if (isYesterday(date)) {
    msg = format(date, "'Yesterday' HH:mm");
  } else if (isTomorrow(date)) {
    msg = format(date, "'Tomorrow' HH:mm");
  } else if (isThisWeek(date)) {
    msg = format(date, "E HH:mm");
  } else if (isThisYear(date)) {
    msg = format(date, "MM-dd HH:mm");
  } else {
    msg = format(date, "yyyy-MM-dd HH:mm");
  }

  return <Tooltip label={duration}>{msg}</Tooltip>;
};

export default FormatDate;
