import { apiList } from "@/app/constants";
import { ApiCallerProps } from "@/types/api";
import { useState } from "react";
import AccordionButton from "@/components/AccordionButton";

export function ApiCaller({ accessToken, environment, scope }: ApiCallerProps) {
    
    const [activeIndex, setActiveIndex] = useState<string | null>(null);
    const toggleAccordion = (index: string) => {
        setActiveIndex(activeIndex === index ? null : index);
    };
    const groupedApis = apiList.reduce((acc: { [key: string]: any[] }, api) => {
        if (scope.includes(api.scope)) {
        if (!acc[api.usecase]) {
            acc[api.usecase] = [];
        }
        acc[api.usecase].push(api);
        }
        return acc;
    }, {});

  return (
    <>
        <div className="mt-2">
            <div  className={`grid gap-2 sm:gap-4 md:gap-6 lg:gap-8 xl:gap-10 ${
                Object.keys(groupedApis).length === 1 ? 'w-full grid-cols-1 place-items-center' : 'grid-cols-1 md:grid-cols-2'
            }`}
            >
            {Object.entries(groupedApis).map(([usecase, apis], usecaseIndex) => (
                <div key={usecase} className="mb-2 bg-white p-6 rounded-xl w-full sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
                <h3 className="text-lg text-openxpand font-roboto font-semibold mb-4 capitalize">{apis[0].title}</h3>
                <div className="grid gap-3">
                    {apis.map((api, index) => (
                    <div key={api.name} className="bg-light p-4 rounded-2xl">
                        <AccordionButton
                            onClick={() => toggleAccordion(`${usecaseIndex}-${index}`)}
                            isActive={activeIndex === `${usecaseIndex}-${index}`}
                            name={api.name}
                            path={api.path}
                            label={api.displayName}
                            description={api.description}
                            accessToken={accessToken}
                            environment={environment}
                        />
                    </div>
                    ))}
                </div>
                </div>
            ))}
            </div>
        </div>
    </>
  );

}