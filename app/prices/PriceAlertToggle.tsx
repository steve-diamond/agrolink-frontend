"use client";
import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface Props {
  commodity: string;
  state: string;
  enabled: boolean;
  threshold: number;
}

export default function PriceAlertToggle({ commodity, state, enabled, threshold }: Props) {
  const { data: session } = useSession();
  const [checked, setChecked] = useState(enabled);
  const [loading, setLoading] = useState(false);

  if (!session) return null;

  const handleToggle = async () => {
    setLoading(true);
    await fetch('/api/user-preferences/price-alert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        commodity,
        state,
        alert_enabled: !checked,
        alert_threshold_pct: threshold,
      }),
    });
    setChecked(!checked);
    setLoading(false);
  };

  return (
    <label className="flex items-center gap-2 mt-2">
      <input type="checkbox" checked={checked} onChange={handleToggle} disabled={loading} />
      <span className="text-sm">Get SMS Alerts for price changes</span>
    </label>
  );
}
