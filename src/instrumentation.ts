import { reportError } from "@/lib/report-error";

export async function onRequestError(
  error: unknown,
  _request: unknown,
  context: { routerKind: string; routePath: string }
) {
  reportError(error, context.routePath || context.routerKind || "request");
}
