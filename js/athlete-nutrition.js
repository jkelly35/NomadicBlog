(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var NUTRITION_LOGS_FALLBACK_KEY = "nomadic_athlete_nutrition_logs_v1";
  var NUTRITION_TARGETS_FALLBACK_KEY = "nomadic_athlete_nutrition_targets_v1";

  var state = {
    client: null,
    user: null,
    viewUser: null,
    isCoachView: false,
    viewedAthleteId: null,
    guardElement: null,
    contentElement: null,
    backLink: null,
    nutritionForm: null,
    nutritionResetButton: null,
    nutritionTargetsForm: null,
    nutritionToday: null,
    nutritionSummary: null,
    nutritionList: null,
    nutritionStatus: null,
    foodSearchInput: null,
    foodDateInput: null,
    foodResults: null,
    foodSelected: null,
    foodServingSelect: null,
    foodQuantityInput: null,
    foodPreview: null,
    foodAddButton: null,
    foodEntries: null,
    foodCatalogRows: [],
    foodEntryRows: [],
    foodServings: [],
    selectedFood: null,
    foodSearchToken: 0,
    nutritionLogSection: null,
    nutritionTargetsSection: null,
    nutritionLogs: [],
    nutritionTargets: null,
    nutritionLogsAvailable: true,
    nutritionTargetsAvailable: true
  };

  document.addEventListener("DOMContentLoaded", function () {
    initializePage();
  });

  function initializePage() {
    state.guardElement = document.querySelector("[data-nutrition-guard]");
    state.contentElement = document.querySelector("[data-nutrition-content]");
    state.backLink = document.querySelector("[data-nutrition-back-link]");
    state.nutritionForm = document.querySelector("[data-nutrition-form]");
    state.nutritionResetButton = document.querySelector("[data-nutrition-reset]");
    state.nutritionTargetsForm = document.querySelector("[data-nutrition-targets-form]");
    state.nutritionToday = document.querySelector("[data-nutrition-today]");
    state.nutritionSummary = document.querySelector("[data-nutrition-summary]");
    state.nutritionList = document.querySelector("[data-nutrition-list]");
    state.nutritionStatus = document.querySelector("[data-nutrition-status]");
    state.foodSearchInput = document.querySelector("[data-food-search]");
    state.foodDateInput = document.querySelector("[data-food-date]");
    state.foodResults = document.querySelector("[data-food-results]");
    state.foodSelected = document.querySelector("[data-food-selected]");
    state.foodServingSelect = document.querySelector("[data-food-serving]");
    state.foodQuantityInput = document.querySelector("[data-food-quantity]");
    state.foodPreview = document.querySelector("[data-food-preview]");
    state.foodAddButton = document.querySelector("[data-food-add-entry]");
    state.foodEntries = document.querySelector("[data-food-entries]");
    state.nutritionLogSection = document.getElementById("nutrition-log-section");
    state.nutritionTargetsSection = document.getElementById("nutrition-targets-section");

    if (!window.supabase || !window.supabase.createClient) {
      showError("Supabase client library failed to load.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      showError("Supabase configuration is incomplete.");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session || !session.user) {
        redirectToHome();
        return;
      }

      state.user = session.user;
      configureViewingContext().then(function (ok) {
        if (ok === false) {
          return;
        }

        hideGuard();
        showContent();
        applyPageContext();
        bindEvents();
        loadNutritionData();
      }).catch(function (error) {
        showError(error && error.message ? error.message : "Could not load nutrition tracker.");
      });
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function configureViewingContext() {
    state.viewUser = state.user;
    state.viewedAthleteId = null;
    state.isCoachView = false;

    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (e) {
      return Promise.resolve(true);
    }

    var wantsCoachView = params.get("coachView") === "1";
    var athleteId = String(params.get("athleteId") || "").trim();
    var isAdminUser = !!state.user.email && String(state.user.email).toLowerCase() === ADMIN_EMAIL;

    if (!wantsCoachView || !athleteId) {
      return Promise.resolve(true);
    }

    if (!isAdminUser) {
      return Promise.reject(new Error("Coach nutrition access is only available to admin accounts."));
    }

    state.isCoachView = true;
    state.viewedAthleteId = athleteId;

    return state.client
      .from("admin_all_users")
      .select("user_id,email,user_created_at,last_sign_in_at")
      .eq("user_id", athleteId)
      .single()
      .then(function (result) {
        if (result.error || !result.data) {
          throw new Error("Athlete was not found for this coach view link.");
        }

        state.viewUser = {
          id: result.data.user_id,
          email: result.data.email,
          created_at: result.data.user_created_at,
          last_sign_in_at: result.data.last_sign_in_at
        };

        return true;
      });
  }

  function applyPageContext() {
    if (state.backLink) {
      if (state.isCoachView && state.viewedAthleteId) {
        state.backLink.href = "profile.html?coachView=1&athleteId=" + encodeURIComponent(state.viewedAthleteId);
        state.backLink.textContent = "Back to Athlete Profile";
      } else {
        state.backLink.href = "profile.html";
        state.backLink.textContent = "Back to Dashboard";
      }
    }

    var heading = document.querySelector(".section-heading");
    var subtitle = document.querySelector(".profile-dashboard-subtitle");
    if (heading) {
      heading.textContent = state.isCoachView ? "Coach Nutrition Goals" : "Nutrition Tracker";
    }

    if (subtitle) {
      subtitle.textContent = state.isCoachView
        ? "Set nutritional targets for this athlete and review their current progress."
        : "Log food, hydration, and daily nutrition feedback in one place.";
    }

    if (state.nutritionLogSection) {
      state.nutritionLogSection.hidden = !!state.isCoachView;
    }

    if (state.nutritionTargetsSection) {
      state.nutritionTargetsSection.classList.toggle("profile-section-wide", !!state.isCoachView);
    }
  }

  function bindEvents() {
    if (state.isCoachView && state.nutritionForm) {
      state.nutritionForm.hidden = true;
    }

    if (state.isCoachView && state.nutritionResetButton) {
      state.nutritionResetButton.hidden = true;
    }

    if (state.nutritionTargetsForm) {
      state.nutritionTargetsForm.addEventListener("submit", onNutritionTargetsSubmit);
    }

    if (state.nutritionForm) {
      state.nutritionForm.addEventListener("submit", onNutritionLogSubmit);
    }

    if (state.nutritionResetButton) {
      state.nutritionResetButton.addEventListener("click", function () {
        resetNutritionLogForm(true);
      });
    }

    if (state.nutritionList) {
      state.nutritionList.addEventListener("click", function (event) {
        var deleteBtn = event.target && event.target.closest("[data-nutrition-delete]");
        if (!deleteBtn) {
          return;
        }

        onNutritionLogDelete(
          String(deleteBtn.getAttribute("data-nutrition-delete") || ""),
          String(deleteBtn.getAttribute("data-nutrition-date") || "")
        );
      });
    }

    if (state.foodSearchInput) {
      state.foodSearchInput.addEventListener("input", function () {
        renderFoodSearchResults(String(state.foodSearchInput.value || ""));
      });
    }

    if (state.foodResults) {
      state.foodResults.addEventListener("click", function (event) {
        var row = event.target && event.target.closest("[data-food-select]");
        if (!row) {
          return;
        }

        var foodId = String(row.getAttribute("data-food-select") || "");
        if (!foodId) {
          return;
        }

        selectFoodById(foodId);
      });
    }

    if (state.foodServingSelect) {
      state.foodServingSelect.addEventListener("change", function () {
        renderSelectedFoodPreview();
      });
    }

    if (state.foodQuantityInput) {
      state.foodQuantityInput.addEventListener("input", function () {
        renderSelectedFoodPreview();
      });
    }

    if (state.foodAddButton) {
      state.foodAddButton.addEventListener("click", onAddFoodEntry);
    }

    if (state.foodEntries) {
      state.foodEntries.addEventListener("click", function (event) {
        var deleteBtn = event.target && event.target.closest("[data-food-entry-delete]");
        if (!deleteBtn) {
          return;
        }

        var entryId = String(deleteBtn.getAttribute("data-food-entry-delete") || "");
        var loggedOn = String(deleteBtn.getAttribute("data-food-date") || "");
        if (!entryId || !loggedOn) {
          return;
        }

        deleteFoodEntry(entryId, loggedOn);
      });
    }
  }

  function loadNutritionData() {
    if (!state.client || !getUserId()) {
      return;
    }

    setNutritionStatus("Loading nutrition logs and targets...", "info");
    resetNutritionLogForm(false);
    if (state.foodDateInput) {
      state.foodDateInput.value = getTodayDateInputValue();
    }

    Promise.all([loadNutritionTargets(), loadNutritionLogs(), loadFoodEntries()])
      .then(function () {
        renderNutritionDashboard();
        renderFoodSearchResults("");
        if (!state.nutritionLogsAvailable || !state.nutritionTargetsAvailable) {
          setNutritionStatus(
            "Nutrition tables are not set up yet. Entries are saved locally until SQL migration is applied.",
            "info"
          );
          return;
        }

        setNutritionStatus("", "info");
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to load nutrition tracking data.", "error");
      });
  }

  function loadNutritionTargets() {
    var userId = getUserId();
    if (!state.client || !userId) {
      state.nutritionTargets = null;
      return Promise.resolve(null);
    }

    return state.client
      .from("athlete_nutrition_targets")
      .select("id,user_id,target_calories,target_protein_g,target_carbs_g,target_fats_g,target_hydration_l,target_fiber_g,updated_at")
      .eq("user_id", userId)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingNutritionTableError(result.error)) {
            state.nutritionTargetsAvailable = false;
            state.nutritionTargets = readNutritionTargetsFallback(userId);
            return state.nutritionTargets;
          }
          throw result.error;
        }

        state.nutritionTargetsAvailable = true;
        state.nutritionTargets = result.data ? normalizeNutritionTargets(result.data) : null;
        writeNutritionTargetsFallback(userId, state.nutritionTargets);
        return state.nutritionTargets;
      });
  }

  function loadNutritionLogs() {
    var userId = getUserId();
    if (!state.client || !userId) {
      state.nutritionLogs = [];
      return Promise.resolve([]);
    }

    return state.client
      .from("athlete_nutrition_logs")
      .select("id,user_id,logged_on,calories,protein_g,carbs_g,fats_g,fiber_g,hydration_l,meal_quality,energy_level,hunger_level,notes,created_at,updated_at")
      .eq("user_id", userId)
      .order("logged_on", { ascending: false })
      .limit(180)
      .then(function (result) {
        if (result.error) {
          if (isMissingNutritionTableError(result.error)) {
            state.nutritionLogsAvailable = false;
            state.nutritionLogs = readNutritionLogsFallback(userId);
            return state.nutritionLogs;
          }
          throw result.error;
        }

        state.nutritionLogsAvailable = true;
        state.nutritionLogs = (result.data || []).map(normalizeNutritionLog);
        writeNutritionLogsFallback(userId, state.nutritionLogs);
        return state.nutritionLogs;
      });
  }

  function renderNutritionDashboard() {
    renderNutritionTargetsForm();
    renderNutritionTodayProgress();
    renderNutritionSummary();
    renderNutritionList();
    renderFoodEntries();
  }

  function renderNutritionTargetsForm() {
    if (!state.nutritionTargetsForm) {
      return;
    }

    var form = state.nutritionTargetsForm;
    var targets = state.nutritionTargets || {};

    setInputValue(form, "target_calories", targets.target_calories);
    setInputValue(form, "target_protein_g", targets.target_protein_g);
    setInputValue(form, "target_carbs_g", targets.target_carbs_g);
    setInputValue(form, "target_fats_g", targets.target_fats_g);
    setInputValue(form, "target_hydration_l", targets.target_hydration_l);
    setInputValue(form, "target_fiber_g", targets.target_fiber_g);
  }

  function renderNutritionTodayProgress() {
    if (!state.nutritionToday) {
      return;
    }

    var logs = sortNutritionLogs(state.nutritionLogs || []);
    var todayKey = getTodayDateInputValue();
    var todayLog = logs.find(function (log) {
      return String(log.logged_on || "") === todayKey;
    }) || null;
    var targets = state.nutritionTargets || {};

    var metrics = [
      { key: "calories", targetKey: "target_calories", label: "Calories", unit: "kcal", decimals: 0 },
      { key: "protein_g", targetKey: "target_protein_g", label: "Protein", unit: "g", decimals: 0 },
      { key: "carbs_g", targetKey: "target_carbs_g", label: "Carbs", unit: "g", decimals: 0 },
      { key: "fats_g", targetKey: "target_fats_g", label: "Fat", unit: "g", decimals: 0 },
      { key: "fiber_g", targetKey: "target_fiber_g", label: "Fiber", unit: "g", decimals: 0 },
      { key: "hydration_l", targetKey: "target_hydration_l", label: "Hydration", unit: "L", decimals: 1 }
    ];

    state.nutritionToday.innerHTML = metrics.map(function (metric) {
      var consumed = todayLog && Number.isFinite(todayLog[metric.key]) ? todayLog[metric.key] : null;
      var target = Number.isFinite(targets[metric.targetKey]) ? targets[metric.targetKey] : null;
      var remaining = (target != null && consumed != null) ? Math.max(target - consumed, 0) : null;
      var pct = (target != null && target > 0 && consumed != null)
        ? Math.max(0, Math.min((consumed / target) * 100, 100))
        : 0;

      return (
        '<article class="profile-nutrition-progress-card">' +
          '<div class="profile-nutrition-progress-head">' +
            '<span class="profile-nutrition-progress-label">' + escapeHtml(metric.label) + '</span>' +
            '<strong class="profile-nutrition-progress-value">' +
              escapeHtml(formatNutritionValue(consumed, metric.decimals, metric.unit)) +
              ' / ' +
              escapeHtml(formatNutritionValue(target, metric.decimals, metric.unit)) +
            '</strong>' +
          '</div>' +
          '<div class="profile-nutrition-progress-bar"><span style="width:' + escapeAttribute(formatDecimal(pct, 0)) + '%"></span></div>' +
          '<p class="profile-nutrition-progress-meta">Remaining: ' + escapeHtml(formatNutritionValue(remaining, metric.decimals, metric.unit)) + '</p>' +
        '</article>'
      );
    }).join("");
  }

  function renderNutritionSummary() {
    if (!state.nutritionSummary) {
      return;
    }

    var logs = sortNutritionLogs(state.nutritionLogs || []);
    if (!logs.length) {
      state.nutritionSummary.innerHTML =
        '<article class="profile-nutrition-summary-card"><span class="profile-nutrition-summary-card-label">Summary</span><strong class="profile-nutrition-summary-card-value">No nutrition logs yet</strong></article>';
      return;
    }

    var recent = logs.slice(0, 7);
    var averages = {
      calories: averageNumeric(recent, "calories"),
      protein_g: averageNumeric(recent, "protein_g"),
      carbs_g: averageNumeric(recent, "carbs_g"),
      fats_g: averageNumeric(recent, "fats_g"),
      fiber_g: averageNumeric(recent, "fiber_g"),
      hydration_l: averageNumeric(recent, "hydration_l")
    };

    var adherence = calculateNutritionAdherence(averages, state.nutritionTargets);
    var lastLogged = logs[0] && logs[0].logged_on ? formatGoalDate(logs[0].logged_on) : "-";

    var cards = [
      { label: "Last Logged", value: lastLogged },
      { label: "7-Day Logs", value: String(recent.length) },
      { label: "7d Avg Calories", value: formatNullableNumber(averages.calories, " kcal") },
      { label: "7d Avg Protein", value: formatNullableNumber(averages.protein_g, " g") },
      { label: "7d Avg Carbs", value: formatNullableNumber(averages.carbs_g, " g") },
      { label: "7d Avg Fat", value: formatNullableNumber(averages.fats_g, " g") },
      { label: "7d Avg Hydration", value: formatNullableNumber(averages.hydration_l, " L") },
      { label: "Target Adherence", value: adherence }
    ];

    state.nutritionSummary.innerHTML = cards
      .map(function (item) {
        return (
          '<article class="profile-nutrition-summary-card">' +
            '<span class="profile-nutrition-summary-card-label">' + escapeHtml(item.label) + '</span>' +
            '<strong class="profile-nutrition-summary-card-value">' + escapeHtml(item.value) + '</strong>' +
          '</article>'
        );
      })
      .join("");
  }

  function renderNutritionList() {
    if (!state.nutritionList) {
      return;
    }

    var logs = sortNutritionLogs(state.nutritionLogs || []);
    if (!logs.length) {
      state.nutritionList.innerHTML = '<p class="profile-loading">No nutrition logs yet. Add your first entry above.</p>';
      return;
    }

    var visible = logs.slice(0, 14);
    state.nutritionList.innerHTML = visible
      .map(function (log) {
        var chips = [];
        if (log.calories != null) chips.push("Calories " + formatInteger(log.calories));
        if (log.protein_g != null) chips.push("Protein " + formatInteger(log.protein_g) + "g");
        if (log.carbs_g != null) chips.push("Carbs " + formatInteger(log.carbs_g) + "g");
        if (log.fats_g != null) chips.push("Fat " + formatInteger(log.fats_g) + "g");
        if (log.fiber_g != null) chips.push("Fiber " + formatInteger(log.fiber_g) + "g");
        if (log.hydration_l != null) chips.push("Hydration " + formatDecimal(log.hydration_l, 1) + "L");
        if (log.meal_quality != null) chips.push("Meal Quality " + formatInteger(log.meal_quality) + "/5");
        if (log.energy_level != null) chips.push("Energy " + formatInteger(log.energy_level) + "/5");
        if (log.hunger_level != null) chips.push("Hunger Control " + formatInteger(log.hunger_level) + "/5");

        return (
          '<article class="profile-nutrition-log-item">' +
            '<div class="profile-nutrition-log-head">' +
              '<h3 class="profile-nutrition-log-date">' + escapeHtml(formatGoalDate(log.logged_on)) + '</h3>' +
              '<button type="button" class="profile-nutrition-log-delete" data-nutrition-delete="' +
                escapeAttribute(log.id || "") +
                '" data-nutrition-date="' +
                escapeAttribute(log.logged_on || "") +
              '">Delete</button>' +
            '</div>' +
            '<div class="profile-nutrition-log-grid">' +
              chips.map(function (chip) {
                return '<span class="profile-nutrition-chip">' + escapeHtml(chip) + '</span>';
              }).join("") +
            '</div>' +
            (log.notes ? '<p class="profile-nutrition-notes">' + escapeHtml(log.notes) + '</p>' : '') +
          '</article>'
        );
      })
      .join("");
  }

  function loadFoodEntries() {
    var userId = getUserId();
    if (!state.client || !userId) {
      state.foodEntryRows = [];
      return Promise.resolve([]);
    }

    return state.client
      .from("athlete_nutrition_food_entries")
      .select("id,user_id,logged_on,food_id,serving_id,quantity,grams_consumed,calories,protein_g,carbs_g,fats_g,fiber_g,created_at,updated_at,food:nutrition_foods(name,brand),serving:nutrition_food_servings(serving_name,grams)")
      .eq("user_id", userId)
      .order("logged_on", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(240)
      .then(function (result) {
        if (result.error) {
          if (isMissingNutritionTableError(result.error)) {
            state.foodEntryRows = [];
            return state.foodEntryRows;
          }
          throw result.error;
        }

        state.foodEntryRows = (result.data || []).map(normalizeFoodEntry);
        return state.foodEntryRows;
      });
  }

  function renderFoodEntries() {
    if (!state.foodEntries) {
      return;
    }

    var rows = Array.isArray(state.foodEntryRows) ? state.foodEntryRows : [];
    if (!rows.length) {
      state.foodEntries.innerHTML = '<p class="profile-loading">No food entries logged yet.</p>';
      return;
    }

    var visible = rows.slice(0, 20);
    state.foodEntries.innerHTML = visible
      .map(function (entry) {
        var foodName = entry.food_name || "Food entry";
        var servingText = entry.serving_name
          ? entry.serving_name + " x " + formatDecimal(entry.quantity || 1, 1)
          : formatDecimal(entry.grams_consumed || 0, 0) + " g";

        return (
          '<article class="profile-nutrition-food-entry">' +
            '<div class="profile-nutrition-food-entry-head">' +
              '<h4>' + escapeHtml(foodName) + '</h4>' +
              '<button type="button" class="profile-nutrition-log-delete" data-food-entry-delete="' +
                escapeAttribute(entry.id || "") +
                '" data-food-date="' +
                escapeAttribute(entry.logged_on || "") +
              '">Delete</button>' +
            '</div>' +
            '<p class="profile-nutrition-food-entry-meta">' +
              escapeHtml(formatGoalDate(entry.logged_on) + " • " + servingText) +
            '</p>' +
            '<div class="profile-nutrition-log-grid">' +
              '<span class="profile-nutrition-chip">Calories ' + escapeHtml(formatInteger(entry.calories || 0)) + '</span>' +
              '<span class="profile-nutrition-chip">Protein ' + escapeHtml(formatDecimal(entry.protein_g || 0, 1)) + 'g</span>' +
              '<span class="profile-nutrition-chip">Carbs ' + escapeHtml(formatDecimal(entry.carbs_g || 0, 1)) + 'g</span>' +
              '<span class="profile-nutrition-chip">Fat ' + escapeHtml(formatDecimal(entry.fats_g || 0, 1)) + 'g</span>' +
              '<span class="profile-nutrition-chip">Fiber ' + escapeHtml(formatDecimal(entry.fiber_g || 0, 1)) + 'g</span>' +
            '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  function renderFoodSearchResults(term) {
    if (!state.foodResults || state.isCoachView) {
      return;
    }

    var searchTerm = String(term || "").trim();
    var token = state.foodSearchToken + 1;
    state.foodSearchToken = token;
    state.foodResults.innerHTML = '<p class="profile-loading">Loading foods...</p>';

    searchFoods(searchTerm)
      .then(function (rows) {
        if (token !== state.foodSearchToken) {
          return;
        }

        state.foodCatalogRows = rows;
        if (!rows.length) {
          state.foodResults.innerHTML = '<p class="profile-loading">No foods found. Try another search.</p>';
          return;
        }

        state.foodResults.innerHTML = rows
          .map(function (food) {
            var brand = food.brand ? " • " + food.brand : "";
            var calories = Number.isFinite(food.kcal_100g) ? formatInteger(food.kcal_100g) + " kcal / 100g" : "Nutrition data unavailable";
            return (
              '<button type="button" class="profile-nutrition-food-row" data-food-select="' + escapeAttribute(food.id) + '">' +
                '<strong>' + escapeHtml(food.name + brand) + '</strong>' +
                '<span>' + escapeHtml(calories) + '</span>' +
              '</button>'
            );
          })
          .join("");
      })
      .catch(function () {
        if (token !== state.foodSearchToken) {
          return;
        }
        state.foodResults.innerHTML = '<p class="profile-loading">Food database unavailable. Run nutrition SQL migration.</p>';
      });
  }

  function searchFoods(searchTerm) {
    if (!state.client) {
      return Promise.resolve([]);
    }

    var query = state.client
      .from("nutrition_foods")
      .select("id,name,brand,kcal_100g,protein_g_100g,carbs_g_100g,fats_g_100g,fiber_g_100g,default_serving_g,is_verified")
      .order("is_verified", { ascending: false })
      .order("name", { ascending: true })
      .limit(25);

    var term = String(searchTerm || "").trim();
    if (term) {
      var safe = term.replace(/[%]/g, "").replace(/,/g, " ");
      var pattern = "%" + safe + "%";
      query = query.or("name.ilike." + pattern + ",brand.ilike." + pattern);
    }

    return query.then(function (result) {
      if (result.error) {
        throw result.error;
      }
      return (result.data || []).map(normalizeFood);
    });
  }

  function selectFoodById(foodId) {
    var selected = (state.foodCatalogRows || []).find(function (food) {
      return String(food.id) === String(foodId);
    });
    if (!selected || !state.foodSelected) {
      return;
    }

    state.selectedFood = selected;

    loadFoodServings(selected.id)
      .then(function (servings) {
        state.foodServings = servings;
        renderSelectedFoodPreview();
      })
      .catch(function () {
        state.foodServings = [];
        renderSelectedFoodPreview();
      });
  }

  function loadFoodServings(foodId) {
    if (!state.client || !foodId) {
      return Promise.resolve([]);
    }

    return state.client
      .from("nutrition_food_servings")
      .select("id,food_id,serving_name,grams,is_default")
      .eq("food_id", foodId)
      .order("is_default", { ascending: false })
      .order("grams", { ascending: true })
      .then(function (result) {
        if (result.error) {
          if (isMissingNutritionTableError(result.error)) {
            return [];
          }
          throw result.error;
        }
        return (result.data || []).map(normalizeServing);
      });
  }

  function renderSelectedFoodPreview() {
    if (!state.foodSelected) {
      return;
    }

    if (!state.selectedFood) {
      state.foodSelected.hidden = true;
      return;
    }

    var servings = state.foodServings.length
      ? state.foodServings
      : [{ id: "", serving_name: "100g", grams: 100, is_default: true }];

    if (state.foodServingSelect) {
      var selectedId = String(state.foodServingSelect.value || servings[0].id || "");
      state.foodServingSelect.innerHTML = servings
        .map(function (serving) {
          var isSelected = String(serving.id || "") === selectedId;
          return (
            '<option value="' + escapeAttribute(serving.id || "") + '"' + (isSelected ? " selected" : "") + '>' +
              escapeHtml(serving.serving_name + " (" + formatDecimal(serving.grams, 0) + "g)") +
            '</option>'
          );
        })
        .join("");
    }

    var preview = buildFoodPreview();
    if (state.foodPreview) {
      state.foodPreview.innerHTML = [
        '<span class="profile-nutrition-food-preview-item">Calories: ' + escapeHtml(formatInteger(preview.calories)) + ' kcal</span>',
        '<span class="profile-nutrition-food-preview-item">Protein: ' + escapeHtml(formatDecimal(preview.protein_g, 1)) + ' g</span>',
        '<span class="profile-nutrition-food-preview-item">Carbs: ' + escapeHtml(formatDecimal(preview.carbs_g, 1)) + ' g</span>',
        '<span class="profile-nutrition-food-preview-item">Fat: ' + escapeHtml(formatDecimal(preview.fats_g, 1)) + ' g</span>',
        '<span class="profile-nutrition-food-preview-item">Fiber: ' + escapeHtml(formatDecimal(preview.fiber_g, 1)) + ' g</span>'
      ].join("");
    }

    state.foodSelected.hidden = false;
  }

  function buildFoodPreview() {
    var food = state.selectedFood || {};
    var servings = state.foodServings.length
      ? state.foodServings
      : [{ id: "", serving_name: "100g", grams: 100, is_default: true }];
    var selectedServingId = state.foodServingSelect ? String(state.foodServingSelect.value || "") : "";
    var serving = servings.find(function (row) {
      return String(row.id || "") === selectedServingId;
    }) || servings[0];

    var quantity = parseOptionalNumber(state.foodQuantityInput ? state.foodQuantityInput.value : "", 0.1);
    if (quantity == null) {
      quantity = 1;
    }

    var grams = (Number(serving.grams) || 0) * quantity;
    var factor = grams / 100;

    return {
      serving_id: serving.id || null,
      serving_name: serving.serving_name || "100g",
      quantity: quantity,
      grams_consumed: grams,
      calories: (Number(food.kcal_100g) || 0) * factor,
      protein_g: (Number(food.protein_g_100g) || 0) * factor,
      carbs_g: (Number(food.carbs_g_100g) || 0) * factor,
      fats_g: (Number(food.fats_g_100g) || 0) * factor,
      fiber_g: (Number(food.fiber_g_100g) || 0) * factor
    };
  }

  function onAddFoodEntry() {
    var userId = getUserId();
    if (!state.client || !userId || !state.selectedFood) {
      setNutritionStatus("Select a food before adding an entry.", "error");
      return;
    }

    var loggedOn = state.foodDateInput ? String(state.foodDateInput.value || "").trim() : "";
    if (!loggedOn) {
      setNutritionStatus("Select a date for the food entry.", "error");
      return;
    }

    var preview = buildFoodPreview();
    var payload = {
      user_id: userId,
      logged_on: loggedOn,
      food_id: state.selectedFood.id,
      serving_id: preview.serving_id,
      quantity: preview.quantity,
      grams_consumed: preview.grams_consumed,
      calories: preview.calories,
      protein_g: preview.protein_g,
      carbs_g: preview.carbs_g,
      fats_g: preview.fats_g,
      fiber_g: preview.fiber_g
    };

    setNutritionStatus("Adding food entry...", "info");

    state.client
      .from("athlete_nutrition_food_entries")
      .insert([payload])
      .select("id,user_id,logged_on,food_id,serving_id,quantity,grams_consumed,calories,protein_g,carbs_g,fats_g,fiber_g,created_at,updated_at,food:nutrition_foods(name,brand),serving:nutrition_food_servings(serving_name,grams)")
      .single()
      .then(function (result) {
        if (result.error) {
          if (isMissingNutritionTableError(result.error)) {
            setNutritionStatus("Food database tables are not available. Run nutrition SQL migration first.", "error");
            return;
          }
          setNutritionStatus(result.error.message, "error");
          return;
        }

        state.foodEntryRows.unshift(normalizeFoodEntry(result.data || payload));
        renderFoodEntries();

        recalculateNutritionLogFromFoodEntries(loggedOn)
          .then(function () {
            renderNutritionDashboard();
            setNutritionStatus("Food entry added.", "success");
          })
          .catch(function () {
            setNutritionStatus("Food entry saved, but daily nutrition rollup could not update.", "info");
          });
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to add food entry.", "error");
      });
  }

  function deleteFoodEntry(entryId, loggedOn) {
    var userId = getUserId();
    if (!state.client || !userId || !entryId) {
      return;
    }

    setNutritionStatus("Deleting food entry...", "info");

    state.client
      .from("athlete_nutrition_food_entries")
      .delete()
      .eq("user_id", userId)
      .eq("id", entryId)
      .then(function (result) {
        if (result.error) {
          setNutritionStatus(result.error.message, "error");
          return;
        }

        state.foodEntryRows = (state.foodEntryRows || []).filter(function (row) {
          return String(row.id || "") !== String(entryId);
        });

        renderFoodEntries();
        recalculateNutritionLogFromFoodEntries(loggedOn)
          .then(function () {
            renderNutritionDashboard();
            setNutritionStatus("Food entry deleted.", "success");
          })
          .catch(function () {
            setNutritionStatus("Food entry deleted, but daily nutrition rollup could not update.", "info");
          });
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to delete food entry.", "error");
      });
  }

  function recalculateNutritionLogFromFoodEntries(loggedOn) {
    var userId = getUserId();
    var dateKey = String(loggedOn || "").trim();
    if (!state.client || !userId || !dateKey || !state.nutritionLogsAvailable) {
      return Promise.resolve();
    }

    return state.client
      .from("athlete_nutrition_food_entries")
      .select("calories,protein_g,carbs_g,fats_g,fiber_g")
      .eq("user_id", userId)
      .eq("logged_on", dateKey)
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        var entries = Array.isArray(result.data) ? result.data : [];
        var totals = entries.reduce(function (acc, row) {
          acc.calories += Number(row && row.calories) || 0;
          acc.protein_g += Number(row && row.protein_g) || 0;
          acc.carbs_g += Number(row && row.carbs_g) || 0;
          acc.fats_g += Number(row && row.fats_g) || 0;
          acc.fiber_g += Number(row && row.fiber_g) || 0;
          return acc;
        }, {
          calories: 0,
          protein_g: 0,
          carbs_g: 0,
          fats_g: 0,
          fiber_g: 0
        });

        var hasEntries = entries.length > 0;
        var existing = (state.nutritionLogs || []).find(function (row) {
          return String(row.logged_on || "") === dateKey;
        }) || null;

        var payload = normalizeNutritionLog({
          id: existing && existing.id ? existing.id : "",
          user_id: userId,
          logged_on: dateKey,
          calories: hasEntries ? totals.calories : null,
          protein_g: hasEntries ? totals.protein_g : null,
          carbs_g: hasEntries ? totals.carbs_g : null,
          fats_g: hasEntries ? totals.fats_g : null,
          fiber_g: hasEntries ? totals.fiber_g : null,
          hydration_l: existing ? existing.hydration_l : null,
          meal_quality: existing ? existing.meal_quality : null,
          energy_level: existing ? existing.energy_level : null,
          hunger_level: existing ? existing.hunger_level : null,
          notes: existing ? existing.notes : "",
          updated_at: new Date().toISOString()
        });

        return state.client
          .from("athlete_nutrition_logs")
          .upsert([payload], { onConflict: "user_id,logged_on" })
          .select("id,user_id,logged_on,calories,protein_g,carbs_g,fats_g,fiber_g,hydration_l,meal_quality,energy_level,hunger_level,notes,created_at,updated_at")
          .single();
      })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        replaceNutritionLog(normalizeNutritionLog(result.data || {}));
        writeNutritionLogsFallback(getUserId(), state.nutritionLogs);
      });
  }

  function normalizeFoodEntry(row) {
    return {
      id: String(row && row.id || ""),
      user_id: String(row && row.user_id || getUserId() || ""),
      logged_on: String(row && row.logged_on || ""),
      food_id: String(row && row.food_id || ""),
      serving_id: String(row && row.serving_id || ""),
      quantity: parseOptionalNumber(row && row.quantity, 0.1) || 1,
      grams_consumed: parseOptionalNumber(row && row.grams_consumed, 0) || 0,
      calories: parseOptionalNumber(row && row.calories, 0) || 0,
      protein_g: parseOptionalNumber(row && row.protein_g, 0) || 0,
      carbs_g: parseOptionalNumber(row && row.carbs_g, 0) || 0,
      fats_g: parseOptionalNumber(row && row.fats_g, 0) || 0,
      fiber_g: parseOptionalNumber(row && row.fiber_g, 0) || 0,
      food_name: row && row.food && row.food.name ? String(row.food.name) : "",
      food_brand: row && row.food && row.food.brand ? String(row.food.brand) : "",
      serving_name: row && row.serving && row.serving.serving_name ? String(row.serving.serving_name) : "",
      serving_grams: parseOptionalNumber(row && row.serving && row.serving.grams, 0) || null,
      created_at: row && row.created_at ? String(row.created_at) : new Date().toISOString(),
      updated_at: row && row.updated_at ? String(row.updated_at) : new Date().toISOString()
    };
  }

  function normalizeFood(row) {
    return {
      id: String(row && row.id || ""),
      name: String(row && row.name || ""),
      brand: String(row && row.brand || "").trim(),
      default_serving_g: parseOptionalNumber(row && row.default_serving_g, 0) || 100,
      kcal_100g: parseOptionalNumber(row && row.kcal_100g, 0) || 0,
      protein_g_100g: parseOptionalNumber(row && row.protein_g_100g, 0) || 0,
      carbs_g_100g: parseOptionalNumber(row && row.carbs_g_100g, 0) || 0,
      fats_g_100g: parseOptionalNumber(row && row.fats_g_100g, 0) || 0,
      fiber_g_100g: parseOptionalNumber(row && row.fiber_g_100g, 0) || 0,
      is_verified: !!(row && row.is_verified)
    };
  }

  function normalizeServing(row) {
    return {
      id: String(row && row.id || ""),
      food_id: String(row && row.food_id || ""),
      serving_name: String(row && row.serving_name || "Serving"),
      grams: parseOptionalNumber(row && row.grams, 0.1) || 100,
      is_default: !!(row && row.is_default)
    };
  }

  function onNutritionTargetsSubmit(event) {
    event.preventDefault();

    var userId = getUserId();
    if (!userId || !state.nutritionTargetsForm) {
      setNutritionStatus("No athlete selected.", "error");
      return;
    }

    var formData = new FormData(state.nutritionTargetsForm);
    var payload = normalizeNutritionTargets({
      id: state.nutritionTargets && state.nutritionTargets.id ? state.nutritionTargets.id : "",
      user_id: userId,
      target_calories: formData.get("target_calories"),
      target_protein_g: formData.get("target_protein_g"),
      target_carbs_g: formData.get("target_carbs_g"),
      target_fats_g: formData.get("target_fats_g"),
      target_hydration_l: formData.get("target_hydration_l"),
      target_fiber_g: formData.get("target_fiber_g"),
      updated_at: new Date().toISOString()
    });

    setNutritionStatus("Saving nutrition targets...", "info");

    if (!state.nutritionTargetsAvailable) {
      state.nutritionTargets = payload;
      writeNutritionTargetsFallback(userId, payload);
      renderNutritionDashboard();
      setNutritionStatus("Nutrition targets saved locally (pending database migration).", "success");
      return;
    }

    state.client
      .from("athlete_nutrition_targets")
      .upsert([payload], { onConflict: "user_id" })
      .select("id,user_id,target_calories,target_protein_g,target_carbs_g,target_fats_g,target_hydration_l,target_fiber_g,updated_at")
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          if (isMissingNutritionTableError(result.error)) {
            state.nutritionTargetsAvailable = false;
            state.nutritionTargets = payload;
            writeNutritionTargetsFallback(userId, payload);
            renderNutritionDashboard();
            setNutritionStatus("Nutrition targets saved locally. Run nutrition SQL migration to sync cloud data.", "info");
            return;
          }

          setNutritionStatus(result.error.message, "error");
          return;
        }

        state.nutritionTargets = normalizeNutritionTargets(result.data || payload);
        writeNutritionTargetsFallback(userId, state.nutritionTargets);
        renderNutritionDashboard();
        setNutritionStatus("Nutrition targets saved.", "success");
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to save nutrition targets.", "error");
      });
  }

  function onNutritionLogSubmit(event) {
    event.preventDefault();

    var userId = getUserId();
    if (!userId || !state.nutritionForm) {
      setNutritionStatus("No athlete selected.", "error");
      return;
    }

    var formData = new FormData(state.nutritionForm);
    var loggedOn = String(formData.get("logged_on") || "").trim();
    if (!loggedOn) {
      setNutritionStatus("Select a date for the nutrition log.", "error");
      return;
    }

    var payload = normalizeNutritionLog({
      user_id: userId,
      logged_on: loggedOn,
      calories: formData.get("calories"),
      protein_g: formData.get("protein_g"),
      carbs_g: formData.get("carbs_g"),
      fats_g: formData.get("fats_g"),
      fiber_g: formData.get("fiber_g"),
      hydration_l: formData.get("hydration_l"),
      meal_quality: formData.get("meal_quality"),
      energy_level: formData.get("energy_level"),
      hunger_level: formData.get("hunger_level"),
      notes: formData.get("notes"),
      updated_at: new Date().toISOString()
    });

    if (!nutritionLogHasContent(payload)) {
      setNutritionStatus("Add at least one nutrition value or note before saving.", "error");
      return;
    }

    setNutritionStatus("Saving nutrition log...", "info");

    if (!state.nutritionLogsAvailable) {
      payload.id = payload.id || "local-" + payload.logged_on;
      replaceNutritionLog(payload);
      writeNutritionLogsFallback(userId, state.nutritionLogs);
      renderNutritionDashboard();
      resetNutritionLogForm(true);
      setNutritionStatus("Nutrition log saved locally (pending database migration).", "success");
      return;
    }

    state.client
      .from("athlete_nutrition_logs")
      .upsert([payload], { onConflict: "user_id,logged_on" })
      .select("id,user_id,logged_on,calories,protein_g,carbs_g,fats_g,fiber_g,hydration_l,meal_quality,energy_level,hunger_level,notes,created_at,updated_at")
      .then(function (result) {
        if (result.error) {
          if (isMissingNutritionTableError(result.error)) {
            state.nutritionLogsAvailable = false;
            payload.id = payload.id || "local-" + payload.logged_on;
            replaceNutritionLog(payload);
            writeNutritionLogsFallback(userId, state.nutritionLogs);
            renderNutritionDashboard();
            resetNutritionLogForm(true);
            setNutritionStatus("Nutrition log saved locally. Run nutrition SQL migration to sync cloud data.", "info");
            return;
          }

          setNutritionStatus(result.error.message, "error");
          return;
        }

        var rows = Array.isArray(result.data) ? result.data : [];
        var saved = rows.length ? normalizeNutritionLog(rows[0]) : payload;
        replaceNutritionLog(saved);
        writeNutritionLogsFallback(userId, state.nutritionLogs);
        renderNutritionDashboard();
        resetNutritionLogForm(true);
        setNutritionStatus("Nutrition log saved.", "success");
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to save nutrition log.", "error");
      });
  }

  function onNutritionLogDelete(logId, loggedOn) {
    var userId = getUserId();
    var id = String(logId || "").trim();
    var dateKey = String(loggedOn || "").trim();

    if (!userId || (!id && !dateKey)) {
      return;
    }

    setNutritionStatus("Deleting nutrition log...", "info");

    function removeLocal() {
      state.nutritionLogs = (state.nutritionLogs || []).filter(function (row) {
        if (id && String(row.id || "") === id) {
          return false;
        }
        if (dateKey && String(row.logged_on || "") === dateKey) {
          return false;
        }
        return true;
      });
      writeNutritionLogsFallback(userId, state.nutritionLogs);
      renderNutritionDashboard();
      setNutritionStatus("Nutrition log deleted.", "success");
    }

    if (!state.nutritionLogsAvailable || id.indexOf("local-") === 0) {
      removeLocal();
      return;
    }

    state.client
      .from("athlete_nutrition_logs")
      .delete()
      .eq("user_id", userId)
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          setNutritionStatus(result.error.message, "error");
          return;
        }

        removeLocal();
      })
      .catch(function (error) {
        setNutritionStatus(error && error.message ? error.message : "Failed to delete nutrition log.", "error");
      });
  }

  function replaceNutritionLog(nextLog) {
    var normalized = normalizeNutritionLog(nextLog);
    var nextDate = normalized.logged_on;

    var rows = (state.nutritionLogs || []).filter(function (row) {
      return String(row.logged_on || "") !== String(nextDate || "");
    });

    rows.push(normalized);
    state.nutritionLogs = sortNutritionLogs(rows);
  }

  function sortNutritionLogs(rows) {
    return (Array.isArray(rows) ? rows : []).slice().sort(function (a, b) {
      return String(b.logged_on || "").localeCompare(String(a.logged_on || ""));
    });
  }

  function normalizeNutritionLog(row) {
    return {
      id: String(row && row.id || ""),
      user_id: String(row && row.user_id || getUserId() || ""),
      logged_on: String(row && row.logged_on || ""),
      calories: parseOptionalNumber(row && row.calories, 0),
      protein_g: parseOptionalNumber(row && row.protein_g, 0),
      carbs_g: parseOptionalNumber(row && row.carbs_g, 0),
      fats_g: parseOptionalNumber(row && row.fats_g, 0),
      fiber_g: parseOptionalNumber(row && row.fiber_g, 0),
      hydration_l: parseOptionalNumber(row && row.hydration_l, 0),
      meal_quality: parseOptionalRating(row && row.meal_quality),
      energy_level: parseOptionalRating(row && row.energy_level),
      hunger_level: parseOptionalRating(row && row.hunger_level),
      notes: String(row && row.notes || "").trim(),
      created_at: row && row.created_at ? String(row.created_at) : new Date().toISOString(),
      updated_at: row && row.updated_at ? String(row.updated_at) : new Date().toISOString()
    };
  }

  function normalizeNutritionTargets(row) {
    return {
      id: String(row && row.id || ""),
      user_id: String(row && row.user_id || getUserId() || ""),
      target_calories: parseOptionalNumber(row && row.target_calories, 0),
      target_protein_g: parseOptionalNumber(row && row.target_protein_g, 0),
      target_carbs_g: parseOptionalNumber(row && row.target_carbs_g, 0),
      target_fats_g: parseOptionalNumber(row && row.target_fats_g, 0),
      target_hydration_l: parseOptionalNumber(row && row.target_hydration_l, 0),
      target_fiber_g: parseOptionalNumber(row && row.target_fiber_g, 0),
      updated_at: row && row.updated_at ? String(row.updated_at) : new Date().toISOString()
    };
  }

  function nutritionLogHasContent(log) {
    if (!log) {
      return false;
    }

    return [
      log.calories,
      log.protein_g,
      log.carbs_g,
      log.fats_g,
      log.fiber_g,
      log.hydration_l,
      log.meal_quality,
      log.energy_level,
      log.hunger_level
    ].some(function (value) {
      return value != null;
    }) || !!String(log.notes || "").trim();
  }

  function averageNumeric(rows, key) {
    var values = (Array.isArray(rows) ? rows : [])
      .map(function (row) {
        var value = row ? row[key] : null;
        return Number.isFinite(value) ? value : null;
      })
      .filter(function (value) {
        return value != null;
      });

    if (!values.length) {
      return null;
    }

    var total = values.reduce(function (acc, value) {
      return acc + value;
    }, 0);
    return total / values.length;
  }

  function calculateNutritionAdherence(averages, targets) {
    if (!targets || typeof targets !== "object") {
      return "No targets";
    }

    var comparisons = [
      [averages && averages.calories, targets.target_calories],
      [averages && averages.protein_g, targets.target_protein_g],
      [averages && averages.carbs_g, targets.target_carbs_g],
      [averages && averages.fats_g, targets.target_fats_g],
      [averages && averages.hydration_l, targets.target_hydration_l],
      [averages && averages.fiber_g, targets.target_fiber_g]
    ].filter(function (pair) {
      return Number.isFinite(pair[0]) && Number.isFinite(pair[1]) && pair[1] > 0;
    });

    if (!comparisons.length) {
      return "No targets";
    }

    var score = comparisons.reduce(function (acc, pair) {
      var actual = pair[0];
      var target = pair[1];
      var ratio = Math.abs(actual - target) / target;
      var component = Math.max(0, 1 - ratio);
      return acc + component;
    }, 0) / comparisons.length;

    return formatInteger(score * 100) + "%";
  }

  function parseOptionalNumber(value, minimum) {
    var text = String(value == null ? "" : value).trim();
    if (!text) {
      return null;
    }

    var numeric = parseFloat(text);
    if (!Number.isFinite(numeric)) {
      return null;
    }

    if (Number.isFinite(minimum) && numeric < minimum) {
      return null;
    }

    return numeric;
  }

  function parseOptionalRating(value) {
    var numeric = parseOptionalNumber(value, 1);
    if (numeric == null) {
      return null;
    }

    var rounded = Math.round(numeric);
    if (rounded < 1 || rounded > 5) {
      return null;
    }
    return rounded;
  }

  function setInputValue(form, name, value) {
    if (!form) {
      return;
    }

    var input = form.querySelector("[name='" + name + "']");
    if (!input) {
      return;
    }

    input.value = value == null ? "" : String(value);
  }

  function resetNutritionLogForm(includeNotes) {
    if (!state.nutritionForm) {
      return;
    }

    setInputValue(state.nutritionForm, "logged_on", getTodayDateInputValue());
    if (!includeNotes) {
      return;
    }

    [
      "calories",
      "protein_g",
      "carbs_g",
      "fats_g",
      "fiber_g",
      "hydration_l",
      "meal_quality",
      "energy_level",
      "hunger_level",
      "notes"
    ].forEach(function (name) {
      setInputValue(state.nutritionForm, name, "");
    });
  }

  function getTodayDateInputValue() {
    var now = new Date();
    var yyyy = String(now.getFullYear());
    var mm = String(now.getMonth() + 1).padStart(2, "0");
    var dd = String(now.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  function formatNutritionValue(value, decimals, unit) {
    if (value == null || !Number.isFinite(value)) {
      return "--";
    }

    var places = Number.isFinite(decimals) ? decimals : 0;
    var text = formatDecimal(value, places);
    return unit ? text + " " + unit : text;
  }

  function formatNullableNumber(value, suffix) {
    if (value == null || !Number.isFinite(value)) {
      return "--";
    }
    return formatDecimal(value, 1) + (suffix || "");
  }

  function formatInteger(value) {
    if (value == null || !Number.isFinite(value)) {
      return "--";
    }
    return String(Math.round(value));
  }

  function formatDecimal(value, places) {
    if (value == null || !Number.isFinite(value)) {
      return "--";
    }
    return Number(value).toFixed(places);
  }

  function formatGoalDate(dateKey) {
    if (!dateKey) {
      return "No date";
    }

    try {
      var date = new Date(String(dateKey) + "T00:00:00");
      if (Number.isNaN(date.getTime())) {
        return String(dateKey);
      }

      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return String(dateKey);
    }
  }

  function setNutritionStatus(message, variant) {
    if (!state.nutritionStatus) {
      return;
    }

    state.nutritionStatus.textContent = message || "";
    state.nutritionStatus.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.nutritionStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.nutritionStatus.classList.add("is-success");
    } else {
      state.nutritionStatus.classList.add("is-info");
    }
  }

  function readNutritionLogsFallback(userId) {
    var map = readNutritionLogsFallbackMap();
    var key = String(userId || "");
    var rows = map[key];
    if (!Array.isArray(rows)) {
      return [];
    }
    return rows.map(normalizeNutritionLog);
  }

  function writeNutritionLogsFallback(userId, rows) {
    var key = String(userId || "");
    if (!key) {
      return;
    }

    var map = readNutritionLogsFallbackMap();
    map[key] = Array.isArray(rows) ? rows.map(normalizeNutritionLog) : [];

    try {
      window.localStorage.setItem(NUTRITION_LOGS_FALLBACK_KEY, JSON.stringify(map));
    } catch (e) {
      // localStorage may be unavailable.
    }
  }

  function readNutritionLogsFallbackMap() {
    try {
      var raw = window.localStorage.getItem(NUTRITION_LOGS_FALLBACK_KEY);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function readNutritionTargetsFallback(userId) {
    var map = readNutritionTargetsFallbackMap();
    var key = String(userId || "");
    if (!key || !map[key]) {
      return null;
    }
    return normalizeNutritionTargets(map[key]);
  }

  function writeNutritionTargetsFallback(userId, row) {
    var key = String(userId || "");
    if (!key) {
      return;
    }

    var map = readNutritionTargetsFallbackMap();
    if (!row) {
      delete map[key];
    } else {
      map[key] = normalizeNutritionTargets(row);
    }

    try {
      window.localStorage.setItem(NUTRITION_TARGETS_FALLBACK_KEY, JSON.stringify(map));
    } catch (e) {
      // localStorage may be unavailable.
    }
  }

  function readNutritionTargetsFallbackMap() {
    try {
      var raw = window.localStorage.getItem(NUTRITION_TARGETS_FALLBACK_KEY);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function isMissingNutritionTableError(error) {
    var code = String(error && error.code || "");
    var msg = String(error && error.message || "").toLowerCase();
    return code === "42P01" || code === "PGRST204" || msg.indexOf("does not exist") > -1 || msg.indexOf("schema cache") > -1;
  }

  function getUserId() {
    return state.viewUser && state.viewUser.id ? state.viewUser.id : state.user && state.user.id ? state.user.id : null;
  }

  function hideGuard() {
    if (state.guardElement) {
      state.guardElement.hidden = true;
    }
  }

  function showContent() {
    if (state.contentElement) {
      state.contentElement.hidden = false;
    }
  }

  function showError(message) {
    if (!state.guardElement) {
      return;
    }

    state.guardElement.innerHTML =
      '<div style="padding: 2rem; text-align: center; color: #9f2d20;">' +
      '<p style="font-size: 1.1rem; font-weight: 700;">' + escapeHtml(message) + '</p>' +
      '<p><a href="profile.html" class="btn" style="display: inline-block; margin-top: 1rem;">Back to Dashboard</a></p>' +
      '</div>';
  }

  function redirectToHome() {
    window.location.href = "index.html";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "");
  }
})();
