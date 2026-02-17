import { Check, Mail } from "lucide-react";

const ICONS = {
  check: Check,
  mail: Mail,
} as const;

interface SuccessStateProps {
  icon?: keyof typeof ICONS;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function SuccessState({
  icon = "check",
  title,
  description,
  children,
}: SuccessStateProps) {
  const Icon = ICONS[icon];

  return (
    <div className="py-3 text-center">
      <div className="animate-scale-in mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-8 w-8 text-primary" strokeWidth={2} />
      </div>
      <h2 className="animate-fade-in-up delay-1 font-serif text-xl font-semibold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="animate-fade-in-up delay-2 mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children && (
        <div className="animate-fade-in-up delay-3 mt-6">{children}</div>
      )}
    </div>
  );
}
