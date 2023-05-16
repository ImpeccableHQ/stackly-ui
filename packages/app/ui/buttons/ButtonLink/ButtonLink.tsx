"use client";

import Link from "next/link";
import {
  ButtonBaseProps,
  ButtonContent,
  buttonStyles,
} from "@/ui/buttons/Button/Button";

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
}

export default function ButtonLink({
  children,
  className,
  size,
  action,
  width,
  disabled,
  href,
  active,
  iconLeft,
  iconRight,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={buttonStyles({
        size,
        action,
        width,
        disabled,
        active,
        className,
      })}
    >
      <ButtonContent iconRight={iconRight} iconLeft={iconLeft}>
        {children}
      </ButtonContent>
    </Link>
  );
}