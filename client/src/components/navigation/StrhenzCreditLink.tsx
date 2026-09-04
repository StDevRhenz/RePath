export function StrhenzCreditLink() {
  return (
    <p className="fixed bottom-2 left-1/2 z-30 -translate-x-1/2 text-[0.68rem] font-light text-zinc-400">
      Made by{" "}
      <a
        href="https://github.com/StDevRhenz"
        target="_blank"
        rel="noopener noreferrer"
        className="transition-colors hover:text-zinc-600 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]"
        aria-label="StDevRhenz GitHub profile"
      >
        StDevRhenz
      </a>
    </p>
  );
}
