import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#050505",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
        }}
      >
        {/* Droplet shape using stacked rounded squares */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 2 L14.5 8.5 Q16 11 16 13 Q16 17 10 17 Q4 17 4 13 Q4 11 5.5 8.5 Z"
            fill="#c8ff00"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
