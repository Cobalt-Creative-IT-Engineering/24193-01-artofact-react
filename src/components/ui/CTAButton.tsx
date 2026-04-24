type Props = {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
};

import React from "react";

export function CTAButton({ href, onClick, children, className = "" }: Props) {
  const cls = `btn-cta ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {children}
    </button>
  );
}
