"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

interface SearchParamsHandlerProps {
  onParamsChange: (params: URLSearchParams) => void;
}

export function SearchParamsHandler({ onParamsChange }: SearchParamsHandlerProps) {
  const searchParams = useSearchParams();
  const prevParamsRef = useRef<string>("");

  useEffect(() => {
    if (searchParams.toString() !== prevParamsRef.current) {
      onParamsChange(searchParams);
      prevParamsRef.current = searchParams.toString();
    }
  }, [searchParams, onParamsChange]);

  return null;
}
