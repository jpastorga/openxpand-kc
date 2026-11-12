import { FormData } from "@/types/api";
import { environments } from "@/app/constants";
import { resolveOAuthScopes } from "@/lib/scopes";

export function generateAuthUrl(formData: FormData): string {
  const { clientId, tenant, environment, selectedVersions, scope } = formData;
  const { auth, authProxy } = environments[environment as keyof typeof environments];
  const host = formData.useAuthProxy ? authProxy : auth;
  const fromVersions = resolveOAuthScopes(selectedVersions ?? []);
  const oauthScopes = (fromVersions.length ? fromVersions : scope ?? []).filter(Boolean);

  return `${host}/auth/realms/${encodeURIComponent(tenant)}/protocol/openid-connect/auth?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    window.location.origin
  )}&scope=${encodeURIComponent(oauthScopes.join(" "))}${formData.useAuthProxy ? "&prompt=none" : ""}`;
}
