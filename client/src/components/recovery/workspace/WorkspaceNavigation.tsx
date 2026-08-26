type WorkspaceSection =
  | "overview"
  | "documents"
  | "recovery"
  | "agent";

type WorkspaceNavigationProps = {
  activeSection: WorkspaceSection;
  onChange: (section: WorkspaceSection) => void;
};

const sections: {
  label: string;
  value: WorkspaceSection;
}[] = [
  { label: "Overview", value: "overview" },
  { label: "Documents", value: "documents" },
  { label: "Recovery", value: "recovery" },
  { label: "Agent", value: "agent" },
];

export function WorkspaceNavigation({
  activeSection,
  onChange,
}: WorkspaceNavigationProps) {
  return (
    <>
      {/* Desktop */}
      <nav className="hidden space-y-1 lg:block">
        {sections.map((section) => (
          <button
            key={section.value}
            onClick={() => onChange(section.value)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
              activeSection === section.value
                ? "bg-indigo-50 font-normal text-indigo-700"
                : "font-light text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Mobile */}
      <nav className="flex overflow-x-auto lg:hidden">
        {sections.map((section) => (
          <button
            key={section.value}
            onClick={() => onChange(section.value)}
            className={`relative shrink-0 px-4 py-3 text-sm transition-colors ${
              activeSection === section.value
                ? "font-normal text-zinc-950"
                : "font-light text-zinc-500"
            }`}
          >
            {section.label}

            {activeSection === section.value && (
              <span className="absolute inset-x-4 bottom-0 h-px bg-zinc-950" />
            )}
          </button>
        ))}
      </nav>
    </>
  );
}

export type { WorkspaceSection };