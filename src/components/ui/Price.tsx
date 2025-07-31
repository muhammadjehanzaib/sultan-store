import React from "react";
import Image from "next/image";

interface PriceProps {
  amount: number | null | undefined;
  locale?: "en" | "ar";
  className?: string;
}

/**
 * Price component that displays the Saudi Riyal symbol and formatted amount.
 * Supports both English (LTR) and Arabic (RTL) layouts.
 */
const Price: React.FC<PriceProps> = ({ amount, locale = "en", className }) => {
  // Handle null/undefined amounts
  if (amount == null || isNaN(amount)) {
    return (
      <span className={`inline-flex items-center gap-1 text-gray-400 ${className || ""}`}>
        <span>-</span>
      </span>
    );
  }

  // Format the amount according to locale
  const formatted = amount.toLocaleString(locale === "ar" ? "ar-SA" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Path to the SVG symbol
  const riyalSvgPath = "/icons/Saudi_Riyal_Symbo.svg";

  // Layout: symbol before (en) or after (ar)
  const isArabic = locale === "ar";


  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${isArabic ? "flex-row-reverse" : ""} ${className || ""}`.trim()}
      dir={isArabic ? "rtl" : "ltr"}
      aria-label={isArabic ? `${formatted} ريال سعودي` : `SAR ${formatted}`}
    >
      <Image
        src={riyalSvgPath}
        alt={isArabic ? "رمز الريال السعودي" : "Saudi Riyal symbol"}
        width={18}
        height={18}
        style={{ display: "inline-block" }}
        aria-hidden="true"
      />
      <span>{formatted}</span>
    </span>
  );
};

export default Price; 