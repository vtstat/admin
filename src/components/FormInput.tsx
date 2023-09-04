import {
  Input as ChakraInput,
  FormControl,
  FormErrorMessage,
  FormLabel,
  InputProps,
} from "@chakra-ui/react";
import {
  Controller,
  ControllerProps,
  FieldPath,
  FieldValues,
} from "react-hook-form";

type Props<
  V extends FieldValues = FieldValues,
  N extends FieldPath<V> = FieldPath<V>,
> = Omit<ControllerProps<V, N>, "render"> & {
  label: string;
  Input?: React.FC<InputProps>;
  required?: boolean;
  inputProps: InputProps;
};

function FormInput<
  V extends FieldValues = FieldValues,
  N extends FieldPath<V> = FieldPath<V>,
>({ label, inputProps, required, Input, ...reset }: Props<V, N>) {
  const InputComponent = Input || ChakraInput;

  return (
    <Controller
      {...reset}
      render={({ field, fieldState, formState }) => (
        <FormControl isRequired={required} isInvalid={!!fieldState.error}>
          <FormLabel htmlFor={field.name}>{label}</FormLabel>
          <InputComponent
            ref={field.ref}
            id={field.name}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            disabled={formState.isSubmitting}
            {...inputProps}
          />
          {fieldState.error && (
            <FormErrorMessage>
              {fieldState.error.type === "required" && "This field is required"}
              {fieldState.error.type === "pattern" &&
                `This field don't match the pattern`}
            </FormErrorMessage>
          )}
        </FormControl>
      )}
    />
  );
}

export default FormInput;
