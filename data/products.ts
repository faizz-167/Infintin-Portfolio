import type { Product } from "./types";

export const products = [
  {
    slug: "fcu-double-shaft",
    name: "product.name",
    overview: "product.overview",
    status: "product.status",
    application: "product.application",
    // The questions an OEM asks first (PRD §4). Rows without a supplied value
    // stay in the table so the gap is visible and routes to engineering.
    specs: [
      { label: "Power range", value: "product.power-range" },
      { label: "Application", value: "product.application" },
      { label: "Speed", value: "product.speed" },
      { label: "Supply voltage", value: "product.voltage" },
      { label: "Dimensions", value: "product.dimensions" },
      { label: "Output shafts", value: "product.shaft" },
      { label: "Mounting", value: "product.mounting" },
      { label: "Noise", value: "product.noise" },
      { label: "Control", value: "product.controller" },
    ],
    features: [
      "product.noise",
      "product.supply",
      "product.retrofit",
      "product.vfd-compat",
      "product.iot",
      "product.rare-earth",
    ],
    controller: "product.controller",
    faq: [
      {
        question: "What stage of development is the motor at?",
        answer: "product.faq.status",
      },
      {
        question: "Will it fit my fan coil unit?",
        answer: "product.faq.fit",
      },
      {
        question: "Can it be customised?",
        answer: "product.faq.customisation",
      },
      {
        question: "How is it being tested?",
        answer: "product.faq.testing",
      },
      {
        question: "Is it available to order?",
        answer: "product.faq.supply",
      },
      {
        question: "How do we start an evaluation?",
        answer: "product.faq.evaluation",
      },
    ],
    modelRef: "fcu-double-shaft",
    posterRefs: ["hero", "elevation"],
    cta: {
      label: "Discuss technical fit",
      href: "/contact?type=oem-integration",
    },
  },
] as const satisfies readonly Product[];

/** Editorial stand-in while `product.name` is unapproved. */
export const PRODUCT_NAME_FALLBACK = "FCU motor";

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
