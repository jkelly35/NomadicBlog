(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var EXERCISE_LIBRARY_KEY = "nomadic_exercise_library_v1";
  var EXERCISE_LIBRARY_TABLE = "exercise_library";

  var state = {
    client: null,
    user: null,
    guardEl: null,
    contentEl: null,
    exercises: []
  };

  document.addEventListener("DOMContentLoaded", function () {
    init();
  });

  function init() {
    state.guardEl = document.querySelector("[data-library-guard]");
    state.contentEl = document.querySelector("[data-library-content]");

    if (!window.supabase || !window.supabase.createClient) {
      showGuardError("Supabase client library failed to load.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      showGuardError("Supabase configuration is incomplete.");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session || !session.user) {
        redirectHome();
        return;
      }

      state.user = session.user;
      if (String(state.user.email || "").toLowerCase() !== ADMIN_EMAIL) {
        showGuardError("You do not have permission to access this page.");
        setTimeout(redirectHome, 1800);
        return;
      }

      showContent();
      bindEvents();
      loadExercises();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectHome();
      }
    });
  }

  function bindEvents() {
    var search = document.querySelector("[data-library-search]");
    var filterPattern = document.querySelector("[data-library-filter-pattern]");
    var filterSport = document.querySelector("[data-library-filter-sport]");
    var form = document.querySelector("[data-library-form]");
    var clearBtn = document.querySelector("[data-library-clear]");
    var list = document.querySelector("[data-library-list]");

    if (search) {
      search.addEventListener("input", renderExercises);
    }
    if (filterPattern) {
      filterPattern.addEventListener("change", renderExercises);
    }
    if (filterSport) {
      filterSport.addEventListener("change", renderExercises);
    }
    if (form) {
      form.addEventListener("submit", onSaveExercise);
    }
    if (clearBtn) {
      clearBtn.addEventListener("click", clearForm);
    }
    if (list) {
      list.addEventListener("click", function (event) {
        var actionBtn = event.target.closest("[data-library-action]");
        if (!actionBtn) {
          return;
        }

        var action = actionBtn.getAttribute("data-library-action");
        var id = actionBtn.getAttribute("data-library-id");
        if (!id) {
          return;
        }

        if (action === "edit") {
          editExercise(id);
          return;
        }

        if (action === "delete") {
          deleteExercise(id);
        }
      });
    }
  }

  function loadExercises() {
    if (!state.client) {
      state.exercises = readLocal();
      renderExercises();
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .select("id,name,movement_pattern,equipment,primary_muscle,training_goal,sport_tags,custom_tags,description,coaching_cues,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            state.exercises = readLocal();
            renderExercises();
            setStatus("Using local exercise library until Supabase table is created.", "info");
            return;
          }

          state.exercises = readLocal();
          renderExercises();
          setStatus(result.error.message, "error");
          return;
        }

        state.exercises = (result.data || []).map(normalizeRow);
        if (!state.exercises.length) {
          var local = readLocal();
          if (local.length) {
            state.exercises = local;
            renderExercises();
            syncLocal(local);
            return;
          }
        }

        renderExercises();
      })
      .catch(function () {
        state.exercises = readLocal();
        renderExercises();
      });
  }

  function renderExercises() {
    var list = document.querySelector("[data-library-list]");
    if (!list) {
      return;
    }

    var query = String((document.querySelector("[data-library-search]") || {}).value || "").trim().toLowerCase();
    var patternFilter = String((document.querySelector("[data-library-filter-pattern]") || {}).value || "").trim().toLowerCase();
    var sportFilter = String((document.querySelector("[data-library-filter-sport]") || {}).value || "").trim().toLowerCase();

    var filtered = state.exercises
      .filter(function (item) {
        if (patternFilter && String(item.movement_pattern || "") !== patternFilter) {
          return false;
        }

        if (sportFilter) {
          var sports = Array.isArray(item.sport_tags) ? item.sport_tags : [];
          if (sports.indexOf(sportFilter) === -1) {
            return false;
          }
        }

        if (!query) {
          return true;
        }

        var haystack = [
          item.name,
          item.movement_pattern,
          item.equipment,
          item.primary_muscle,
          item.training_goal,
          item.description,
          item.coaching_cues,
          (item.custom_tags || []).join(" "),
          (item.sport_tags || []).join(" ")
        ]
          .join(" ")
          .toLowerCase();

        return haystack.indexOf(query) > -1;
      })
      .sort(function (a, b) {
        return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No exercises match this view yet.</p>';
      return;
    }

    list.innerHTML = filtered
      .map(function (item) {
        var tags = [item.movement_pattern, item.equipment, item.primary_muscle, item.training_goal]
          .concat(Array.isArray(item.sport_tags) ? item.sport_tags : [])
          .concat(Array.isArray(item.custom_tags) ? item.custom_tags : [])
          .filter(function (v) {
            return !!v;
          });

        return (
          '<article class="admin-library-item">' +
          '<div class="admin-library-item-head">' +
          '<h4>' + escapeHtml(item.name || "Exercise") + '</h4>' +
          '<div class="admin-program-item-actions">' +
          '<button type="button" class="btn admin-btn-small" data-library-action="edit" data-library-id="' +
          escapeAttribute(item.id) +
          '">Edit</button>' +
          '<button type="button" class="btn admin-btn-delete-mini" data-library-action="delete" data-library-id="' +
          escapeAttribute(item.id) +
          '">Delete</button>' +
          '</div>' +
          '</div>' +
          '<p>' + escapeHtml(item.description || "No description yet.") + '</p>' +
          '<div class="admin-library-tags">' +
          tags
            .map(function (tag) {
              return '<span class="admin-library-tag">' + escapeHtml(tag) + '</span>';
            })
            .join("") +
          '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  function onSaveExercise(event) {
    event.preventDefault();

    var id = String((document.querySelector("[data-library-id]") || {}).value || "").trim();
    var name = String((document.querySelector("[data-library-name]") || {}).value || "").trim();
    if (!name) {
      setStatus("Exercise name is required.", "error");
      return;
    }

    var existing = id
      ? state.exercises.find(function (item) {
          return item.id === id;
        })
      : null;

    var now = new Date().toISOString();
    var entry = {
      id: existing ? existing.id : "ex_" + String(Date.now()) + "_" + String(Math.floor(Math.random() * 10000)),
      name: name,
      movement_pattern: String((document.querySelector("[data-library-pattern]") || {}).value || "").trim().toLowerCase(),
      equipment: String((document.querySelector("[data-library-equipment]") || {}).value || "").trim().toLowerCase(),
      primary_muscle: String((document.querySelector("[data-library-muscle]") || {}).value || "").trim().toLowerCase(),
      training_goal: String((document.querySelector("[data-library-goal]") || {}).value || "").trim().toLowerCase(),
      sport_tags: Array.prototype.slice
        .call(document.querySelectorAll("[data-library-sport]:checked"))
        .map(function (checkbox) {
          return String(checkbox.value || "").trim().toLowerCase();
        })
        .filter(function (value) {
          return !!value;
        }),
      custom_tags: String((document.querySelector("[data-library-custom-tags]") || {}).value || "")
        .split(",")
        .map(function (part) {
          return String(part || "").trim().toLowerCase();
        })
        .filter(function (value) {
          return !!value;
        }),
      description: String((document.querySelector("[data-library-description]") || {}).value || "").trim(),
      coaching_cues: String((document.querySelector("[data-library-cues]") || {}).value || "").trim(),
      created_at: existing ? existing.created_at : now,
      updated_at: now
    };

    if (existing) {
      state.exercises = state.exercises.map(function (item) {
        return item.id === entry.id ? entry : item;
      });
    } else {
      state.exercises.push(entry);
    }

    writeLocal(state.exercises);

    if (!state.client) {
      renderExercises();
      clearForm();
      setStatus(existing ? "Exercise updated." : "Exercise added.", "success");
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .upsert(entry)
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            renderExercises();
            clearForm();
            setStatus("Saved locally. Run sql/create-exercise-library-table.sql for cloud sync.", "info");
            return;
          }

          setStatus(result.error.message, "error");
          return;
        }

        clearForm();
        setStatus(existing ? "Exercise updated." : "Exercise added.", "success");
        loadExercises();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Saved locally, but cloud sync failed.", "info");
      });
  }

  function editExercise(id) {
    var entry = state.exercises.find(function (item) {
      return item.id === id;
    });

    if (!entry) {
      return;
    }

    var title = document.querySelector("[data-library-form-title]");
    if (title) {
      title.textContent = "Edit Exercise";
    }

    setInputValue("[data-library-id]", entry.id || "");
    setInputValue("[data-library-name]", entry.name || "");
    setInputValue("[data-library-pattern]", entry.movement_pattern || "");
    setInputValue("[data-library-equipment]", entry.equipment || "");
    setInputValue("[data-library-muscle]", entry.primary_muscle || "");
    setInputValue("[data-library-goal]", entry.training_goal || "");
    setInputValue("[data-library-custom-tags]", Array.isArray(entry.custom_tags) ? entry.custom_tags.join(", ") : "");
    setInputValue("[data-library-description]", entry.description || "");
    setInputValue("[data-library-cues]", entry.coaching_cues || "");

    var sports = Array.isArray(entry.sport_tags) ? entry.sport_tags : [];
    document.querySelectorAll("[data-library-sport]").forEach(function (checkbox) {
      checkbox.checked = sports.indexOf(String(checkbox.value || "").trim().toLowerCase()) > -1;
    });
  }

  function deleteExercise(id) {
    var entry = state.exercises.find(function (item) {
      return item.id === id;
    });
    if (!entry) {
      return;
    }

    if (!confirm("Delete exercise '" + (entry.name || "Exercise") + "'?")) {
      return;
    }

    state.exercises = state.exercises.filter(function (item) {
      return item.id !== id;
    });
    writeLocal(state.exercises);

    if (!state.client) {
      renderExercises();
      clearForm();
      setStatus("Exercise deleted.", "info");
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .delete()
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            renderExercises();
            clearForm();
            setStatus("Exercise deleted locally.", "info");
            return;
          }

          setStatus(result.error.message, "error");
          return;
        }

        renderExercises();
        clearForm();
        setStatus("Exercise deleted.", "info");
      })
      .catch(function (error) {
        setStatus(
          error && error.message ? error.message : "Exercise deleted locally, but cloud delete failed.",
          "info"
        );
      });
  }

  function clearForm() {
    var form = document.querySelector("[data-library-form]");
    if (form) {
      form.reset();
    }

    setInputValue("[data-library-id]", "");
    var title = document.querySelector("[data-library-form-title]");
    if (title) {
      title.textContent = "Add Exercise";
    }
  }

  function syncLocal(items) {
    if (!state.client || !items || !items.length) {
      return;
    }

    state.client
      .from(EXERCISE_LIBRARY_TABLE)
      .upsert(items)
      .then(function (result) {
        if (result.error) {
          return;
        }

        setStatus("Exercise library synced from local cache to Supabase.", "success");
      })
      .catch(function () {
        // Keep local data if sync fails.
      });
  }

  function normalizeRow(item) {
    return {
      id: item && item.id,
      name: item && item.name ? item.name : "",
      movement_pattern: item && item.movement_pattern ? item.movement_pattern : "",
      equipment: item && item.equipment ? item.equipment : "",
      primary_muscle: item && item.primary_muscle ? item.primary_muscle : "",
      training_goal: item && item.training_goal ? item.training_goal : "",
      sport_tags: item && Array.isArray(item.sport_tags) ? item.sport_tags : [],
      custom_tags: item && Array.isArray(item.custom_tags) ? item.custom_tags : [],
      description: item && item.description ? item.description : "",
      coaching_cues: item && item.coaching_cues ? item.coaching_cues : "",
      created_at: item && item.created_at,
      updated_at: item && item.updated_at
    };
  }

  function readLocal() {
    try {
      var raw = window.localStorage.getItem(EXERCISE_LIBRARY_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(normalizeRow);
    } catch (e) {
      return [];
    }
  }

  function writeLocal(items) {
    try {
      window.localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify(items || []));
    } catch (e) {
      setStatus("Could not save exercise library in this browser.", "error");
    }
  }

  function setStatus(message, variant) {
    var el = document.querySelector("[data-library-status]");
    if (!el) {
      return;
    }

    el.textContent = message || "";
    el.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      el.classList.add("is-error");
    } else if (variant === "success") {
      el.classList.add("is-success");
    } else {
      el.classList.add("is-info");
    }
  }

  function setInputValue(selector, value) {
    var el = document.querySelector(selector);
    if (el) {
      el.value = value;
    }
  }

  function showContent() {
    if (state.guardEl) {
      state.guardEl.hidden = true;
    }
    if (state.contentEl) {
      state.contentEl.hidden = false;
    }
  }

  function showGuardError(message) {
    if (!state.guardEl) {
      return;
    }

    state.guardEl.innerHTML =
      '<div style="padding: 2rem; text-align: center; color: #9f2d20;">' +
      '<p style="font-size: 1.1rem; font-weight: 700;">' +
      escapeHtml(message || "Access denied.") +
      "</p>" +
      '<p><a href="admin.html" class="btn" style="display:inline-block; margin-top: 1rem;">Return to Coaching Dashboard</a></p>' +
      "</div>";
  }

  function redirectHome() {
    window.location.href = "index.html";
  }

  function isMissingTableError(error) {
    var msg = error && error.message ? String(error.message).toLowerCase() : "";
    return !!(error && error.code === "42P01") || msg.indexOf("does not exist") > -1;
  }

  function escapeHtml(text) {
    if (!text) return "";
    var map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return String(text).replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  function escapeAttribute(text) {
    return escapeHtml(String(text || "")).replace(/`/g, "");
  }
})();
