import React, { forwardRef } from "react";

import { Handle } from "./handle";
import { Remove } from "./remove";

import "./styles.css";
import { cn } from "@/lib/utils";

export interface ContainerProps {
  children: React.ReactNode;
  label?: string;
  style?: React.CSSProperties;
  handleProps?: React.HTMLAttributes<any>;
  shadow?: boolean;
  onClick?(): void;
  onRemove?(): void;
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      handleProps,
      onClick,
      onRemove,
      label,
      style,
      shadow,
      ...props
    }: ContainerProps,
    ref
  ) => {
    const Component = onClick ? "button" : "div";

    return (
      <Component
        {...props}
        // @ts-ignore
        ref={ref}
        style={style}
        className={cn("container", shadow && "shadow")}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? (
          <div className={"header"}>
            <div className={"dragHandle"}>
              <Handle {...handleProps} />
            </div>
            <div className={"label"}>{label}</div>
            <div className={"actions"}>
              {onRemove ? <Remove onClick={onRemove} /> : undefined}
            </div>
          </div>
        ) : null}
        <ul>{children}</ul>
      </Component>
    );
  }
);
