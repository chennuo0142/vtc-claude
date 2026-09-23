export default function InitialsAvatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: "999px",
        background: "var(--color-accent-100)",
        color: "var(--color-accent-700, var(--color-accent))",
        fontFamily: "var(--font-heading)",
        fontWeight: 600,
        fontSize: size * 0.4,
      }}
    >
      {initials}
    </div>
  );
}
