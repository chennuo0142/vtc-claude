"use client";

import { useState, type InputHTMLAttributes } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { EyeIcon, EyeOffIcon } from "@/components/icons";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "style"> & {
  style?: React.CSSProperties;
};

export default function PasswordInput({ className, style, ...props }: PasswordInputProps) {
  const { dict } = useLanguage();
  const t = dict.common;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={className}
        style={{ paddingRight: 34, ...style }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t.masquerMotDePasse : t.afficherMotDePasse}
        aria-pressed={visible}
        className="absolute right-0 top-0 flex h-full items-center justify-center px-2"
        style={{ color: "var(--color-neutral-700)" }}
      >
        {visible ? (
          <EyeOffIcon style={{ width: 17, height: 17 }} />
        ) : (
          <EyeIcon style={{ width: 17, height: 17 }} />
        )}
      </button>
    </div>
  );
}
