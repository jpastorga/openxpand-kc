"use client";

import { useEffect, useState } from "react";
import { environments } from "@/app/constants";

type Status = {
  env: string;
  status: string;
  version: string;
};

export function useEnvironmentStatuses() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatuses = async () => {
      const entries = Object.entries(environments);
      const promises = entries.map(async ([env, config]) => {
        try {
          const res = await fetch(`${config.api}/healthcheck`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          return { ...data, env };
        } catch {
          return { env, status: "Unavailable", version: "N/A" };
        }
      });

      const results = await Promise.all(promises);
      setStatuses(results);
      setLoading(false);
    };

    fetchStatuses();
  }, []);

  return { statuses, loading };
}
