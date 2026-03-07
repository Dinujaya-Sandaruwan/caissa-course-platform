import React, { useState, useEffect } from "react";

// Popular country codes for datalist (optional helper)
const COUNTRY_CODES = [
  { code: "+94", name: "Sri Lanka" },
  { code: "+1", name: "US/Canada" },
  { code: "+44", name: "UK" },
  { code: "+61", name: "Australia" },
  { code: "+91", name: "India" },
  { code: "+971", name: "UAE" },
  { code: "+65", name: "Singapore" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export default function PhoneInput({
  value,
  onChange,
  className = "",
  placeholder = "XX XXX XXXX",
}: PhoneInputProps) {
  // Try to extract existing country code from value, defaulting to +94
  const [countryCode, setCountryCode] = useState("+94");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    // Basic parser to split value into code and number when component receives a new value prop
    if (value) {
      let foundCode = "+94";
      let numberPart = value;

      // Check if value starts with any known country code
      for (const country of COUNTRY_CODES) {
        if (value.startsWith(country.code)) {
          foundCode = country.code;
          numberPart = value.slice(country.code.length).trim();
          break;
        }
      }

      setCountryCode(foundCode);
      setPhoneNumber(numberPart);
    } else {
      setPhoneNumber("");
    }
  }, [value]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const validNumber = e.target.value.replace(/\D/g, "");
    setPhoneNumber(validNumber);
    onChange(`${countryCode}${validNumber}`);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure it always starts with + and only contains digits after
    let newCode = e.target.value;
    if (!newCode.startsWith("+")) {
      newCode = "+" + newCode.replace(/\D/g, "");
    } else {
      newCode = "+" + newCode.slice(1).replace(/\D/g, "");
    }

    // Limit length to something reasonable like +1234
    if (newCode.length > 5) return;

    setCountryCode(newCode);
    if (phoneNumber) {
      onChange(`${newCode}${phoneNumber}`);
    } else {
      onChange(newCode);
    }
  };

  return (
    <div
      className={`flex items-stretch bg-white border border-gray-200 shadow-sm rounded-xl focus-within:ring-4 focus-within:ring-red-500/10 focus-within:border-red-500 transition-all overflow-hidden ${className}`}
    >
      <div className="relative border-r border-gray-200 bg-slate-50 flex items-center shrink-0 w-[80px]">
        <input
          type="text"
          value={countryCode}
          onChange={handleCodeChange}
          placeholder="+94"
          className="w-full bg-transparent px-3 py-3.5 text-gray-700 font-bold text-sm focus:outline-none text-center"
        />
      </div>
      <input
        type="tel"
        placeholder={placeholder}
        value={phoneNumber}
        onChange={handleNumberChange}
        className="w-full px-4 py-3.5 border-none text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-0 bg-transparent min-w-0"
      />
    </div>
  );
}
