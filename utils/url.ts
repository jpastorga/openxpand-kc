import { FormData } from "@/types/api";
import { environments } from "@/app/constants";
import { resolveOAuthScopes } from "@/lib/scopes";

export function generateAuthUrl(formData: FormData): string {
  const { clientId, tenant, environment, selectedVersions, scope } = formData;
  const { auth } = environments[environment as keyof typeof environments];
  const fromVersions = resolveOAuthScopes(selectedVersions ?? []);
  const oauthScopes = (fromVersions.length ? fromVersions : scope ?? []).filter(Boolean);

  return `${auth}/auth/realms/${tenant}/protocol/openid-connect/auth?response_type=code&client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    window.location.origin
  )}&scope=${encodeURIComponent(oauthScopes.join(" "))}`;
}
