import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, error, icon, iconPosition = "left", type, ...props },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              "w-full h-12 px-4 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400",
              "focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500",
              "transition-all duration-200",
              "disabled:bg-gray-100 disabled:cursor-not-allowed",
              icon && iconPosition === "left" && "pl-10",
              icon && iconPosition === "right" && "pr-10",
              error && "border-error-500 focus:ring-error-100 focus:border-error-500",
              className
            )}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-error-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
