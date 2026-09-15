# NOTES.md — Journal de bord

**TP R5.A.07 — Automatisation de la chaîne de production (BUT3, IUT du Limousin)**
Projet : Yuka clone (React Native / Expo Router / TypeScript)
Outil expérimenté : **Stryker Mutator** (mutation testing)
Comparatifs : SonarQube, couverture Jest
Angle du rapport : *un taux de couverture élevé ne garantit pas des tests pertinents.*

---

## 1. État initial (avant outillage)

Relevé le 2026-09-11, sur la branche `main` au commit `300b282`.
La branche `main` est volontairement conservée comme référence « avant outillage » ;
tout l'outillage qualité est ajouté sur `feat/quality-tooling`.

### 1.1 Structure

Pas de dossier `src/` : arborescence Expo Router standard à la racine.

```
app/            écrans (expo-router)
  (tabs)/_layout.tsx, index.tsx, scanner.tsx, history.tsx
  _layout.tsx, modal.tsx, +not-found.tsx
components/     composants UI (9 + 4 dans ui/)
constants/      Colors.ts, Data.ts (seuils nutritionnels)
contexts/       HistoryContext.tsx
hooks/          useColorScheme(.web).ts, useThemeColor.ts
scripts/        reset-project.js
```

### 1.2 Tests existants

**Aucun.** Zéro fichier `*.test.*` / `*.spec.*` / `__tests__/`.
Aucune dépendance de test dans `package.json` : ni `jest`, ni `jest-expo`,
ni `@testing-library/react-native`, ni `react-test-renderer`.
Le seul script qualité est `npm run lint` (`expo lint`, ESLint 9 + `eslint-config-expo`).

### 1.3 Couverture initiale

**0 %** — mesure impossible en l'état, aucun runner de test n'est installé.
Point de départ idéal pour le rapport : on part de 0 et on construit
la démonstration couverture → mutation score.

### 1.4 Logique métier identifiée (cibles du mutation testing)

Le score nutritionnel est **calculé en local**, pas récupéré de l'API.
C'est la cible principale : une fonction arithmétique à seuils, pleine
d'opérateurs et de constantes — exactement ce que Stryker sait muter.

| Fonction | Emplacement | Nature | Intérêt mutation |
|---|---|---|---|
| `getScore` | `app/(tabs)/scanner.tsx:69-89` | pondérations + `Math.min/max` de clamp | **Très fort** |
| `safe` | `app/(tabs)/scanner.tsx:68` | `n ?? 0` | Fort (mutation du fallback) |
| `getScoreColor` | `app/(tabs)/index.tsx:83-100` | regex `/^[A-E]$/i`, `switch`, seuils 80/50 | **Très fort** |
| `getScoreColor` | `app/modal.tsx:67-71` | seuils 70/40 — **dupliqué, seuils différents** | Fort |
| `getTimeAgo` | `app/(tabs)/index.tsx:42-62` | bornes 1/60/24 min-h-j | **Très fort** |
| `formatDateHeader` | `app/(tabs)/index.tsx:20-40` | comparaison de dates normalisées | Fort |
| `groupedHistory` | `app/(tabs)/index.tsx:65-81` | filtre + `reduce` de groupement | Moyen |
| `BAD/GOOD_NUTRIMENTS` | `app/modal.tsx:55-65` | comparaisons `>` / `<` au seuil `DATA[key].limit` | **Très fort** |
| `addToHistory` | `contexts/HistoryContext.tsx:46-65` | dédoublonnage + `slice(0, 50)` | Fort |
| `saveItemToStorage` | `app/(tabs)/scanner.tsx:48-66` | `findIndex` → update vs `unshift` | Fort |

### 1.5 Points suspects (matière pour le rapport)

Ces défauts sont **conservés volontairement** : ils doivent être remontés par
SonarQube et/ou survivre à des tests naïfs pour illustrer le propos.

1. **Logique métier mélangée au JSX.** Toutes les fonctions ci-dessus sont
   déclarées *dans* le corps des composants. Aucune n'est exportée, aucune
   n'est testable unitairement en l'état → **extraction préalable obligatoire**
   avant de pouvoir lancer Stryker.
2. **`getScoreColor` dupliqué** avec des seuils incohérents : 80/50 dans
   `index.tsx`, 70/40 dans `modal.tsx`. Le même produit peut changer de couleur
   selon l'écran.
3. **`getScore` n'est pas le Nutri-Score.** Formule maison arbitraire, sans
   source ni test. Le vrai `nutriscore_grade` de l'API est stocké en parallèle
   dans l'historique → deux notations concurrentes affichées dans l'app.
4. **Clé de seuil erronée dans `constants/Data.ts:2`** : `proteine_100g`, alors
   que l'API Open Food Facts expose `proteins_100g`. La ligne « Protéines » ne
   s'affiche donc jamais. *Un test de couverture passerait sans rien voir.*
