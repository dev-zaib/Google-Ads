const axios = require("axios");
const API_KEY =
  "b8e78870ff30acb146b4e957cbf5b04253e0b4005b0c361b2627efcfba7d4a33"; // Replace with your actual SerpAPI key
const BASE_URL = "https://serpapi.com/search.json";
const SEARCH_TERMS = [
  "lawn care",
  "landscaping",
  "grass cutting",
  "yard maintenance",
  "lawn service",
  "lawn mowing",
  "garden care",
  "yard work",
  "landscape design",
  "lawn treatment",
  "weed control",
];

const lawnCareCompanies = new Map();

async function fetchLawnCareCompanies() {
  for (const term of SEARCH_TERMS) {
    try {
      console.log(`\nSearching for: "${term}"`);
      const response = await axios.get(BASE_URL, {
        params: {
          engine: "google_ads_transparency_center",
          text: term,
          api_key: API_KEY,
        },
      });

      const adCreatives = response.data.ad_creatives || [];
      console.log(`Found ${adCreatives.length} ad creatives for "${term}"`);

      for (const ad of adCreatives) {
        if (isLawnCareCompany(ad)) {
          updateCompanyInfo(ad);
        }
      }
    } catch (error) {
      console.error(`Error fetching results for "${term}":`, error.message);
      if (error.response) {
        console.error("Response status:", error.response.status);
      }
    }
  }

  return JSON.stringify(Object.fromEntries(lawnCareCompanies), null, 2);
}

function updateCompanyInfo(ad) {
  if (lawnCareCompanies.has(ad.advertiser)) {
    const company = lawnCareCompanies.get(ad.advertiser);
    company.adCount++;
  } else {
    const newCompany = getCompanyInfo(ad);
    lawnCareCompanies.set(ad.advertiser, newCompany);
  }
}

function getCompanyInfo(ad) {
  return {
    website: ad.target_domain,
    adCount: 1,
    adDetails: ad.details_link,
  };
}

function isLawnCareCompany(ad) {
  const keywords = [
    "lawn",
    "landscape",
    "yard",
    "grass",
    "garden",
    "mow",
    "trim",
    "weed",
    "turf",
    "green",
    "outdoor",
    "sprinkler",
    "irrigation",
    "fertiliz",
    "pest control",
  ];

  const nameMatch = keywords.some((keyword) =>
    ad.advertiser.toLowerCase().includes(keyword)
  );
  const domainMatch = keywords.some((keyword) =>
    ad.target_domain.toLowerCase().includes(keyword)
  );
  const adTextMatch = ad.ad_text
    ? keywords.some((keyword) => ad.ad_text.toLowerCase().includes(keyword))
    : false;
  const formatMatch = ["image", "video"].includes(ad.format);

  return nameMatch || domainMatch || adTextMatch || formatMatch;
}

// Run the function and log the JSON result
const fs = require("fs");

fetchLawnCareCompanies().then((jsonResult) => {
  fs.writeFileSync("lawnCareCompanies.json", jsonResult);
  console.log("Results saved to lawnCareCompanies.json");
});
