import { useMemo } from "react";
import { FormData, ApiVersionOption } from "@/types/api";

interface ScopeSelectorProps {
  formData: FormData;
  handleScopeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  versionOptions: ApiVersionOption[];
  isLoading: boolean;
}

export function ScopeSelector({ formData, handleScopeChange, versionOptions, isLoading }: ScopeSelectorProps) {
  const selectedVersions = formData.selectedVersions ?? [];

  const rows = useMemo(() => {
    const groups: { api: string; versions: ApiVersionOption[] }[] = [];

    for (const option of versionOptions) {
      const last = groups[groups.length - 1];
      if (last && last.api === option.api) {
        last.versions.push(option);
      } else {
        groups.push({ api: option.api, versions: [option] });
      }
    }

    return groups;
  }, [versionOptions]);

  const midpoint = Math.ceil(rows.length / 2);
  const columns = [rows.slice(0, midpoint), rows.slice(midpoint)];

  return (
    <div className="mt-1 grid grid-cols-2 gap-x-6">
      {columns.map((column, columnIndex) => (
        <div key={columnIndex} className="divide-y divide-gray-100">
          {column.map(({ api, versions }) => (
            <div key={api} className="flex items-center justify-between gap-2 py-1.5">
              <span className="min-w-0 truncate text-sm" title={api}>{api}</span>
              <div className="flex shrink-0 gap-1">
                {versions.map(({ id, version, scopes }) => {
                  const selected = selectedVersions.includes(id);
                  return (
                    <label
                      key={id}
                      title={scopes.join(" ")}
                      className={`cursor-pointer rounded px-1.5 py-0.5 text-xs font-medium leading-none ${
                        selected ? "bg-openxpand text-white" : "bg-light text-openxpand"
                      } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        name="scope"
                        value={id}
                        checked={selected}
                        onChange={handleScopeChange}
                        disabled={isLoading}
                        aria-label={`${api} ${version}`}
                        className="sr-only"
                      />
                      {version}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
