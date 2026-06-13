import React from "react";

/**
 * A sleek spinner component.
 * @param {string} size - size of spinner ('sm', 'md', 'lg')
 * @param {string} color - theme color ('accent', 'secondary', 'white')
 */
export const LoadingSpinner = ({ size = "md", color = "accent" }) => {
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-4",
  };

  const colorClasses = {
    accent: "border-stellar-accent/20 border-t-stellar-accent",
    secondary: "border-stellar-secondary/20 border-t-stellar-secondary",
    white: "border-white/20 border-t-white",
  };

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size] || sizeClasses.md} ${
        colorClasses[color] || colorClasses.accent
      }`}
    />
  );
};

/**
 * Loading skeleton for balance numbers to prevent layout shift.
 */
export const BalanceSkeleton = () => {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-4 bg-white/10 rounded w-20"></div>
      <div className="h-12 bg-white/10 rounded w-44"></div>
    </div>
  );
};

/**
 * Loading skeleton representing a generic UI card section.
 */
export const CardSkeleton = () => {
  return (
    <div className="animate-pulse space-y-4 p-6 bg-stellar-card/50 backdrop-blur-md rounded-2xl border border-white/5">
      <div className="h-5 bg-white/10 rounded w-1/3"></div>
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
      </div>
      <div className="h-10 bg-white/10 rounded w-full mt-4"></div>
    </div>
  );
};
