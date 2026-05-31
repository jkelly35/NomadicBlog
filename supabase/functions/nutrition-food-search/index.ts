import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
};

type FoodRow = {
  id?: string;
  name: string;
  brand: string | null;
  source: string;
  source_food_id: string;
  default_serving_g: number;
  kcal_100g: number;
  protein_g_100g: number;
  carbs_g_100g: number;
  fats_g_100g: number;
  fiber_g_100g: number;
  is_verified: boolean;
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json"
    }
  });
}

function getEnv(name: string, required = true): string {
  const value = Deno.env.get(name) || "";
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function createServiceClient() {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false }
  });
}

async function getAuthedUserId(req: Request): Promise<string> {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const anonKey = getEnv("SUPABASE_ANON_KEY");
  const authHeader = req.headers.get("Authorization") || "";

  if (!authHeader.startsWith("Bearer ")) {
    throw new Error("Missing Authorization bearer token.");
  }

  const client = createClient(supabaseUrl, anonKey, {
    auth: { persistSession: false },
    global: {
      headers: { Authorization: authHeader }
    }
  });

  const { data, error } = await client.auth.getUser();
  if (error || !data.user) {
    throw new Error(error?.message || "Unable to authenticate user.");
  }

  return data.user.id;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function cleanText(value: unknown): string {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseNumber(value: unknown, fallback = 0): number {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) {
    return fallback;
  }
  return num;
}

function readNutrientByNames(
  nutrients: Array<Record<string, unknown>>,
  names: string[]
): number {
  const lowerNames = names.map((name) => name.toLowerCase());
  const match = nutrients.find((n) => {
    const nutrientName = cleanText(n.nutrientName || n.name).toLowerCase();
    return lowerNames.some((candidate) => nutrientName === candidate);
  });

  if (!match) {
    return 0;
  }

  return parseNumber(match.value ?? match.amount, 0);
}

async function fetchUsdFoods(query: string, limit: number): Promise<FoodRow[]> {
  const apiKey = getEnv("USDA_FOODDATA_API_KEY", false);
  if (!apiKey) {
    return [];
  }

  const response = await fetch(
    `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        pageSize: clamp(limit, 1, 25),
        dataType: ["Branded", "Foundation", "Survey (FNDDS)", "SR Legacy"]
      })
    }
  );

  if (!response.ok) {
    return [];
  }

  const json = await response.json();
  const foods = Array.isArray(json?.foods) ? json.foods : [];

  return foods
    .map((item: Record<string, unknown>) => {
      const name = cleanText(item.description);
      const sourceId = String(item.fdcId || "").trim();
      const nutrients = Array.isArray(item.foodNutrients)
        ? (item.foodNutrients as Array<Record<string, unknown>>)
        : [];

      if (!name || !sourceId) {
        return null;
      }

      const calories = readNutrientByNames(nutrients, ["Energy"]);
      const protein = readNutrientByNames(nutrients, ["Protein"]);
      const carbs = readNutrientByNames(nutrients, ["Carbohydrate, by difference"]);
      const fats = readNutrientByNames(nutrients, ["Total lipid (fat)"]);
      const fiber = readNutrientByNames(nutrients, ["Fiber, total dietary"]);

      return {
        name,
        brand: cleanText(item.brandOwner) || null,
        source: "usda",
        source_food_id: sourceId,
        default_serving_g: 100,
        kcal_100g: calories,
        protein_g_100g: protein,
        carbs_g_100g: carbs,
        fats_g_100g: fats,
        fiber_g_100g: fiber,
        is_verified: true
      } as FoodRow;
    })
    .filter((row): row is FoodRow => !!row);
}

async function fetchOpenFoodFactsFoods(query: string, limit: number): Promise<FoodRow[]> {
  const userAgent = getEnv("OPENFOODFACTS_USER_AGENT", false) || "NomadicPerformance/1.0";
  const url = new URL("https://world.openfoodfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", query);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(clamp(limit, 1, 20)));
  url.searchParams.set(
    "fields",
    "code,product_name,brands,nutriments,serving_quantity,serving_size,product_quantity"
  );

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": userAgent
    }
  });

  if (!response.ok) {
    return [];
  }

  const json = await response.json();
  const products = Array.isArray(json?.products) ? json.products : [];

  return products
    .map((item: Record<string, unknown>) => {
      const name = cleanText(item.product_name);
      const sourceId = String(item.code || "").trim();
      const nutriments = (item.nutriments || {}) as Record<string, unknown>;

      if (!name || !sourceId) {
        return null;
      }

      const defaultServing = parseNumber(
        item.serving_quantity ?? item.serving_size ?? item.product_quantity,
        100
      );

      return {
        name,
        brand: cleanText(item.brands) || null,
        source: "openfoodfacts",
        source_food_id: sourceId,
        default_serving_g: defaultServing > 0 ? defaultServing : 100,
        kcal_100g: parseNumber(nutriments["energy-kcal_100g"]),
        protein_g_100g: parseNumber(nutriments.proteins_100g),
        carbs_g_100g: parseNumber(nutriments.carbohydrates_100g),
        fats_g_100g: parseNumber(nutriments.fat_100g),
        fiber_g_100g: parseNumber(nutriments.fiber_100g),
        is_verified: false
      } as FoodRow;
    })
    .filter((row): row is FoodRow => !!row);
}

function dedupeFoods(rows: FoodRow[]): FoodRow[] {
  const map = new Map<string, FoodRow>();

  rows.forEach((row) => {
    const key = `${row.source}:${row.source_food_id}`;
    if (!map.has(key)) {
      map.set(key, row);
      return;
    }

    const existing = map.get(key)!;
    const keepNew =
      row.kcal_100g > existing.kcal_100g ||
      row.protein_g_100g > existing.protein_g_100g ||
      row.carbs_g_100g > existing.carbs_g_100g ||
      row.fats_g_100g > existing.fats_g_100g;

    if (keepNew) {
      map.set(key, row);
    }
  });

  return Array.from(map.values());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    await getAuthedUserId(req);

    let query = "";
    let limit = 25;
    try {
      const body = await req.json();
      query = cleanText(body?.query);
      limit = clamp(Number(body?.limit || 25), 5, 40);
    } catch (_error) {
      query = "";
    }

    if (!query) {
      return jsonResponse({ foods: [] });
    }

    const admin = createServiceClient();

    const { data: localRows, error: localError } = await admin
      .from("nutrition_foods")
      .select(
        "id,name,brand,source,source_food_id,default_serving_g,kcal_100g,protein_g_100g,carbs_g_100g,fats_g_100g,fiber_g_100g,is_verified"
      )
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%`)
      .order("is_verified", { ascending: false })
      .order("name", { ascending: true })
      .limit(limit);

    if (localError) {
      throw new Error(localError.message);
    }

    const localFoods = (localRows || []) as FoodRow[];

    const [usdaFoods, offFoods] = await Promise.all([
      fetchUsdFoods(query, limit),
      fetchOpenFoodFactsFoods(query, limit)
    ]);

    const externalFoods = dedupeFoods([...usdaFoods, ...offFoods]);

    let syncedFoods: FoodRow[] = [];
    if (externalFoods.length) {
      const upsertPayload = externalFoods.map((row) => ({
        name: row.name,
        brand: row.brand,
        source: row.source,
        source_food_id: row.source_food_id,
        default_serving_g: row.default_serving_g,
        kcal_100g: row.kcal_100g,
        protein_g_100g: row.protein_g_100g,
        carbs_g_100g: row.carbs_g_100g,
        fats_g_100g: row.fats_g_100g,
        fiber_g_100g: row.fiber_g_100g,
        is_verified: row.is_verified
      }));

      const { data: upsertedRows, error: upsertError } = await admin
        .from("nutrition_foods")
        .upsert(upsertPayload, { onConflict: "source,source_food_id" })
        .select(
          "id,name,brand,source,source_food_id,default_serving_g,kcal_100g,protein_g_100g,carbs_g_100g,fats_g_100g,fiber_g_100g,is_verified"
        );

      if (!upsertError && upsertedRows) {
        syncedFoods = upsertedRows as FoodRow[];

        const servingRows = syncedFoods
          .filter((row) => !!row.id)
          .map((row) => ({
            food_id: row.id,
            serving_name: "1 serving",
            grams: row.default_serving_g > 0 ? row.default_serving_g : 100,
            is_default: true
          }));

        if (servingRows.length) {
          await admin.from("nutrition_food_servings").upsert(servingRows, {
            onConflict: "food_id,serving_name"
          });
        }
      }
    }

    const merged = dedupeFoods([
      ...localFoods,
      ...syncedFoods
    ])
      .sort((a, b) => {
        if (a.is_verified !== b.is_verified) {
          return a.is_verified ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);

    return jsonResponse({
      foods: merged,
      sources_used: {
        local: true,
        usda: usdaFoods.length > 0,
        openfoodfacts: offFoods.length > 0
      }
    });
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Failed to search food database." },
      400
    );
  }
});
