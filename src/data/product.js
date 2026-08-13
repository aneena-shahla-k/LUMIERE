import img1 from "../images/daily.jpg";
import img2 from "../images/serum.jpg";
import img3 from "../images/serum2.jpg";
import img4 from "../images/cleanse.jpg";
import img5 from "../images/barriercream.jpg";
import img6 from "../images/milky.jpg";
import img7 from "../images/360.jpg";
import img8 from "../images/serum2.jpg";
import serumFront from "../images/see.jpg";
import serumAngle from "../images/see1.jpg";
import serumSide from "../images/see2.jpg";
import serumBack from "../images/see.jpg";

export const PRODUCTS = [
  {
    id: 1,
    name: "Lumière Radiance Serum",
    category: "Serum",
    price: 68,
    rating: 4.9,
    reviews: 328,

    tagline: "Vitamin C + Niacinamide brightening concentrate",

    description:
      "A featherweight, fast-absorbing concentrate powered by stabilised vitamin C and niacinamide. Designed to visibly brighten dull skin, improve uneven tone and support a healthy-looking skin barrier.",

    skinTypes: ["Normal", "Dry", "Combination"],
    concerns: ["Dullness", "Uneven Tone"],

    image: img3,
    images: [
    { src: img3, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: true,
    bestseller: true,

    badges: ["Bestseller", "Cruelty-Free", "Vegan"],

    colorway: "#b98a52",

    sizes: [
      {
        label: "15 ml",
        sub: "Travel",
        price: 38,
      },
      {
        label: "30 ml",
        sub: "Full Size",
        price: 68,
        default: true,
      },
      {
        label: "50 ml",
        sub: "Value",
        price: 98,
        save: "Save 12%",
      },
    ],

    highlights: [
      "Visibly brightens and evens tone",
      "Fragrance-free and suitable for sensitive skin",
      "Lightweight texture layers beautifully under SPF",
      "Precision glass dropper for low-waste application",
    ],

    keyIngredients: [
      {
        name: "15% Vitamin C",
        note: "Brightens and protects against free radicals",
      },
      {
        name: "5% Niacinamide",
        note: "Refines texture and calms visible redness",
      },
      {
        name: "Sodium Hyaluronate",
        note: "Provides multi-weight hydration",
      },
      {
        name: "Ferulic Acid",
        note: "Supports antioxidant stability",
      },
    ],

    fullIngredients:
      "Aqua, Ascorbic Acid, Propanediol, Niacinamide, Glycerin, Sodium Hyaluronate, Ferulic Acid, Panthenol, Tocopherol, Sodium Hydroxide, Xanthan Gum, Citric Acid, Sodium Benzoate, Potassium Sorbate.",

    howToUse: [
      {
        title: "Cleanse",
        body: "Start with a clean, dry face morning or night.",
      },
      {
        title: "Dispense",
        body: "Apply 3–4 drops to your fingertips using the glass dropper.",
      },
      {
        title: "Press in",
        body: "Warm between your palms and gently press into the face and neck.",
      },
      {
        title: "Follow up",
        body: "Layer moisturiser over the top and SPF during the daytime.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 78 },
      { star: 4, pct: 15 },
      { star: 3, pct: 5 },
      { star: 2, pct: 1 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Priya M.",
        verified: true,
        rating: 5,
        date: "3 weeks ago",
        title: "Genuinely changed my skin",
        body:
          "Dullness is gone within a month. It layers beautifully under my moisturiser and doesn't pill under SPF.",
      },
      {
        name: "Alex T.",
        verified: true,
        rating: 5,
        date: "1 month ago",
        title: "Gentle but effective",
        body:
          "I have sensitive skin and most vitamin C serums sting. This one didn't. Texture is silky, not sticky.",
      },
      {
        name: "Sana K.",
        verified: true,
        rating: 4,
        date: "2 months ago",
        title: "Great, just wish it was bigger",
        body:
          "Works exactly as described. The 30ml goes fast with nightly use. Considering the 50ml next time.",
      },
    ],
  },

  {
    id: 2,
    name: "Velour Barrier Cream",
    category: "Moisturizer",
    price: 74,
    rating: 4.8,
    reviews: 216,

    tagline: "Rich barrier-support cream for deeply comforted skin",

    description:
      "A luxurious barrier cream designed to replenish moisture and leave dry, stressed skin feeling soft, balanced and comforted without a heavy finish.",

    skinTypes: ["Dry", "Normal", "Sensitive"],
    concerns: ["Dryness", "Barrier"],

    image: img5,
    images: [
    { src: img5, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: true,
    bestseller: false,

    badges: ["Barrier Care", "Vegan", "Cruelty-Free"],

    colorway: "#c9b79a",

    sizes: [
      {
        label: "30 ml",
        sub: "Travel",
        price: 42,
      },
      {
        label: "50 ml",
        sub: "Full Size",
        price: 74,
        default: true,
      },
    ],

    highlights: [
      "Deeply replenishes dry skin",
      "Supports a healthy-looking skin barrier",
      "Comforting cream texture without heavy residue",
      "Ideal for dry and sensitive skin",
    ],

    keyIngredients: [
      {
        name: "Ceramides",
        note: "Help support the skin's moisture barrier",
      },
      {
        name: "Squalane",
        note: "Softens and helps reduce moisture loss",
      },
      {
        name: "Panthenol",
        note: "Helps comfort and hydrate stressed skin",
      },
      {
        name: "Shea Butter",
        note: "Provides rich, nourishing emollience",
      },
    ],

    fullIngredients:
      "Aqua, Glycerin, Squalane, Butyrospermum Parkii Butter, Cetearyl Alcohol, Panthenol, Ceramide NP, Ceramide AP, Cholesterol, Sodium Hyaluronate, Tocopherol, Xanthan Gum, Citric Acid, Sodium Benzoate.",

    howToUse: [
      {
        title: "Cleanse",
        body: "Begin with freshly cleansed skin.",
      },
      {
        title: "Apply",
        body: "Take a small amount and warm it between your fingertips.",
      },
      {
        title: "Massage",
        body: "Gently massage over the face and neck.",
      },
      {
        title: "Layer",
        body: "Use morning or evening as the final moisturising step.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 74 },
      { star: 4, pct: 19 },
      { star: 3, pct: 5 },
      { star: 2, pct: 1 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Maya R.",
        verified: true,
        rating: 5,
        date: "2 weeks ago",
        title: "Beautiful texture",
        body:
          "My skin feels incredibly soft after using this. Rich but not greasy.",
      },
      {
        name: "Nora P.",
        verified: true,
        rating: 5,
        date: "1 month ago",
        title: "Perfect for winter",
        body:
          "This has become my night-time moisturiser. My skin feels much more comfortable.",
      },
    ],
  },

  {
    id: 3,
    name: "Aurelia Daily Shield SPF 50",
    category: "Sunscreen",
    price: 52,
    rating: 4.9,
    reviews: 441,

    tagline: "Invisible daily UV protection with a lightweight finish",

    description:
      "A lightweight daily sunscreen designed to provide high protection while sitting comfortably under makeup and skincare.",

    skinTypes: ["All Skin Types"],
    concerns: ["Sensitivity", "Fine Lines"],

    image: img4,
    images: [
    { src: img4, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: true,
    bestseller: true,

    badges: ["Bestseller", "SPF 50", "Vegan"],

    colorway: "#dcd3c2",

    sizes: [
      {
        label: "40 ml",
        sub: "Full Size",
        price: 52,
        default: true,
      },
    ],

    highlights: [
      "High SPF 50 daily protection",
      "Lightweight finish",
      "Designed to layer under makeup",
      "Suitable for everyday use",
    ],

    keyIngredients: [
      {
        name: "Broad Spectrum Filters",
        note: "Help protect against UVA and UVB exposure",
      },
      {
        name: "Vitamin E",
        note: "Provides antioxidant support",
      },
      {
        name: "Glycerin",
        note: "Helps maintain comfortable hydration",
      },
      {
        name: "Panthenol",
        note: "Helps condition the skin",
      },
    ],

    fullIngredients:
      "Aqua, Glycerin, UV Filters, Tocopherol, Panthenol, Propanediol, Cetearyl Alcohol, Sodium Hyaluronate, Xanthan Gum, Preservatives.",

    howToUse: [
      {
        title: "Apply generously",
        body: "Apply generously to face and neck as the final skincare step.",
      },
      {
        title: "Use daily",
        body: "Apply every morning, even on cloudy days.",
      },
      {
        title: "Reapply",
        body: "Reapply throughout the day when exposed to sunlight.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 83 },
      { star: 4, pct: 12 },
      { star: 3, pct: 3 },
      { star: 2, pct: 1 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Aisha K.",
        verified: true,
        rating: 5,
        date: "1 week ago",
        title: "No white cast",
        body:
          "Very comfortable sunscreen and works beautifully under makeup.",
      },
      {
        name: "Emma L.",
        verified: true,
        rating: 5,
        date: "3 weeks ago",
        title: "My everyday SPF",
        body:
          "Lightweight and easy to apply every morning.",
      },
    ],
  },

  {
    id: 4,
    name: "Silk Amino Cleanser",
    category: "Cleanser",
    price: 42,
    rating: 4.7,
    reviews: 182,

    tagline: "Silky amino-acid cleanser for a soft, balanced cleanse",

    description:
      "A gentle amino-acid cleanser that removes daily buildup while helping the skin maintain a comfortable, hydrated feeling.",

    skinTypes: ["All Skin Types"],
    concerns: ["Sensitivity", "Barrier"],

    image: img6,
    images: [
    { src: img6, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: false,
    bestseller: false,

    badges: ["Gentle", "Amino Acid", "Vegan"],

    colorway: "#e3ddd0",

    sizes: [
      {
        label: "100 ml",
        sub: "Full Size",
        price: 42,
        default: true,
      },
    ],

    highlights: [
      "Gentle everyday cleansing",
      "Amino-acid based formula",
      "Leaves skin feeling soft",
      "Suitable for sensitive skin",
    ],

    keyIngredients: [
      {
        name: "Amino Acid Surfactants",
        note: "Gently cleanse without a stripped feeling",
      },
      {
        name: "Glycerin",
        note: "Helps maintain hydration",
      },
      {
        name: "Panthenol",
        note: "Helps comfort the skin",
      },
    ],

    fullIngredients:
      "Aqua, Glycerin, Amino Acid Surfactants, Panthenol, Sodium Hyaluronate, Citric Acid, Xanthan Gum, Preservatives.",

    howToUse: [
      {
        title: "Wet skin",
        body: "Use lukewarm water to wet the face.",
      },
      {
        title: "Massage",
        body: "Massage a small amount over the face using gentle circular motions.",
      },
      {
        title: "Rinse",
        body: "Rinse thoroughly and pat dry.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 68 },
      { star: 4, pct: 22 },
      { star: 3, pct: 7 },
      { star: 2, pct: 2 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Sara J.",
        verified: true,
        rating: 5,
        date: "2 weeks ago",
        title: "Very gentle",
        body:
          "Doesn't leave my skin tight after cleansing.",
      },
    ],
  },

  {
    id: 5,
    name: "Élan Hydrating Essence",
    category: "Toner",
    price: 48,
    rating: 4.8,
    reviews: 147,

    tagline: "Weightless hydrating essence for fresh luminous skin",

    description:
      "A silky hydrating essence designed to replenish moisture and prepare the skin for the rest of your routine.",

    skinTypes: ["Dry", "Normal", "Sensitive"],
    concerns: ["Dryness", "Dullness"],

    image: img7,
    images: [
    { src: img7, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: false,
    bestseller: false,

    badges: ["Hydrating", "Luminous", "Vegan"],

    colorway: "#b9c6b2",

    sizes: [
      {
        label: "120 ml",
        sub: "Full Size",
        price: 48,
        default: true,
      },
    ],

    highlights: [
      "Instant hydration",
      "Helps skin appear more luminous",
      "Lightweight watery texture",
      "Ideal before serum and moisturiser",
    ],

    keyIngredients: [
      {
        name: "Hyaluronic Acid",
        note: "Helps attract and retain moisture",
      },
      {
        name: "Glycerin",
        note: "Supports lasting hydration",
      },
      {
        name: "Betaine",
        note: "Helps maintain a comfortable skin feel",
      },
    ],

    fullIngredients:
      "Aqua, Glycerin, Propanediol, Sodium Hyaluronate, Betaine, Panthenol, Citric Acid, Xanthan Gum, Preservatives.",

    howToUse: [
      {
        title: "Cleanse",
        body: "Use after cleansing.",
      },
      {
        title: "Apply",
        body: "Pour a small amount into your palms.",
      },
      {
        title: "Press",
        body: "Press gently into the face and neck.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 76 },
      { star: 4, pct: 16 },
      { star: 3, pct: 6 },
      { star: 2, pct: 1 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Lina S.",
        verified: true,
        rating: 5,
        date: "1 month ago",
        title: "Beautiful hydration",
        body:
          "Makes my skin feel fresh and plump without being sticky.",
      },
    ],
  },

  {
    id: 6,
    name: "Nocturne Renewal Treatment",
    category: "Treatment",
    price: 86,
    rating: 4.9,
    reviews: 193,

    tagline: "Night-time renewal concentrate for smoother-looking skin",

    description:
      "A concentrated evening treatment designed to support smoother texture, more even-looking tone and a refined appearance by morning.",

    skinTypes: ["Normal", "Combination", "Oily"],
    concerns: ["Fine Lines", "Uneven Tone", "Dullness"],

    image: img8,
    images: [
    { src: img8, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: true,
    bestseller: false,

    badges: ["Night Ritual", "Advanced", "Vegan"],

    colorway: "#8f806c",

    sizes: [
      {
        label: "30 ml",
        sub: "Full Size",
        price: 86,
        default: true,
      },
      {
        label: "50 ml",
        sub: "Value",
        price: 118,
        save: "Save 10%",
      },
    ],

    highlights: [
      "Designed for overnight renewal",
      "Helps improve the look of texture",
      "Supports a more even-looking complexion",
      "Ideal for evening routines",
    ],

    keyIngredients: [
      {
        name: "Retinoid Complex",
        note: "Supports smoother-looking skin",
      },
      {
        name: "Peptides",
        note: "Support the appearance of firmness",
      },
      {
        name: "Niacinamide",
        note: "Helps refine visible texture",
      },
    ],

    fullIngredients:
      "Aqua, Glycerin, Niacinamide, Peptides, Retinoid Complex, Propanediol, Panthenol, Sodium Hyaluronate, Tocopherol, Preservatives.",

    howToUse: [
      {
        title: "Cleanse",
        body: "Apply to clean, completely dry skin in the evening.",
      },
      {
        title: "Start slowly",
        body: "Begin with a small amount a few nights per week.",
      },
      {
        title: "Moisturise",
        body: "Follow with a nourishing moisturiser.",
      },
      {
        title: "SPF",
        body: "Use sunscreen every morning while using a renewal treatment.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 81 },
      { star: 4, pct: 13 },
      { star: 3, pct: 4 },
      { star: 2, pct: 1 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Nadia A.",
        verified: true,
        rating: 5,
        date: "2 weeks ago",
        title: "My skin looks smoother",
        body:
          "I've noticed a clear improvement in texture after adding this to my night routine.",
      },
    ],
  },

  {
    id: 7,
    name: "Clarté Pore Refining Serum",
    category: "Serum",
    price: 62,
    rating: 4.7,
    reviews: 124,

    tagline: "Balancing serum for refined-looking pores and clearer skin",

    description:
      "A lightweight balancing serum formulated for combination and oily skin to improve the appearance of pores, uneven tone and occasional breakouts.",

    skinTypes: ["Oily", "Combination"],
    concerns: ["Breakouts", "Uneven Tone"],

    image: img2,
    images: [
    { src: img2, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: false,
    bestseller: false,

    badges: ["Pore Care", "Balancing", "Vegan"],

    colorway: "#a8b89a",

    sizes: [
      {
        label: "30 ml",
        sub: "Full Size",
        price: 62,
        default: true,
      },
    ],

    highlights: [
      "Helps refine the look of pores",
      "Supports balanced-looking skin",
      "Lightweight non-heavy texture",
      "Ideal for oily and combination skin",
    ],

    keyIngredients: [
      {
        name: "Niacinamide",
        note: "Helps refine visible pores and texture",
      },
      {
        name: "Zinc PCA",
        note: "Supports balanced-looking skin",
      },
      {
        name: "Salicylic Acid",
        note: "Helps clear buildup within pores",
      },
    ],

    fullIngredients:
      "Aqua, Niacinamide, Propanediol, Glycerin, Zinc PCA, Salicylic Acid, Panthenol, Sodium Hyaluronate, Citric Acid, Preservatives.",

    howToUse: [
      {
        title: "Cleanse",
        body: "Apply after cleansing.",
      },
      {
        title: "Dispense",
        body: "Apply 2–3 drops to the face.",
      },
      {
        title: "Press",
        body: "Gently press into areas of concern.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 69 },
      { star: 4, pct: 21 },
      { star: 3, pct: 7 },
      { star: 2, pct: 2 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Tara P.",
        verified: true,
        rating: 5,
        date: "3 weeks ago",
        title: "Great for combination skin",
        body:
          "My T-zone looks much more balanced since using this.",
      },
    ],
  },

  {
    id: 8,
    name: "Maison Cleansing Milk",
    category: "Cleanser",
    price: 46,
    rating: 4.8,
    reviews: 96,

    tagline: "Creamy cleansing milk for soft, comfortable skin",

    description:
      "A luxurious cleansing milk that gently dissolves daily impurities while leaving dry and sensitive skin feeling soft and comforted.",

    skinTypes: ["Dry", "Normal", "Sensitive"],
    concerns: ["Dryness", "Sensitivity"],

    image: img1,
    images: [
    { src: img1, label: "Front" },
    { src: serumAngle, label: "Angle" },   
    { src: serumSide, label: "Side" },    
    { src: serumBack, label: "Back" }, 
  ],

    featured: false,
    bestseller: false,

    badges: ["Gentle", "Comforting", "Cruelty-Free"],

    colorway: "#d8cdbd",

    sizes: [
      {
        label: "150 ml",
        sub: "Full Size",
        price: 46,
        default: true,
      },
    ],

    highlights: [
      "Creamy, non-stripping cleanser",
      "Ideal for dry and sensitive skin",
      "Leaves skin soft and comfortable",
      "Perfect for morning and evening",
    ],

    keyIngredients: [
      {
        name: "Squalane",
        note: "Helps soften and condition skin",
      },
      {
        name: "Oat Extract",
        note: "Helps comfort sensitive-looking skin",
      },
      {
        name: "Glycerin",
        note: "Supports skin hydration",
      },
    ],

    fullIngredients:
      "Aqua, Glycerin, Squalane, Oat Extract, Panthenol, Cetearyl Alcohol, Sodium Hyaluronate, Xanthan Gum, Preservatives.",

    howToUse: [
      {
        title: "Apply",
        body: "Massage a small amount onto dry or damp skin.",
      },
      {
        title: "Massage",
        body: "Use gentle circular motions across the face.",
      },
      {
        title: "Rinse",
        body: "Rinse with lukewarm water or remove with a soft cloth.",
      },
    ],

    ratingBreakdown: [
      { star: 5, pct: 75 },
      { star: 4, pct: 18 },
      { star: 3, pct: 5 },
      { star: 2, pct: 1 },
      { star: 1, pct: 1 },
    ],

    customerReviews: [
      {
        name: "Meera S.",
        verified: true,
        rating: 5,
        date: "1 month ago",
        title: "So comfortable",
        body:
          "Perfect when my skin feels dry. It leaves no tight feeling afterward.",
      },
    ],
  },
];

export const CATEGORIES = [
  "All",
  ...new Set(PRODUCTS.map((product) => product.category)),
];

export const SKIN_TYPES = [
  "All Skin Types",
  ...new Set(PRODUCTS.flatMap((product) => product.skinTypes || [])),
];

export const CONCERNS = [
  ...new Set(PRODUCTS.flatMap((product) => product.concerns || [])),
];

export const PRICE_OPTIONS = [
  { label: "All Prices", value: "all" },
  { label: "Under $50", value: "under50" },
  { label: "$50 – $75", value: "50to75" },
  { label: "Over $75", value: "over75" },
];

export const getProductById = (id) => {
  if (!id) return null;
  return PRODUCTS.find((product) => String(product.id) === String(id));
};

export const getSimilarProducts = (id) => {
  const currentProduct = getProductById(id);
  if (!currentProduct) return [];

  return PRODUCTS.filter(
    (product) =>
      String(product.id) !== String(currentProduct.id) &&
      product.category === currentProduct.category
  ).slice(0, 4);
};