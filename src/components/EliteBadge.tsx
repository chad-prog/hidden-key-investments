/**
 * EliteBadge component
 * Shows a small, reusable "Elite Automation Active" indicator across the app
 */

import React from 'react';
import { Zap } from 'lucide-react';

/**
 * EliteBadge
 * Minimal status pill showing Elite plan activation.
 */
export function EliteBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/90 text-blue-900 px-3 py-1 text-xs font-bold shadow">
      <Zap className="h-3.5 w-3.5" />
      Elite Automation Active
    </div>
  );
}

export default EliteBadge;
