import type { ReactNode } from 'react';

export interface EditorSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function EditorSection({
  title,
  description,
  children,
  className = '',
}: EditorSectionProps) {
  return (
    <section className={className}>
      <header>
        <h3>{title}</h3>
        {description ? <p>{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
