(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    client: null,
    user: null,
    guardEl: null,
    contentEl: null,
    statusEl: null,
    resultsSummaryEl: null,
    foodAdminForm: null,
    foodAdminId: null,
    foodAdminName: null,
    foodAdminBrand: null,
    foodAdminCalories: null,
    foodAdminProtein: null,
    foodAdminCarbs: null,
    foodAdminFats: null,
    foodAdminFiber: null,
    foodAdminServingLabel: null,
    foodAdminServingGrams: null,
    foodAdminSearch: null,
    foodAdminReset: null,
    foodAdminList: null,
    csvExportBtn: null,
    csvTemplateBtn: null,
    csvImportTriggerBtn: null,
    csvInputEl: null,
    foodAdminRows: [],
    foodAdminFilterTerm: "",
    selectedFoodId: "",
    servingEmptyEl: null,
    servingManagerEl: null,
    servingTitleEl: null,
    servingForm: null,
    servingNameEl: null,
    servingGramsEl: null,
    servingDefaultEl: null,
    servingListEl: null,
    servingRows: []
  };

  document.addEventListener("DOMContentLoaded", initFoodbankSettings);

  function initFoodbankSettings() {
    state.guardEl = document.querySelector("[data-foodbank-guard]");
    state.contentEl = document.querySelector("[data-foodbank-content]");
    state.statusEl = document.querySelector("[data-food-admin-status]");
    state.resultsSummaryEl = document.querySelector("[data-food-admin-results-summary]");
    state.foodAdminForm = document.querySelector("[data-food-admin-form]");
    state.foodAdminId = document.querySelector("[data-food-admin-id]");
    state.foodAdminName = document.querySelector("[data-food-admin-name]");
    state.foodAdminBrand = document.querySelector("[data-food-admin-brand]");
    state.foodAdminCalories = document.querySelector("[data-food-admin-calories]");
    state.foodAdminProtein = document.querySelector("[data-food-admin-protein]");
    state.foodAdminCarbs = document.querySelector("[data-food-admin-carbs]");
    state.foodAdminFats = document.querySelector("[data-food-admin-fats]");
    state.foodAdminFiber = document.querySelector("[data-food-admin-fiber]");
    state.foodAdminServingLabel = document.querySelector("[data-food-admin-serving-label]");
    state.foodAdminServingGrams = document.querySelector("[data-food-admin-serving-grams]");
    state.foodAdminSearch = document.querySelector("[data-food-admin-search]");
    state.foodAdminReset = document.querySelector("[data-food-admin-reset]");
    state.foodAdminList = document.querySelector("[data-food-admin-list]");
    state.csvExportBtn = document.querySelector("[data-food-csv-export]");
    state.csvTemplateBtn = document.querySelector("[data-food-csv-template]");
    state.csvImportTriggerBtn = document.querySelector("[data-food-csv-import-trigger]");
    state.csvInputEl = document.querySelector("[data-food-csv-input]");
    state.servingEmptyEl = document.querySelector("[data-food-serving-empty]");
    state.servingManagerEl = document.querySelector("[data-food-serving-manager]");
    state.servingTitleEl = document.querySelector("[data-food-serving-title]");
    state.servingForm = document.querySelector("[data-food-serving-form]");
    state.servingNameEl = document.querySelector("[data-food-serving-name]");
    state.servingGramsEl = document.querySelector("[data-food-serving-grams]");
    state.servingDefaultEl = document.querySelector("[data-food-serving-default]");
    state.servingListEl = document.querySelector("[data-food-serving-list]");

    if (!window.supabase || !window.supabase.createClient) {
      setStatus("Supabase client failed to load.", "error");
      return;
    }

    if (!window.NOMADIC_SUPABASE_URL || !window.NOMADIC_SUPABASE_ANON_KEY) {
      setStatus("Supabase configuration is missing.", "error");
      return;
    }

    state.client = window.supabase.createClient(window.NOMADIC_SUPABASE_URL, window.NOMADIC_SUPABASE_ANON_KEY);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session || !session.user) {
        window.location.href = "index.html";
        return;
      }

      state.user = session.user;
      if (String(state.user.email || "").toLowerCase() !== ADMIN_EMAIL) {
        setStatus("Foodbank settings are restricted to coach/admin.", "error");
        return;
      }

      if (state.guardEl) {
        state.guardEl.hidden = true;
      }
      if (state.contentEl) {
        state.contentEl.hidden = false;
      }

      bindEvents();
      loadCatalog();
    });
  }

  function bindEvents() {
    if (state.foodAdminForm) {
      state.foodAdminForm.addEventListener("submit", onFoodAdminSubmit);
    }

    if (state.foodAdminReset) {
      state.foodAdminReset.addEventListener("click", function () {
        resetFoodAdminForm(true);
      });
    }

    if (state.foodAdminSearch) {
      state.foodAdminSearch.addEventListener("input", function () {
        state.foodAdminFilterTerm = String(state.foodAdminSearch.value || "").trim().toLowerCase();
        renderFoodList();
      });
    }

    if (state.foodAdminList) {
      state.foodAdminList.addEventListener("click", function (event) {
        var editBtn = event.target && event.target.closest("[data-food-admin-edit]");
        if (editBtn) {
          onFoodAdminEdit(String(editBtn.getAttribute("data-food-admin-edit") || ""));
          return;
        }

        var deleteBtn = event.target && event.target.closest("[data-food-admin-delete]");
        if (deleteBtn) {
          onFoodAdminDelete(String(deleteBtn.getAttribute("data-food-admin-delete") || ""));
        }
      });
    }

    if (state.csvExportBtn) {
      state.csvExportBtn.addEventListener("click", onExportCsv);
    }

    if (state.csvTemplateBtn) {
      state.csvTemplateBtn.addEventListener("click", onDownloadTemplate);
    }

    if (state.csvImportTriggerBtn && state.csvInputEl) {
      state.csvImportTriggerBtn.addEventListener("click", function () {
        state.csvInputEl.value = "";
        state.csvInputEl.click();
      });
    }

    if (state.csvInputEl) {
      state.csvInputEl.addEventListener("change", onCsvFileSelected);
    }

    if (state.servingForm) {
      state.servingForm.addEventListener("submit", onServingSubmit);
    }

    if (state.servingListEl) {
      state.servingListEl.addEventListener("click", function (event) {
        var deleteBtn = event.target && event.target.closest("[data-serving-delete]");
        if (!deleteBtn) return;
        onServingDelete(String(deleteBtn.getAttribute("data-serving-delete") || ""));
      });
    }
  }

  function onExportCsv() {
    if (!state.client || !state.foodAdminRows.length) {
      setStatus("No foods available to export.", "error");
      return;
    }

    setStatus("Preparing CSV export...", "info");
    var foodIds = state.foodAdminRows
      .map(function (row) { return String(row.id || ""); })
      .filter(Boolean);

    state.client
      .from("nutrition_food_servings")
      .select("id,food_id,serving_name,grams,is_default")
      .in("food_id", foodIds)
      .order("food_id", { ascending: true })
      .order("is_default", { ascending: false })
      .order("grams", { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;

        var servingByFood = {};
        (result.data || []).forEach(function (row) {
          var key = String(row.food_id || "");
          if (!key) return;
          if (!servingByFood[key]) {
            servingByFood[key] = [];
          }
          servingByFood[key].push(normalizeServing(row));
        });

        var header = csvHeader();
        var rows = [header];
        state.foodAdminRows.forEach(function (food) {
          var servings = servingByFood[String(food.id || "")] || [];
          if (!servings.length) {
            rows.push(buildCsvRow(food, null));
            return;
          }
          servings.forEach(function (serving) {
            rows.push(buildCsvRow(food, serving));
          });
        });

        downloadCsv("foodbank-export.csv", rows);
        setStatus("CSV exported.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to export CSV.", "error");
      });
  }

  function onDownloadTemplate() {
    var rows = [csvHeader()];
    rows.push([
      "",
      "Greek Yogurt",
      "Fage",
      "coach",
      "100",
      "59",
      "10.3",
      "3.6",
      "0.4",
      "0",
      "1 cup",
      "245",
      "true"
    ]);

    rows.push([]);
    rows.push([
      "Food",
      "Serving Size",
      "Calories",
      "Protein (g)",
      "Carbs (g)",
      "Fats (g)",
      "Fiber (g)"
    ]);
    rows.push([
      "Greek Yogurt",
      "1 container (150g)",
      "90",
      "15",
      "7",
      "0",
      "0"
    ]);

    downloadCsv("foodbank-template.csv", rows);
    setStatus("Template downloaded.", "success");
  }

  function onCsvFileSelected(event) {
    var file = event && event.target && event.target.files && event.target.files[0];
    if (!file) return;

    setStatus("Importing CSV...", "info");
    readFileText(file)
      .then(parseCsv)
      .then(importCsvRows)
      .then(function (summary) {
        return loadCatalog().then(function () {
          setStatus("CSV import complete. Foods: " + summary.foods + ", servings: " + summary.servings + ".", "success");
        });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to import CSV.", "error");
      });
  }

  function importCsvRows(parsedRows) {
    if (!Array.isArray(parsedRows) || parsedRows.length < 2) {
      return Promise.reject(new Error("CSV is empty or missing data rows."));
    }

    var header = parsedRows[0].map(normalizeCsvHeader);
    var records = parsedRows.slice(1)
      .map(function (row) { return mapCsvRow(header, row); })
      .filter(function (row) {
        return String(getField(row, ["name", "food"]) || "").trim().length > 0;
      });

    if (!records.length) {
      return Promise.reject(new Error("No valid food rows found in CSV."));
    }

    var foodsByKey = {};
    records.forEach(function (record) {
      var key = getFoodRecordKey(record);
      if (!foodsByKey[key]) {
        foodsByKey[key] = record;
      }
    });

    var foodKeys = Object.keys(foodsByKey);
    var foodCount = 0;
    var servingCount = 0;
    var keyToFoodId = {};

    return sequence(foodKeys, function (key) {
      return upsertFoodFromRecord(foodsByKey[key]).then(function (foodId) {
        keyToFoodId[key] = foodId;
        foodCount += 1;
      });
    }).then(function () {
      return sequence(records, function (record) {
        var servingName = String(record.serving_name || "").trim();
        var servingGrams = parseOptionalNumber(record.serving_grams, 0.1);
        if (!servingName || servingGrams == null) {
          return Promise.resolve();
        }

        var foodId = keyToFoodId[getFoodRecordKey(record)];
        if (!foodId) {
          return Promise.resolve();
        }

        return upsertServing(foodId, servingName, servingGrams, toBoolean(record.serving_is_default))
          .then(function () {
            servingCount += 1;
          });
      });
    }).then(function () {
      return {
        foods: foodCount,
        servings: servingCount
      };
    });
  }

  function upsertFoodFromRecord(record) {
    var knownId = resolveFoodId(record);
    var servingGrams = getServingGrams(record);
    var nutritionValues = computePer100gFromRecord(record, servingGrams);
    var payload = {
      name: String(getField(record, ["name", "food"]) || "").trim(),
      brand: String(getField(record, ["brand"]) || "").trim() || null,
      source: String(getField(record, ["source"]) || "coach").trim() || "coach",
      source_food_id: null,
      default_serving_g: servingGrams,
      kcal_100g: nutritionValues.kcal_100g,
      protein_g_100g: nutritionValues.protein_g_100g,
      carbs_g_100g: nutritionValues.carbs_g_100g,
      fats_g_100g: nutritionValues.fats_g_100g,
      fiber_g_100g: nutritionValues.fiber_g_100g,
      is_verified: true
    };

    var operation = knownId
      ? state.client.from("nutrition_foods").update(payload).eq("id", knownId).select("id").single()
      : state.client.from("nutrition_foods").insert([payload]).select("id").single();

    return operation.then(function (result) {
      if (result.error || !result.data || !result.data.id) {
        throw (result && result.error) || new Error("Failed to upsert food row.");
      }
      return String(result.data.id);
    });
  }

  function upsertServing(foodId, servingName, servingGrams, isDefault) {
    var before = Promise.resolve();
    if (isDefault) {
      before = state.client
        .from("nutrition_food_servings")
        .update({ is_default: false })
        .eq("food_id", foodId);
    }

    return before.then(function () {
      return state.client
        .from("nutrition_food_servings")
        .upsert([
          {
            food_id: foodId,
            serving_name: servingName,
            grams: servingGrams,
            is_default: !!isDefault
          }
        ], { onConflict: "food_id,serving_name" });
    }).then(function (result) {
      if (result && result.error) {
        throw result.error;
      }
    });
  }

  function resolveFoodId(record) {
    var explicitId = String(getField(record, ["food_id"]) || "").trim();
    if (explicitId) {
      var byId = (state.foodAdminRows || []).find(function (row) {
        return String(row.id || "") === explicitId;
      });
      if (byId) {
        return explicitId;
      }
    }

    var name = String(getField(record, ["name", "food"]) || "").trim().toLowerCase();
    var brand = String(getField(record, ["brand"]) || "").trim().toLowerCase();
    var byNameBrand = (state.foodAdminRows || []).find(function (row) {
      return String(row.name || "").trim().toLowerCase() === name
        && String(row.brand || "").trim().toLowerCase() === brand;
    });

    return byNameBrand ? String(byNameBrand.id || "") : "";
  }

  function csvHeader() {
    return [
      "food_id",
      "name",
      "brand",
      "source",
      "default_serving_g",
      "kcal_100g",
      "protein_g_100g",
      "carbs_g_100g",
      "fats_g_100g",
      "fiber_g_100g",
      "serving_name",
      "serving_grams",
      "serving_is_default"
    ];
  }

  function buildCsvRow(food, serving) {
    return [
      String(food.id || ""),
      String(food.name || ""),
      String(food.brand || ""),
      String(food.source || "coach"),
      numberToCsv(food.default_serving_g),
      numberToCsv(food.kcal_100g),
      numberToCsv(food.protein_g_100g),
      numberToCsv(food.carbs_g_100g),
      numberToCsv(food.fats_g_100g),
      numberToCsv(food.fiber_g_100g),
      serving ? String(serving.serving_name || "") : "",
      serving ? numberToCsv(serving.grams) : "",
      serving ? String(!!serving.is_default) : ""
    ];
  }

  function normalizeCsvHeader(value) {
    return String(value || "").trim().toLowerCase();
  }

  function mapCsvRow(header, row) {
    var mapped = {};
    header.forEach(function (key, index) {
      mapped[key] = row && row.length > index ? row[index] : "";
    });
    return mapped;
  }

  function parseCsv(text) {
    var normalizedText = String(text || "").replace(/^\uFEFF/, "");
    var firstLine = normalizedText.split(/\r?\n/)[0] || "";
    var commaCount = (firstLine.match(/,/g) || []).length;
    var tabCount = (firstLine.match(/\t/g) || []).length;

    if (tabCount > commaCount) {
      return parseTsv(normalizedText);
    }

    var rows = [];
    var currentRow = [];
    var current = "";
    var inQuotes = false;

    for (var i = 0; i < normalizedText.length; i += 1) {
      var ch = normalizedText[i];
      var next = normalizedText[i + 1];

      if (ch === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (ch === "," && !inQuotes) {
        currentRow.push(current);
        current = "";
        continue;
      }

      if ((ch === "\n" || ch === "\r") && !inQuotes) {
        if (ch === "\r" && next === "\n") {
          i += 1;
        }
        currentRow.push(current);
        if (currentRow.some(function (cell) { return String(cell || "").trim().length > 0; })) {
          rows.push(currentRow);
        }
        currentRow = [];
        current = "";
        continue;
      }

      current += ch;
    }

    if (current.length || currentRow.length) {
      currentRow.push(current);
      if (currentRow.some(function (cell) { return String(cell || "").trim().length > 0; })) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  function parseTsv(text) {
    return String(text || "")
      .split(/\r?\n/)
      .map(function (line) {
        return line.split("\t");
      })
      .filter(function (row) {
        return row.some(function (cell) {
          return String(cell || "").trim().length > 0;
        });
      });
  }

  function downloadCsv(fileName, rows) {
    var content = rows
      .map(function (row) {
        return row.map(escapeCsvCell).join(",");
      })
      .join("\n");

    var blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function escapeCsvCell(value) {
    var text = String(value == null ? "" : value);
    if (/[",\n\r]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function readFileText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(new Error("Could not read the CSV file.")); };
      reader.readAsText(file);
    });
  }

  function numberToCsv(value) {
    return Number.isFinite(value) ? String(value) : "";
  }

  function toBoolean(value) {
    var normalized = String(value == null ? "" : value).trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "y";
  }

  function getFoodRecordKey(record) {
    var explicitId = String(getField(record, ["food_id"]) || "").trim();
    if (explicitId) {
      return "id:" + explicitId;
    }
    var name = String(getField(record, ["name", "food"]) || "").trim().toLowerCase();
    var brand = String(getField(record, ["brand"]) || "").trim().toLowerCase();
    return "nb:" + name + "|" + brand;
  }

  function getField(record, keys) {
    for (var i = 0; i < keys.length; i += 1) {
      var key = String(keys[i] || "").toLowerCase();
      if (!key) continue;
      if (Object.prototype.hasOwnProperty.call(record, key) && record[key] != null && String(record[key]).trim() !== "") {
        return record[key];
      }
    }
    return "";
  }

  function getServingGrams(record) {
    var direct = parseOptionalNumber(getField(record, ["default_serving_g", "serving_grams"]), 0.1);
    if (direct != null) {
      return direct;
    }

    var servingSizeText = String(getField(record, ["serving_name", "serving size", "serving_size"]) || "");
    var inferred = inferGramsFromServingText(servingSizeText);
    if (inferred != null) {
      return inferred;
    }

    return 100;
  }

  function inferGramsFromServingText(text) {
    var value = String(text || "").toLowerCase();
    if (!value) return null;
    var gramsMatch = value.match(/([0-9]+(?:\.[0-9]+)?)\s*g\b/);
    if (gramsMatch && gramsMatch[1]) {
      var grams = parseOptionalNumber(gramsMatch[1], 0.1);
      if (grams != null) return grams;
    }

    var mlMatch = value.match(/([0-9]+(?:\.[0-9]+)?)\s*m(?:l|l)\b/);
    if (mlMatch && mlMatch[1]) {
      var ml = parseOptionalNumber(mlMatch[1], 0.1);
      if (ml != null) return ml;
    }

    return null;
  }

  function computePer100gFromRecord(record, servingGrams) {
    var kcal100 = parseOptionalNumber(getField(record, ["kcal_100g"]), 0);
    var protein100 = parseOptionalNumber(getField(record, ["protein_g_100g"]), 0);
    var carbs100 = parseOptionalNumber(getField(record, ["carbs_g_100g"]), 0);
    var fats100 = parseOptionalNumber(getField(record, ["fats_g_100g"]), 0);
    var fiber100 = parseOptionalNumber(getField(record, ["fiber_g_100g"]), 0);

    var fallbackKcal = parseOptionalNumber(getField(record, ["calories", "calories (kcal)"]), 0);
    var fallbackProtein = parseOptionalNumber(getField(record, ["protein (g)", "protein_g"]), 0);
    var fallbackCarbs = parseOptionalNumber(getField(record, ["carbs (g)", "carbs_g"]), 0);
    var fallbackFats = parseOptionalNumber(getField(record, ["fats (g)", "fat (g)", "fats_g"]), 0);
    var fallbackFiber = parseOptionalNumber(getField(record, ["fiber (g)", "fiber_g"]), 0);

    var factor = servingGrams > 0 ? (100 / servingGrams) : 1;

    return {
      kcal_100g: kcal100 != null ? kcal100 : ((fallbackKcal != null ? fallbackKcal * factor : 0) || 0),
      protein_g_100g: protein100 != null ? protein100 : ((fallbackProtein != null ? fallbackProtein * factor : 0) || 0),
      carbs_g_100g: carbs100 != null ? carbs100 : ((fallbackCarbs != null ? fallbackCarbs * factor : 0) || 0),
      fats_g_100g: fats100 != null ? fats100 : ((fallbackFats != null ? fallbackFats * factor : 0) || 0),
      fiber_g_100g: fiber100 != null ? fiber100 : ((fallbackFiber != null ? fallbackFiber * factor : 0) || 0)
    };
  }

  function sequence(items, worker) {
    return items.reduce(function (chain, item) {
      return chain.then(function () {
        return worker(item);
      });
    }, Promise.resolve());
  }

  function loadCatalog() {
    if (!state.client) return;

    setStatus("Loading foodbank...", "info");
    state.client
      .from("nutrition_foods")
      .select("id,name,brand,source,source_food_id,default_serving_g,kcal_100g,protein_g_100g,carbs_g_100g,fats_g_100g,fiber_g_100g,is_verified,updated_at")
      .order("is_verified", { ascending: false })
      .order("name", { ascending: true })
      .limit(1200)
      .then(function (result) {
        if (result.error) throw result.error;
        state.foodAdminRows = (result.data || []).map(normalizeFood);
        renderFoodList();
        setStatus("", "info");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load foodbank.", "error");
      });
  }

  function renderFoodList() {
    if (!state.foodAdminList) return;

    var rows = Array.isArray(state.foodAdminRows) ? state.foodAdminRows.slice() : [];
    var term = String(state.foodAdminFilterTerm || "").trim().toLowerCase();
    if (term) {
      rows = rows.filter(function (row) {
        var haystack = (String(row.name || "") + " " + String(row.brand || "") + " " + String(row.source || "")).toLowerCase();
        return haystack.indexOf(term) > -1;
      });
    }

    if (state.resultsSummaryEl) {
      state.resultsSummaryEl.textContent = rows.length + " foods in view";
    }

    if (!rows.length) {
      state.foodAdminList.innerHTML = '<p class="profile-loading">No foods match this filter.</p>';
      return;
    }

    state.foodAdminList.innerHTML = rows.slice(0, 250)
      .map(function (food) {
        var sourceLabel = food.source ? String(food.source) : "manual";
        var brandLabel = food.brand ? " - " + food.brand : "";
        return (
          '<article class="profile-nutrition-admin-food-row">' +
            '<div class="profile-nutrition-admin-food-head">' +
              '<h4>' + escapeHtml(food.name + brandLabel) + '</h4>' +
              '<div class="profile-nutrition-admin-food-actions">' +
                '<button type="button" class="btn profile-btn-cancel" data-food-admin-edit="' + escapeAttribute(food.id) + '">Edit</button>' +
                '<button type="button" class="btn profile-btn-delete" data-food-admin-delete="' + escapeAttribute(food.id) + '">Delete</button>' +
              '</div>' +
            '</div>' +
            '<p class="profile-nutrition-admin-food-meta">' +
              escapeHtml('Source: ' + sourceLabel + ' - ' + formatInteger(food.kcal_100g) + ' kcal - P ' + formatDecimal(food.protein_g_100g, 1) + 'g - C ' + formatDecimal(food.carbs_g_100g, 1) + 'g - F ' + formatDecimal(food.fats_g_100g, 1) + 'g - Fiber ' + formatDecimal(food.fiber_g_100g, 1) + 'g') +
            '</p>' +
          '</article>'
        );
      })
      .join("");
  }

  function onFoodAdminSubmit(event) {
    event.preventDefault();
    if (!state.client) return;

    var name = String(state.foodAdminName && state.foodAdminName.value || "").trim();
    if (!name) {
      setStatus("Food name is required.", "error");
      return;
    }

    var servingGrams = parseOptionalNumber(state.foodAdminServingGrams && state.foodAdminServingGrams.value, 0.1);
    if (servingGrams == null) {
      setStatus("Default serving grams must be greater than 0.", "error");
      return;
    }

    var payload = {
      name: name,
      brand: String(state.foodAdminBrand && state.foodAdminBrand.value || "").trim() || null,
      source: "coach",
      source_food_id: null,
      default_serving_g: servingGrams,
      kcal_100g: parseOptionalNumber(state.foodAdminCalories && state.foodAdminCalories.value, 0) || 0,
      protein_g_100g: parseOptionalNumber(state.foodAdminProtein && state.foodAdminProtein.value, 0) || 0,
      carbs_g_100g: parseOptionalNumber(state.foodAdminCarbs && state.foodAdminCarbs.value, 0) || 0,
      fats_g_100g: parseOptionalNumber(state.foodAdminFats && state.foodAdminFats.value, 0) || 0,
      fiber_g_100g: parseOptionalNumber(state.foodAdminFiber && state.foodAdminFiber.value, 0) || 0,
      is_verified: true
    };

    var foodId = String(state.foodAdminId && state.foodAdminId.value || "").trim();
    setStatus(foodId ? "Updating food..." : "Adding food...", "info");

    var operation = foodId
      ? state.client.from("nutrition_foods").update(payload).eq("id", foodId).select("id,name").single()
      : state.client.from("nutrition_foods").insert([payload]).select("id,name").single();

    operation
      .then(function (result) {
        if (result.error || !result.data || !result.data.id) {
          throw (result && result.error) || new Error("Could not save food.");
        }

        var servingName = String(state.foodAdminServingLabel && state.foodAdminServingLabel.value || "").trim() || "1 serving";
        var savedFoodId = String(result.data.id);
        var savedFoodName = String(result.data.name || name);

        return ensureDefaultServingForFood(savedFoodId, servingName, servingGrams)
          .then(function () {
            return loadCatalog();
          })
          .then(function () {
            selectFoodForServingManager(savedFoodId, savedFoodName);
            setStatus("Food saved.", "success");
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save food.", "error");
      });
  }

  function onFoodAdminEdit(foodId) {
    var id = String(foodId || "").trim();
    if (!id) return;

    var food = (state.foodAdminRows || []).find(function (row) {
      return String(row.id || "") === id;
    });
    if (!food) return;

    if (state.foodAdminId) state.foodAdminId.value = food.id || "";
    if (state.foodAdminName) state.foodAdminName.value = food.name || "";
    if (state.foodAdminBrand) state.foodAdminBrand.value = food.brand || "";
    if (state.foodAdminCalories) state.foodAdminCalories.value = String(food.kcal_100g || 0);
    if (state.foodAdminProtein) state.foodAdminProtein.value = String(food.protein_g_100g || 0);
    if (state.foodAdminCarbs) state.foodAdminCarbs.value = String(food.carbs_g_100g || 0);
    if (state.foodAdminFats) state.foodAdminFats.value = String(food.fats_g_100g || 0);
    if (state.foodAdminFiber) state.foodAdminFiber.value = String(food.fiber_g_100g || 0);
    if (state.foodAdminServingGrams) state.foodAdminServingGrams.value = String(food.default_serving_g || 100);

    selectFoodForServingManager(id, food.name || "");
    setStatus("Editing food: " + (food.name || ""), "info");
  }

  function onFoodAdminDelete(foodId) {
    var id = String(foodId || "").trim();
    if (!id || !state.client) return;

    if (!window.confirm("Delete this food from the database? Existing athlete entries that reference this food may block deletion.")) {
      return;
    }

    setStatus("Deleting food...", "info");
    state.client
      .from("nutrition_foods")
      .delete()
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        if (state.selectedFoodId === id) {
          state.selectedFoodId = "";
          state.servingRows = [];
          renderServingManager();
        }

        if (state.foodAdminId && String(state.foodAdminId.value || "") === id) {
          resetFoodAdminForm(false);
        }

        return loadCatalog().then(function () {
          setStatus("Food deleted.", "success");
        });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete food.", "error");
      });
  }

  function selectFoodForServingManager(foodId, foodName) {
    state.selectedFoodId = String(foodId || "").trim();
    if (!state.selectedFoodId) {
      state.servingRows = [];
      renderServingManager();
      return;
    }

    if (state.servingTitleEl) {
      state.servingTitleEl.textContent = "Managing servings for: " + String(foodName || "Selected Food");
    }

    state.client
      .from("nutrition_food_servings")
      .select("id,food_id,serving_name,grams,is_default")
      .eq("food_id", state.selectedFoodId)
      .order("is_default", { ascending: false })
      .order("grams", { ascending: true })
      .then(function (result) {
        if (result.error) throw result.error;
        state.servingRows = (result.data || []).map(normalizeServing);
        var currentDefault = state.servingRows.find(function (row) { return !!row.is_default; }) || null;
        if (state.foodAdminServingLabel) {
          state.foodAdminServingLabel.value = currentDefault ? String(currentDefault.serving_name || "") : "";
        }
        if (state.foodAdminServingGrams && currentDefault) {
          state.foodAdminServingGrams.value = String(parseOptionalNumber(currentDefault.grams, 0.1) || 100);
        }
        renderServingManager();
      })
      .catch(function (error) {
        state.servingRows = [];
        renderServingManager();
        setStatus(error && error.message ? error.message : "Failed to load serving options.", "error");
      });
  }

  function renderServingManager() {
    if (!state.servingManagerEl || !state.servingEmptyEl || !state.servingListEl) return;

    var hasSelection = !!state.selectedFoodId;
    state.servingEmptyEl.hidden = hasSelection;
    state.servingManagerEl.hidden = !hasSelection;

    if (!hasSelection) {
      return;
    }

    var rows = Array.isArray(state.servingRows) ? state.servingRows : [];
    if (!rows.length) {
      state.servingListEl.innerHTML = '<p class="profile-loading">No servings yet. Add one above.</p>';
      return;
    }

    state.servingListEl.innerHTML = rows
      .map(function (serving) {
        return (
          '<article class="foodbank-serving-row">' +
            '<div>' +
              '<strong>' + escapeHtml(String(serving.serving_name || "Serving")) + '</strong>' +
              (serving.is_default ? ' <span class="foodbank-serving-default">Default</span>' : '') +
              '<p class="profile-nutrition-admin-food-meta" style="margin-top:0.2rem;">' +
                escapeHtml(formatDecimal(serving.grams, 1) + " g") +
              '</p>' +
            '</div>' +
            '<button type="button" class="btn profile-btn-delete" data-serving-delete="' + escapeAttribute(serving.id || "") + '">Delete</button>' +
          '</article>'
        );
      })
      .join("");
  }

  function onServingSubmit(event) {
    event.preventDefault();

    if (!state.client || !state.selectedFoodId) {
      setStatus("Select a food first.", "error");
      return;
    }

    var servingName = String(state.servingNameEl && state.servingNameEl.value || "").trim();
    if (!servingName) {
      setStatus("Serving name is required.", "error");
      return;
    }

    var grams = parseOptionalNumber(state.servingGramsEl && state.servingGramsEl.value, 0.1);
    if (grams == null) {
      setStatus("Serving grams must be greater than 0.", "error");
      return;
    }

    var shouldBeDefault = !!(state.servingDefaultEl && state.servingDefaultEl.checked);
    setStatus("Saving serving...", "info");

    var before = Promise.resolve();
    if (shouldBeDefault) {
      before = state.client
        .from("nutrition_food_servings")
        .update({ is_default: false })
        .eq("food_id", state.selectedFoodId);
    }

    before
      .then(function () {
        return state.client
          .from("nutrition_food_servings")
          .upsert([
            {
              food_id: state.selectedFoodId,
              serving_name: servingName,
              grams: grams,
              is_default: shouldBeDefault
            }
          ], { onConflict: "food_id,serving_name" });
      })
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }

        if (shouldBeDefault && state.foodAdminServingLabel && state.foodAdminServingGrams) {
          state.foodAdminServingLabel.value = servingName;
          state.foodAdminServingGrams.value = String(grams);
        }

        if (state.servingNameEl) state.servingNameEl.value = "";
        if (state.servingGramsEl) state.servingGramsEl.value = "";
        if (state.servingDefaultEl) state.servingDefaultEl.checked = false;

        var selected = getSelectedFood();
        return selectFoodForServingManager(state.selectedFoodId, selected ? selected.name : "");
      })
      .then(function () {
        setStatus("Serving saved.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save serving.", "error");
      });
  }

  function onServingDelete(servingId) {
    var id = String(servingId || "").trim();
    if (!id || !state.client || !state.selectedFoodId) {
      return;
    }

    setStatus("Deleting serving...", "info");
    state.client
      .from("nutrition_food_servings")
      .delete()
      .eq("id", id)
      .then(function (result) {
        if (result.error) throw result.error;

        var selected = getSelectedFood();
        return selectFoodForServingManager(state.selectedFoodId, selected ? selected.name : "");
      })
      .then(function () {
        setStatus("Serving deleted.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete serving.", "error");
      });
  }

  function ensureDefaultServingForFood(foodId, servingName, grams) {
    if (!state.client || !foodId) {
      return Promise.resolve();
    }

    return state.client
      .from("nutrition_food_servings")
      .update({ is_default: false })
      .eq("food_id", foodId)
      .then(function () {
        return state.client
          .from("nutrition_food_servings")
          .upsert([
            {
              food_id: foodId,
              serving_name: servingName,
              grams: grams,
              is_default: true
            }
          ], { onConflict: "food_id,serving_name" });
      })
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }
      });
  }

  function getSelectedFood() {
    return (state.foodAdminRows || []).find(function (row) {
      return String(row.id || "") === String(state.selectedFoodId || "");
    }) || null;
  }

  function resetFoodAdminForm(clearStatus) {
    if (state.foodAdminId) state.foodAdminId.value = "";
    if (state.foodAdminName) state.foodAdminName.value = "";
    if (state.foodAdminBrand) state.foodAdminBrand.value = "";
    if (state.foodAdminCalories) state.foodAdminCalories.value = "";
    if (state.foodAdminProtein) state.foodAdminProtein.value = "";
    if (state.foodAdminCarbs) state.foodAdminCarbs.value = "";
    if (state.foodAdminFats) state.foodAdminFats.value = "";
    if (state.foodAdminFiber) state.foodAdminFiber.value = "";
    if (state.foodAdminServingLabel) state.foodAdminServingLabel.value = "";
    if (state.foodAdminServingGrams) state.foodAdminServingGrams.value = "100";

    if (clearStatus) {
      setStatus("", "info");
    }
  }

  function normalizeFood(row) {
    var source = row && row.source != null ? String(row.source).trim() : "";
    return {
      id: row && row.id ? String(row.id) : "",
      name: row && row.name ? String(row.name).trim() : "",
      brand: row && row.brand ? String(row.brand).trim() : "",
      source: source || "manual",
      source_food_id: row && row.source_food_id ? String(row.source_food_id) : "",
      default_serving_g: parseOptionalNumber(row && row.default_serving_g, 0.1),
      kcal_100g: parseOptionalNumber(row && row.kcal_100g, 0),
      protein_g_100g: parseOptionalNumber(row && row.protein_g_100g, 0),
      carbs_g_100g: parseOptionalNumber(row && row.carbs_g_100g, 0),
      fats_g_100g: parseOptionalNumber(row && row.fats_g_100g, 0),
      fiber_g_100g: parseOptionalNumber(row && row.fiber_g_100g, 0),
      is_verified: !!(row && row.is_verified)
    };
  }

  function normalizeServing(row) {
    return {
      id: row && row.id ? String(row.id) : "",
      food_id: row && row.food_id ? String(row.food_id) : "",
      serving_name: row && row.serving_name ? String(row.serving_name).trim() : "",
      grams: parseOptionalNumber(row && row.grams, 0.1),
      is_default: !!(row && row.is_default)
    };
  }

  function parseOptionalNumber(value, minValue) {
    if (value == null || value === "") {
      return null;
    }

    var number = Number(value);
    if (!Number.isFinite(number)) {
      return null;
    }

    if (minValue != null && number < minValue) {
      return null;
    }

    return number;
  }

  function setStatus(message, variant) {
    if (!state.statusEl) return;

    state.statusEl.textContent = message || "";
    state.statusEl.classList.remove("status-success", "status-error", "status-info");
    if (!message) return;

    state.statusEl.classList.add(
      variant === "success" ? "status-success" : (variant === "error" ? "status-error" : "status-info")
    );
  }

  function formatDecimal(value, digits) {
    if (!Number.isFinite(value)) {
      return "-";
    }
    return Number(value).toFixed(Number.isFinite(digits) ? digits : 0);
  }

  function formatInteger(value) {
    if (!Number.isFinite(value)) {
      return "-";
    }
    return String(Math.round(value));
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
