import logoSrc from "../assets/echoaide-logo.png";

type EchoAideLogoProps = {
  height?: number;
  className?: string;
  alt?: string;
};

export default function EchoAideLogo({
  height = 48,
  className = "",
  alt = "EchoAide — The AI Operating System for Outpatient Clinics",
}: EchoAideLogoProps) {
  return (
    <img
      src={logoSrc}
      alt={alt}
      className={`block w-auto max-w-full object-contain ${className}`}
      style={{ height }}
      decoding="async"
    />
  );
}
