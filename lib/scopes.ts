import { apiList } from "@/app/constants";
import { ApiVersionOption } from "@/types/api";

function parseVersionId(versionId: string): { api: string; version: string } {
  const separator = versionId.indexOf("/");
  if (separator < 0) {
    return { api: versionId, version: "" };
  }
  return {
    api: versionId.slice(0, separator),
    version: versionId.slice(separator + 1),
  };
}

export function compareVersions(left: string, right: string): number {
  const parse = (value: string) => {
    const match = value.match(/^v(\d+)(?:\.(\d+))?(.*)$/i);
    if (!match) {
      return { major: 0, minor: 0, extra: value };
    }
    return {
      major: Number(match[1]),
      minor: Number(match[2] || 0),
      extra: match[3] || "",
    };
  };

  const a = parse(left);
  const b = parse(right);
  if (Boolean(a.extra) !== Boolean(b.extra)) {
    return a.extra ? 1 : -1;
  }
  if (a.major !== b.major) return a.major - b.major;
  if (a.minor !== b.minor) return a.minor - b.minor;
  return a.extra.localeCompare(b.extra);
}

export function getApiVersionOptions(): ApiVersionOption[] {
  const byId = new Map<string, ApiVersionOption>();

  for (const api of apiList) {
    const { api: apiName, version } = parseVersionId(api.versionId);
    const current = byId.get(api.versionId) ?? {
      id: api.versionId,
      api: apiName,
      version,
      scopes: [],
    };

    for (const scope of api.scopes) {
      if (!current.scopes.includes(scope)) {
        current.scopes.push(scope);
      }
    }

    byId.set(api.versionId, current);
  }

  return [...byId.values()].sort((left, right) => {
    const apiCmp = left.api.localeCompare(right.api);
    if (apiCmp !== 0) return apiCmp;
    return compareVersions(left.version, right.version);
  });
}

export function resolveOAuthScopes(selectedVersionIds: string[]): string[] {
  return [
    ...new Set(
      getApiVersionOptions()
        .filter((option) => selectedVersionIds.includes(option.id))
        .flatMap((option) => option.scopes)
    ),
  ];
}

export function selectedVersionsFromParams(params: string[]): string[] {
  return getApiVersionOptions()
    .filter((option) => {
      return params.some((raw) => {
        const value = raw.includes("#") ? raw.split("#")[1] : raw;
        return (
          raw === option.id ||
          value === option.id ||
          value === option.api ||
          raw === `${option.api} ${option.version}` ||
          option.scopes.includes(raw) ||
          option.scopes.includes(value)
        );
      });
    })
    .map((option) => option.id);
}

export function toggleVersionSelection(
  selectedVersionIds: string[],
  versionId: string,
  checked: boolean
): string[] {
  return checked
    ? [...new Set([...selectedVersionIds, versionId])]
    : selectedVersionIds.filter((id) => id !== versionId);
}
