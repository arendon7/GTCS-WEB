# Graph Report - GTCS-WEB  (2026-08-31)

## Corpus Check
- Large corpus: 303 files · ~1,050,700 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 543 nodes · 622 edges · 75 communities (25 shown, 32 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 52
- Community 53
- Community 54
- Community 55
- Community 73

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `site` - 13 edges
3. `BreadcrumbJsonLd()` - 10 edges
4. `scripts` - 8 edges
5. `yarumalClaims` - 8 edges
6. `ArticleJsonLd()` - 6 edges
7. `JsonLd()` - 6 edges
8. `include` - 6 edges
9. `ProductVisual()` - 5 edges
10. `crops` - 5 edges

## Surprising Connections (you probably didn't know these)
- `generateMetadata()` --calls--> `getCrop()`  [EXTRACTED]
  src/app/wondergreen/cultivos/[slug]/page.tsx → src/data/crops.ts
- `CropDetailPage()` --calls--> `getCrop()`  [EXTRACTED]
  src/app/wondergreen/cultivos/[slug]/page.tsx → src/data/crops.ts
- `generateMetadata()` --calls--> `getProduct()`  [EXTRACTED]
  src/app/wondergreen/productos/[slug]/page.tsx → src/data/products.ts
- `ProductPage()` --calls--> `getProduct()`  [EXTRACTED]
  src/app/wondergreen/productos/[slug]/page.tsx → src/data/products.ts
- `ProductVisual()` --calls--> `canRenderPublicPackshot()`  [EXTRACTED]
  src/components/product-visual.tsx → src/data/product-media.ts

## Import Cycles
- None detected.

## Communities (75 total, 32 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (27): metadata, evidencePrinciples, gallery, metadata, gallery, metadata, responsibilities, systemSteps (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (25): evidence, metadata, segments, valueSteps, decisionAxes, metadata, moments, pilotSteps (+17 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): @axe-core/playwright, next, dependencies, next, react, react-dom, devDependencies, @axe-core/playwright (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (18): doNot, equipment, metadata, dynamic, stages, metadata, CropDetailPage(), generateMetadata() (+10 more)

### Community 4 - "Community 4"
Cohesion: 0.07
Nodes (27): dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts (+19 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (19): cop(), generateMetadata(), ProductPage(), cop(), FAMILY_TAGS, ProductCard(), ProductVisual(), ProductVisualProps (+11 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (15): metadata, AgroEnterpriseRoi(), CropDeficiencyViewer(), deficiencies, Deficiency, CropLibraryGrid(), cropList, comparisonRows (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (13): architecture, dataChain, metadata, roles, equipment, inventory, logEntries, ModuleId (+5 more)

### Community 8 - "Community 8"
Cohesion: 0.17
Nodes (11): governanceSteps, metadata, EsgCalculator(), formatCurrency(), formatNumber(), ImpactCalculator(), ProfileConfig, PROFILES (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.19
Nodes (9): metadata, quickRules, contexts, metadata, route, ArticleJsonLd(), ArticleJsonLdProps, deficiencyCrops (+1 more)

### Community 10 - "Community 10"
Cohesion: 0.17
Nodes (10): errors, htmlFiles, manifestFile, normalizePathname(), pagePathFromFile(), robotsFile, root, sitemapFile (+2 more)

### Community 11 - "Community 11"
Cohesion: 0.17
Nodes (10): decisionSteps, metadata, outsideCatalog, productRows, DeficiencyCrop, DeficiencyRow, portfolioFamilies, bioinputs (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.18
Nodes (9): metadata, principles, teamDisciplines, timelineMilestones, GalleryEvidence(), plantImages, routeImages, metrics (+1 more)

### Community 13 - "Community 13"
Cohesion: 0.24
Nodes (8): metadata, cop(), parseWeightKg(), PresetPackage, PRESETS, QuoteBuilder(), CatalogOffer, catalogOffers

### Community 14 - "Community 14"
Cohesion: 0.20
Nodes (8): domesticDeficiencies, metadata, spaceKits, stages, CasaJardinInteractive(), diagnosticMatrix, DiagnosticResult, potSizes

### Community 15 - "Community 15"
Cohesion: 0.22
Nodes (7): metadata, organizationSchema, viewport, websiteSchema, FloatingActionBar(), footerGroups, SiteFooter()

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (5): categoryProcess, clientInputs, BreadcrumbItem, JsonLd(), JsonLdValue

### Community 17 - "Community 17"
Cohesion: 0.28
Nodes (6): SiteHeader(), searchIndex, SearchItem, UniversalSearchModal(), NavItem, primaryNav

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (5): consolidation, gallery, metadata, operatingRecords, systemSteps

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (5): anaerobicStages, delivery, metadata, outputs, principles

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (5): needs, ProfileItem, profiles, RouteResult, routes

### Community 21 - "Community 21"
Cohesion: 0.33
Nodes (4): categories, Category, LibraryResource, libraryResources

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (4): metadata, stages, BreadcrumbJsonLd(), homeKitFamilies

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (3): outDir, replacements, textExtensions

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (3): fieldQuestions, metadata, system

## Knowledge Gaps
- **246 isolated node(s):** `nextConfig`, `name`, `version`, `private`, `dev` (+241 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 352 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **32 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `yarumalClaims` connect `Community 0` to `Community 8`, `Community 1`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `site` connect `Community 9` to `Community 3`, `Community 5`, `Community 11`, `Community 13`, `Community 15`, `Community 16`, `Community 17`, `Community 22`, `Community 24`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Why does `BreadcrumbJsonLd()` connect `Community 22` to `Community 3`, `Community 5`, `Community 9`, `Community 11`, `Community 16`, `Community 24`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `nextConfig`, `name`, `version` to the rest of the system?**
  _246 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06097560975609756 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06722689075630252 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.0625 - nodes in this community are weakly interconnected._