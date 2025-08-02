import React from "react";
import Image from "next/image";

interface PriceProps {
  amount: number | null | undefined;
  locale?: "en" | "ar";
  className?: string;
  taxLabelType?: "excluded" | "included" | null;
}

const Price: React.FC<PriceProps> = ({
  amount,
  locale = "en",
  className,
  taxLabelType = null,
}) => {
  if (amount == null || isNaN(amount)) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-gray-400 ${
          className || ""
        }`}
      >
        <span>-</span>
      </span>
    );
  }

  const isArabic = locale === "ar";
  const formatted = amount.toLocaleString(isArabic ? "ar-SA" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const taxLabelText =
    taxLabelType === "included"
      ? isArabic
        ? "شامل الضريبة (٪١٥)"
        : "Included VAT 15%"
      : taxLabelType === "excluded"
      ? isArabic
        ? "غير شامل الضريبة"
        : "Excluded VAT"
      : null;

  const TaxLabel = taxLabelText ? (
    <span
      className={`text-xs ${
        taxLabelType === "included"
          ? "text-green-700 border-green-500 bg-green-50"
          : "text-purple-700 border-purple-500 bg-purple-50"
      } border px-2 py-0.5 rounded-full`}
    >
      {taxLabelText}
    </span>
  ) : null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold ${
        isArabic ? "flex-row-reverse" : ""
      } ${className || ""}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {isArabic && TaxLabel}
      <Image
        src="/icons/Saudi_Riyal_Symbo.svg"
        alt={isArabic ? "رمز الريال السعودي" : "Saudi Riyal symbol"}
        width={18}
        height={18}
        aria-hidden="true"
      />
      <span>{formatted}</span>
      {!isArabic && TaxLabel}
    </span>
  );
};

export default Price;
