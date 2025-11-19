import { memo, useState } from "react";
import AccordionButton from "@/components/AccordionButton";
import { ApiItem, ApiErrorResponse } from "@/types/api";

interface AccordionItemProps {
  api: ApiItem;
  accessToken: string;
  environment: string;
  loading: { [key: string]: boolean };
  responses: { [key: string]: ApiErrorResponse | null };
  inputs: { [key: string]: string };
  setInputs: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleSubmit: (apiName: string, path: string, method?: string) => Promise<void>;
  assignmentId: string | null;
}

const AccordionItem = ({
  api,
  accessToken,
  environment,
  loading,
  responses,
  inputs,
  setInputs,
  handleSubmit,
  assignmentId
}: AccordionItemProps) => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive((prev) => !prev);
  };

  return (
    <div className="bg-light p-4 rounded-2xl">
      <AccordionButton
        onClick={handleClick}
        isActive={isActive}
        name={api.name}
        path={api.path}
        label={api.displayName}
        description={api.description}
        accessToken={accessToken}
        environment={environment}
        loading={loading}
        responses={responses}
        inputs={inputs}
        setInputs={setInputs}
        handleSubmit={handleSubmit}
        assignmentId={assignmentId}
      />
    </div>
  );
};

export default memo(AccordionItem);
