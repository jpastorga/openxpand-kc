import { apiList } from "@/app/constants";
import { ApiCallerProps, ApiItem } from "@/types/api";
import { useMemo, useState } from "react";
import AccordionItem from "@/components/AccordionItem";

export function ApiCaller({ accessToken, env }: ApiCallerProps) {
    
  const [sandboxMode, setSandboxMode] = useState(true);

  const groupedApis = useMemo(() => {
      return apiList.reduce((acc: Record<string, ApiItem[]>, api) => {
        if (env.scope.includes(api.scope)) {
          if (!acc[api.usecase]) acc[api.usecase] = [];
          const updatedApi = {
            ...api,
            path: sandboxMode ? `sandbox/${api.path}` : api.path,
          };
          acc[api.usecase].push(updatedApi);
        }
        return acc;
      }, {} as Record<string, ApiItem[]>);
    }, [env.scope, sandboxMode]);

  return (
    <>
        <div className="mt-2">
            <div
                className={`grid gap-4 mb-4 ${
                  Object.keys(groupedApis).length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
                }`}
              >
                   <div className="col-span-full flex justify-center">
                      <label className="flex capitalize items-center gap-2 cursor-pointer">
                        <span className="text-md font-roboto font-bold text-openxpand">sandbox mode</span>
                        <div className="relative">
                          <input type="checkbox" checked={sandboxMode} onChange={() => setSandboxMode(!sandboxMode)} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-openxpand transition-colors"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-full"></div>
                        </div>
                      </label>
                  </div>
            </div>
            <div  className={`grid gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 ${
                Object.keys(groupedApis).length === 1 ? 'w-full grid-cols-1 place-items-center' : 'grid-cols-1 md:grid-cols-2'
            }`}
            >
            {Object.entries(groupedApis).map(([usecase, apis]) => (
                <div key={usecase} className="mb-2 bg-white p-6 rounded-xl w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <h3 className="text-lg text-openxpand font-roboto font-semibold mb-4 capitalize">{apis[0].title}</h3>
                <div className="grid gap-3">
                    {apis.map((api) => (
                    <AccordionItem
                         key={api.name}
                         api={api}
                         accessToken={accessToken}
                         environment={env.environment}
                       />
                    ))}
                </div>
                </div>
            ))}
            </div>
        </div>
    </>
  );

}