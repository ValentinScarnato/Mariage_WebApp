"use client";

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex-none whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition-colors " +
        (active
          ? "border-sage bg-sage text-cream"
          : "border-line bg-card text-sage-dark")
      }
    >
      {label}
    </button>
  );
}
