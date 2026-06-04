import logoSrc from "../assets/echoaide-logo.png";

type EchoAideLogoProps = {
  height?: number;
  className?: string;
  alt?: string;
};

export default function EchoAideLogo({
  height = 48,
  className = "",
  alt = "EchoAide — Secure medical notes & transcription",
}: EchoAideLogoProps) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`block w-auto max-w-full object-contain bg-transparent ${className}`}
      style={{ height, background: "transparent" }}
      decoding="async"
    />
  );
}
