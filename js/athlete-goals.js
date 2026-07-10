(function () {
  var GOALS_FALLBACK_KEY = "nomadic_athlete_goals_events_v1";

  var state = {
    client: null,
    user: null,
    guardElement: null,
    contentElement: null,
    goalsForm: null,
    goalsList: null,
    goalsCountdown: null,
    goalsStatus: null,
    goalItems: [],
    editingGoalId: null,
    submitButton: null,
    cancelEditButton: null
  };

  document.addEventListener("DOMContentLoaded", function () {
    initializePage();
  });

  function initializePage() {
    state.guardElement = document.querySelector("[data-goals-guard]");
    state.contentElement = document.querySelector("[data-goals-content]");
    state.goalsForm = document.querySelector("[data-goals-form]");
    state.goalsList = document.querySelector("[data-goals-list]");
    state.goalsCountdown = document.querySelector("[data-goals-countdown]");
    state.goalsStatus = document.querySelector("[data-goals-status]");
    state.submitButton = document.querySelector("[data-goal-submit-button]");
    state.cancelEditButton = document.querySelector("[data-goal-cancel-edit]");

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
      hideGuard();
      showContent();
      bindEvents();
      loadGoalItems();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function bindEvents() {
    if (state.goalsForm) {
      state.goalsForm.addEventListener("submit", onGoalSubmit);
    }

    if (state.cancelEditButton) {
      state.cancelEditButton.addEventListener("click", function () {
        if (state.goalsForm) {
          state.goalsForm.reset();
        }
        resetGoalFormMode();
        setGoalsStatus("Edit canceled.", "info");
      });
    }

    if (state.goalsList) {
      state.goalsList.addEventListener("click", onGoalListClick);
      state.goalsList.addEventListener("change", onGoalListChange);
    }
  }

  function loadGoalItems() {
    if (!state.client || !getUserId()) {
      return;
    }

    setGoalsStatus("Loading goals and milestones...", "info");

    state.client
      .from("athlete_goals_events")
      .select("id,user_id,title,goal_type,target_date,details,status,created_at,updated_at")
      .eq("user_id", getUserId())
      .order("target_date", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingGoalTableError(result.error)) {
            state.goalItems = readGoalFallbackItems(getUserId());
            renderGoalItems();
            setGoalsStatus(
              "Goals table not found yet. Run sql/create-athlete-goals-events-table.sql to sync with coach dashboard.",
              "error"
            );
            return;
          }

          setGoalsStatus(result.error.message, "error");
          return;
        }

        state.goalItems = (result.data || []).map(normalizeGoalItem);
        writeGoalFallbackItems(getUserId(), state.goalItems);
        renderGoalItems();
        setGoalsStatus("", "info");
      })
      .catch(function (error) {
        setGoalsStatus(error && error.message ? error.message : "Failed to load goals.", "error");
      });
  }

  function onGoalSubmit(event) {
    event.preventDefault();

    if (!state.goalsForm || !getUserId()) {
      setGoalsStatus("Unable to save goal right now.", "error");
      return;
    }

    var formData = new FormData(state.goalsForm);
    var title = String(formData.get("title") || "").trim();
    var goalType = String(formData.get("goal_type") || "goal").trim() || "goal";
    var targetDate = String(formData.get("target_date") || "").trim();
    var details = String(formData.get("details") || "").trim();

    if (!title) {
      setGoalsStatus("Add a goal title.", "error");
      return;
    }

    if (isGoalTypeDateRequired(goalType) && !targetDate) {
      setGoalsStatus("Add a target date for races, events, trips, and milestones.", "error");
      return;
    }

    var payload = {
      user_id: getUserId(),
      title: title,
      goal_type: goalType,
      target_date: targetDate || null,
      details: details || null,
      status: "active"
    };

    if (state.editingGoalId) {
      updateGoalItem(state.editingGoalId, payload);
      return;
    }

    setGoalsStatus("Saving goal...", "info");

    state.client
      .from("athlete_goals_events")
      .insert(payload)
      .select("id,user_id,title,goal_type,target_date,details,status,created_at,updated_at")
      .single()
      .then(function (result) {
        if (result.error) {
          if (isMissingGoalTableError(result.error)) {
            var fallbackItem = normalizeGoalItem(
              Object.assign({ id: "goal_" + Date.now() }, payload, {
                target_date: payload.target_date || "",
                details: payload.details || "",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
            );
            state.goalItems.unshift(fallbackItem);
            writeGoalFallbackItems(getUserId(), state.goalItems);
            renderGoalItems();
            state.goalsForm.reset();
            setGoalsStatus("Saved in this browser only.", "error");
            return;
          }

          setGoalsStatus(result.error.message, "error");
          return;
        }

        state.goalItems.unshift(normalizeGoalItem(result.data));
        writeGoalFallbackItems(getUserId(), state.goalItems);
        renderGoalItems();
        state.goalsForm.reset();
        resetGoalFormMode();
        setGoalsStatus("Goal added.", "success");
      })
      .catch(function (error) {
        setGoalsStatus(error && error.message ? error.message : "Failed to save goal.", "error");
      });
  }

  function onGoalListClick(event) {
    var editBtn = event.target && event.target.closest("[data-goal-edit]");
    if (editBtn) {
      var editGoalId = String(editBtn.getAttribute("data-goal-edit") || "").trim();
      if (editGoalId) {
        beginGoalEdit(editGoalId);
      }
      return;
    }

    var deleteBtn = event.target && event.target.closest("[data-goal-delete]");
    if (!deleteBtn) {
      return;
    }

    var goalId = String(deleteBtn.getAttribute("data-goal-delete") || "").trim();
    if (!goalId) {
      return;
    }

    deleteGoalItem(goalId);
  }

  function beginGoalEdit(goalId) {
    if (!state.goalsForm) {
      return;
    }

    var goal = (state.goalItems || []).find(function (item) {
      return String(item && item.id || "") === String(goalId || "");
    });

    if (!goal) {
      setGoalsStatus("Goal not found.", "error");
      return;
    }

    state.editingGoalId = String(goal.id || "");
    setGoalFormValues(goal);

    if (state.submitButton) {
      state.submitButton.textContent = "Update Goal";
    }

    if (state.cancelEditButton) {
      state.cancelEditButton.hidden = false;
    }

    setGoalsStatus("Editing goal. Update fields and save.", "info");
    state.goalsForm.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setGoalFormValues(goal) {
    if (!state.goalsForm || !goal) {
      return;
    }

    var goalTypeEl = state.goalsForm.querySelector("[data-goal-type]");
    var goalDateEl = state.goalsForm.querySelector("[data-goal-target-date]");
    var goalTitleEl = state.goalsForm.querySelector("[data-goal-title]");
    var goalDetailsEl = state.goalsForm.querySelector("[data-goal-details]");

    if (goalTypeEl) {
      goalTypeEl.value = String(goal.goal_type || "goal") || "goal";
    }
    if (goalDateEl) {
      goalDateEl.value = String(goal.target_date || "");
    }
    if (goalTitleEl) {
      goalTitleEl.value = String(goal.title || "");
    }
    if (goalDetailsEl) {
      goalDetailsEl.value = String(goal.details || "");
    }
  }

  function resetGoalFormMode() {
    state.editingGoalId = null;

    if (state.submitButton) {
      state.submitButton.textContent = "Add Goal";
    }

    if (state.cancelEditButton) {
      state.cancelEditButton.hidden = true;
    }
  }

  function updateGoalItem(goalId, payload) {
    if (!state.client) {
      return;
    }

    setGoalsStatus("Updating goal...", "info");

    state.client
      .from("athlete_goals_events")
      .update({
        title: payload.title,
        goal_type: payload.goal_type,
        target_date: payload.target_date,
        details: payload.details,
        updated_at: new Date().toISOString()
      })
      .eq("id", goalId)
      .eq("user_id", getUserId())
      .select("id,user_id,title,goal_type,target_date,details,status,created_at,updated_at")
      .single()
      .then(function (result) {
        if (result.error) {
          if (isMissingGoalTableError(result.error)) {
            state.goalItems = state.goalItems.map(function (item) {
              if (item.id !== goalId) {
                return item;
              }

              return normalizeGoalItem(Object.assign({}, item, {
                title: payload.title,
                goal_type: payload.goal_type,
                target_date: payload.target_date || "",
                details: payload.details || "",
                updated_at: new Date().toISOString()
              }));
            });

            writeGoalFallbackItems(getUserId(), state.goalItems);
            renderGoalItems();
            state.goalsForm.reset();
            resetGoalFormMode();
            setGoalsStatus("Updated in this browser only.", "error");
            return;
          }

          setGoalsStatus(result.error.message, "error");
          return;
        }

        state.goalItems = state.goalItems.map(function (item) {
          if (item.id !== goalId) {
            return item;
          }
          return normalizeGoalItem(result.data);
        });

        writeGoalFallbackItems(getUserId(), state.goalItems);
        renderGoalItems();
        state.goalsForm.reset();
        resetGoalFormMode();
        setGoalsStatus("Goal updated.", "success");
      })
      .catch(function (error) {
        setGoalsStatus(error && error.message ? error.message : "Failed to update goal.", "error");
      });
  }

  function onGoalListChange(event) {
    var statusToggle = event.target && event.target.closest("[data-goal-complete]");
    if (!statusToggle) {
      return;
    }

    var goalId = String(statusToggle.getAttribute("data-goal-complete") || "").trim();
    if (!goalId) {
      return;
    }

    updateGoalStatus(goalId, statusToggle.checked ? "completed" : "active");
  }

  function updateGoalStatus(goalId, status) {
    if (!state.client) {
      return;
    }

    setGoalsStatus("Updating goal...", "info");

    state.client
      .from("athlete_goals_events")
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq("id", goalId)
      .eq("user_id", getUserId())
      .then(function (result) {
        if (result.error) {
          if (isMissingGoalTableError(result.error)) {
            state.goalItems = state.goalItems.map(function (item) {
              if (item.id !== goalId) {
                return item;
              }
              var copy = Object.assign({}, item);
              copy.status = status;
              copy.updated_at = new Date().toISOString();
              return copy;
            });
            writeGoalFallbackItems(getUserId(), state.goalItems);
            renderGoalItems();
            setGoalsStatus("Updated in this browser only.", "error");
            return;
          }

          setGoalsStatus(result.error.message, "error");
          return;
        }

        state.goalItems = state.goalItems.map(function (item) {
          if (item.id !== goalId) {
            return item;
          }
          var copy = Object.assign({}, item);
          copy.status = status;
          copy.updated_at = new Date().toISOString();
          return copy;
        });
        writeGoalFallbackItems(getUserId(), state.goalItems);
        renderGoalItems();
        setGoalsStatus("Goal updated.", "success");
      })
      .catch(function (error) {
        setGoalsStatus(error && error.message ? error.message : "Failed to update goal.", "error");
      });
  }

  function deleteGoalItem(goalId) {
    if (!state.client) {
      return;
    }

    setGoalsStatus("Deleting goal...", "info");

    state.client
      .from("athlete_goals_events")
      .delete()
      .eq("id", goalId)
      .eq("user_id", getUserId())
      .then(function (result) {
        if (result.error) {
          if (isMissingGoalTableError(result.error)) {
            state.goalItems = state.goalItems.filter(function (item) {
              return item.id !== goalId;
            });

            if (state.editingGoalId && state.editingGoalId === goalId) {
              state.goalsForm.reset();
              resetGoalFormMode();
            }

            writeGoalFallbackItems(getUserId(), state.goalItems);
            renderGoalItems();
            setGoalsStatus("Deleted in this browser only.", "error");
            return;
          }

          setGoalsStatus(result.error.message, "error");
          return;
        }

        state.goalItems = state.goalItems.filter(function (item) {
          return item.id !== goalId;
        });

        if (state.editingGoalId && state.editingGoalId === goalId) {
          state.goalsForm.reset();
          resetGoalFormMode();
        }

        writeGoalFallbackItems(getUserId(), state.goalItems);
        renderGoalItems();
        setGoalsStatus("Goal removed.", "success");
      })
      .catch(function (error) {
        setGoalsStatus(error && error.message ? error.message : "Failed to delete goal.", "error");
      });
  }

  function renderGoalItems() {
    if (!state.goalsList || !state.goalsCountdown) {
      return;
    }

    var items = (state.goalItems || [])
      .slice()
      .sort(function (a, b) {
        var aCompleted = String(a.status || "active") === "completed" ? 1 : 0;
        var bCompleted = String(b.status || "active") === "completed" ? 1 : 0;
        if (aCompleted !== bCompleted) {
          return aCompleted - bCompleted;
        }

        var aDate = a.target_date || "9999-12-31";
        var bDate = b.target_date || "9999-12-31";
        if (aDate !== bDate) {
          return aDate.localeCompare(bDate);
        }
        return String(b.created_at || "").localeCompare(String(a.created_at || ""));
      });

    renderGoalCountdown(items);

    if (!items.length) {
      state.goalsList.innerHTML = '<p class="profile-loading">No goals added yet.</p>';
      return;
    }

    state.goalsList.innerHTML = items
      .map(function (item) {
        var isCompleted = String(item.status || "active") === "completed";
        var daysUntil = getDaysUntilDate(item.target_date);
        var countdown = "";

        if (typeof daysUntil === "number") {
          if (daysUntil > 0) {
            countdown = daysUntil + " days away";
          } else if (daysUntil === 0) {
            countdown = "Today";
          } else {
            countdown = Math.abs(daysUntil) + " days ago";
          }
        }

        return (
          '<article class="profile-goal-item ' + (isCompleted ? 'is-completed' : '') + '">' +
            '<div class="profile-goal-main">' +
              '<div class="profile-goal-top">' +
                '<span class="profile-goal-type">' + escapeHtml(getGoalTypeLabel(item.goal_type)) + '</span>' +
                '<span class="profile-goal-status-chip ' + (isCompleted ? 'is-completed' : 'is-active') + '">' + (isCompleted ? 'Completed' : 'Active') + '</span>' +
                (item.target_date ? '<span class="profile-goal-date">' + escapeHtml(formatGoalDate(item.target_date)) + '</span>' : '<span class="profile-goal-date is-empty">No target date</span>') +
              '</div>' +
              '<h3>' + escapeHtml(item.title || 'Untitled goal') + '</h3>' +
              (item.details ? '<p class="profile-goal-details">' + escapeHtml(item.details) + '</p>' : '') +
              (countdown ? '<p class="profile-goal-countdown-inline">' + escapeHtml(countdown) + '</p>' : '') +
            '</div>' +
            '<div class="profile-goal-actions">' +
              '<label class="profile-goal-check"><input type="checkbox" data-goal-complete="' + escapeAttribute(item.id) + '" ' + (isCompleted ? 'checked' : '') + ' /><span>Completed</span></label>' +
              '<button type="button" class="btn profile-btn-cancel" data-goal-edit="' + escapeAttribute(item.id) + '">Edit</button>' +
              '<button type="button" class="btn profile-btn-delete" data-goal-delete="' + escapeAttribute(item.id) + '">Delete</button>' +
            '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  function renderGoalCountdown(items) {
    var activeUpcoming = (items || []).filter(function (item) {
      if (String(item.status || "active") === "completed") {
        return false;
      }
      return !!item.target_date;
    }).sort(function (a, b) {
      return String(a.target_date || "").localeCompare(String(b.target_date || ""));
    });

    if (!activeUpcoming.length) {
      state.goalsCountdown.innerHTML =
        '<div class="profile-goals-countdown-card is-empty"><p class="profile-goals-countdown-label">Next Countdown</p><strong>Add a dated event to start your countdown</strong></div>';
      return;
    }

    var nextItem = activeUpcoming[0];
    var daysUntil = getDaysUntilDate(nextItem.target_date);
    var countdownText;
    if (typeof daysUntil !== "number") {
      countdownText = "Date unavailable";
    } else if (daysUntil > 0) {
      countdownText = daysUntil + " days";
    } else if (daysUntil === 0) {
      countdownText = "Today";
    } else {
      countdownText = Math.abs(daysUntil) + " days ago";
    }

    state.goalsCountdown.innerHTML =
      '<div class="profile-goals-countdown-card">' +
        '<p class="profile-goals-countdown-label">Next ' + escapeHtml(getGoalTypeLabel(nextItem.goal_type)) + '</p>' +
        '<strong>' + escapeHtml(nextItem.title || 'Upcoming event') + '</strong>' +
        '<p class="profile-goals-countdown-meta">' + escapeHtml(formatGoalDate(nextItem.target_date)) + ' • ' + escapeHtml(countdownText) + '</p>' +
      '</div>';
  }

  function normalizeGoalItem(item) {
    return {
      id: String(item && item.id || ""),
      user_id: String(item && item.user_id || getUserId() || ""),
      title: String(item && item.title || "").trim(),
      goal_type: String(item && item.goal_type || "goal").trim() || "goal",
      target_date: item && item.target_date ? String(item.target_date) : "",
      details: String(item && item.details || "").trim(),
      status: String(item && item.status || "active").trim() || "active",
      created_at: item && item.created_at ? String(item.created_at) : new Date().toISOString(),
      updated_at: item && item.updated_at ? String(item.updated_at) : new Date().toISOString()
    };
  }

  function getGoalTypeLabel(goalType) {
    var value = String(goalType || "goal").toLowerCase();
    if (value === "specific_goal") return "Specific Goal";
    if (value === "race") return "Race";
    if (value === "event") return "Event";
    if (value === "trip") return "Trip";
    if (value === "milestone") return "Milestone";
    return "General Goal";
  }

  function isGoalTypeDateRequired(goalType) {
    var value = String(goalType || "").toLowerCase();
    return value === "race" || value === "event" || value === "trip" || value === "milestone";
  }

  function getDaysUntilDate(dateKey) {
    if (!dateKey) {
      return null;
    }

    var target = new Date(String(dateKey) + "T00:00:00");
    if (Number.isNaN(target.getTime())) {
      return null;
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function formatGoalDate(dateKey) {
    if (!dateKey) {
      return "No target date";
    }

    try {
      var date = new Date(String(dateKey) + "T00:00:00");
      if (Number.isNaN(date.getTime())) {
        return dateKey;
      }

      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return dateKey;
    }
  }

  function getUserId() {
    return state.user && state.user.id ? state.user.id : null;
  }

  function setGoalsStatus(message, variant) {
    if (!state.goalsStatus) {
      return;
    }

    state.goalsStatus.textContent = message || "";
    state.goalsStatus.classList.remove("is-error", "is-success", "is-info");

    if (!message) {
      return;
    }

    if (variant === "error") {
      state.goalsStatus.classList.add("is-error");
    } else if (variant === "success") {
      state.goalsStatus.classList.add("is-success");
    } else {
      state.goalsStatus.classList.add("is-info");
    }
  }

  function readGoalFallbackItems(userId) {
    var map = readGoalFallbackMap();
    var key = String(userId || "");
    var rows = map[key];
    if (!Array.isArray(rows)) {
      return [];
    }

    return rows.map(normalizeGoalItem);
  }

  function writeGoalFallbackItems(userId, rows) {
    var key = String(userId || "");
    if (!key) {
      return;
    }

    var map = readGoalFallbackMap();
    map[key] = Array.isArray(rows) ? rows.map(normalizeGoalItem) : [];

    try {
      window.localStorage.setItem(GOALS_FALLBACK_KEY, JSON.stringify(map));
    } catch (e) {
      // localStorage may be unavailable.
    }
  }

  function readGoalFallbackMap() {
    try {
      var raw = window.localStorage.getItem(GOALS_FALLBACK_KEY);
      if (!raw) {
        return {};
      }

      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function isMissingGoalTableError(error) {
    var code = String(error && error.code || "");
    var msg = String(error && error.message || "").toLowerCase();
    return code === "42P01" || code === "PGRST204" || msg.indexOf("does not exist") > -1 || msg.indexOf("schema cache") > -1;
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
