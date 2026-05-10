(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var state = {
    client: null,
    user: null,
    guardElement: null,
    contentElement: null,
    form: null,
    sportOverviewEditor: null,
    athleteId: null,
    athleteName: null,
    currentAthlete: null,
    isPersonal: false,
    sportOverviewTemplates: {
      climbing: [
        { key: "climbing_type", label: "Climbing Type", placeholder: "Bouldering, Sport, Trad, Ice" },
        { key: "climbing_grade", label: "Current Climbing Level", placeholder: "V5 / 5.12a" },
        { key: "climbing_focus", label: "Current Focus", placeholder: "Power endurance, projecting" }
      ],
      skiing: [
        { key: "ski_discipline", label: "Ski Discipline", placeholder: "Alpine, Touring, Freeride" },
        { key: "ski_home_mountain", label: "Primary Mountain / Region", placeholder: "e.g., Jackson Hole" },
        { key: "ski_terrain", label: "Preferred Terrain", placeholder: "Steeps, moguls, groomers" }
      ],
      snowboarding: [
        { key: "snowboard_discipline", label: "Snowboard Discipline", placeholder: "Freeride, Park, Splitboard" },
        { key: "snowboard_home_mountain", label: "Primary Mountain / Region", placeholder: "e.g., Whistler" },
        { key: "snowboard_stance", label: "Stance", placeholder: "Regular or Goofy" }
      ],
      mountainbiking: [
        { key: "mtb_discipline", label: "MTB Discipline", placeholder: "XC, Enduro, DH, Trail" },
        { key: "mtb_home_trails", label: "Primary Trails / Region", placeholder: "e.g., Sedona" },
        { key: "mtb_weekly_volume", label: "Weekly Ride Volume", placeholder: "e.g., 6 hrs" }
      ],
      "trail-running": [
        { key: "run_primary_distance", label: "Primary Distance", placeholder: "10k, Half, Ultra" },
        { key: "run_elevation_goal", label: "Elevation Focus", placeholder: "e.g., 3000 ft/week" },
        { key: "run_surface", label: "Preferred Terrain", placeholder: "Technical trail, mixed" }
      ],
      mixed: [
        { key: "mixed_split", label: "Training Split", placeholder: "Climb 2x, Run 2x, Strength 2x" }
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

    if (state.form) {
      state.form.addEventListener("submit", onSaveChanges);
      state.form.addEventListener("change", function (event) {
        var target = event && event.target;
        if (target && target.name === "dob") {
          updateCalculatedAgeDisplay(String(target.value || ""));
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

    if (!state.athleteId) {
      setStatus("No athlete selected.", "error");
      return;
    }

    showContent();
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
    var createdText = athlete.user_created_at || (state.user && state.user.created_at) || "";
    var lastSignInText = athlete.last_sign_in_at || (state.user && state.user.last_sign_in_at) || "";

    var emailEl = document.querySelector("[data-athlete-editor-email]");
    var createdEl = document.querySelector("[data-athlete-editor-created]");
    var lastSignInEl = document.querySelector("[data-athlete-editor-last-signin]");
    if (emailEl) emailEl.textContent = emailText;
    if (createdEl) createdEl.textContent = createdText ? formatDate(createdText) : "N/A";
    if (lastSignInEl) lastSignInEl.textContent = lastSignInText ? formatDate(lastSignInText) : "N/A";

    setInputValue("name", athlete.name);
    setInputValue("dob", getDobFromProfile(athlete));
    setInputValue("bio", athlete.bio);
    setInputValue("location", athlete.location);
    setInputValue("height_cm", athlete.height_cm);
    setInputValue("weight_kg", athlete.weight_kg);

    updateCalculatedAgeDisplay(getDobFromProfile(athlete));

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
      age: calculateAgeFromDob(dobValue),
      location: String(formData.get("location") || "").trim(),
      height_cm: parseFloat(formData.get("height_cm") || "") || null,
      weight_kg: parseFloat(formData.get("weight_kg") || "") || null,
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

  function updateCalculatedAgeDisplay(dobText) {
    var ageEl = document.querySelector("[data-athlete-editor-calculated-age]");
    if (!ageEl) {
      return;
    }

    var age = calculateAgeFromDob(dobText);
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
        var fieldValue = sportValues[field.key] == null ? "" : String(sportValues[field.key]);
        return (
          '<div class="sport-overview-field">' +
          '<label>' + escapeHtml(field.label) + '</label>' +
          '<input type="text" data-sport-overview-field data-overview-key="' +
          escapeAttribute(field.key) +
          '" value="' +
          escapeAttribute(fieldValue) +
          '" placeholder="' +
          escapeAttribute(field.placeholder || "") +
          '" />' +
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

  function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    try {
      var d = new Date(dateStr);
      return d.toLocaleDateString() + " " + d.toLocaleTimeString();
    } catch (e) {
      return dateStr;
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
