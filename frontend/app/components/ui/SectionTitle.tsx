type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export default function SectionTitle({
  eyebrow,
  title,
  description,
  className = "",
}: SectionTitleProps) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
          {eyebrow}
        </p>
      )}

      <h2 className={eyebrow ? "mt-2 text-xl font-semibold" : "text-xl font-semibold"}>
        {title}
      </h2>

      {description && (
        <p className="mt-3 text-sm leading-7 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
