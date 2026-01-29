import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const PORT = Number(process.env.PORT || 8787);
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase configuration for MCP server');
}

if (!OPENAI_API_KEY) {
  throw new Error('Set OPENAI_API_KEY for the MCP server');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

const GENERAL_VET_RULES = `Healthy stool baseline: medium to dark brown, firm yet moist, easy to pick up with minimal residue, and 1–3 bowel movements per day (Purina 2–3 reference).

Rule 1 – Consistency too hard/dry: hard pellets or crumbly masses that signal dehydration, low fiber, constipation, or poor digestibility.
Rule 2 – Consistency too soft/unformed/watery: mushy or pourable piles tied to diarrhea, infections, malabsorption, or IBD.
Rule 3 – Abnormal color (black/tarry): dark black or tar-like stool pointing to upper GI bleeding from ulcers, toxins, or ingested blood.
Rule 4 – Abnormal color (white/grey/clay): pale or chalky stool indicating bile duct, liver, or pancreatic issues.
Rule 5 – Abnormal color (yellow/orange): bright yellow or orange tint suggesting rapid transit, biliary problems, or food intolerance.
Rule 6 – Abnormal color (green): distinct green color from bacterial overgrowth, rapid transit, or possible toxin ingestion.
Rule 7 – Abnormal color (red/bloody): visible fresh blood or streaks highlighting lower GI bleeding, parasites, or anal gland problems.
Rule 8 – Visible content abnormalities: undigested food, worms, grass, foreign objects, or excess hair implying parasites, pica, poor digestion, or blockage.
Rule 9 – Excessive mucus coating: slimy or jelly-like film that indicates colonic inflammation, allergies, stress, or infection.
Rule 10 – Greasy/oily appearance: shiny residue or oily puddles signalling fat malabsorption, pancreatic insufficiency, or very high-fat diets.
Rule 11 – Abnormal frequency/volume: more than four bowel movements per day, very small/hard outputs, or excessively large/soggy piles pointing to dietary imbalance, stress, maldigestion, or GI disease.

Guidance:
- Treat any single triggered rule as a potential concern that must be mentioned explicitly.
- If three or more rules appear simultaneously (e.g., watery + blood + foul odor), escalate to urgent veterinary attention.
- Always include this advisory sentence verbatim somewhere in recommendations or ownerMessage: "Consult a veterinarian for persistent or severe changes, especially with blood, black color, or sudden onset."`;

type AuthedRequest = express.Request & { authUserId?: string };

app.use(async (req, res, next) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    (req as AuthedRequest).authUserId = data.user.id;
    return next();
  } catch (authError: any) {
    console.error(authError);
    return res.status(401).json({ error: 'Authentication failed' });
  }
});

interface PetContext {
  pet: any;
  ownerProfile?: any;
  food: any[];
  poop: any[];
  supplements: any[];
  notes: any[];
}

