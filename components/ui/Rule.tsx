type RuleProps = {
  /** `object` is the 2 px emphasis line; `hairline` the default 1 px rule. */
  weight?: "hairline" | "object";
  className?: string;
};

export function Rule({ weight = "hairline", className }: RuleProps) {
  return (
    <hr
      className={`${weight === "object" ? "rule-object" : "rule-hairline"} ${className ?? ""}`}
    />
  );
}
