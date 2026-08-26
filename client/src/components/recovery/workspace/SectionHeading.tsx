type SectionHeadingProps = {
  title: string;
  description: string;
};

export function SectionHeading({
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div>
      <h2 className="text-sm font-normal text-zinc-900">
        {title}
      </h2>

      <p className="mt-1 text-sm font-light text-zinc-500">
        {description}
      </p>
    </div>
  );
}