5. **`saturated-fat_100g` pondéré dans `getScore` mais absent de `DATA`** :
   compté dans le score, jamais affiché à l'utilisateur.
6. **Seuils `limit: 100` pour protéines et fibres** : jamais dépassables pour
   100 g de produit, donc systématiquement classés « points positifs ».
7. **`product.nutriments` déréférencé sans garde** (`app/modal.tsx:55`,
   `scanner.tsx:71`) → crash sur un produit sans données nutritionnelles.
8. **`any` généralisé** : `saveItemToStorage(product: any)`, `DATA`,
   `groupedHistory` — `strict: true` dans `tsconfig.json` est contourné.
9. **`console.log` de données produit** laissés en production
   (`scanner.tsx:92,97`, `modal.tsx:53`).
10. **Code mort / incohérence de nommage** : `app/(tabs)/history.tsx` exporte
    `SettingsScreen` et affiche un écran Paramètres entièrement statique ;
    `MOCKED_BARCODE` et son bouton « Scanner » de debug sont dans le build.

### 1.6 Secrets en dur

**Aucun trouvé.** Recherche sur `app/`, `components/`, `contexts/`, `hooks/`,
`constants/`, `scripts/`, `app.json` (motifs : `api_key`, `token`, `secret`,
`password`, `bearer`, `AIza`, `sk-`, `ghp_`, JWT).
Seule constante externe : `API_URL` (`scanner.tsx:9`), endpoint public
Open Food Facts sans authentification. Aucun `.env` versionné.

### 1.7 Configuration

- Lockfile : **`package-lock.json` présent et versionné** (npm). OK.
- `.gitignore` complété au commit `300b282`.
- Réserve : `.expo/` est ignoré mais `.expo/README.md`, `.expo/devices.json` et
  `.expo/types/router.d.ts` restent suivis (antérieurs à la règle).
  Non corrigé — hors périmètre de cette séance.

### 1.8 Couverture de référence — `lib/score.ts`

Relevé le 2026-09-15 sur `feat/quality-tooling`, après extraction de `getScore`
vers `lib/` (`d9c665c`) et écriture de 6 tests Jest (`lib/score.test.ts`).
Commande : `npm run test:coverage` (périmètre `collectCoverageFrom: lib/**/*.ts`).

| Fichier | % Stmts | % Branch | % Funcs | % Lines |
|---|---|---|---|---|
| `score.ts` | 100 | 100 | 100 | 100 |

6 tests / 6 passent : produit sain, gras-sucré-salé, moyen, clamp à 0,
clamp à 100, nutriment manquant (`salt_100g` absent).

**Valeur de référence : 100 % partout.** Pourtant aucun test ne couvre un
produit **sans objet `nutriments`** (défaut n°7 → `TypeError`). Le trou est
volontaire : Jest le déclare couvert, Stryker doit le révéler.

### 1.9 Mutation score de référence — `lib/score.ts`

Relevé le 2026-09-15, Stryker (`@stryker-mutator/core` + `jest-runner`),
`coverageAnalysis: perTest`, `mutate: lib/score.ts`. Commande : `npm run test:mutation`.
Durée : 13 s. Rapport : `reports/mutation/index.html`.

| Métrique | Valeur |
|---|---|
| Couverture Jest (lignes / branches) | **100 % / 100 %** |
| **Mutation score** | **80,00 %** |
| Mutants générés | 20 |
| Tués / survivants / no coverage / timeout | 16 / **4** / 0 / 0 |

**Écart couverture → mutation : 20 points.** Un mutant sur cinq modifie le
comportement de `getScore` sans qu'aucun test ne s'en aperçoive.

#### Survivants

| # | Ligne | Mutation | Pourquoi aucun test ne l'a vue |
|---|---|---|---|
| 1 | `score.ts:7` | `saturated-fat * 3` → `/ 3` | Produit gras : 3 g × 3 = 9 pts devient 1 pt → score 29 → **37**, toujours `< 40`. Les autres produits ont ≤ 1 g de graisses saturées, écart de ≤ 3 pts absorbé par les fourchettes. |
| 2 | `score.ts:7` | `'saturated-fat_100g'` → `""` | La clé ne matche plus rien → `safe(undefined)` = 0, les graisses saturées disparaissent du score. Produit gras : 29 → **38**, toujours `< 40`. **Un nutriment entier peut être retiré du calcul sans casser un test.** |
| 3 | `score.ts:13` | `fiber * 2` → `/ 2` | Fibres faibles dans les produits testés (0,5 à 2 g) : écart de 0,75 à 3 pts. Produit « extrême inverse » : 175 au lieu de 220, **le clamp à 100 masque la différence**. |
| 4 | `score.ts:14` | `proteins * 1.5` → `/ 1.5` | Même mécanisme : moyen 67 → 62 (dans 40–80), manquant 82 → 78 (dans 70–100), extrême inverse toujours clampé à 100. |

Constats :
- Les 4 survivants sont des **pondérations** : les assertions en
  `toBeGreaterThan` / `toBeLessThan` vérifient une tendance, pas une formule.
