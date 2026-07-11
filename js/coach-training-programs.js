(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_LIBRARY_KEY = "nomadic_training_program_templates_v1";
  var TEMPLATE_MARKER = "__NOMADIC_TEMPLATE__";

  var state = {
    client: null,
    user: null,
    guardEl: null,
    contentEl: null,
    templates: [],
    athletes: [],
    assignmentTemplateId: null,
    filter: "active"
  };

  document.addEventListener("DOMContentLoaded", function () {
    init();
  });

  function init() {
    state.guardEl = document.querySelector("[data-programs-guard]");
    state.contentEl = document.querySelector("[data-programs-content]");

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
      loadTemplates();
      loadAthletes();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectHome();
      }
    });
  }

  function bindEvents() {
    var createBtn = document.querySelector("[data-programs-create]");
    if (createBtn) {
      createBtn.addEventListener("click", function () {
        window.location.href = "training-program-example.html?builder=1";
      });
    }

    var filters = document.querySelector("[data-programs-filters]");
    if (filters) {
      filters.addEventListener("click", function (event) {
        var filterBtn = event.target.closest("[data-programs-filter]");
        if (!filterBtn) {
          return;
        }

        state.filter = filterBtn.getAttribute("data-programs-filter") || "active";
        Array.prototype.slice
          .call(filters.querySelectorAll("[data-programs-filter]"))
          .forEach(function (btn) {
            btn.classList.remove("active");
          });
        filterBtn.classList.add("active");
        renderTemplates();
      });
    }

    var list = document.querySelector("[data-programs-list]");
    if (list) {
      list.addEventListener("click", function (event) {
        var actionTarget = event.target.closest("[data-program-action]");
        if (!actionTarget) {
          return;
        }

        var action = actionTarget.getAttribute("data-program-action");
        var templateId = actionTarget.getAttribute("data-program-id");
        if (!templateId) {
          return;
        }

        if (action === "edit") {
          if (String(templateId).indexOf("preset:") === 0) {
            var presetKey = String(templateId).slice("preset:".length);
            window.location.href =
              "training-program-example.html?builder=1&preset=" + encodeURIComponent(presetKey);
            return;
          }
          window.location.href =
            "training-program-example.html?builder=1&templateId=" + encodeURIComponent(templateId);
          return;
        }

        if (action === "assign") {
          onAssignTemplate(templateId);
          return;
        }

        if (action === "duplicate") {
          onDuplicateTemplate(templateId);
          return;
        }

        if (action === "archive") {
          onToggleArchive(templateId);
          return;
        }

        if (action === "delete") {
          onDeleteTemplate(templateId);
        }
      });
    }

    var closeAssignBtns = document.querySelectorAll("[data-programs-assign-close]");
    closeAssignBtns.forEach(function (btn) {
      btn.addEventListener("click", closeAssignModal);
    });

    var assignSearch = document.querySelector("[data-programs-assign-search]");
    if (assignSearch) {
      assignSearch.addEventListener("input", function () {
        renderAssignAthleteList(assignSearch.value || "");
      });
    }

    var selectAllBtn = document.querySelector("[data-programs-assign-select-all]");
    if (selectAllBtn) {
      selectAllBtn.addEventListener("click", function () {
        var list = document.querySelector("[data-programs-assign-list]");
        if (!list) return;
        list.querySelectorAll("[data-programs-assign-athlete]").forEach(function (checkbox) {
          checkbox.checked = true;
        });
      });
    }

    var clearAllBtn = document.querySelector("[data-programs-assign-clear-all]");
    if (clearAllBtn) {
      clearAllBtn.addEventListener("click", function () {
        var list = document.querySelector("[data-programs-assign-list]");
        if (!list) return;
        list.querySelectorAll("[data-programs-assign-athlete]").forEach(function (checkbox) {
          checkbox.checked = false;
        });
      });
    }

    var assignSubmitBtn = document.querySelector("[data-programs-assign-submit]");
    if (assignSubmitBtn) {
      assignSubmitBtn.addEventListener("click", onConfirmAssignTemplate);
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeAssignModal();
      }
    });
  }

  function loadAthletes() {
    if (!state.client) {
      state.athletes = [];
      return;
    }

    state.client
      .from("admin_all_users")
      .select("user_id,email,name,sport")
      .order("user_created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.athletes = result.data || [];
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load athletes.", "error");
      });
  }

  function loadTemplates() {
    if (!state.client) {
      state.templates = readTemplateLibrary();
      renderTemplates();
      return;
    }

    state.client
      .from("training_programs")
      .select("id,name,description,created_at,updated_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            state.templates = readTemplateLibrary();
            renderTemplates();
            setStatus("Using local templates until Supabase training_programs is available.", "info");
            return;
          }

          setStatus(result.error.message, "error");
          return;
        }

        state.templates = (result.data || [])
          .map(parseTemplateRow)
          .filter(function (template) {
            return !!template;
          })
          .sort(function (a, b) {
            var aDate = new Date(a.updated_at || a.created_at || 0).getTime();
            var bDate = new Date(b.updated_at || b.created_at || 0).getTime();
            return bDate - aDate;
          });

        renderTemplates();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load templates.", "error");
      });
  }

  function renderTemplates() {
    var list = document.querySelector("[data-programs-list]");
    if (!list) {
      return;
    }

    var visible = state.templates.filter(function (template) {
      if (state.filter === "all") {
        return true;
      }
      if (state.filter === "archived") {
        return !!template.archived;
      }
      return !template.archived;
    });

    if (!visible.length) {
      list.innerHTML = '<p class="admin-loading">No templates in this view yet.</p>';
      return;
    }

    var starterCards = state.filter === "archived" ? "" : renderBuiltInStarterTemplates();

    list.innerHTML = starterCards + visible
      .map(function (template) {
        var archiveLabel = template.archived ? "Unarchive" : "Archive";
        var metaSummary = buildProgramMetaSummary(template);
        return (
          '<article class="admin-program-item">' +
          '<div class="admin-program-item-main">' +
          '<h3>' + escapeHtml(template.name || "Untitled Template") + '</h3>' +
          '<p>Last updated: ' + escapeHtml(formatDate(template.updated_at || template.created_at)) +
          (template.archived ? " · Archived" : "") +
          '</p>' +
          (metaSummary ? '<p>' + escapeHtml(metaSummary) + '</p>' : '') +
          '</div>' +
          '<div class="admin-program-item-actions">' +
          '<button type="button" class="btn admin-btn-small" data-program-action="edit" data-program-id="' + escapeAttribute(template.id) + '">Edit</button>' +
          '<button type="button" class="btn admin-btn-small" data-program-action="assign" data-program-id="' + escapeAttribute(template.id) + '">Assign</button>' +
          '<button type="button" class="btn admin-btn-small" data-program-action="duplicate" data-program-id="' + escapeAttribute(template.id) + '">Duplicate</button>' +
          '<button type="button" class="btn admin-btn-archive-mini" data-program-action="archive" data-program-id="' + escapeAttribute(template.id) + '">' + archiveLabel + '</button>' +
          '<button type="button" class="btn admin-btn-delete-mini" data-program-action="delete" data-program-id="' + escapeAttribute(template.id) + '">Delete</button>' +
          '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  function renderBuiltInStarterTemplates() {
    return [
      '<article class="admin-program-item">',
      '<div class="admin-program-item-main">',
      '<h3>12-Week Climbing Performance Starter</h3>',
      '<p>Built-in starter template for testing the full program builder, overview, calendar, and scheduling workflow.</p>',
      '<p>12 weeks · 4 workouts/week · climbing strength, hangboarding, intervals, EMOM, AMRAP</p>',
      '</div>',
      '<div class="admin-program-item-actions">',
      '<button type="button" class="btn admin-btn-small" data-program-action="edit" data-program-id="preset:climbing-12-week">Use Starter</button>',
      '</div>',
      '</article>'
    ].join('');
  }

  function onAssignTemplate(templateId) {
    if (!templateId) {
      return;
    }

    var template = getTemplateById(templateId);
    if (!template || !state.client) {
      setStatus("Template not found.", "error");
      return;
    }

    if (!state.athletes.length) {
      setStatus("Load athletes before assigning templates.", "error");
      return;
    }

    state.assignmentTemplateId = templateId;

    var titleEl = document.querySelector("[data-programs-assign-template-name]");
    if (titleEl) {
      titleEl.textContent = "Assign: " + (template.name || "Template");
    }

    var searchInput = document.querySelector("[data-programs-assign-search]");
    if (searchInput) {
      searchInput.value = "";
    }

    var startDateInput = document.querySelector("[data-programs-assign-start-date]");
    if (startDateInput) {
      startDateInput.value = toDateInputValue(new Date());
    }

    var weekdayInputs = document.querySelectorAll("[data-programs-assign-weekday]");
    weekdayInputs.forEach(function (input) {
      var value = parseInt(String(input.value || ""), 10);
      input.checked = value === 1 || value === 2 || value === 3;
    });

    setAssignStatus("", "info");
    renderAssignAthleteList("");
    showAssignModal();
  }

  function renderAssignAthleteList(searchTerm) {
    var list = document.querySelector("[data-programs-assign-list]");
    if (!list) {
      return;
    }

    var query = String(searchTerm || "").trim().toLowerCase();
    var filtered = state.athletes.filter(function (athlete) {
      if (!query) {
        return true;
      }

      var email = String(athlete.email || "").toLowerCase();
      var name = String(athlete.name || "").toLowerCase();
      var sport = String(athlete.sport || "").toLowerCase();
      return email.indexOf(query) > -1 || name.indexOf(query) > -1 || sport.indexOf(query) > -1;
    });

    if (!filtered.length) {
      list.innerHTML = '<p class="admin-loading">No athletes match this search.</p>';
      return;
    }

    list.innerHTML = filtered
      .map(function (athlete) {
        return (
          '<label class="admin-assign-item">' +
          '<input type="checkbox" data-programs-assign-athlete data-athlete-id="' + escapeAttribute(athlete.user_id || "") + '" />' +
          '<span class="admin-assign-item-main">' +
          '<strong>' + escapeHtml(athlete.name || athlete.email || "Athlete") + '</strong>' +
          '<small>' + escapeHtml(athlete.email || "") + (athlete.sport ? " • " + escapeHtml(athlete.sport) : "") + '</small>' +
          '</span>' +
          '</label>'
        );
      })
      .join("");
  }

  function onConfirmAssignTemplate() {
    var template = getTemplateById(state.assignmentTemplateId);
    if (!template || !state.client) {
      setAssignStatus("Template not found.", "error");
      return;
    }

    var list = document.querySelector("[data-programs-assign-list]");
    if (!list) {
      return;
    }

    var selectedIds = Array.prototype.slice
      .call(list.querySelectorAll("[data-programs-assign-athlete]:checked"))
      .map(function (checkbox) {
        return String(checkbox.getAttribute("data-athlete-id") || "").trim();
      })
      .filter(function (id) {
        return !!id;
      });

    if (!selectedIds.length) {
      setAssignStatus("Select at least one athlete.", "error");
      return;
    }

    var startDateInput = document.querySelector("[data-programs-assign-start-date]");
    var startDate = String(startDateInput && startDateInput.value || "").trim();
    if (!isIsoDate(startDate)) {
      setAssignStatus("Choose a valid schedule start date.", "error");
      return;
    }

    var selectedWeekdays = Array.prototype.slice
      .call(document.querySelectorAll("[data-programs-assign-weekday]:checked"))
      .map(function (checkbox) {
        return parseInt(String(checkbox.value || ""), 10);
      })
      .filter(function (day) {
        return Number.isFinite(day) && day >= 0 && day <= 6;
      });

    if (!selectedWeekdays.length) {
      setAssignStatus("Select at least one day of week for scheduling.", "error");
      return;
    }

    var scheduleBlueprint = buildTemplateScheduleBlueprint(template);
    if (!scheduleBlueprint.length) {
      setAssignStatus("This template has no workout days to schedule.", "error");
      return;
    }

    var now = new Date().toISOString();
    var rows = selectedIds.map(function (userId) {
      return {
        user_id: userId,
        program_id: template.id,
        program_name: template.name,
        is_active: true,
        assigned_at: now,
        assigned_by: state.user ? state.user.id : null
      };
    });

    setAssignStatus("Assigning template to " + selectedIds.length + " athlete(s)...", "info");

    state.client
      .from("user_training_programs")
      .insert(rows)
      .select("id,user_id,program_id")
      .then(function (insertResult) {
        if (insertResult.error) {
          setAssignStatus(insertResult.error.message, "error");
          return;
        }

        var insertedAssignments = insertResult.data || [];
        if (!insertedAssignments.length) {
          setAssignStatus("Template assignment completed, but no assignment rows returned.", "info");
          setStatus("Assigned '" + (template.name || "Template") + "' to " + selectedIds.length + " athlete(s).", "success");
          setTimeout(function () {
            closeAssignModal();
          }, 900);
          return;
        }

        var scheduleRows = [];
        insertedAssignments.forEach(function (assignment) {
          var userId = String(assignment && assignment.user_id || "").trim();
          var assignmentId = String(assignment && assignment.id || "").trim();
          var programId = String(assignment && assignment.program_id || "").trim();
          if (!userId || !assignmentId) {
            return;
          }

          var scheduledDates = generateScheduledDates(startDate, scheduleBlueprint.length, selectedWeekdays);
          scheduleBlueprint.forEach(function (slotEntry, index) {
            var scheduledDate = scheduledDates[index];
            if (!scheduledDate) {
              return;
            }

            scheduleRows.push({
              athlete_user_id: userId,
              user_training_program_id: assignmentId,
              program_id: programId || null,
              slot_key: slotEntry.slot_key,
              session_label: slotEntry.session_label,
              scheduled_for: scheduledDate,
              status: "scheduled",
              scheduled_by: state.user ? state.user.id : null
            });
          });
        });

        if (!scheduleRows.length) {
          setAssignStatus("Assigned template, but no schedule rows were generated.", "info");
          setStatus("Assigned '" + (template.name || "Template") + "' to " + selectedIds.length + " athlete(s).", "success");
          setTimeout(function () {
            closeAssignModal();
          }, 900);
          return;
        }

        state.client
          .from("athlete_program_schedule")
          .insert(scheduleRows)
          .then(function (scheduleResult) {
            if (scheduleResult.error) {
              setAssignStatus(
                "Assigned template, but calendar schedule could not be saved: " + scheduleResult.error.message,
                "error"
              );
              setStatus(
                "Template assigned. Schedule table may be missing; run the athlete calendar SQL migration.",
                "info"
              );
              return;
            }

            setAssignStatus(
              "Assigned template and scheduled " + scheduleRows.length + " workout date(s).",
              "success"
            );
            setStatus(
              "Assigned '" + (template.name || "Template") + "' and created athlete workout calendar entries.",
              "success"
            );
            setTimeout(function () {
              closeAssignModal();
            }, 900);
          })
          .catch(function (error) {
            setAssignStatus(
              error && error.message
                ? "Assigned template, but schedule save failed: " + error.message
                : "Assigned template, but schedule save failed.",
              "error"
            );
          });
      })
      .catch(function (error) {
        setAssignStatus(error && error.message ? error.message : "Failed to assign template.", "error");
      });
  }

  function buildTemplateScheduleBlueprint(template) {
    var slotKeys = getOrderedTemplateSlotKeys(template);
    return slotKeys.map(function (slotKey) {
      return {
        slot_key: slotKey,
        session_label: resolveTemplateSlotLabel(template, slotKey)
      };
    });
  }

  function getOrderedTemplateSlotKeys(template) {
    var days = template && template.days ? template.days : {};
    var keys = Object.keys(days || {}).filter(function (key) {
      return /^w\d+d\d+$/i.test(String(key || ""));
    });

    return keys.sort(function (a, b) {
      var parsedA = parseTemplateSlotKey(a);
      var parsedB = parseTemplateSlotKey(b);
      if (!parsedA || !parsedB) {
        return String(a || "").localeCompare(String(b || ""));
      }

      if (parsedA.week !== parsedB.week) {
        return parsedA.week - parsedB.week;
      }

      return parsedA.workout - parsedB.workout;
    });
  }

  function parseTemplateSlotKey(slotKey) {
    var match = /^w(\d+)d(\d+)$/i.exec(String(slotKey || ""));
    if (!match) {
      return null;
    }

    return {
      week: parseInt(match[1], 10),
      workout: parseInt(match[2], 10)
    };
  }

  function resolveTemplateSlotLabel(template, slotKey) {
    var customNames = template && template.custom_day_names && typeof template.custom_day_names === "object"
      ? template.custom_day_names
      : {};

    if (customNames[slotKey]) {
      return String(customNames[slotKey]);
    }

    var parsed = parseTemplateSlotKey(slotKey);
    if (!parsed) {
      return "Workout";
    }

    return "Week " + parsed.week + " - Workout " + parsed.workout;
  }

  function generateScheduledDates(startDate, totalSessions, weekdays) {
    var results = [];
    var allowedDays = (Array.isArray(weekdays) ? weekdays : [])
      .filter(function (day) {
        return Number.isFinite(day) && day >= 0 && day <= 6;
      })
      .sort();

    if (!allowedDays.length || !isIsoDate(startDate)) {
      return results;
    }

    var cursor = new Date(startDate + "T00:00:00");
    var safety = 0;

    while (results.length < totalSessions && safety < 730) {
      if (allowedDays.indexOf(cursor.getDay()) >= 0) {
        results.push(toDateInputValue(cursor));
      }

      cursor.setDate(cursor.getDate() + 1);
      safety++;
    }

    return results;
  }

  function isIsoDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  }

  function toDateInputValue(date) {
    var d = date instanceof Date ? date : new Date(date);
    if (!d || isNaN(d.getTime())) {
      return "";
    }

    var year = d.getFullYear();
    var month = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function showAssignModal() {
    var modal = document.querySelector("[data-programs-assign-modal]");
    if (modal) {
      modal.hidden = false;
      document.body.classList.add("admin-modal-open");
    }
  }

  function closeAssignModal() {
    var modal = document.querySelector("[data-programs-assign-modal]");
    if (modal) {
      modal.hidden = true;
      document.body.classList.remove("admin-modal-open");
    }

    state.assignmentTemplateId = null;
    setAssignStatus("", "info");
  }

  function setAssignStatus(message, variant) {
    var statusEl = document.querySelector("[data-programs-assign-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
    }
  }

  function onDuplicateTemplate(templateId) {
    var template = getTemplateById(templateId);
    if (!template || !state.client) {
      setStatus("Template not found.", "error");
      return;
    }

    var payload = {
      archived: false,
      focus: template.focus || "strength",
      program_meta: template.program_meta || {},
      program_phases: template.program_phases || [],
      weekly_structure: template.weekly_structure || [],
      day_session_types: template.day_session_types || {},
      custom_day_name_mode: template.custom_day_name_mode || "legacy-suffix",
      structure: template.structure || { weeks: 1, workoutsPerWeek: 3 },
      session_plans: template.session_plans || {},
      days: template.days || { "day-1": [], "day-2": [], "day-3": [] }
    };

    state.client
      .from("training_programs")
      .insert({
        name: (template.name || "Template") + " (Copy)",
        description: serializeTemplatePayload(payload)
      })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Template duplicated.", "success");
        loadTemplates();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to duplicate template.", "error");
      });
  }

  function onToggleArchive(templateId) {
    var template = getTemplateById(templateId);
    if (!template || !state.client) {
      setStatus("Template not found.", "error");
      return;
    }

    var payload = {
      archived: !template.archived,
      structure: template.structure || { weeks: 1, workoutsPerWeek: 3 },
      days: template.days || { "day-1": [], "day-2": [], "day-3": [] }
    };

    state.client
      .from("training_programs")
      .update({ description: serializeTemplatePayload(payload) })
      .eq("id", template.id)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus(template.archived ? "Template unarchived." : "Template archived.", "info");
        loadTemplates();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to update template.", "error");
      });
  }

  function onDeleteTemplate(templateId) {
    var template = getTemplateById(templateId);
    if (!template || !state.client) {
      setStatus("Template not found.", "error");
      return;
    }

    if (!confirm("Delete " + (template.name || "this template") + "?")) {
      return;
    }

    setStatus("Removing template from active athlete programs...", "info");

    state.client
      .from("user_training_programs")
      .update({ is_active: false })
      .eq("program_id", templateId)
      .eq("is_active", true)
      .then(function (deactivateResult) {
        if (deactivateResult.error) {
          setStatus(deactivateResult.error.message, "error");
          return;
        }

        state.client
          .from("training_programs")
          .delete()
          .eq("id", templateId)
          .then(function (result) {
            if (result.error) {
              setStatus(result.error.message, "error");
              return;
            }

            setStatus("Template deleted and removed from active athlete programs.", "success");
            loadTemplates();
          })
          .catch(function (error) {
            setStatus(error && error.message ? error.message : "Failed to delete template.", "error");
          });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to remove template from athletes.", "error");
      });
  }

  function getTemplateById(templateId) {
    return state.templates.find(function (item) {
      return item.id === templateId;
    });
  }

  function parseTemplateRow(row) {
    if (!row || !row.id) {
      return null;
    }

    var payload = parseTemplatePayload(row.description);
    if (!payload) {
      return null;
    }

    return {
      id: row.id,
      name: row.name || "Untitled Template",
      created_at: row.created_at,
      updated_at: row.updated_at,
      archived: !!payload.archived,
      focus: payload.focus || "strength",
      program_meta: payload.program_meta || {},
      program_phases: Array.isArray(payload.program_phases) ? payload.program_phases : [],
      weekly_structure: Array.isArray(payload.weekly_structure) ? payload.weekly_structure : [],
      day_session_types: payload.day_session_types || {},
      custom_day_name_mode: payload.custom_day_name_mode || "legacy-suffix",
      structure: payload.structure || { weeks: 1, workoutsPerWeek: 3 },
      session_plans: payload.session_plans || {},
      days: payload.days || { "day-1": [], "day-2": [], "day-3": [] },
      custom_day_names: payload.custom_day_names || {}
    };
  }

  function parseTemplatePayload(description) {
    var value = String(description || "");
    if (value.indexOf(TEMPLATE_MARKER) !== 0) {
      return null;
    }

    try {
      return JSON.parse(value.slice(TEMPLATE_MARKER.length));
    } catch (e) {
      return null;
    }
  }

  function serializeTemplatePayload(payload) {
    var safePayload = {
      archived: !!(payload && payload.archived),
      focus: payload && payload.focus ? payload.focus : "strength",
      program_meta: payload && payload.program_meta ? payload.program_meta : {},
      program_phases: payload && payload.program_phases ? payload.program_phases : [],
      weekly_structure: payload && payload.weekly_structure ? payload.weekly_structure : [],
      day_session_types: payload && payload.day_session_types ? payload.day_session_types : {},
      custom_day_name_mode: payload && payload.custom_day_name_mode ? payload.custom_day_name_mode : "legacy-suffix",
      structure: payload && payload.structure ? payload.structure : { weeks: 1, workoutsPerWeek: 3 },
      session_plans: payload && payload.session_plans ? payload.session_plans : {},
      days: payload && payload.days ? payload.days : { "day-1": [], "day-2": [], "day-3": [] },
      custom_day_names: payload && payload.custom_day_names ? payload.custom_day_names : {}
    };
    return TEMPLATE_MARKER + JSON.stringify(safePayload);
  }

  function readTemplateLibrary() {
    try {
      var raw = window.localStorage.getItem(TEMPLATE_LIBRARY_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (item) {
        return {
          id: item.id,
          name: item.name || "Untitled Template",
          created_at: item.created_at,
          updated_at: item.updated_at,
          archived: !!item.archived,
          focus: item.focus || "strength",
          program_meta: item.program_meta || {},
          program_phases: item.program_phases || [],
          weekly_structure: item.weekly_structure || [],
          day_session_types: item.day_session_types || {},
          custom_day_name_mode: item.custom_day_name_mode || "legacy-suffix",
          structure: item.structure || { weeks: 1, workoutsPerWeek: 3 },
          session_plans: item.session_plans || {},
          days: item.days || {},
          custom_day_names: item.custom_day_names || {}
        };
      });
    } catch (e) {
      return [];
    }
  }

  function isMissingTableError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return !!(error && error.code === "42P01") || msg.indexOf("does not exist") > -1;
  }

  function buildProgramMetaSummary(template) {
    var meta = template && template.program_meta && typeof template.program_meta === "object"
      ? template.program_meta
      : {};
    var parts = [];
    if (meta.program_type) {
      parts.push(prettyLabel(meta.program_type));
    }
    if (meta.sport_focus) {
      parts.push(String(meta.sport_focus));
    }
    if (template && template.structure && template.structure.weeks) {
      parts.push(String(template.structure.weeks) + " wk");
    }
    if (meta.athlete_level) {
      parts.push(prettyLabel(meta.athlete_level));
    }
    if (Array.isArray(template && template.program_phases) && template.program_phases.length) {
      parts.push(String(template.program_phases.length) + " phases");
    }
    return parts.join(" • ");
  }

  function prettyLabel(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (char) { return char.toUpperCase(); });
  }

  function setStatus(message, variant) {
    var statusEl = document.querySelector("[data-programs-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message || "";
    statusEl.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      statusEl.classList.add("is-error");
    } else if (variant === "success") {
      statusEl.classList.add("is-success");
    } else {
      statusEl.classList.add("is-info");
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

  function formatDate(dateString) {
    try {
      var date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch (e) {
      return dateString || "N/A";
    }
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
