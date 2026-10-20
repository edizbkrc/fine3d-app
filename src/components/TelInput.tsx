import { Controller } from "react-hook-form";
import { TextField } from "@mui/material";

import MaskedInput from "react-text-mask";

const DEFAULT_TEL_PLACEHOLDER = "+90 123 456 7890";
const PHONE_MASK = [
  "+",
  "9",
  "0",
  " ",
  /\d/,
  /\d/,
  /\d/,
  " ",
  /\d/,
  /\d/,
  /\d/,
  " ",
  /\d/,
  /\d/,
  /\d/,
  /\d/,
];

export default function TelInput(props: any) {
  const {
    name,
    registerOptions,
    error,
    errorMessage,
    defaultValue,
    label,
    t,
    control,
    setValue,
    placeholder,
  } = props;
  return (
    <Controller
      key={name}
      name={name}
      control={control}
      defaultValue={defaultValue}
      rules={
        registerOptions
          ? {
              required: t("Required"),
              minLength: {
                message: t("MinLength13"),
                value: 13,
              },
            }
          : undefined
      }
      render={({ field: { onChange, value } }: any) => (
        <MaskedInput
          mask={PHONE_MASK}
          placeholder={placeholder ?? DEFAULT_TEL_PLACEHOLDER}
          guide={false}
          value={value}
          onChange={(e: any) => {
            const trimmedValue = e.target.value.replace(/\s+/g, "");
            onChange(trimmedValue);
            setValue(name, trimmedValue.trim());
          }}
          render={(ref: any, props: any) => (
            <TextField
              {...props}
              inputRef={ref}
              variant="outlined"
              label={label}
              fullWidth
              error={!!error}
              helperText={errorMessage}
            />
          )}
        />
      )}
    />
  );
}
