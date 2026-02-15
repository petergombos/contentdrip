/* eslint-disable @next/next/no-img-element */

export async function loadFonts(origin: string) {
  const [dmSans, fraunces] = await Promise.all([
    fetch(new URL("/fonts/DMSans-Variable.ttf", origin)).then((r) =>
      r.arrayBuffer()
    ),
    fetch(new URL("/fonts/Fraunces-Variable.ttf", origin)).then((r) =>
      r.arrayBuffer()
    ),
  ]);

  return [
    { name: "DM Sans", data: dmSans, weight: 400 as const, style: "normal" as const },
    { name: "DM Sans", data: dmSans, weight: 700 as const, style: "normal" as const },
    { name: "Fraunces", data: fraunces, weight: 600 as const, style: "normal" as const },
  ];
}

export function DarkTemplate({
  title,
  description,
  label,
}: {
  title: string;
  description?: string;
  label?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        backgroundColor: "#050505",
        padding: "60px 64px",
        fontFamily: "DM Sans",
      }}
    >
      {/* Top: label + logo */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        {label ? (
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "#c8ff00",
              fontFamily: "DM Sans",
            }}
          >
            {label}
          </div>
        ) : (
          <div />
        )}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#e8e8e8",
            fontFamily: "DM Sans",
            letterSpacing: "-0.02em",
          }}
        >
          ContentDrip
        </div>
      </div>

      {/* Center: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: title.length > 50 ? 48 : 60,
            fontWeight: 700,
            color: "#e8e8e8",
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            fontFamily: "DM Sans",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 22,
              color: "#777",
              lineHeight: 1.4,
              fontFamily: "DM Sans",
            }}
          >
            {description.length > 120
              ? description.slice(0, 117) + "..."
              : description}
          </div>
        )}
      </div>

      {/* Bottom: accent bar */}
      <div
        style={{
          display: "flex",
          width: "64px",
          height: "4px",
          backgroundColor: "#c8ff00",
        }}
      />
    </div>
  );
}

export function WarmTemplate({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #faf7f2 0%, #f5ede3 50%, #efe5d8 100%)",
        padding: "60px 64px",
        fontFamily: "DM Sans",
      }}
    >
      {/* Top: Learnwise badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            backgroundColor: "#1a1a1a",
            color: "#faf7f2",
            fontSize: 18,
            fontWeight: 700,
            fontFamily: "DM Sans",
            borderRadius: "4px",
          }}
        >
          L
        </div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#6b5e50",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontFamily: "DM Sans",
          }}
        >
          Learnwise
        </div>
      </div>

      {/* Center: title + description */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div
          style={{
            fontSize: title.length > 40 ? 48 : 56,
            fontWeight: 600,
            color: "#2a2520",
            lineHeight: 1.15,
            fontFamily: "Fraunces",
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontSize: 22,
              color: "#8a7d6d",
              lineHeight: 1.4,
              fontFamily: "DM Sans",
            }}
          >
            {description.length > 120
              ? description.slice(0, 117) + "..."
              : description}
          </div>
        )}
      </div>

      {/* Bottom: subtle line */}
      <div
        style={{
          display: "flex",
          width: "64px",
          height: "3px",
          backgroundColor: "#c4a97d",
          borderRadius: "2px",
        }}
      />
    </div>
  );
}
