export const defaultCategories = [
  "Education",
  "Healthcare",
  "Infrastructure",
  "Environment",
  "Agriculture",
  "Water Resources",
  "Sanitation & Drainage",
  "Road & Traffic Safety",
  "Street Lighting & Power",
  "Public Safety & Police",
] as const;

export const challengeCategories = defaultCategories;
export const challengePriorities = ["High", "Medium", "Low"] as const;

export type ChallengeCategory = string;
export type ChallengePriority = (typeof challengePriorities)[number];

export type ChallengeClassification = {
  category: string;
  priority: ChallengePriority;
  suggestedTags?: string[];
};

function getGeminiApiKey(): string {
  const envKey = import.meta.env["VITE_GEMINI_API_KEY"];
  if (typeof envKey === "string" && envKey.trim().length > 0) {
    return envKey.trim();
  }
  try {
    return atob("QVEuQWI4Uk42S1dXNmFTUVR2WWI3c3BGc0NKVzRMdlRpVzV6SC16TXdlMjNhMnNTaFFCYWc=");
  } catch {
    return "";
  }
}

const GEMINI_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
] as const;

async function callGemini(payload: object, timeoutMs = 8000): Promise<any> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          signal: controller.signal,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      console.warn(`Gemini model ${model} responded with status ${response.status}, trying fallback model...`);
    } catch (err) {
      console.warn(`Gemini model ${model} fetch failed:`, err);
    }
  }

  return null;
}

function formatTitleCase(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function categorizeLocally(description: string): ChallengeClassification {
  // Strip generated boilerplate before classifying so we analyze ONLY the user's core report
  let userText = description
    .toLowerCase()
    .replace(/^📌\s*issue summary:\s*/gim, "")
    .replace(/ground impact.*$/gim, "")
    .replace(/recommended action.*$/gim, "")
    .replace(/action requested.*$/gim, "")
    .trim();

  if (!userText) userText = description.toLowerCase();

  // 1. Lighting, Electricity & Power (handles Hinglish & typos like "liight", "bijli", "andhera", "light")
  if (
    userText.includes("light") ||
    userText.includes("liight") ||
    userText.includes("bijli") ||
    userText.includes("power") ||
    userText.includes("lamp") ||
    userText.includes("electric") ||
    userText.includes("wire") ||
    userText.includes("taar") ||
    userText.includes("current") ||
    userText.includes("voltage") ||
    userText.includes("transformer") ||
    userText.includes("meter") ||
    userText.includes("andhera") ||
    userText.includes("dark")
  ) {
    return { category: "Street Lighting & Power", priority: "High" };
  }

  // 2. Roads, Potholes & Infrastructure
  if (
    userText.includes("road") ||
    userText.includes("sadak") ||
    userText.includes("pothole") ||
    userText.includes("gaddha") ||
    userText.includes("gaddhe") ||
    userText.includes("bridge") ||
    userText.includes("traffic") ||
    userText.includes("footpath") ||
    userText.includes("street") ||
    userText.includes("jam")
  ) {
    return { category: "Roads & Public Infrastructure", priority: "High" };
  }

  // 3. Water Supply, Drainage & Sanitation
  if (
    userText.includes("water") ||
    userText.includes("pani") ||
    userText.includes("paani") ||
    userText.includes("pipe") ||
    userText.includes("leak") ||
    userText.includes("drain") ||
    userText.includes("naala") ||
    userText.includes("naali") ||
    userText.includes("sewer") ||
    userText.includes("supply") ||
    userText.includes("tank")
  ) {
    return { category: "Sanitation & Water Resources", priority: "High" };
  }

  // 4. Waste Management & Environment
  if (
    userText.includes("garbage") ||
    userText.includes("kachra") ||
    userText.includes("trash") ||
    userText.includes("waste") ||
    userText.includes("pollution") ||
    userText.includes("tree") ||
    userText.includes("clean") ||
    userText.includes("safai") ||
    userText.includes("environment") ||
    userText.includes("dump")
  ) {
    return { category: "Waste Management & Environment", priority: "Medium" };
  }

  // 5. Healthcare
  if (
    userText.includes("hospital") ||
    userText.includes("doctor") ||
    userText.includes("health") ||
    userText.includes("medicine") ||
    userText.includes("dawa") ||
    userText.includes("clinic") ||
    userText.includes("disease") ||
    userText.includes("medical")
  ) {
    return { category: "Healthcare & Sanitation", priority: "High" };
  }

  // 6. Education
  if (
    userText.includes("school") ||
    userText.includes("student") ||
    userText.includes("teacher") ||
    userText.includes("education") ||
    userText.includes("college") ||
    userText.includes("padhai") ||
    userText.includes("class")
  ) {
    return { category: "Education & Schools", priority: "Medium" };
  }

  // 7. Public Safety & Crime
  if (
    userText.includes("crime") ||
    userText.includes("police") ||
    userText.includes("theft") ||
    userText.includes("chori") ||
    userText.includes("cyber") ||
    userText.includes("fraud")
  ) {
    return { category: "Public Safety & Law", priority: "High" };
  }

  return { category: "Civic Infrastructure", priority: "High" };
}

export async function categorizeChallenge(description: string): Promise<ChallengeClassification> {
  if (!description.trim()) {
    throw new Error("A challenge description is required.");
  }

  const payload = {
    contents: [
      {
        parts: [{ text: `Classify this civic report description into a category:\n\n${description}` }],
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: `You are an expert AI civic report classifier for JanSetu in India.
Analyze the user's issue description (which may be in English, Hindi, Devanagari, or Hinglish with phonetic spellings/typos like 'liight', 'sadak', 'pani', 'bijli', 'kachra').
Classify it into a concise civic category. Examples:
- "Street Lighting & Power" (for electricity, light outage, power, wires, transformer)
- "Roads & Public Infrastructure" (for sadak, potholes, traffic, bridges)
- "Sanitation & Water Resources" (for water supply, pipeline leakage, drainage, naali)
- "Waste Management & Environment" (for kachra, garbage, trash dump, pollution)
- "Healthcare & Sanitation" (for hospital, doctor, medicine, health)
- "Education & Schools" (for school, college, student, padhai)
- "Public Safety & Law" (for crime, police, theft, fraud)
- "Food & Social Welfare" (for food, hunger, ration, shelter)

Return ONLY a valid JSON object with "category" and "priority" ("High", "Medium", "Low").`,
        },
      ],
    },
    generationConfig: {
      responseMimeType: "application/json",
    },
  };

  const data = await callGemini(payload, 10000);
  if (!data) {
    return categorizeLocally(description);
  }

  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!responseText) {
    return categorizeLocally(description);
  }

  try {
    const parsed = JSON.parse(responseText);
    const categoryName =
      typeof parsed.category === "string" && parsed.category.trim()
        ? formatTitleCase(parsed.category.trim())
        : categorizeLocally(description).category;

    const priorityVal = challengePriorities.includes(parsed.priority)
      ? parsed.priority
      : "Medium";

    return {
      category: categoryName,
      priority: priorityVal as ChallengePriority,
    };
  } catch (error) {
    return categorizeLocally(description);
  }
}

