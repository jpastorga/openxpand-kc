import { environments } from "@/app/constants";
import { ScopeSelector } from "./ScopeSelector";
import { FormData } from "@/types/api";
import { useEnvironmentStatuses } from "@/hook/useEnvironmentStatuses";

interface LoginFormProps {
  formData: FormData;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleScopeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  error: string | null;
  formattedScopeOptions: { key: string; fullValue: string }[];
}

export function LoginForm({ formData, handleSubmit, handleChange, handleScopeChange, isLoading, error, formattedScopeOptions }: LoginFormProps) {
  const { statuses, loading: loadingStatuses } = useEnvironmentStatuses();

  return (
    <div className="bg-white text-openxpand p-10 rounded-2xl w-full sm:max-w-sm md:max-w-md">
      <h2 className="text-2xl font-roboto font-semibold mb-8">Quick Tester</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col">
          <label htmlFor="clientId" className="block text-md font-medium">Client ID</label>
          <input type="text" id="clientId" name="clientId" value={formData.clientId} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" disabled={isLoading} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="clientSecret" className="block text-md font-medium">Client Secret</label>
          <input type="password" id="clientSecret" name="clientSecret" value={formData.clientSecret} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" disabled={isLoading} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="tenant" className="block text-md font-medium">Tenant</label>
          <input type="text" id="tenant" name="tenant" value={formData.tenant} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" disabled={isLoading} />
        </div>

        <div className="flex flex-col">
          <label htmlFor="environment" className="block text-md font-medium">Environment</label>
          <div className="relative">
            <select
              id="environment"
              name="environment"
              value={formData.environment}
              onChange={handleChange}
              required
              className="w-full mt-1 p-2 border rounded-md pr-10 capitalize"
              disabled={isLoading}
            >
              {Object.keys(environments).map((env) => {
                const found = statuses.find((s) => s.env === env);
                const label = found
                  ? `${env} - ${found.version}`
                  : loadingStatuses
                  ? `${env} - Checking...`
                  : `${env} - Error`;

                return (
                  <option key={env} value={env}>
                    {label}
                  </option>
                );
              })}
            </select>

            <div className="mt-1 mr-4 absolute top-1/2 right-3 transform -translate-y-1/2 w-4 h-4 rounded-full"
              style={{
                backgroundColor:
                  statuses.find((s) => s.env === formData.environment)?.status === "healthy"
                    ? "#3ba98c"
                    : "#6c757d",
              }}
            />
          </div>
        </div>

        <ScopeSelector formData={formData} handleScopeChange={handleScopeChange} formattedScopeOptions={formattedScopeOptions} isLoading={isLoading} />

        <button className="text-white px-6 py-2 rounded-md mt-4 mx-auto block hover:opacity-80 transition" disabled={isLoading}>
          {isLoading ? "Loading..." : "Log In"}
        </button>
      </form>

      {error && (
        <div className="mt-2 flex justify-center items-center text-center h-full">
          <p className="bg-red-100 text-red-700 border border-red-400 rounded-lg px-4 py-2 shadow-md">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
}
