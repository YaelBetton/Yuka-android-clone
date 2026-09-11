export const safe = (n?: number) => n ?? 0;
export const getScore = (product: any) => {
  // Calcul du score basé sur les éléments négatifs
  const negativePoints = 
    safe(product.nutriments.energy_100g) / 100 + // Énergie (kcal)
    safe(product.nutriments.fat_100g) * 2 + // Graisses
    safe(product.nutriments['saturated-fat_100g']) * 3 + // Graisses saturées
    safe(product.nutriments.sugars_100g) * 2 + // Sucres
    safe(product.nutriments.salt_100g) * 50; // Sel
  
  // Calcul des points positifs
  const positivePoints = 
    safe(product.nutriments.fiber_100g) * 2 + // Fibres
    safe(product.nutriments.proteins_100g) * 1.5; // Protéines
  
  // Score sur 100 (100 = excellent, 0 = mauvais)
  const rawScore = 100 - negativePoints + positivePoints;
  return Math.min(Math.max(Math.round(rawScore), 0), 100);
};
