import { getScore } from '@/lib/score';

describe('getScore', () => {
  it('retourne un score élevé pour un produit sain', () => {
    const product = {
      nutriments: {
        energy_100g: 150,
        fat_100g: 0.5,
        'saturated-fat_100g': 0.1,
        sugars_100g: 2,
        salt_100g: 0.05,
        proteins_100g: 1,
        fiber_100g: 0.5,
      },
    };
    expect(getScore(product)).toBeGreaterThan(70);
  });

  it('retourne un score bas pour un produit gras, sucré et salé', () => {
    const product = {
      nutriments: {
        energy_100g: 500,
        fat_100g: 10,
        'saturated-fat_100g': 3,
        sugars_100g: 10,
        salt_100g: 0.5,
        proteins_100g: 4,
        fiber_100g: 1,
      },
    };
    expect(getScore(product)).toBeLessThan(40);
  });

  it('retourne un score intermédiaire pour un produit moyen', () => {
    const product = {
      nutriments: {
        energy_100g: 240,
        fat_100g: 5,
        'saturated-fat_100g': 1,
        sugars_100g: 8,
        salt_100g: 0.3,
        proteins_100g: 6,
        fiber_100g: 2,
      },
    };
    const score = getScore(product);
    expect(score).toBeGreaterThan(40);
    expect(score).toBeLessThan(80);
  });

  it('borne le score à 0 pour un produit extrême', () => {
    const product = {
      nutriments: {
        energy_100g: 2000,
        fat_100g: 50,
        'saturated-fat_100g': 20,
        sugars_100g: 60,
        salt_100g: 2,
        proteins_100g: 5,
        fiber_100g: 0,
      },
    };
    expect(getScore(product)).toBe(0);
  });

  it('borne le score à 100 pour un produit extrême inverse', () => {
    const product = {
      nutriments: {
        energy_100g: 0,
        fat_100g: 0,
        'saturated-fat_100g': 0,
        sugars_100g: 0,
        salt_100g: 0,
        proteins_100g: 40,
        fiber_100g: 30,
      },
    };
    expect(getScore(product)).toBe(100);
  });

  it('calcule un score quand un nutriment est manquant', () => {
    const product = {
      nutriments: {
        energy_100g: 240,
        fat_100g: 5,
        'saturated-fat_100g': 1,
        sugars_100g: 8,
        proteins_100g: 6,
        fiber_100g: 2,
      },
    };
    const score = getScore(product);
    expect(score).toBeGreaterThan(70);
    expect(score).toBeLessThan(100);
  });
});