function localHinglishConverter(text: string): string {
  const dictionary: Record<string, string> = {
    गड्ढा: "pothole",
    गड्ढे: "potholes",
    सड़क: "sadak",
    रोड: "road",
    पानी: "pani",
    लीक: "leakage",
    गंदा: "ganda",
    कचरा: "kachra",
    बिजली: "bijli",
    लाइट: "light",
    समस्या: "problem",
    दुर्घटना: "accident",
    खतरा: "danger",
    अंधेरा: "andhera",
    नाला: "naala",
    नाली: "naali",
    स्कूल: "school",
    अस्पताल: "hospital",
    डॉक्टर: "doctor",
    सफाई: "safai",
  };

  let converted = text;
  Object.entries(dictionary).forEach(([hindi, hinglish]) => {
    converted = converted.replaceAll(hindi, hinglish);
  });

  return converted;
}

export async function convertToHinglish(speechText: string): Promise<string> {
  if (!speechText.trim()) return "";

  const payload = {
    contents: [
      {
        parts: [{ text: `Convert this spoken text (Hindi or English) into natural Romanized Hinglish:\n\n${speechText}` }],
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: `You are an AI speech-to-Hinglish converter for JanSetu.
Convert any input spoken sentence (whether in Devanagari Hindi, English, or mixed) into natural, clear Romanized Hinglish (Hindi-English written in English script, e.g., 'Road par water leakage ki vajah se accident ka danger hai').
Return ONLY the converted Hinglish text without any markdown, quotes, or explanations.`,
        },
      ],
    },
  };

  const data = await callGemini(payload, 10000);
  if (!data) {
    return localHinglishConverter(speechText);
  }

  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return resultText && resultText.trim()
    ? resultText.trim().replace(/^["']|["']$/g, "")
    : localHinglishConverter(speechText);
}

function localEnhancer(rawText: string): string {
  let clean = rawText.trim();
  if (!clean) return "";

  // Strip any pre-existing legacy headers if present
  clean = clean
    .replace(/^(📌|⚠️|🛠️|📢)?\s*(Issue Summary|Ground Impact & Urgency|Ground Impact|Safety Risk|Recommended Action|Action Requested):\s*/gim, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();

  const lower = clean.toLowerCase();
  let impactDetail = "This reported issue creates recurring civic inconvenience, administrative bottlenecks, and disruption for affected community residents and visitors in this sector.";
  let municipalAction = "An urgent on-site technical inspection by the concerned civic authorities is required to execute prompt remediation and restore normal public standards.";

  if (lower.includes("road") || lower.includes("sadak") || lower.includes("pothole") || lower.includes("gaddha") || lower.includes("crater") || lower.includes("traffic")) {
    impactDetail = "The damaged road surface presents an acute hazard to passing vehicles and two-wheeler riders, who are forced into sudden evasive maneuvers, creating severe collision risks and persistent traffic bottlenecks.";
    municipalAction = "The municipal road engineering and PWD division must conduct an immediate site survey, deploy emergency asphalt patching, and schedule comprehensive surface leveling to eliminate accident threats.";
  } else if (lower.includes("light") || lower.includes("bijli") || lower.includes("andhera") || lower.includes("wire") || lower.includes("electric") || lower.includes("lamp")) {
    impactDetail = "The absence of reliable street illumination creates dark, hazardous corridors during evening hours, severely compromising pedestrian security and drastically elevating the likelihood of nighttime vehicular accidents.";
    municipalAction = "The municipal electrical engineering department should urgently inspect the lighting circuit, replace defective fixtures and burnt-out LEDs, and ensure uninterrupted street illumination.";
  } else if (lower.includes("water") || lower.includes("pani") || lower.includes("pipe") || lower.includes("leak") || lower.includes("drain") || lower.includes("naali") || lower.includes("sewer")) {
    impactDetail = "Persistent water leakage and drainage blockages are causing localized waterlogging, erosion of the surrounding foundation, clean water loss, and breeding grounds for vector-borne diseases.";
    municipalAction = "The Water and Sewerage Board maintenance team must be dispatched immediately to isolate the fractured line, desilt the drainage system, and implement permanent structural pipe repairs.";
  } else if (lower.includes("garbage") || lower.includes("kachra") || lower.includes("waste") || lower.includes("dump") || lower.includes("trash")) {
    impactDetail = "Accumulated uncollected waste is spreading foul odors, obstructing pedestrian pathways, and creating an acute public health concern for nearby homes and commercial establishments.";
    municipalAction = "Sanitation inspection squads must immediately coordinate mechanized waste clearance, sanitize the perimeter, and schedule regular periodic collection to prevent re-accumulation.";
  } else if (lower.includes("food") || lower.includes("hungry") || lower.includes("bhook") || lower.includes("ration") || lower.includes("khana") || lower.includes("meal")) {
    impactDetail = "The individual or local group is facing acute nutritional distress and severe food insecurity, posing an immediate humanitarian risk to basic physical health and personal dignity.";
    municipalAction = "The Municipal Social Welfare and Civil Supplies departments must promptly deploy emergency food relief or mobile assistance, and connect the affected persons with nearby community kitchens or municipal shelters.";
  } else if (lower.includes("hospital") || lower.includes("doctor") || lower.includes("dawai") || lower.includes("health") || lower.includes("patient") || lower.includes("clinic")) {
    impactDetail = "Inadequate healthcare access and medical service disruptions jeopardize patient recovery and pose significant health risks to vulnerable community residents.";
    municipalAction = "The District Chief Medical Officer (CMO) and health inspection teams must urgently inspect the facility, ensure essential pharmaceutical supplies, and deploy adequate healthcare staff.";
  } else if (lower.includes("school") || lower.includes("college") || lower.includes("teacher") || lower.includes("student") || lower.includes("padhai") || lower.includes("class")) {
    impactDetail = "This condition disrupts the educational environment, student concentration, and day-to-day academic functioning within the public learning institution.";
    municipalAction = "The District Education Office (DEO) should conduct an administrative assessment and take necessary steps to upgrade institutional facilities and instructional resources.";
  } else if (lower.includes("police") || lower.includes("crime") || lower.includes("theft") || lower.includes("chori") || lower.includes("safety") || lower.includes("danger") || lower.includes("harass")) {
    impactDetail = "This security concern instills widespread fear, threatens resident well-being, and compromises public peace and safe pedestrian movement in the neighborhood.";
    municipalAction = "Local police station officers must immediately increase night patrolling, inspect vigilance posts, and execute active crime deterrence protocols.";
  }

  return `${clean}. ${impactDetail}\n\n${municipalAction}`;
}

export async function enhanceDescription(rawDescription: string): Promise<string> {
  if (!rawDescription.trim()) return "";

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Transform this citizen's grievance into an articulate, detailed, and comprehensive civic issue description:\n\n"${rawDescription}"`,
          },
        ],
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: `You are an expert civic communication AI for JanSetu (India's Citizen-Administration Commons).
Your goal is to transform brief, rough, or spoken user inputs (in English, Hindi, or Hinglish) into an articulate, highly detailed, fluent, and professional civic report description.

STRICT INSTRUCTIONS:
- DO NOT use rigid robotic template headers like "📌 Issue Summary:", "⚠️ Ground Impact & Urgency:", "🛠️ Recommended Action:", or canned bullet points.
- Write a natural, authoritative, and vivid 2-paragraph narrative report:
  * Paragraph 1: Clearly articulate the physical problem and ground reality, keeping all specific local landmarks, street names, ward numbers, and locations intact. Detail the immediate impact on commuters, local residents, pedestrians, and public transit.
  * Paragraph 2: Highlight the technical urgency, escalating safety or health risks if left unaddressed, and outline the concrete administrative and engineering actions needed from the municipal department.
- Return ONLY the final enhanced description text without conversational prefixes, quotation marks, or markdown headers.`,
        },
      ],
    },
  };

  const data = await callGemini(payload, 14000);
  if (!data) {
    return localEnhancer(rawDescription);
  }

  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return resultText && resultText.trim()
    ? resultText.trim().replace(/^["']|["']$/g, "")
    : localEnhancer(rawDescription);
}