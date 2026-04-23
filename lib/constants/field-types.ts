// Define os tipos de categoria que você usa no seu Select
export type CategoryType = "currency" | "weight" | "distance" | "liquid" | "numeric";

export const UNIT_TO_CATEGORY: Record<string, CategoryType> = {
  // Currency
  BRL: "currency", USD: "currency", EUR: "currency",
  // Weight
  kg: "weight", g: "weight",
  // Liquid
  ml: "liquid", l: "liquid",
  // Distance
  cm: "distance", m: "distance", km: "distance"
};