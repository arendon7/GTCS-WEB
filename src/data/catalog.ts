export type CatalogOffer = {
  id: string;
  product: string;
  family: string;
  formula?: string;
  presentation: string;
  priceCop: number;
};

export const catalogOffers: CatalogOffer[] = [
  { id: "compost-40kg", product: "Wondergreen Compost", family: "Compost", presentation: "40 kg", priceCop: 20200 },
  { id: "2grow-s-40kg", product: "Wondergreen 2GROW", family: "2GROW", formula: "15-3-3", presentation: "40 kg", priceCop: 147400 },
  { id: "2balance-s-40kg", product: "Wondergreen 2BALANCE", family: "2BALANCE", formula: "7-7-7", presentation: "40 kg", priceCop: 147400 },
  { id: "2bloom-s-40kg", product: "Wondergreen 2BLOOM", family: "2BLOOM", formula: "3-8-3", presentation: "40 kg", priceCop: 115500 },
  { id: "2fruit-s-40kg", product: "Wondergreen 2FRUIT", family: "2FRUIT", formula: "3-3-8", presentation: "40 kg", priceCop: 121900 },
  { id: "2grow-l-1l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "1 L", priceCop: 17000 },
  { id: "2grow-l-375l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "3,75 L", priceCop: 39300 },
  { id: "2grow-l-20l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "20 L", priceCop: 169800 },
  { id: "2grow-l-200l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "200 L", priceCop: 1644600 },
  { id: "2grow-l-1000l", product: "Wondergreen 2GROW Líquido", family: "2GROW", formula: "100-20-20", presentation: "1000 L", priceCop: 6259900 },
  { id: "2balance-l-1l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "1 L", priceCop: 19100 },
  { id: "2balance-l-375l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "3,75 L", priceCop: 46700 },
  { id: "2balance-l-20l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "20 L", priceCop: 191000 },
  { id: "2balance-l-200l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "200 L", priceCop: 1909800 },
  { id: "2balance-l-1000l", product: "Wondergreen 2BALANCE Líquido", family: "2BALANCE", formula: "70-70-70", presentation: "1000 L", priceCop: 7214800 },
  { id: "2fruit-l-1l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "1 L", priceCop: 18000 },
  { id: "2fruit-l-375l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "3,75 L", priceCop: 44600 },
  { id: "2fruit-l-20l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "20 L", priceCop: 191000 },
  { id: "2fruit-l-200l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "200 L", priceCop: 1909800 },
  { id: "2fruit-l-1000l", product: "Wondergreen 2FRUIT Líquido", family: "2FRUIT", formula: "30-30-80", presentation: "1000 L", priceCop: 6896500 },
];
