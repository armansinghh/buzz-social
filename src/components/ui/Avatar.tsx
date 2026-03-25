import { useState } from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
  onClick?: () => void;
}

export default function Avatar({
  name = "User",
  src,
  size = "md",
  className = "",
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses: Record<AvatarSize, string> = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .trim()
      .split(" ")
      .map((word) => word[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const showImage = src && !imgError;

  return (
    <div
      onClick={onClick}
      className={`
        relative flex items-center justify-center
        rounded-full overflow-hidden
        bg-[var(--bg-tertiary)]
        text-[var(--text-primary)]
        font-semibold select-none
        ${sizeClasses[size]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}