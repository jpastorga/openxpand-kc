"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface SearchParamsHandlerProps {
  onParamsChange: (params: URLSearchParams) => void;
}

export function SearchParamsHandler({ onParamsChange }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams) {
      onParamsChange(searchParams);
    }
  }, [searchParams, onParamsChange]);

  return null;
}
