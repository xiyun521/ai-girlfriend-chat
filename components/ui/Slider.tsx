// ============================================
// Slider Component
// ============================================

import { InputHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
  leftLabel?: string;
  rightLabel?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      label,
      showValue = true,
      leftLabel,
      rightLabel,
      value,
      id,
      ...props
    },
    ref
  ) => {
    const sliderId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor={sliderId}
              className="text-sm font-medium text-gray-700"
            >
              {label}
            </label>
            {showValue && (
              <span className="text-sm text-gray-500">{value}</span>
            )}
          </div>
        )}
        <input
          ref={ref}
          id={sliderId}
          type="range"
          value={value}
          className={clsx(
            "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
            "accent-pink-500",
            "[&::-webkit-slider-thumb]:appearance-none",
            "[&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:h-4",
            "[&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-pink-500",
            "[&::-webkit-slider-thumb]:cursor-pointer",
            "[&::-webkit-slider-thumb]:shadow-md",
            "[&::-moz-range-thumb]:w-4",
            "[&::-moz-range-thumb]:h-4",
            "[&::-moz-range-thumb]:rounded-full",
            "[&::-moz-range-thumb]:bg-pink-500",
            "[&::-moz-range-thumb]:cursor-pointer",
            "[&::-moz-range-thumb]:border-0",
            className
          )}
          {...props}
        />
        {(leftLabel || rightLabel) && (
          <div className="flex justify-between mt-1">
            <span className="text-xs text-gray-400">{leftLabel}</span>
            <span className="text-xs text-gray-400">{rightLabel}</span>
          </div>
        )}
      </div>
    );
  }
);

Slider.displayName = "Slider";
