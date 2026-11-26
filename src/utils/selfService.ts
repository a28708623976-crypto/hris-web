import { SELF_SERVICE_REQUEST_TYPES } from "../constants/selfService";
import type {
  RequestField,
  RequestSubmission,
  RequestTypeNode,
  RequestValues,
} from "../types";
import { resolveCascaderPath } from "./cascader";

export function resolveRequest(path: readonly string[]) {
  const nodes = resolveCascaderPath(
    SELF_SERVICE_REQUEST_TYPES,
    path,
  ) as RequestTypeNode[];
  const leaf = nodes.at(-1);
  return leaf && !leaf.children?.length && leaf.fields
    ? { leaf, labels: nodes.map((node) => node.label) }
    : null;
}
export function validateRequest(submission: RequestSubmission) {
  const request = resolveRequest(submission.path);
  const errors: Record<string, string> = {};
  if (!request)
    return { request, errors: { typePath: "请选择最末级申请事项" } };
  for (const field of request.leaf.fields!) {
    const value = submission.values[field.name];
    const empty =
      field.type === "file"
        ? !Array.isArray(value) || !value.length
        : typeof value !== "string" || !value.trim();
    if (empty) {
      if (field.required)
        errors[field.name] =
          `请${field.type === "file" ? "上传" : field.type === "select" || field.type === "date" ? "选择" : "填写"}${field.type === "file" ? field.label.replace(/上传$/, "") : field.label}`;
      continue;
    }
    if (field.type === "file") {
      if (!Array.isArray(value) || !value.every((file) => file instanceof File))
        errors[field.name] = "请重新选择有效文件";
    } else if (typeof value === "string") {
      if (field.type === "number") {
        const number = Number(value);
        if (
          !Number.isFinite(number) ||
          (field.min !== undefined && number < field.min) ||
          (field.step !== undefined &&
            Math.abs(number / field.step - Math.round(number / field.step)) >
              1e-7)
        )
          errors[field.name] =
            `请填写有效的${field.label}${field.min !== undefined ? `（至少 ${field.min}）` : ""}`;
      } else if (field.type === "date") {
        const date = new Date(value);
        if (
          !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
          Number.isNaN(date.getTime()) ||
          date.toISOString().slice(0, 10) !== value
        )
          errors[field.name] = "请选择有效日期";
        else if (
          field.afterField &&
          typeof submission.values[field.afterField] === "string" &&
          value < submission.values[field.afterField]
        )
          errors[field.name] = "结束日期不能早于开始日期";
      } else if (field.type === "select" && !field.options?.includes(value))
        errors[field.name] = "请选择有效选项";
    } else errors[field.name] = "请填写有效内容";
  }
  return { request, errors };
}
export function requestFieldText(field: RequestField, values: RequestValues) {
  const value = values[field.name];
  return Array.isArray(value)
    ? value.map((file) => file.name).join("、")
    : (value?.trim() ?? "");
}
