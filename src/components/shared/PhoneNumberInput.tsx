"use client";

import {
  getCountries,
  getCountryCallingCode,
  type Country,
} from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import es from "react-phone-number-input/locale/es.json";
import { useState } from "react";

interface PhoneNumberInputProps {
  id: string;
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const countryName = (country: Country) => es[country] ?? country;

const countryLabel = (country: Country) =>
  `${countryName(country)} (+${getCountryCallingCode(country)})`;

// Lista ordenada alfabéticamente por nombre (se calcula una sola vez)
const sortedCountries = [...getCountries()].sort((a, b) =>
  countryName(a).localeCompare(countryName(b), "es"),
);

// Ordenada por longitud del código para detectar bien el país (ej. +1 vs +1242)
const countriesByCodeLength = [...getCountries()].sort(
  (first, second) =>
    getCountryCallingCode(second).length - getCountryCallingCode(first).length,
);

const getCountryFromPhone = (phone: string) =>
  countriesByCodeLength.find((country) =>
    phone.startsWith(`+${getCountryCallingCode(country)}`),
  );

const getPhoneDigits = (phone: string, country: Country) =>
  phone.replace(`+${getCountryCallingCode(country)}`, "").replace(/\D/g, "");

export const PhoneNumberInput = ({
  id,
  value = "",
  onChange,
  disabled = false,
  placeholder = "7689 8907",
}: PhoneNumberInputProps) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    getCountryFromPhone(value) ?? "BO",
  );
  const Flag = flags[selectedCountry];

  const updateValue = (country: Country, digits: string) => {
    onChange(digits ? `+${getCountryCallingCode(country)}${digits}` : "");
  };

  return (
    <div className="flex h-9 min-w-0 w-full items-center overflow-hidden rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs md:text-sm">
      <div className="relative h-6 w-8 shrink-0">
        {Flag && (
          <span className="absolute inset-0 [&>svg]:h-full [&>svg]:w-full [&>svg]:object-cover">
            <Flag title={countryName(selectedCountry)} />
          </span>
        )}
        <select
          aria-label="Código de país"
          value={selectedCountry}
          disabled={disabled}
          onChange={(event) => {
            const country = event.target.value as Country;
            setSelectedCountry(country);
            updateValue(country, getPhoneDigits(value, selectedCountry));
          }}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        >
          {sortedCountries.map((country) => (
            <option key={country} value={country}>
              {countryLabel(country)}
            </option>
          ))}
        </select>
      </div>
      <span className="ml-2 shrink-0 text-muted-foreground" aria-hidden>
        +{getCountryCallingCode(selectedCountry)}
      </span>
      <input
        id={id}
        value={getPhoneDigits(value, selectedCountry)}
        onChange={(event) =>
          updateValue(selectedCountry, event.target.value.replace(/\D/g, ""))
        }
        placeholder={placeholder}
        inputMode="numeric"
        disabled={disabled}
        className="ml-2 min-w-0 flex-1 border-0 bg-transparent p-0 outline-none ring-0 placeholder:text-muted-foreground focus:border-0 focus:outline-none focus:ring-0"
      />
    </div>
  );
};
