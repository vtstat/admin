import { Input, InputProps } from "@chakra-ui/react";
import React from "react";
import { parse, isValid, lightFormat } from "date-fns";

const offset = new Date().getTimezoneOffset() * 60 * 1000;
const base = new Date(2000, 1, 1, 0, 0, 0);

const parseDate = (s: string): Date | null => {
  s = s.trim();
  let dt = parse(s, "yyyy-M-d", base);
  if (isValid(dt)) return dt;
  dt = parse(s, "yyyy/M/d", base);
  if (isValid(dt)) return dt;
  return null;
};

const DateInput: React.FC<InputProps> = React.forwardRef(
  ({ value, onChange, onBlur, ...rest }, ref) => {
    const defaultValue = value
      ? lightFormat((value as number) - offset, "yyyy-MM-dd")
      : "";

    return (
      <Input
        ref={ref}
        defaultValue={defaultValue}
        onBlur={(event) => {
          const value = event.target.value;
          const date = parseDate(value);
          if (date) {
            const ts = date.getTime() - offset;
            onChange?.(ts as any);
            event.target.value = lightFormat(ts, "yyyy-MM-dd");
          } else {
            event.target.value = defaultValue;
          }
          onBlur?.(event);
        }}
        {...rest}
      />
    );
  }
);

export default DateInput;
