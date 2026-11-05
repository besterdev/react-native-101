export function DateField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      aria-label="Next payment date"
      type="date"
      min="2026-10-16"
      value={value}
      onChange={(event) => {
        if (event.target.value) onChange(event.target.value);
      }}
      style={{
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
        height: 50,
        padding: "0 13px",
        background: "#ffffff",
        border: 0,
        borderRadius: 12,
        fontFamily: "RecurInter-Medium",
        fontSize: 16,
        color: "#1c1c1e",
        colorScheme: "light",
      }}
    />
  );
}
