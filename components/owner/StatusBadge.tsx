type Props = {
  statut: "PENDING" | "VALIDEE";
};

const labelMap = {
  PENDING: "En attente de validation",
  VALIDEE: "Validee",
} as const;

export function StatusBadge({ statut }: Props) {
  const isValid = statut === "VALIDEE";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
        isValid ? "bg-emerald-500/20 text-emerald-200" : "bg-amber-500/20 text-amber-200"
      }`}
    >
      {labelMap[statut]}
    </span>
  );
}
