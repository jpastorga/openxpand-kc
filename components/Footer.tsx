"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { environments } from "@/app/constants";

interface FooterProps {
  env: string;
  tenant: string;
}

export function Footer({ env, tenant }: FooterProps) {
  const [urlPortal, setUrlPortal] = useState<string>("");

  useEffect(() => {
    const url = environments[env as keyof typeof environments]?.portal;
    if (url && tenant) {
      setUrlPortal(url.replace(":tenant", tenant));
    }
  }, [env, tenant]);

  if (!urlPortal) return null;

  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center my-4">
      <a
        className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-openxpand"
        href={urlPortal}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image
          aria-hidden
          src="/globe.svg"
          alt="Globe icon"
          width={16}
          height={16}
        />
        Go to developer portal →
      </a>
    </footer>
  );
}
