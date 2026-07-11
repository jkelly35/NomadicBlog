(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var STRAVA_REDIRECT_STATUS_PARAM = "strava_status";
  var STRAVA_REDIRECT_MESSAGE_PARAM = "strava_message";
  var WHOOP_REDIRECT_STATUS_PARAM = "whoop_status";
  var WHOOP_REDIRECT_MESSAGE_PARAM = "whoop_message";
  var state = {
    client: null,
    user: null,
    guardElement: null,
    contentElement: null,
    form: null,
    sportOverviewEditor: null,
    accountActionsSection: null,
    wearablesSection: null,
    athleteId: null,
    athleteName: null,
    currentAthlete: null,
    isPersonal: false,
    stravaConnection: null,
    whoopConnection: null,
    stravaConnectBtn: null,
    stravaSyncBtn: null,
    stravaDisconnectBtn: null,
    stravaMetaEl: null,
    stravaStatusEl: null,
    whoopConnectBtn: null,
    whoopManualToggleBtn: null,
    whoopSyncBtn: null,
    whoopDisconnectBtn: null,
    whoopMetaEl: null,
    whoopStatusEl: null,
    whoopManualForm: null,
    whoopManualAccessToken: null,
    whoopManualRefreshToken: null,
    whoopManualExpiresIn: null,
    whoopManualUserId: null,
    whoopManualCancelBtn: null,
    coachCompassSection: null,
    sportOverviewTemplates: {
      climbing: [
        {
          key: "climbing_discipline",
          label: "Primary Discipline",
          type: "multi-select",
          placeholder: "Select discipline",
          options: ["Bouldering", "Sport", "Trad", "Ice", "Alpine", "Gym / Indoor"]
        },
        { key: "climbing_grade", label: "Current Climbing Level", placeholder: "V5 / 5.12a" },
        { key: "climbing_years", label: "Years Climbing", type: "number", placeholder: "e.g., 4", min: "0", max: "80", step: "0.5" },
        { key: "climbing_focus", label: "Current Focus", placeholder: "Power endurance, projecting" },
        { key: "climbing_notes", label: "Important Notes", type: "textarea", placeholder: "Injury history, limitations, preferred climbing days", rows: "3" }
      ],
      skiing: [
        {
          key: "ski_discipline",
          label: "Ski Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["Alpine", "Touring", "Freeride", "Nordic", "Park"]
        },
        { key: "ski_home_mountain", label: "Primary Mountain / Region", placeholder: "e.g., Jackson Hole" },
        {
          key: "ski_terrain",
          label: "Preferred Terrain",
          type: "multi-select",
          placeholder: "Select one or more terrain types",
          options: ["Groomers", "Steeps", "Moguls", "Backcountry", "Park"]
        }
      ],
      snowboarding: [
        {
          key: "snowboard_discipline",
          label: "Snowboard Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["Freeride", "Park", "Splitboard", "Alpine", "All-Mountain"]
        },
        { key: "snowboard_home_mountain", label: "Primary Mountain / Region", placeholder: "e.g., Whistler" },
        {
          key: "snowboard_stance",
          label: "Stance",
          type: "select",
          placeholder: "Select stance",
          options: ["Regular", "Goofy", "Switch"]
        }
      ],
      mountainbiking: [
        {
          key: "mtb_discipline",
          label: "MTB Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["XC", "Trail", "Enduro", "DH", "Bike Park"]
        },
        { key: "mtb_home_trails", label: "Primary Trails / Region", placeholder: "e.g., Sedona" },
        { key: "mtb_weekly_volume", label: "Weekly Ride Volume", placeholder: "e.g., 6 hrs" }
      ],
      "trail-running": [
        {
          key: "run_primary_distance",
          label: "Primary Distances",
          type: "multi-select",
          placeholder: "Select one or more distance focuses",
          options: ["5k", "10k", "Half Marathon", "Marathon", "Ultra"]
        },
        { key: "run_elevation_goal", label: "Elevation Focus", placeholder: "e.g., 3000 ft/week" },
        {
          key: "run_surface",
          label: "Preferred Surface",
          type: "multi-select",
          placeholder: "Select one or more surfaces",
          options: ["Singletrack", "Technical Trail", "Fire Road", "Mixed Trail", "Road"]
        }
      ],
      cycling: [
        {
          key: "cycling_discipline",
          label: "Cycling Disciplines",
          type: "multi-select",
          placeholder: "Select one or more disciplines",
          options: ["Road", "Gravel", "Mountain Bike", "Cyclocross", "Track"]
        },
        { key: "cycling_weekly_volume", label: "Weekly Ride Volume", placeholder: "e.g., 8 hrs / 180 mi" },
        { key: "cycling_focus", label: "Current Focus", placeholder: "Endurance, sprint power, climbing" }
      ],
      other: [
        { key: "other_sport_name", label: "Sport Name", placeholder: "What sport are you training for?" },
        { key: "other_focus", label: "Current Focus", placeholder: "What are you working on most right now?" },
        { key: "other_notes", label: "Important Notes", type: "textarea", placeholder: "Constraints, event schedule, or key context", rows: "3" }
      ]
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initializeEditor();
  });

  function initializeEditor() {
    state.guardElement = document.querySelector("[data-athlete-editor-guard]");
    state.contentElement = document.querySelector("[data-athlete-editor-content]");
    state.form = document.querySelector("[data-athlete-editor-form]");
    state.sportOverviewEditor = document.querySelector("[data-athlete-editor-sport-overview]");
    state.accountActionsSection = document.querySelector("[data-athlete-editor-account-actions]");
    state.wearablesSection = document.querySelector("[data-athlete-editor-wearables-section]");
    state.stravaConnectBtn = document.querySelector("[data-athlete-editor-strava-connect]");
    state.stravaSyncBtn = document.querySelector("[data-athlete-editor-strava-sync]");
    state.stravaDisconnectBtn = document.querySelector("[data-athlete-editor-strava-disconnect]");
    state.stravaMetaEl = document.querySelector("[data-athlete-editor-strava-meta]");
    state.stravaStatusEl = document.querySelector("[data-athlete-editor-strava-status]");
    state.whoopConnectBtn = document.querySelector("[data-athlete-editor-whoop-connect]");
    state.whoopManualToggleBtn = document.querySelector("[data-athlete-editor-whoop-manual-toggle]");
    state.whoopSyncBtn = document.querySelector("[data-athlete-editor-whoop-sync]");
    state.whoopDisconnectBtn = document.querySelector("[data-athlete-editor-whoop-disconnect]");
    state.whoopMetaEl = document.querySelector("[data-athlete-editor-whoop-meta]");
    state.whoopStatusEl = document.querySelector("[data-athlete-editor-whoop-status]");
    state.whoopManualForm = document.querySelector("[data-athlete-editor-whoop-manual-form]");
    state.whoopManualAccessToken = document.querySelector("[data-athlete-editor-whoop-access-token]");
    state.whoopManualRefreshToken = document.querySelector("[data-athlete-editor-whoop-refresh-token]");
    state.whoopManualExpiresIn = document.querySelector("[data-athlete-editor-whoop-expires-in]");
    state.whoopManualUserId = document.querySelector("[data-athlete-editor-whoop-user-id]");
    state.whoopManualCancelBtn = document.querySelector("[data-athlete-editor-whoop-manual-cancel]");
    state.coachCompassSection = document.querySelector("[data-athlete-editor-compass-section]");

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
      if (!session) {
        redirectToHome();
        return;
      }

      state.user = session.user;
      verifyAccess();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function verifyAccess() {
    var params = new URLSearchParams(window.location.search || "");
    state.isPersonal = params.get("personal") === "true";

    if (!state.user) {
      showError("You do not have permission to access this page.");
      setTimeout(redirectToHome, 2000);
      return;
    }

    if (!state.isPersonal && state.user.email !== ADMIN_EMAIL) {
      showError("You do not have permission to access this page.");
      setTimeout(redirectToHome, 2000);
      return;
    }

    hideGuard();
    setupEventHandlers();
    loadAthleteEditor();
  }

  function setupEventHandlers() {
    var backBtns = document.querySelectorAll("[data-athlete-editor-back]");
    backBtns.forEach(function (btn) {
      btn.addEventListener("click", goBackToDashboard);
    });

    var resetBtn = document.querySelector("[data-athlete-editor-reset-password]");
    if (resetBtn) {
      resetBtn.addEventListener("click", onResetMyPassword);
    }

    var logoutBtn = document.querySelector("[data-athlete-editor-logout]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", onLogout);
    }

    var deleteBtn = document.querySelector("[data-athlete-editor-delete]");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", onDeleteAccount);
    }

    if (state.stravaConnectBtn) {
      state.stravaConnectBtn.addEventListener("click", onStravaConnect);
    }
    if (state.stravaSyncBtn) {
      state.stravaSyncBtn.addEventListener("click", onStravaSync);
    }
    if (state.stravaDisconnectBtn) {
      state.stravaDisconnectBtn.addEventListener("click", onStravaDisconnect);
    }

    if (state.whoopConnectBtn) {
      state.whoopConnectBtn.addEventListener("click", onWhoopConnect);
    }
    if (state.whoopManualToggleBtn) {
      state.whoopManualToggleBtn.addEventListener("click", function () {
        setWhoopManualFormVisible(true);
      });
    }
    if (state.whoopManualCancelBtn) {
      state.whoopManualCancelBtn.addEventListener("click", function () {
        setWhoopManualFormVisible(false);
      });
    }
    if (state.whoopManualForm) {
      state.whoopManualForm.addEventListener("submit", onWhoopManualSubmit);
    }
    if (state.whoopSyncBtn) {
      state.whoopSyncBtn.addEventListener("click", onWhoopSync);
    }
    if (state.whoopDisconnectBtn) {
      state.whoopDisconnectBtn.addEventListener("click", onWhoopDisconnect);
    }

    if (state.form) {
      state.form.addEventListener("submit", onSaveChanges);
      state.form.addEventListener("change", function (event) {
        var target = event && event.target;
        if (target && target.name === "dob") {
          updateCalculatedAgeDisplay(String(target.value || ""), null);
          return;
        }
        if (!target || target.name !== "sports[]") {
          return;
        }

        renderSportOverviewEditor(getSelectedSportsFromForm(), collectSportOverviewFromForm());
      });
    }
  }

  function loadAthleteEditor() {
    var params = new URLSearchParams(window.location.search);
    state.athleteId = params.get("athleteId");
    state.athleteName = params.get("athleteName");

    if (state.isPersonal) {
      state.athleteId = state.user && state.user.id ? state.user.id : state.athleteId;
    }

    var nameEl = document.querySelector("[data-athlete-editor-athlete-name]");
    if (nameEl) {
      nameEl.textContent = state.isPersonal
        ? "Editing your profile"
        : (state.athleteName ? "Editing: " + state.athleteName : "Loading...");
    }

    var backBtn = document.querySelector("[data-athlete-editor-back]");
    if (backBtn && state.isPersonal) {
      backBtn.textContent = "← Back to Athlete Dashboard";
    }

    if (state.accountActionsSection) {
      state.accountActionsSection.hidden = !state.isPersonal;
    }
    if (state.coachCompassSection) {
      state.coachCompassSection.hidden = !!state.isPersonal;
    }
    if (state.wearablesSection) {
      state.wearablesSection.hidden = !state.isPersonal;
    }

    if (!state.athleteId) {
      setStatus("No athlete selected.", "error");
      return;
    }

    showContent();
    maybeShowWearableRedirectStatuses();
    loadWearablesSync();
    loadAthlete();
  }

  function loadAthlete() {
    if (!state.athleteId || !state.client) {
      setStatus("No athlete selected.", "error");
      return;
    }

    state.client
      .from("athlete_profiles")
      .select("*")
      .eq("user_id", state.athleteId)
      .single()
      .then(function (result) {
        if (result.error && result.error.code !== "PGRST116") {
          setStatus(result.error.message, "error");
          return;
        }

        state.currentAthlete = result.data || { user_id: state.athleteId };
        populateForm(state.currentAthlete);
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load athlete.", "error");
      });
  }

  function populateForm(athlete) {
    var emailText = athlete.email || (state.user && state.user.email) || "N/A";

    var emailEl = document.querySelector("[data-athlete-editor-email]");
    if (emailEl) emailEl.textContent = emailText;

    setInputValue("name", athlete.name);
    setInputValue("dob", getDobFromProfile(athlete));
    setInputValue("bio", athlete.bio);
    setInputValue("location", athlete.location);
    setInputValue("height_cm", athlete.height_cm);
    setInputValue("weight_kg", athlete.weight_kg);
    setInputValue("sex", getProfileSexForFormValue(athlete));
    setInputValue("compass_training_status", athlete.compass_training_status);
    setInputValue("compass_current_phase", athlete.compass_current_phase);
    setInputValue("compass_next_objective", athlete.compass_next_objective);
    setInputValue("compass_coach_note", athlete.compass_coach_note);

    updateCalculatedAgeDisplay(getDobFromProfile(athlete), athlete.age);

    var sports = getProfileSports(athlete);
    setSelectedSportsInForm(sports);

    var overview = getProfileSportOverview(athlete);
    populateGeneralProfileIntoForm(overview.general || {});
    renderSportOverviewEditor(sports, overview);
    clearStatus();
  }

  function setInputValue(key, value) {
    var input = document.querySelector("[data-athlete-editor-input='" + key + "']");
    if (input) {
      input.value = value == null ? "" : String(value);
    }
  }

  function parseAgeValue(value) {
    var age = parseInt(String(value || "").trim(), 10);
    if (!Number.isFinite(age) || age <= 0 || age > 120) {
      return null;
    }
    return age;
  }

  function onSaveChanges(event) {
    event.preventDefault();

    if (!state.client || !state.athleteId || !state.form) {
      setStatus("No athlete selected.", "error");
      return;
    }

    var formData = new FormData(state.form);
    var selectedSports = getSelectedSportsFromForm();
    if (!selectedSports.length) {
      setStatus("Select at least one sport.", "error");
      return;
    }

    var dobValue = normalizeDob(String(formData.get("dob") || "").trim());
    var ageValue = calculateAgeFromDob(dobValue);
    var sportOverview = collectSportOverviewFromForm();
    var generalProfile = collectGeneralProfileFromForm();
    if (dobValue) {
      generalProfile.date_of_birth = dobValue;
    }
    if (Object.keys(generalProfile).length) {
      sportOverview.general = generalProfile;
    }

    var profileData = {
      user_id: state.athleteId,
      name: String(formData.get("name") || "").trim(),
      dob: dobValue,
      sport: selectedSports[0],
      sports: selectedSports,
      sport_overview: sportOverview,
      bio: String(formData.get("bio") || "").trim(),
      age: ageValue,
      location: String(formData.get("location") || "").trim(),
      height_cm: parseFloat(formData.get("height_cm") || "") || null,
      weight_kg: parseFloat(formData.get("weight_kg") || "") || null,
      sex: String(formData.get("sex") || "").trim() || null,
      compass_training_status: String(formData.get("compass_training_status") || "").trim(),
      compass_current_phase: String(formData.get("compass_current_phase") || "").trim(),
      compass_next_objective: String(formData.get("compass_next_objective") || "").trim(),
      compass_coach_note: String(formData.get("compass_coach_note") || "").trim(),
      updated_at: new Date().toISOString()
    };

    setStatus("Saving profile...", "info");

    saveProfileWithFallback(profileData)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.currentAthlete = Object.assign({}, state.currentAthlete || {}, result.data || profileData);
        setStatus("Profile updated successfully!", "success");
        setTimeout(goBackToDashboard, 1200);
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to save changes.", "error");
      });
  }

  function saveProfileWithFallback(profileData) {
    var payload = Object.assign({}, profileData);
    var droppedColumns = {};
    var optionalColumnsFallbackOrder = [
      "compass_coach_note",
      "compass_next_objective",
      "compass_current_phase",
      "compass_training_status",
      "sport_overview",
      "sports",
      "height_cm",
      "weight_kg",
      "bio",
      "age",
      "location",
      "dob",
      "sport",
      "name"
    ];

    function runSave(nextPayload, attemptsRemaining) {
      var operation;
      if (state.currentAthlete && state.currentAthlete.id) {
        operation = state.client
          .from("athlete_profiles")
          .update(nextPayload)
          .eq("user_id", state.athleteId)
          .select()
          .single();
      } else {
        operation = state.client.from("athlete_profiles").insert([nextPayload]).select().single();
      }

      return operation.then(function (result) {
        if (!result.error || !isMissingColumnError(result.error) || attemptsRemaining <= 0) {
          return result;
        }

        var missingColumn = getMissingColumnName(result.error);
        if (!missingColumn) {
          missingColumn = optionalColumnsFallbackOrder.find(function (column) {
            return Object.prototype.hasOwnProperty.call(nextPayload, column) && !droppedColumns[column];
          }) || null;
        }

        if (!missingColumn || droppedColumns[missingColumn]) {
          return result;
        }

        droppedColumns[missingColumn] = true;
        var retryPayload = Object.assign({}, nextPayload);
        delete retryPayload[missingColumn];
        return runSave(retryPayload, attemptsRemaining - 1);
      });
    }

    return runSave(payload, 6);
  }

  function getSelectedSportsFromForm() {
    if (!state.form) {
      return [];
    }

    var nodes = Array.prototype.slice.call(state.form.querySelectorAll('input[name="sports[]"]:checked'));
    var sports = nodes
      .map(function (node) {
        return String(node.value || "").trim();
      })
      .filter(function (value) {
        return !!value;
      });

    return Array.from(new Set(sports));
  }

  function setSelectedSportsInForm(sports) {
    if (!state.form) {
      return;
    }

    var selectedLookup = {};
    (sports || []).forEach(function (sport) {
      selectedLookup[String(sport)] = true;
    });

    state.form.querySelectorAll('input[name="sports[]"]').forEach(function (node) {
      node.checked = !!selectedLookup[String(node.value || "")];
    });
  }

  function getProfileSports(profile) {
    var sportsFromProfile = [];

    if (profile && Array.isArray(profile.sports)) {
      sportsFromProfile = profile.sports;
    } else if (profile && profile.sports) {
      sportsFromProfile = parseSportsValue(profile.sports);
    } else if (profile && profile.sport) {
      sportsFromProfile = parseSportsValue(profile.sport);
    }

    return Array.from(new Set(
      (sportsFromProfile || [])
        .map(function (sport) {
          return String(sport || "").trim();
        })
        .filter(function (sport) {
          return !!sport;
        })
    ));
  }

  function getDobFromProfile(profile) {
    if (!profile) {
      return "";
    }

    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};
    var raw =
      profile.dob ||
      profile.date_of_birth ||
      profile.birth_date ||
      general.date_of_birth ||
      general.dob ||
      "";
    return normalizeDob(String(raw || ""));
  }

  function normalizeDob(raw) {
    var value = String(raw || "").trim();
    if (!value) {
      return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    var date = new Date(value);
    if (isNaN(date.getTime())) {
      return "";
    }

    var yyyy = date.getFullYear();
    var mm = String(date.getMonth() + 1).padStart(2, "0");
    var dd = String(date.getDate()).padStart(2, "0");
    return yyyy + "-" + mm + "-" + dd;
  }

  function calculateAgeFromDob(dobText) {
    var dob = normalizeDob(dobText);
    if (!dob) {
      return null;
    }

    var birth = new Date(dob + "T00:00:00");
    if (isNaN(birth.getTime())) {
      return null;
    }

    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear();
    var hasBirthdayPassed =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

    if (!hasBirthdayPassed) {
      age -= 1;
    }

    if (age < 0 || age > 120) {
      return null;
    }

    return age;
  }

  function updateCalculatedAgeDisplay(dobText, ageText) {
    var ageEl = document.querySelector("[data-athlete-editor-calculated-age]");
    if (!ageEl) {
      return;
    }

    var age = calculateAgeFromDob(dobText);
    if (age == null) {
      age = parseAgeValue(ageText);
    }
    ageEl.textContent = age == null ? "—" : String(age);
  }

  function parseSportsValue(value) {
    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    var text = String(value).trim();
    if (!text) {
      return [];
    }

    if (text[0] === "[") {
      var parsedArray = safeJsonParse(text);
      if (Array.isArray(parsedArray)) {
        return parsedArray;
      }
    }

    return text
      .split(",")
      .map(function (part) {
        return String(part || "").trim();
      })
      .filter(function (part) {
        return !!part;
      });
  }

  function getProfileSportOverview(profile) {
    var baseOverview = {};

    if (profile && profile.sport_overview && typeof profile.sport_overview === "object") {
      baseOverview = profile.sport_overview;
    } else if (profile && profile.sport_overview) {
      baseOverview = safeJsonParse(profile.sport_overview) || {};
    }

    return baseOverview;
  }

  function getProfileSexForFormValue(profile) {
    var overview = getProfileSportOverview(profile);
    var general = overview && overview.general && typeof overview.general === "object"
      ? overview.general
      : {};

    var rawCandidates = [
      profile && profile.sex,
      profile && profile.gender,
      profile && profile.biological_sex,
      overview && overview.sex,
      overview && overview.gender,
      overview && overview.biological_sex,
      general.sex,
      general.gender,
      general.biological_sex
    ];

    var raw = rawCandidates.find(function (value) {
      return String(value || "").trim().length > 0;
    });

    var normalized = String(raw || "").trim().toLowerCase();
    if (normalized === "male" || normalized === "m" || normalized === "man") {
      return "male";
    }
    if (normalized === "female" || normalized === "f" || normalized === "woman") {
      return "female";
    }
    if (
      normalized === "prefer-not-to-say" ||
      normalized === "prefer not to say" ||
      normalized === "undisclosed"
    ) {
      return "prefer-not-to-say";
    }
    if (normalized === "other" || normalized === "nonbinary" || normalized === "non-binary") {
      return "other";
    }
    return "";
  }

  function renderSportOverviewEditor(selectedSports, existingOverview) {
    if (!state.sportOverviewEditor) {
      return;
    }

    var sports = (selectedSports || []).slice();
    var overview = existingOverview || {};
    if (!sports.length) {
      state.sportOverviewEditor.innerHTML =
        '<p class="sport-overview-empty">Select one or more sports to customize your overview details.</p>';
      return;
    }

    var cards = sports.map(function (sport) {
      var sportLabel = getSportLabel(sport);
      var fields = state.sportOverviewTemplates[sport] || [
        { key: "notes", label: "Sport Notes", placeholder: "Add sport-specific context" }
      ];
      var sportValues = overview && overview[sport] && typeof overview[sport] === "object"
        ? overview[sport]
        : {};

      var fieldMarkup = fields.map(function (field) {
        var rawFieldValue = sportValues[field.key];
        var fieldValue = rawFieldValue == null ? "" : String(rawFieldValue);
        var fieldType = String(field.type || "text").toLowerCase();
        if (fieldType === "multi-select") {
          var multiOptions = Array.isArray(field.options) ? field.options : [];
          var selectedValues = normalizeMultiValue(rawFieldValue);
          var selectedLookup = {};
          selectedValues.forEach(function (value) {
            selectedLookup[String(value || "").toLowerCase()] = true;
          });

          var multiOptionMarkup = multiOptions.map(function (option) {
            var optionValue = typeof option === "object" && option
              ? String(option.value || option.label || "")
              : String(option || "");
            if (!optionValue) {
              return "";
            }
            var optionLabel = typeof option === "object" && option
              ? String(option.label || option.value || optionValue)
              : optionValue;
            var checkedAttr = selectedLookup[optionValue.toLowerCase()] ? ' checked' : '';
            var optionId = 'overview-' + sport + '-' + field.key + '-' + optionValue
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            return (
              '<label class="sport-overview-chip" for="' + escapeAttribute(optionId) + '">' +
              '<input id="' + escapeAttribute(optionId) + '" type="checkbox" data-sport-overview-field data-field-type="multi-check" data-overview-key="' +
              escapeAttribute(field.key) +
              '" value="' +
              escapeAttribute(optionValue) +
              '"' + checkedAttr + ' />' +
              '<span>' + escapeHtml(optionLabel) + '</span>' +
              '</label>'
            );
          }).join("");

          return (
            '<div class="sport-overview-field">' +
            '<label>' + escapeHtml(field.label) + '</label>' +
            '<div class="sport-overview-chip-group">' + multiOptionMarkup + '</div>' +
            '</div>'
          );
        }

        if (fieldType === "select") {
          var options = Array.isArray(field.options) ? field.options : [];
          var placeholder = String(field.placeholder || "Select an option");
          var optionMarkup = ['<option value="">' + escapeHtml(placeholder) + '</option>'];
          options.forEach(function (option) {
            var optionValue = typeof option === "object" && option
              ? String(option.value || option.label || "")
              : String(option || "");
            if (!optionValue) {
              return;
            }
            var optionLabel = typeof option === "object" && option
              ? String(option.label || option.value || optionValue)
              : optionValue;
            var selectedAttr = fieldValue.toLowerCase() === optionValue.toLowerCase() ? ' selected' : '';
            optionMarkup.push(
              '<option value="' + escapeAttribute(optionValue) + '"' + selectedAttr + '>' +
              escapeHtml(optionLabel) +
              '</option>'
            );
          });

          return (
            '<div class="sport-overview-field">' +
            '<label>' + escapeHtml(field.label) + '</label>' +
            '<select data-sport-overview-field data-overview-key="' +
            escapeAttribute(field.key) +
            '">' + optionMarkup.join("") + '</select>' +
            '</div>'
          );
        }

        if (fieldType === "textarea") {
          return (
            '<div class="sport-overview-field">' +
            '<label>' + escapeHtml(field.label) + '</label>' +
            '<textarea data-sport-overview-field data-overview-key="' +
            escapeAttribute(field.key) +
            '" rows="' +
            escapeAttribute(String(field.rows || "3")) +
            '" placeholder="' +
            escapeAttribute(field.placeholder || "") +
            '">' +
            escapeHtml(fieldValue) +
            '</textarea>' +
            '</div>'
          );
        }

        var minAttr = field.min != null ? ' min="' + escapeAttribute(String(field.min)) + '"' : "";
        var maxAttr = field.max != null ? ' max="' + escapeAttribute(String(field.max)) + '"' : "";
        var stepAttr = field.step != null ? ' step="' + escapeAttribute(String(field.step)) + '"' : "";
        return (
          '<div class="sport-overview-field">' +
          '<label>' + escapeHtml(field.label) + '</label>' +
          '<input type="' + escapeAttribute(fieldType || "text") + '" data-sport-overview-field data-overview-key="' +
          escapeAttribute(field.key) +
          '" value="' +
          escapeAttribute(fieldValue) +
          '" placeholder="' +
          escapeAttribute(field.placeholder || "") +
          '"' + minAttr + maxAttr + stepAttr + ' />' +
          '</div>'
        );
      }).join("");

      return (
        '<section class="sport-overview-card" data-sport-overview-card data-sport-key="' +
        escapeAttribute(sport) +
        '">' +
        '<h4>' + escapeHtml(sportLabel) + ' Overview</h4>' +
        '<div class="sport-overview-fields">' + fieldMarkup + '</div>' +
        '</section>'
      );
    });

    state.sportOverviewEditor.innerHTML = cards.join("");
  }

  function collectSportOverviewFromForm() {
    if (!state.sportOverviewEditor) {
      return {};
    }

    var overview = {};
    state.sportOverviewEditor.querySelectorAll("[data-sport-overview-card]").forEach(function (card) {
      var sport = String(card.getAttribute("data-sport-key") || "").trim();
      if (!sport) {
        return;
      }

      var sportValues = {};
      card.querySelectorAll("[data-sport-overview-field]").forEach(function (input) {
        var key = String(input.getAttribute("data-overview-key") || "").trim();
        if (!key) {
          return;
        }

        var fieldType = String(input.getAttribute("data-field-type") || "").toLowerCase();
        if (fieldType === "multi-check") {
          if (input.checked) {
            if (!Array.isArray(sportValues[key])) {
              sportValues[key] = [];
            }
            sportValues[key].push(String(input.value || "").trim());
          }
          return;
        }

        var value = String(input.value || "").trim();
        if (value) {
          sportValues[key] = value;
        }
      });

      if (Object.keys(sportValues).length) {
        overview[sport] = sportValues;
      }
    });

    return overview;
  }

  function collectGeneralProfileFromForm() {
    var data = {};
    document.querySelectorAll("[data-general-profile-key]").forEach(function (input) {
      var key = String(input.getAttribute("data-general-profile-key") || "").trim();
      if (!key) {
        return;
      }

      var value = String(input.value || "").trim();
      if (value) {
        data[key] = value;
      }
    });
    return data;
  }

  function populateGeneralProfileIntoForm(general) {
    document.querySelectorAll("[data-general-profile-key]").forEach(function (input) {
      var key = String(input.getAttribute("data-general-profile-key") || "").trim();
      if (!key) {
        return;
      }
      input.value = general && general[key] != null ? String(general[key]) : "";
    });
  }

  function normalizeMultiValue(value) {
    if (value == null) {
      return [];
    }

    if (Array.isArray(value)) {
      return value
        .map(function (item) {
          return String(item || "").trim();
        })
        .filter(function (item) {
          return !!item;
        });
    }

    return String(value)
      .split(",")
      .map(function (item) {
        return String(item || "").trim();
      })
      .filter(function (item) {
        return !!item;
      });
  }

  function getSportLabel(sport) {
    var value = String(sport || "").trim();
    if (!value) {
      return "";
    }
    return value
      .split("-")
      .join(" ")
      .replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      });
  }

  function getMissingColumnName(error) {
    var message = String((error && error.message) || "");
    var details = String((error && error.details) || "");
    var text = message + " " + details;

    var quotedBeforeColumn = text.match(/[\'\"]([a-zA-Z0-9_]+)[\'\"]\s+column/i);
    if (quotedBeforeColumn && quotedBeforeColumn[1]) {
      return quotedBeforeColumn[1];
    }

    var columnThenName = text.match(/column\s+[\'\"]?([a-zA-Z0-9_]+)[\'\"]?/i);
    if (columnThenName && columnThenName[1]) {
      return columnThenName[1];
    }

    var findColumn = text.match(/find\s+the\s+[\'\"]?([a-zA-Z0-9_]+)[\'\"]?\s+column/i);
    if (findColumn && findColumn[1]) {
      return findColumn[1];
    }

    return null;
  }

  function isMissingColumnError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    var code = error && error.code ? String(error.code) : "";
    return code === "42703" ||
      code === "PGRST204" ||
      (msg.indexOf("column") > -1 && msg.indexOf("does not exist") > -1) ||
      (msg.indexOf("schema cache") > -1 && msg.indexOf("column") > -1);
  }

  function safeJsonParse(value) {
    try {
      return JSON.parse(String(value || ""));
    } catch (e) {
      return null;
    }
  }

  function goBackToDashboard() {
    window.location.href = state.isPersonal ? "profile.html" : "admin.html";
  }

  function canManageWearablesConnection() {
    return !!(state.isPersonal && state.user && state.athleteId && String(state.user.id || "") === String(state.athleteId || ""));
  }

  function maybeShowWearableRedirectStatuses() {
    var params;
    try {
      params = new URLSearchParams(window.location.search || "");
    } catch (_err) {
      return;
    }

    var stravaStatus = String(params.get(STRAVA_REDIRECT_STATUS_PARAM) || "").trim();
    if (stravaStatus) {
      var stravaMessage = String(params.get(STRAVA_REDIRECT_MESSAGE_PARAM) || "").trim();
      if (!stravaMessage) {
        stravaMessage = stravaStatus === "connected"
          ? "Strava account connected. Run a sync to pull your latest metrics."
          : (stravaStatus === "synced"
            ? "Strava metrics synced successfully."
            : "There was an issue completing Strava connection.");
      }
      setStravaStatus(stravaMessage, stravaStatus === "error" ? "error" : "success");
      params.delete(STRAVA_REDIRECT_STATUS_PARAM);
      params.delete(STRAVA_REDIRECT_MESSAGE_PARAM);
    }

    var whoopStatus = String(params.get(WHOOP_REDIRECT_STATUS_PARAM) || "").trim();
    if (whoopStatus) {
      var whoopMessage = String(params.get(WHOOP_REDIRECT_MESSAGE_PARAM) || "").trim();
      if (!whoopMessage) {
        whoopMessage = whoopStatus === "connected"
          ? "Whoop account connected. Run a sync to pull your latest metrics."
          : (whoopStatus === "synced"
            ? "Whoop metrics synced successfully."
            : "There was an issue completing Whoop connection.");
      }
      setWhoopStatus(whoopMessage, whoopStatus === "error" ? "error" : "success");
      params.delete(WHOOP_REDIRECT_STATUS_PARAM);
      params.delete(WHOOP_REDIRECT_MESSAGE_PARAM);
    }

    if (window.history && window.history.replaceState) {
      var cleanQuery = params.toString();
      var cleanUrl = window.location.pathname + (cleanQuery ? "?" + cleanQuery : "") + window.location.hash;
      window.history.replaceState({}, "", cleanUrl);
    }
  }

  function loadWearablesSync() {
    if (!state.isPersonal || !state.client || !state.athleteId) {
      return;
    }

    if (!state.stravaMetaEl && !state.whoopMetaEl) {
      return;
    }

    loadStravaConnection();
    loadWhoopConnection();
  }

  function loadStravaConnection() {
    if (!state.client || !state.athleteId) {
      return;
    }

    renderStravaConnection(null, true);

    state.client
      .from("athlete_strava_connections")
      .select("user_id,strava_athlete_id,connected_at,last_sync_at,sync_status,updated_at")
      .eq("user_id", state.athleteId)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          setStravaStatus(result.error.message || "Failed to load Strava connection.", "error");
          renderStravaConnection(null, false);
          return;
        }

        state.stravaConnection = result.data || null;
        renderStravaConnection(state.stravaConnection, false);
      })
      .catch(function (error) {
        setStravaStatus(error && error.message ? error.message : "Failed to load Strava connection.", "error");
        renderStravaConnection(null, false);
      });
  }

  function renderStravaConnection(connection, isLoading) {
    if (!state.stravaMetaEl) {
      return;
    }

    if (isLoading) {
      state.stravaMetaEl.innerHTML = '<p class="profile-loading">Checking Strava connection...</p>';
      return;
    }

    var canManage = canManageWearablesConnection();
    var isConnected = !!connection;

    if (state.stravaConnectBtn) {
      state.stravaConnectBtn.hidden = !canManage || isConnected;
      state.stravaConnectBtn.disabled = !canManage;
    }
    if (state.stravaSyncBtn) {
      state.stravaSyncBtn.hidden = !isConnected;
      state.stravaSyncBtn.disabled = !isConnected;
    }
    if (state.stravaDisconnectBtn) {
      state.stravaDisconnectBtn.hidden = !canManage || !isConnected;
      state.stravaDisconnectBtn.disabled = !canManage || !isConnected;
    }

    if (!isConnected) {
      state.stravaMetaEl.innerHTML =
        '<p class="strava-connection-empty">Connect your Strava account to sync activity-based training load.</p>';
      return;
    }

    var athleteLabel = connection.strava_athlete_id ? "Athlete " + String(connection.strava_athlete_id) : "Connected account";
    var syncLabel = connection.last_sync_at ? formatDateLabel(connection.last_sync_at) : "Not synced yet";
    var statusText = connection.sync_status || "connected";

    state.stravaMetaEl.innerHTML =
      '<div class="strava-connection-grid">' +
      '<div class="strava-connection-item"><span>Account</span><strong>' + escapeHtml(athleteLabel) + '</strong></div>' +
      '<div class="strava-connection-item"><span>Connection Status</span><strong>' + escapeHtml(String(statusText)) + '</strong></div>' +
      '<div class="strava-connection-item"><span>Last Sync</span><strong>' + escapeHtml(syncLabel) + '</strong></div>' +
      '</div>';
  }

  function onStravaConnect() {
    if (!canManageWearablesConnection()) {
      setStravaStatus("Only the athlete can connect Strava from this page.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    setStravaStatus("Generating Strava authorization link...", "info");

    state.client.functions
      .invoke("strava-connect-start", {
        body: {
          redirectTo: getStravaRedirectUrl()
        }
      })
      .then(function (result) {
        if (result.error) {
          setStravaStatus(formatEdgeFunctionError(result.error, "strava-connect-start"), "error");
          return;
        }

        var data = result.data || {};
        var authUrl = data.auth_url || data.authUrl || data.url || "";
        if (!authUrl) {
          setStravaStatus("Strava auth URL was not returned by strava-connect-start.", "error");
          return;
        }

        window.location.href = authUrl;
      })
      .catch(function (error) {
        setStravaStatus(formatEdgeFunctionError(error, "strava-connect-start"), "error");
      });
  }

  function onStravaSync() {
    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.stravaConnection) {
      setStravaStatus("Connect Strava before requesting a sync.", "info");
      return;
    }

    setStravaStatus("Syncing latest Strava metrics...", "info");

    state.client.functions
      .invoke("strava-sync-latest", {
        body: {
          days: 30
        }
      })
      .then(function (result) {
        if (result.error) {
          setStravaStatus(formatEdgeFunctionError(result.error, "strava-sync-latest"), "error");
          return;
        }

        setStravaStatus("Strava sync complete.", "success");
        loadStravaConnection();
      })
      .catch(function (error) {
        setStravaStatus(formatEdgeFunctionError(error, "strava-sync-latest"), "error");
      });
  }

  function onStravaDisconnect() {
    if (!canManageWearablesConnection()) {
      setStravaStatus("Only the athlete can disconnect Strava from this page.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setStravaStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.stravaConnection) {
      setStravaStatus("No Strava account is currently connected.", "info");
      return;
    }

    if (!confirm("Disconnect Strava from this athlete profile?")) {
      return;
    }

    setStravaStatus("Disconnecting Strava account...", "info");

    state.client.functions
      .invoke("strava-disconnect", { body: {} })
      .then(function (result) {
        if (result.error) {
          setStravaStatus(formatEdgeFunctionError(result.error, "strava-disconnect"), "error");
          return;
        }

        state.stravaConnection = null;
        renderStravaConnection(null, false);
        setStravaStatus("Strava disconnected.", "success");
      })
      .catch(function (error) {
        setStravaStatus(formatEdgeFunctionError(error, "strava-disconnect"), "error");
      });
  }

  function loadWhoopConnection() {
    if (!state.client || !state.athleteId) {
      return;
    }

    renderWhoopConnection(null, true);

    state.client
      .from("athlete_whoop_connections")
      .select("user_id,whoop_user_id,connected_at,last_sync_at,sync_status,updated_at")
      .eq("user_id", state.athleteId)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          setWhoopStatus(result.error.message || "Failed to load Whoop connection.", "error");
          renderWhoopConnection(null, false);
          return;
        }

        state.whoopConnection = result.data || null;
        renderWhoopConnection(state.whoopConnection, false);
      })
      .catch(function (error) {
        setWhoopStatus(error && error.message ? error.message : "Failed to load Whoop connection.", "error");
        renderWhoopConnection(null, false);
      });
  }

  function renderWhoopConnection(connection, isLoading) {
    if (!state.whoopMetaEl) {
      return;
    }

    if (isLoading) {
      state.whoopMetaEl.innerHTML = '<p class="profile-loading">Checking Whoop connection...</p>';
      return;
    }

    var canManage = canManageWearablesConnection();
    var isConnected = !!connection;

    if (state.whoopConnectBtn) {
      state.whoopConnectBtn.hidden = !canManage || isConnected;
      state.whoopConnectBtn.disabled = !canManage;
    }
    if (state.whoopManualToggleBtn) {
      state.whoopManualToggleBtn.hidden = !canManage || isConnected;
      state.whoopManualToggleBtn.disabled = !canManage;
    }
    if (state.whoopSyncBtn) {
      state.whoopSyncBtn.hidden = !isConnected;
      state.whoopSyncBtn.disabled = !isConnected;
    }
    if (state.whoopDisconnectBtn) {
      state.whoopDisconnectBtn.hidden = !canManage || !isConnected;
      state.whoopDisconnectBtn.disabled = !canManage || !isConnected;
    }

    if (!isConnected) {
      setWhoopManualFormVisible(false);
      state.whoopMetaEl.innerHTML =
        '<p class="strava-connection-empty">Connect your Whoop account to sync recovery and sleep metrics.</p>';
      return;
    }

    var whoopLabel = connection.whoop_user_id ? "Whoop User " + String(connection.whoop_user_id) : "Connected account";
    var syncLabel = connection.last_sync_at ? formatDateLabel(connection.last_sync_at) : "Not synced yet";
    var statusText = connection.sync_status || "connected";

    state.whoopMetaEl.innerHTML =
      '<div class="strava-connection-grid">' +
      '<div class="strava-connection-item"><span>Account</span><strong>' + escapeHtml(whoopLabel) + '</strong></div>' +
      '<div class="strava-connection-item"><span>Connection Status</span><strong>' + escapeHtml(String(statusText)) + '</strong></div>' +
      '<div class="strava-connection-item"><span>Last Sync</span><strong>' + escapeHtml(syncLabel) + '</strong></div>' +
      '</div>';
    setWhoopManualFormVisible(false);
  }

  function onWhoopConnect() {
    if (!canManageWearablesConnection()) {
      setWhoopStatus("Only the athlete can connect Whoop from this page.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    setWhoopStatus("Generating Whoop authorization link...", "info");

    state.client.functions
      .invoke("whoop-connect-start", {
        body: {
          redirectTo: getWhoopRedirectUrl()
        }
      })
      .then(function (result) {
        if (result.error) {
          setWhoopStatus(formatEdgeFunctionError(result.error, "whoop-connect-start"), "error");
          return;
        }

        var data = result.data || {};
        var authUrl = data.auth_url || data.authUrl || data.url || "";
        if (!authUrl) {
          setWhoopStatus("Whoop auth URL was not returned by whoop-connect-start.", "error");
          return;
        }

        window.location.href = authUrl;
      })
      .catch(function (error) {
        setWhoopStatus(formatEdgeFunctionError(error, "whoop-connect-start"), "error");
      });
  }

  function onWhoopSync() {
    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.whoopConnection) {
      setWhoopStatus("Connect Whoop before requesting a sync.", "info");
      return;
    }

    setWhoopStatus("Syncing latest Whoop metrics...", "info");

    state.client.functions
      .invoke("whoop-sync-latest", {
        body: {
          days: 30
        }
      })
      .then(function (result) {
        if (result.error) {
          setWhoopStatus(formatEdgeFunctionError(result.error, "whoop-sync-latest"), "error");
          return;
        }

        setWhoopStatus("Whoop sync complete.", "success");
        loadWhoopConnection();
      })
      .catch(function (error) {
        setWhoopStatus(formatEdgeFunctionError(error, "whoop-sync-latest"), "error");
      });
  }

  function onWhoopDisconnect() {
    if (!canManageWearablesConnection()) {
      setWhoopStatus("Only the athlete can disconnect Whoop from this page.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    if (!state.whoopConnection) {
      setWhoopStatus("No Whoop account is currently connected.", "info");
      return;
    }

    if (!confirm("Disconnect Whoop from this athlete profile?")) {
      return;
    }

    setWhoopStatus("Disconnecting Whoop account...", "info");

    state.client.functions
      .invoke("whoop-disconnect", { body: {} })
      .then(function (result) {
        if (result.error) {
          setWhoopStatus(formatEdgeFunctionError(result.error, "whoop-disconnect"), "error");
          return;
        }

        state.whoopConnection = null;
        renderWhoopConnection(null, false);
        setWhoopStatus("Whoop disconnected.", "success");
      })
      .catch(function (error) {
        setWhoopStatus(formatEdgeFunctionError(error, "whoop-disconnect"), "error");
      });
  }

  function onWhoopManualSubmit(event) {
    if (event) {
      event.preventDefault();
    }

    if (!canManageWearablesConnection()) {
      setWhoopStatus("Only the athlete can set Whoop credentials from this page.", "info");
      return;
    }

    if (!state.client || !state.client.functions) {
      setWhoopStatus("Supabase Functions are not available in this build.", "error");
      return;
    }

    var accessToken = String((state.whoopManualAccessToken && state.whoopManualAccessToken.value) || "").trim();
    var refreshToken = String((state.whoopManualRefreshToken && state.whoopManualRefreshToken.value) || "").trim();
    var userId = String((state.whoopManualUserId && state.whoopManualUserId.value) || "").trim();
    var expiresInRaw = String((state.whoopManualExpiresIn && state.whoopManualExpiresIn.value) || "").trim();
    var expiresIn = expiresInRaw ? Number(expiresInRaw) : null;

    if (!accessToken || !refreshToken) {
      setWhoopStatus("Access token and refresh token are required.", "error");
      return;
    }

    setWhoopStatus("Saving Whoop info...", "info");

    state.client.functions
      .invoke("whoop-manual-connect", {
        body: {
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_in: Number.isFinite(expiresIn) ? expiresIn : null,
          whoop_user_id: userId || null
        }
      })
      .then(function (result) {
        if (result.error) {
          setWhoopStatus(formatEdgeFunctionError(result.error, "whoop-manual-connect"), "error");
          return;
        }

        setWhoopStatus("Whoop credentials saved.", "success");
        setWhoopManualFormVisible(false);
        if (state.whoopManualAccessToken) state.whoopManualAccessToken.value = "";
        if (state.whoopManualRefreshToken) state.whoopManualRefreshToken.value = "";
        if (state.whoopManualExpiresIn) state.whoopManualExpiresIn.value = "";
        if (state.whoopManualUserId) state.whoopManualUserId.value = "";
        loadWhoopConnection();
      })
      .catch(function (error) {
        setWhoopStatus(formatEdgeFunctionError(error, "whoop-manual-connect"), "error");
      });
  }

  function setWhoopManualFormVisible(visible) {
    if (!state.whoopManualForm) {
      return;
    }

    state.whoopManualForm.hidden = !(!!visible && canManageWearablesConnection());
  }

  function setStravaStatus(message, variant) {
    if (!state.stravaStatusEl) {
      return;
    }

    state.stravaStatusEl.textContent = message || "";
    state.stravaStatusEl.className = "admin-modal-status" + (message ? " is-" + (variant || "info") : "");
  }

  function setWhoopStatus(message, variant) {
    if (!state.whoopStatusEl) {
      return;
    }

    state.whoopStatusEl.textContent = message || "";
    state.whoopStatusEl.className = "admin-modal-status" + (message ? " is-" + (variant || "info") : "");
  }

  function getStravaRedirectUrl() {
    return window.location.origin + "/athlete-editor.html?personal=true";
  }

  function getWhoopRedirectUrl() {
    return window.location.origin + "/athlete-editor.html?personal=true";
  }

  function formatEdgeFunctionError(error, functionName) {
    var message = String((error && error.message) || "").trim();
    var normalized = message.toLowerCase();

    if (
      normalized.indexOf("failed to send a request") !== -1 ||
      normalized.indexOf("requested function was not found") !== -1 ||
      normalized.indexOf("not_found") !== -1
    ) {
      return "Could not reach " + functionName + ". Verify Supabase Edge Functions are deployed and configured.";
    }

    return message || ("Failed calling " + functionName + ".");
  }

  function formatDateLabel(value) {
    var date = new Date(String(value || ""));
    if (!date || isNaN(date.getTime())) {
      return "—";
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  function onResetMyPassword() {
    if (!state.isPersonal) {
      setAccountStatus("Password reset is only available for your own account.", "info");
      return;
    }

    if (!state.client || !state.user || !state.user.email) {
      setAccountStatus("Not authenticated.", "error");
      return;
    }

    var cooldownMs = getResetCooldownRemainingMs();
    if (cooldownMs > 0) {
      var seconds = Math.ceil(cooldownMs / 1000);
      setAccountStatus("Please wait " + seconds + " seconds before requesting another reset email.", "info");
      return;
    }

    setAccountStatus("Sending password reset email...", "info");

    state.client.auth
      .resetPasswordForEmail(state.user.email, {
        redirectTo: getPasswordResetRedirectUrl()
      })
      .then(function (result) {
        if (result.error) {
          if (isRateLimitError(result.error)) {
            markResetCooldown();
            setAccountStatus("Email rate limit reached. Please wait about a minute, then try again.", "error");
            return;
          }

          setAccountStatus(result.error.message, "error");
          return;
        }

        markResetCooldown();
        setAccountStatus("Password reset email sent. Check your inbox.", "success");
      })
      .catch(function (error) {
        setAccountStatus(error && error.message ? error.message : "Failed to send password reset email.", "error");
      });
  }

  function onLogout() {
    if (!state.client) {
      setAccountStatus("Not authenticated.", "error");
      return;
    }

    setAccountStatus("Logging out...", "info");

    state.client.auth
      .signOut()
      .then(function (result) {
        if (result.error) {
          setAccountStatus(result.error.message, "error");
          return;
        }

        window.location.href = "index.html";
      })
      .catch(function (error) {
        setAccountStatus(error && error.message ? error.message : "Failed to log out.", "error");
      });
  }

  function onDeleteAccount() {
    if (!state.isPersonal) {
      setAccountStatus("Delete account is only available for your own account.", "info");
      return;
    }

    if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      return;
    }

    if (!confirm("This will permanently delete your account and all data. Continue?")) {
      return;
    }

    if (!state.client || !state.user) {
      setAccountStatus("Not authenticated.", "error");
      return;
    }

    setAccountStatus("Deleting account...", "info");

    state.client
      .rpc("athlete_delete_own_account")
      .then(function (result) {
        if (result.error) {
          var message = result.error.message || "Failed to delete account.";
          if (result.error.code === "42883" || /athlete_delete_own_account\(\)/i.test(message)) {
            message = "Delete account is not configured yet. Run sql/create-athlete-self-delete-account-rpc.sql in Supabase.";
          }
          setAccountStatus(message, "error");
          return;
        }

        setAccountStatus("Account deleted. Redirecting...", "success");

        state.client.auth
          .signOut()
          .finally(function () {
            setTimeout(function () {
              redirectToHome();
            }, 700);
          });
      })
      .catch(function (error) {
        setAccountStatus(error && error.message ? error.message : "Failed to delete account.", "error");
      });
  }

  function setAccountStatus(msg, type) {
    var statusEl = document.querySelector("[data-athlete-editor-account-status]");
    if (!statusEl) {
      setStatus(msg, type);
      return;
    }

    statusEl.textContent = msg;
    statusEl.className = "admin-modal-status is-" + (type || "info");
    if (type === "success") {
      setTimeout(function () {
        statusEl.textContent = "";
        statusEl.className = "admin-modal-status";
      }, 3000);
    }
  }

  function getResetCooldownRemainingMs() {
    try {
      var key = getResetCooldownKey();
      var expiresAt = parseInt(window.localStorage.getItem(key) || "0", 10);
      if (!expiresAt) {
        return 0;
      }

      var remaining = expiresAt - Date.now();
      return remaining > 0 ? remaining : 0;
    } catch (_err) {
      return 0;
    }
  }

  function markResetCooldown() {
    try {
      var key = getResetCooldownKey();
      var expiresAt = Date.now() + 60 * 1000;
      window.localStorage.setItem(key, String(expiresAt));
    } catch (_err) {
      // Ignore storage errors.
    }
  }

  function getResetCooldownKey() {
    var email = state.user && state.user.email ? state.user.email.toLowerCase() : "unknown";
    return "nomadic_reset_password_cooldown_" + email;
  }

  function getPasswordResetRedirectUrl() {
    return window.location.origin + "/update-password.html";
  }

  function isRateLimitError(error) {
    var message = error && error.message ? String(error.message).toLowerCase() : "";
    return message.indexOf("rate limit") > -1 || message.indexOf("too many") > -1;
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

  function showError(msg) {
    if (state.guardElement) {
      state.guardElement.innerHTML = '<p style="color: #9f2d20; font-weight: 700;">' + escapeHtml(msg) + '</p>';
    }
  }

  function setStatus(msg, type) {
    var statusEl = document.querySelector("[data-athlete-editor-status]");
    if (!statusEl) return;

    statusEl.textContent = msg;
    statusEl.className = "admin-modal-status is-" + (type || "info");
    if (type === "success") {
      setTimeout(function () {
        statusEl.textContent = "";
        statusEl.className = "admin-modal-status";
      }, 3000);
    }
  }

  function clearStatus() {
    var statusEl = document.querySelector("[data-athlete-editor-status]");
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.className = "admin-modal-status";
    }
  }

  function redirectToHome() {
    window.location.href = "index.html";
  }

  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
