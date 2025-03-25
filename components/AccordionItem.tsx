import { memo, useState } from "react";
import AccordionButton from "@/components/AccordionButton";
import { ApiItem } from "@/types/api";

interface AccordionItemProps {
  api: ApiItem;
  accessToken: string;
  environment: string;
}

const AccordionItem = ({
  api, 
  accessToken, 
  environment 
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
      />
    </div>
  );
};

export default memo(AccordionItem);
