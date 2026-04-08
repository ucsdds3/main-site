import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const DS3_GRADIENT = {
  type: "linear" as const,
  rotation: 0.5,
  colorStops: [
    { offset: 0, color: "#F58134" },
    { offset: 1, color: "#19B5CA" },
  ],
};

const getQRCodeOptions = (data: string, size: number) => ({
  width: size,
  height: size,
  data,
  dotsOptions: {
    type: "rounded" as const,
    gradient: DS3_GRADIENT,
  },
  cornersSquareOptions: {
    type: "extra-rounded" as const,
    gradient: DS3_GRADIENT,
  },
  cornersDotOptions: {
    type: "dot" as const,
    gradient: DS3_GRADIENT,
  },
  backgroundOptions: { color: "#FFFFFF" },
});

const DOWNLOAD_SIZE = 400;

const sanitizeFilename = (name: string) =>
  name
    .replace(/[\/\\:*?"<>|]/g, "")
    .replace(/\s+/g, "-")
    .trim() || "event";

interface EventQRCodeProps {
  password: string;
  eventName?: string;
  size?: number;
}

export default function EventQRCode({ password, eventName, size = 200 }: EventQRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  const url = password
    ? `https://members.ds3atucsd.com?eventcode=${encodeURIComponent(password)}`
    : "";

  useEffect(() => {
    if (!url) return;

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(getQRCodeOptions(url, size));
    } else {
      qrRef.current.update({ data: url, width: size, height: size });
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      qrRef.current.append(containerRef.current);
    }
  }, [url, size]);

  const handleClick = () => {
    if (!url || !password) return;
    const downloadQr =
      size >= DOWNLOAD_SIZE
        ? qrRef.current
        : new QRCodeStyling(getQRCodeOptions(url, DOWNLOAD_SIZE));
    downloadQr?.download({
      name: `${sanitizeFilename(eventName ?? "event")}-qr-code`,
      extension: "png",
    });
  };

  if (!password) {
    return <p className="text-sm text-(--obs-text-muted)">Enter a password to generate QR code</p>;
  }

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={e => e.key === "Enter" && handleClick()}
      className="cursor-pointer rounded-lg border border-(--obs-border) p-2 transition-colors hover:border-[#19B5CA] focus:outline-none focus:ring-2 focus:ring-[#19B5CA]"
      title="Click to download"
    />
  );
}
