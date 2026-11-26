import type {
  RequestSubmission,
  RequestSubmitResult,
  RequestValues,
  SelfRequest,
} from "../types";
import { requestFieldText, validateRequest } from "../utils/selfService";
import { useStore } from "./index";

export function submitSelfRequest(
  submission: RequestSubmission,
): RequestSubmitResult {
  const { request, errors } = validateRequest(submission);
  if (!request || Object.keys(errors).length) return { ok: false, errors };
  const values: RequestValues = {};
  for (const field of request.leaf.fields!) {
    const value = submission.values[field.name];
    if (value !== undefined)
      values[field.name] = Array.isArray(value) ? [...value] : value.trim();
  }
  const fields = request.leaf.fields!;
  const dates = fields
    .filter((field) => field.type === "date")
    .map((field) => requestFieldText(field, values))
    .filter(Boolean);
  const record: SelfRequest = {
    id: `REQ-${crypto.randomUUID()}`,
    bizType: request.labels.join(" / "),
    effectiveDate: dates.join(" ~ "),
    reason: fields
      .filter(
        (field) => field.type !== "date" && requestFieldText(field, values),
      )
      .map((field) => `${field.label}：${requestFieldText(field, values)}`)
      .join(" · "),
    status: "审批中",
    requestTypeId: request.leaf.id,
    typePath: [...request.labels],
    formValues: values,
  };
  useStore.setState((state) => ({
    selfRequests: [record, ...state.selfRequests],
  }));
  return { ok: true, errors: {} };
}
