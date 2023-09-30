export interface Currency {
  currency: string
  ticker: string
}

export const supportedCurrencies: Currency[] = [
  { currency: "Indonesian Rupiah", ticker: "IDR" },
  { currency: "Singaporean Dollars", ticker: "SGD" },
  { currency: "United States Dollars", ticker: "USD" },
]

export const supportedConversationLanguages: string[] = [
  "English",
  "Bahasa Indonesia",
]