async function fetchPetContext(petId: string, userId: string): Promise<PetContext> {
  const { data: pet, error: petError } = await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .eq('user_id', userId)
    .single();

  if (petError || !pet) {
    throw new Error('Pet not found');
  }

  const [{ data: food }, { data: poop }, { data: supplements }, { data: notes }] =
    await Promise.all([
      supabase
        .from('food_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('logged_at', { ascending: false })
        .limit(3),
      supabase
        .from('poop_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('logged_at', { ascending: false })
        .limit(3),
      supabase
        .from('supplement_logs')
        .select('*')
        .eq('pet_id', petId)
        .order('logged_at', { ascending: false })
        .limit(3),
      supabase
        .from('health_notes')
        .select('*')
        .eq('pet_id', petId)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

  return {
    pet,
    food: food ?? [],
    poop: poop ?? [],
    supplements: supplements ?? [],
    notes: notes ?? [],
  };
}

async function fetchRagMemories(petId: string) {
  const segments: string[] = [];

  const { data: noteChunks } = await supabase
    .from('health_notes')
    .select('summary, recommendations, risk_level')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: poopInsights } = await supabase
    .from('poop_insights')
    .select('summary, notes, risk_level')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false })
    .limit(5);

  noteChunks?.forEach((note) => {
    segments.push(
      `Insight | ${note.risk_level ?? 'risk n/a'} | ${note.summary}${
        note.recommendations ? ` → ${note.recommendations}` : ''
      }`
    );
  });

  poopInsights?.forEach((insight) => {
    segments.push(
      `Stool pattern | ${insight.risk_level ?? 'risk n/a'} | ${insight.summary ?? 'No summary'}${
        insight.notes ? ` (${insight.notes})` : ''
      }`
    );
  });

  return segments;
}

function buildPrompt(context: PetContext, ragSegments: string[]) {
  const pet = context.pet;
  const owner = pet.owner_name || 'Owner';
  const petName = pet.name;
  const foodSummary = context.food
    .map(
      (item: any) =>
        `${item.name} (${item.amount_grams ?? 0}g) at ${item.logged_at}`
    )
    .join('\n');
  const poopSummary = context.poop
    .map(
      (item: any) =>
        `${item.color}/${item.consistency} • moisture: ${item.moisture_level ?? 'n/a'} • blood: ${
          item.blood_present ? 'yes' : 'no'
        } • mucus: ${item.mucus_present ? 'yes' : 'no'} • smell: ${item.smell_level ?? 'n/a'}${
          item.undesirable_behaviors?.length
            ? ` • behavior: ${item.undesirable_behaviors.join(', ')}${
                item.undesirable_behavior_notes ? ` (${item.undesirable_behavior_notes})` : ''
              }`
            : ''
        } on ${item.logged_at}`
    )
    .join('\n');
  const supplementSummary = context.supplements
    .map((item: any) => `${item.name} ${item.dosage ?? ''} (${item.frequency ?? ''})`)
    .join('\n');
  const rag = ragSegments.length > 0 ? ragSegments.map((chunk) => `- ${chunk}`).join('\n') : 'None recorded.';

  return `You are the Soycraft pet health assistant.

Owner: ${owner}
Pet: ${petName} (${pet.species}, ${pet.breed})
Age: ${pet.date_of_birth ?? 'unknown'}
Medical history: ${pet.medical_history ?? 'not provided'}
Allergies: ${pet.allergies ?? 'not provided'}

Recent food intake:
${foodSummary || 'No meals logged.'}

Recent poop observations:
${poopSummary || 'No poop logs yet.'}

Supplements provided:
${supplementSummary || 'None logged.'}

Knowledge base:
${rag}

General veterinary alert rules (use them to flag issues and cite triggered rule numbers):
${GENERAL_VET_RULES}

Instructions:
- Compare each stool log against the rules above. List every triggered rule in recommendations (e.g., "Rule 2 watery stool triggered").
- Treat any single triggered rule as a concern that must be mentioned along with likely causes from the rule description.
- When three or more rules trigger together, explicitly state "urgent veterinary attention recommended" and set riskLevel to see_vet.
- Always include this sentence verbatim somewhere in recommendations or ownerMessage: "Consult a veterinarian for persistent or severe changes, especially with blood, black color, or sudden onset."
- Keep summary under 80 words. Return JSON with keys summary, recommendations, riskLevel (normal|watch|see_vet) and ownerMessage.`;
}

function summarizeContextForChat(context: PetContext) {
  const pet = context.pet;
  const basic = `${pet.name} (${pet.species}${pet.breed ? `, ${pet.breed}` : ''}) age ${pet.date_of_birth ?? 'unknown'} weighing ${pet.weight ?? 'n/a'}kg.`;
  const meals = context.food.length
    ? `Meals logged: ${context.food
        .map((meal: any) => `${meal.name ?? 'meal'} ${meal.amount_grams ?? '?'}g`)
        .join('; ')}`
    : 'No meals logged recently.';
  const poopLine = context.poop.length
    ? `Digestive notes: ${context.poop
        .map((log: any) => `${log.consistency ?? 'n/a'} ${log.color ?? ''}`.trim())
        .join(', ')}`
    : 'No poop entries this week.';
  const supplementLine = context.supplements.length
    ? `Supplements: ${context.supplements
        .map((supp: any) => `${supp.name ?? 'supplement'} ${supp.dosage ?? ''}`.trim())
        .join('; ')}`
    : 'No supplements logged.';
  const recentInsight = context.notes[0]?.summary
    ? `Latest AI note: ${context.notes[0].summary}`
    : 'No AI notes yet.';

  return `${basic} ${meals} ${poopLine} ${supplementLine} ${recentInsight}`;
}

function buildBreedPrompt(context: PetContext) {
  const pet = context.pet;
  return `You are a playful but precise veterinary genetic counselor.

Pet profile:
- Name: ${pet.name}
- Species: ${pet.species}
- Owner reported breed: ${pet.breed ?? 'unknown'}
- Allergies: ${pet.allergies ?? 'not provided'}
- Medical flags: ${pet.medical_history ?? 'none logged'}

Return JSON with keys breakdown (array of {label, percentage, traits}),
originStory (2 short sentences about notable mixes and what they imply for care),
and watchouts (array of concise care tips referencing allergies/poop trends when possible).
Percentages must sum to ~100. If no image supplied, lean on metadata but stay transparent about uncertainty.`;
}

async function persistHealthNote(petId: string, payload: any, raw: any) {
  await supabase.from('health_notes').insert({
    pet_id: petId,
    summary: payload.summary,
    recommendations: payload.recommendations || null,
    risk_level: payload.riskLevel || null,
    owner_message: payload.ownerMessage || null,
    raw_response: raw,
  });
}

app.get('/context/:petId', async (req, res) => {
  try {
    const userId = (req as AuthedRequest).authUserId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const context = await fetchPetContext(req.params.petId, userId);
    res.json(context);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/analyze', async (req, res) => {
  try {
    const { petId, imageUrl } = req.body;
    if (!petId) {
      return res.status(400).json({ error: 'petId is required' });
    }

    const userId = (req as AuthedRequest).authUserId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const context = await fetchPetContext(petId, userId);
    const ragSegments = await fetchRagMemories(petId);
    const prompt = buildPrompt(context, ragSegments);

    const messages: any[] = [
      { role: 'system', content: 'You are a concise pet health triage assistant.' },
      { role: 'user', content: prompt },
    ];

    if (imageUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze the attached stool photo for additional signals.' },
          { type: 'image_url', image_url: { url: imageUrl } },
        ],
      });
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.2,
      messages,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    const parsed = JSON.parse(content);
    await persistHealthNote(petId, parsed, completion);

    res.json(parsed);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to analyze pet context' });
  }
});