- Les tests de clamp (`toBe(0)`, `toBe(100)`) utilisent des valeurs si extrêmes
  qu'ils **saturent** : n'importe quel coefficient donne le même résultat.
  Le test clamp-0 et le test « moyen » ne tuent **aucun** mutant en propre
  (Stryker : `covered 19`, `killed 0`).
- Le test « gras/sucré/salé » tue 10 mutants à lui seul, mais laisse passer
  les survivants 1 et 2 à 2–3 points près de son seuil de 40.

#### Le trou `product.nutriments` absent n'apparaît pas

Attendu en « No coverage », **il n'y est pas : 0 mutant non couvert.**
Stryker mute le code **existant** (opérateurs, littéraux, conditions) ; il ne
peut pas inventer une garde qui n'a jamais été écrite. `getScore` ne contient
ni `?.` ni `if (!product.nutriments)` : il n'y a rien à muter, donc rien à signaler.

**Pour le rapport** : ni la couverture (100 %) ni le mutation score (80 %)
ne détectent le crash sur un produit sans données nutritionnelles. Le mutation
testing mesure la qualité des tests *vis-à-vis du code écrit*, pas l'absence
de code (cas limites non gérés). Ce défaut relève plutôt de l'analyse statique
(SonarQube, TypeScript strict sans `any`) ou de tests écrits à partir de la
spécification plutôt que de l'implémentation.

---

## 2. Gabarit de séance

> Copier ce bloc pour chaque séance. Le plus récent en haut de la section 3.

```markdown
### Séance N — AAAA-MM-JJ — <titre>

**Objectif**

**Fait**
-

**Problèmes rencontrés**
| Problème | Cause | Résolution / contournement |
|---|---|---|

**Chiffres**
| Métrique | Avant | Après |
|---|---|---|
| Couverture lignes (Jest) | | |
| Couverture branches (Jest) | | |
| Mutation score (Stryker) | | |
| Mutants tués / survivants | | |
| Issues SonarQube | | |

**Pour le rapport**
-

**Temps passé** : Xh
```

---

## 3. Séances

### Séance 1 — 2026-09-11 — Préparation du dépôt

**Objectif** — Mettre le dépôt en état avant d'installer le moindre outil, et
figer un état de référence « avant outillage ».

**Fait**
- État Git vérifié : dépôt existant, branche `main`, un seul fichier modifié
  (`.gitignore`).
- `.gitignore` complété (build, env, sorties d'outils qualité) et commité
  sur `main` (`300b282`).
- Recherche de secrets en dur : aucun (cf. 1.6).
- Branche `feat/quality-tooling` créée depuis `main`.
- Ce journal créé.
- Lockfile vérifié : `package-lock.json` présent et versionné.

**Problèmes rencontrés**
| Problème | Cause | Résolution / contournement |
|---|---|---|
| Pas de dossier `src/` | Convention Expo Router : code à la racine | Analyse portée sur `app/`, `components/`, `contexts/`, `hooks/`, `constants/` |
| Aucune fonction métier exportée | Tout est déclaré dans le corps des composants | À traiter en séance 2 : extraction vers `lib/` avant toute config Stryker |

**Chiffres**
| Métrique | Avant | Après |
|---|---|---|
| Couverture lignes (Jest) | n/a (pas de Jest) | n/a |
| Mutation score (Stryker) | n/a | n/a |
| Fichiers de test | 0 | 0 |

**Pour le rapport**
- Le projet part de **0 test et 0 % de couverture** : la progression
  couverture → mutation score sera lisible de bout en bout.
- La logique métier existe bien en local (`getScore` & co.) : le mutation
  testing a un objet réel, ce n'était pas acquis d'avance.
- Le défaut n°4 (clé `proteine_100g` au lieu de `proteins_100g`) est
  **l'exemple canonique du rapport** : une branche morte qu'un test de
  couverture traverse sans jamais la valider.

**Temps passé** : —

---

## 4. Backlog

- [ ] Extraire la logique métier des composants vers `lib/` (fonctions pures exportées).
- [ ] Installer et configurer `jest-expo` + `@testing-library/react-native`.
- [ ] Écrire une première passe de tests « naïfs » (couverture haute, assertions faibles)
      — c'est le contre-exemple du rapport, à conserver tel quel.
- [ ] Installer Stryker (`@stryker-mutator/core` + runner Jest), `stryker.conf.json`.
- [ ] Configurer SonarQube (`sonar-project.properties`).
- [ ] Comparer les trois métriques sur le même périmètre.
- [ ] Écrire les « vrais » tests et mesurer le gain en mutation score.

## Contrainte d'infrastructure
- Pool d'agents Microsoft indisponible sur projet privé (compte étudiant)
- Options : formulaire de demande (2-3j), agent self-hosted, ou projet public
- Choix : bascule en public — aucun secret dans le code, débloque aussi SonarCloud free