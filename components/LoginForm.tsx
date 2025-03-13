import { environments } from "@/app/constants";
import { ScopeSelector } from "./ScopeSelector";
import { FormData } from "@/types/api";

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
          <select id="environment" name="environment" value={formData.environment} onChange={handleChange} required className="w-full mt-1 p-2 border rounded-md" disabled={isLoading}>
            <option value="">-- Select an Environment --</option>
            {Object.keys(environments).map((env) => (
              <option key={env} value={env}>{env.charAt(0).toUpperCase() + env.slice(1)}</option>
            ))}
          </select>
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
