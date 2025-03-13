import { FormData } from "@/types/api";
import { environments } from "@/app/constants";

export function generateAuthUrl(formData: FormData): string {
const { clientId, tenant, environment, scope } = formData;
const { auth } = environments[environment as keyof typeof environments];

    return `${auth}/auth/realms/${tenant}/protocol/openid-connect/auth?response_type=code&client_id=${encodeURIComponent(
        clientId
    )}&redirect_uri=${encodeURIComponent(
        window.location.origin
    )}&scope=${encodeURIComponent(scope.join(" "))}`;

}
