import React from 'react';

interface IdentityChipProps {
  email: string | null;
  className?: string;
}

/**
 * Shared identity badge — one language everywhere in Admin:
 * "Signed-in" (grouped by college email across browsers) vs
 * "Anonymous" (grouped by IP + browser fingerprint until login merges it).
 */
export const IdentityChip: React.FC<IdentityChipProps> = ({ email, className = '' }) => {
  if (email) {
    return (
      <span
        className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary dark:bg-primary/20 ${className}`}
        title="Identified by college email — visits from every browser and network fold into this one profile."
      >
        Signed-in
      </span>
    );
  }
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-[#1F2430] dark:text-[#94A3B8] ${className}`}
      title="Anonymous browser — grouped by IP + browser fingerprint. Logging in folds this history into the email profile."
    >
      Anonymous
    </span>
  );
};
