import { FormData } from "@/types/api";

interface ScopeSelectorProps {
  formData: FormData;
  handleScopeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  formattedScopeOptions: { key: string; fullValue: string }[];
  isLoading: boolean;
}

export function ScopeSelector({ formData, handleScopeChange, formattedScopeOptions, isLoading }: ScopeSelectorProps) {
  return (
    <div className="flex flex-col mt-3">
      <div className="grid grid-cols-2 gap-4">
        {formattedScopeOptions.map(({ key, fullValue }) => (
          <label key={fullValue} className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="scope"
              value={fullValue}
              checked={formData.scope.includes(fullValue)}
              onChange={handleScopeChange}
              disabled={isLoading}
              className="h-4 w-4 rounded accent-openxpand appearance-auto"
            />
            <span className="text-md font-medium">{key}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
