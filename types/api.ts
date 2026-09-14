
export interface ApiCallerProps {
    accessToken: string;
    env: FormData;
}

export interface MakeRequestOptions {
    method?: string;
    url: string;
    data?: object;
    headers?: object;
}


export interface StepWizardProps {
    title: string;
    env: FormDataWithCode;
}

export interface ApiItem {
    name: string;
    path: string;
    displayName: string;
    description: string;
    versionId: string;
    scopes: string[];
    title: string;
    usecase: string;
    body?: string;
    method?: string;
}

export interface ApiVersionOption {
    id: string;
    api: string;
    version: string;
    scopes: string[];
}

export interface FormData {
    clientId: string;
    clientSecret: string;
    tenant: string;
    scope: string[];
    selectedVersions: string[];
    environment: string;
}

export interface FormDataWithCode extends FormData {
    code: string | null;
    host: string;
}

export interface ApiErrorResponse {
    status: string;
    message: string;
    code: string;
    assignmentId?: string;
    subscriptionId?: string;
    authenticationId?: string;
    [key: string]: unknown;
}