app.post('/breed-breakdown', async (req, res) => {
  try {
    const { petId, imageUrl } = req.body;
    if (!petId) {
      return res.status(400).json({ error: 'petId is required' });
    }

    const userId = (req as AuthedRequest).authUserId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const context = await fetchPetContext(petId, userId);
    const prompt = buildBreedPrompt(context);
    const visualUrl = imageUrl || context.pet.photo_url;

    const messages: any[] = [
      { role: 'system', content: 'You turn photos and metadata into estimated breed mix.' },
      { role: 'user', content: prompt },
    ];

    if (visualUrl) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: 'Here is the most recent pet photo. Incorporate clear visual cues if visible.' },
          { type: 'image_url', image_url: { url: visualUrl } },
        ],
      });
    }

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    res.json(JSON.parse(content));
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Failed to build breed analysis' });
  }
});

interface ClientChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

app.post('/chat', async (req, res) => {
  try {
    const { petId, messages } = req.body as { petId?: string; messages?: ClientChatMessage[] };
    if (!petId || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'petId and messages are required' });
    }

    const userId = (req as AuthedRequest).authUserId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const context = await fetchPetContext(petId, userId);
    const contextDigest = summarizeContextForChat(context);
    const sanitizedMessages = messages.map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content ?? '').slice(0, 800),
    }));

    const ragSegments = await fetchRagMemories(petId);

    const completion = await openai.chat.completions.create({
      model: OPENAI_MODEL,
      temperature: 0.35,
      messages: [
        {
          role: 'system',
          content: `You are Soycraft's AI exchange. Blend recent care data with actionable coaching.
Context digest: ${contextDigest}
RAG snippets:
${ragSegments.join('\n')}
Keep replies under 80 words and focus on next best steps.`,
        },
        ...sanitizedMessages,
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error('No response from OpenAI');
    }

    res.json({ reply });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message || 'Chat failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Pet insights MCP server listening on port ${PORT}`);
});
