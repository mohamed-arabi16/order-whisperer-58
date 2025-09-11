import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useTranslation } from "@/hooks/useTranslation";

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
  disabled?: boolean;
}

const CURRENCIES = [
  { code: 'SYP', name: 'Syrian Pound', symbol: 'ل.س' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'د.أ' },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'ل.ل' },
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { t, isRTL } = useTranslation();

  return (
    <div className="space-y-2">
      <Label htmlFor="currency-select">{t('restaurant.profile.currency')}</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="currency-select">
          <SelectValue placeholder={t('restaurant.profile.selectCurrency')} />
        </SelectTrigger>
        <SelectContent>
          {CURRENCIES.map((currency) => (
            <SelectItem key={currency.code} value={currency.code}>
              <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span className="font-mono text-sm">{currency.symbol}</span>
                <span>{currency.name}</span>
                <span className="text-muted-foreground">({currency.code})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export const getCurrencySymbol = (currencyCode: string): string => {
  const currency = CURRENCIES.find(c => c.code === currencyCode);
  return currency?.symbol || 'ل.س';
};

export const formatPrice = (price: number, currencyCode: string = 'SYP'): string => {
  const symbol = getCurrencySymbol(currencyCode);
  return `${price.toLocaleString()} ${symbol}`;
};