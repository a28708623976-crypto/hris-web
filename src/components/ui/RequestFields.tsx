import { useId } from "react";
import type { RequestField, RequestValues } from "../../types";

export function RequestFields({
  fields,
  values,
  errors,
  onChange,
  formKey,
}: {
  fields: readonly RequestField[];
  values: RequestValues;
  errors: Record<string, string>;
  onChange: (name: string, value: string | File[]) => void;
  formKey: string;
}) {
  const prefix = useId();
  const className =
    "w-full px-3.5 py-2.5 rounded-xl bg-[#F5F5F7] text-xs outline-none focus:ring-2 focus:ring-[#0071E3]/30";
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const id = `${prefix}-${field.name}`;
        const value =
          typeof values[field.name] === "string"
            ? (values[field.name] as string)
            : "";
        const shared = {
          id,
          name: field.name,
          required: field.required,
          "aria-invalid": Boolean(errors[field.name]),
          "aria-describedby": errors[field.name] ? `${id}-error` : undefined,
          className,
        };
        return (
          <div key={`${formKey}:${field.name}`}>
            <label
              htmlFor={id}
              className="block text-xs font-medium text-[#6E6E73] mb-1.5"
            >
              {field.label}
              {field.required && <span className="text-[#FF3B30] ml-1">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                {...shared}
                rows={3}
                value={value}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            ) : field.type === "select" ? (
              <select
                {...shared}
                value={value}
                onChange={(event) => onChange(field.name, event.target.value)}
              >
                <option value="">请选择</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === "file" ? (
              <input
                {...shared}
                type="file"
                accept={field.accept}
                multiple={field.multiple}
                onChange={(event) =>
                  onChange(field.name, Array.from(event.target.files ?? []))
                }
              />
            ) : (
              <input
                {...shared}
                type={field.type}
                min={
                  field.type === "date" && field.afterField
                    ? String(values[field.afterField] ?? "")
                    : field.min
                }
                step={field.step}
                value={value}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            )}
            {errors[field.name] && (
              <p
                id={`${id}-error`}
                role="alert"
                className="text-[11px] text-[#D70015] mt-1"
              >
                {errors[field.name]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
