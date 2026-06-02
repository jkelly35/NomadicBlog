(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_MARKER = "__NOMADIC_TEMPLATE__";

  var state = {
    client: null,
    user: null,
    rows: [],
    athletesById: {},
    assignmentsById: {},
    templatesById: {},
    selectedRowIds: {},
    viewMode: "month",
    viewAnchorDate: null,
    activeDropDate: "",
    draggedRowId: "",
    inlineAddDate: "",
    initialScope: {
      templateId: "",
      athleteId: ""
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    if (!window.supabase || !window.supabase.createClient) {
      showGuardError("Supabase client library failed to load.");
      return;
    }

    if (!window.NOMADIC_SUPABASE_URL || !window.NOMADIC_SUPABASE_ANON_KEY) {
      showGuardError("Supabase configuration is incomplete.");
      return;
    }

    state.client = window.supabase.createClient(window.NOMADIC_SUPABASE_URL, window.NOMADIC_SUPABASE_ANON_KEY);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      var user = session && session.user;
      var email = String(user && user.email || "").toLowerCase();

      if (!user || email !== ADMIN_EMAIL) {
        showGuardError("You do not have permission to access calendar editing.");
        return;
      }

      state.user = user;
      state.initialScope = readScopeFromQuery();
      showContent();
      setDefaultFilters();
      bindEvents();
      loadReferenceData().then(function () {
        populateScopeFilterOptions();
        applyInitialScopeFilters();
        loadCalendarRows();
      });
    }).catch(function () {
      showGuardError("Could not verify coach session.");
    });
  }

  function bindEvents() {
    var applyBtn = document.querySelector("[data-schedule-filter-apply]");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        loadCalendarRows();
      });
    }

    var filterInputs = document.querySelectorAll("[data-schedule-filter-start], [data-schedule-filter-end], [data-schedule-filter-athlete], [data-schedule-filter-status], [data-schedule-filter-template-id], [data-schedule-filter-athlete-id]");
    filterInputs.forEach(function (input) {
      input.addEventListener("change", function () {
        loadCalendarRows();
      });
    });

    var viewButtons = document.querySelectorAll("[data-calendar-view]");
    viewButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = String(btn.getAttribute("data-calendar-view") || "").trim();
        if (mode !== "week" && mode !== "month") {
          return;
        }

        state.viewMode = mode;
        syncFilterWindowToCurrentView();
        updateViewButtons();
        loadCalendarRows();
      });
    });

    var navButtons = document.querySelectorAll("[data-calendar-nav]");
    navButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var action = String(btn.getAttribute("data-calendar-nav") || "").trim();
        moveCalendarWindow(action);
      });
    });

    var bulkApplyBtn = document.querySelector("[data-bulk-apply]");
    if (bulkApplyBtn) {
      bulkApplyBtn.addEventListener("click", applyBulkActionToSelected);
    }

    var bulkDeleteBtn = document.querySelector("[data-bulk-delete]");
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener("click", deleteSelectedRows);
    }

    var selectVisibleBtn = document.querySelector("[data-select-visible]");
    if (selectVisibleBtn) {
      selectVisibleBtn.addEventListener("click", selectVisibleRows);
    }

    var clearSelectionBtn = document.querySelector("[data-clear-selection]");
    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener("click", function () {
        state.selectedRowIds = {};
        renderCalendarGrid();
        updateSelectionCount();
      });
    }

    var list = document.querySelector("[data-schedule-list]");
    if (list) {
      list.addEventListener("click", function (event) {
        var saveBtn = event.target && event.target.closest("[data-session-save]");
        if (saveBtn) {
          saveSessionRow(String(saveBtn.getAttribute("data-session-save") || ""));
          return;
        }

        var deleteBtn = event.target && event.target.closest("[data-session-delete]");
        if (deleteBtn) {
          deleteSessionRow(String(deleteBtn.getAttribute("data-session-delete") || ""));
        }
      });
    }

    var grid = document.querySelector("[data-calendar-grid]");
    if (grid) {
      grid.addEventListener("click", function (event) {
        var openAddBtn = event.target && event.target.closest("[data-calendar-add-open]");
        if (openAddBtn) {
          state.inlineAddDate = String(openAddBtn.getAttribute("data-calendar-add-open") || "").trim();
          renderCalendarGrid();
          return;
        }

        var cancelAddBtn = event.target && event.target.closest("[data-calendar-add-cancel]");
        if (cancelAddBtn) {
          state.inlineAddDate = "";
          renderCalendarGrid();
          return;
        }

        var submitAddBtn = event.target && event.target.closest("[data-calendar-add-submit]");
        if (submitAddBtn) {
          var form = submitAddBtn.closest("[data-calendar-add-form]");
          var dateValue = String(submitAddBtn.getAttribute("data-calendar-add-submit") || "").trim();
          addWorkoutFromInlineForm(form, dateValue);
        }
      });

      grid.addEventListener("change", function (event) {
        var checkbox = event.target && event.target.closest("[data-session-select]");
        if (!checkbox) {
          return;
        }

        var rowId = String(checkbox.getAttribute("data-session-select") || "").trim();
        if (!rowId) {
          return;
        }

        if (checkbox.checked) {
          state.selectedRowIds[rowId] = true;
        } else {
          delete state.selectedRowIds[rowId];
        }

        updateSelectionCount();
      });

      grid.addEventListener("dragstart", function (event) {
        var card = event.target && event.target.closest("[data-session-card]");
        if (!card) {
          return;
        }

        var rowId = String(card.getAttribute("data-session-card") || "").trim();
        if (!rowId) {
          return;
        }

        state.draggedRowId = rowId;
        card.classList.add("is-dragging");
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("text/plain", rowId);
        }
      });

      grid.addEventListener("dragend", function () {
        state.draggedRowId = "";
        state.activeDropDate = "";
        renderCalendarGrid();
      });

      grid.addEventListener("dragover", function (event) {
        var dayCell = event.target && event.target.closest("[data-calendar-day]");
        if (!dayCell) {
          return;
        }

        event.preventDefault();
        var isoDate = String(dayCell.getAttribute("data-calendar-day") || "").trim();
        if (isoDate && isoDate !== state.activeDropDate) {
          state.activeDropDate = isoDate;
          renderCalendarGrid();
        }
      });

      grid.addEventListener("dragleave", function (event) {
        var leaving = event.target && event.target.closest("[data-calendar-day]");
        if (!leaving) {
          return;
        }

        var related = event.relatedTarget;
        if (related && leaving.contains(related)) {
          return;
        }

        state.activeDropDate = "";
        renderCalendarGrid();
      });

      grid.addEventListener("drop", function (event) {
        var dayCell = event.target && event.target.closest("[data-calendar-day]");
        if (!dayCell) {
          return;
        }

        event.preventDefault();
        var targetDate = String(dayCell.getAttribute("data-calendar-day") || "").trim();
        if (!isIsoDate(targetDate)) {
          return;
        }

        var draggedRowId = String(state.draggedRowId || "").trim();
        if (!draggedRowId && event.dataTransfer) {
          draggedRowId = String(event.dataTransfer.getData("text/plain") || "").trim();
        }

        if (!draggedRowId) {
          return;
        }

        onCalendarDrop(draggedRowId, targetDate);
      });
    }
  }

  function setDefaultFilters() {
    var start = document.querySelector("[data-schedule-filter-start]");
    var end = document.querySelector("[data-schedule-filter-end]");

    var today = new Date();
    state.viewAnchorDate = new Date(today.getTime());
    if (start) {
      start.value = toDateInputValue(today);
    }

    var plusThirty = new Date(today.getTime());
    plusThirty.setDate(plusThirty.getDate() + 30);
    if (end) {
      end.value = toDateInputValue(plusThirty);
    }

    syncFilterWindowToCurrentView();
    updateViewButtons();
  }

  function loadReferenceData() {
    return Promise.all([
      state.client
        .from("admin_all_users")
        .select("user_id,name,email"),
      state.client
        .from("user_training_programs")
        .select("id,program_name,program_id,user_id"),
      state.client
        .from("training_programs")
        .select("id,name,description")
    ]).then(function (results) {
      var athletesResult = results[0] || {};
      var assignmentsResult = results[1] || {};
      var templatesResult = results[2] || {};

      if (!athletesResult.error) {
        state.athletesById = {};
        (athletesResult.data || []).forEach(function (row) {
          state.athletesById[String(row.user_id || "")] = {
            name: String(row.name || "").trim(),
            email: String(row.email || "").trim()
          };
        });
      }

      if (!assignmentsResult.error) {
        state.assignmentsById = {};
        (assignmentsResult.data || []).forEach(function (row) {
          state.assignmentsById[String(row.id || "")] = {
            program_name: String(row.program_name || "").trim(),
            program_id: String(row.program_id || "").trim(),
            user_id: String(row.user_id || "").trim()
          };
        });
      }

      if (!templatesResult.error) {
        state.templatesById = {};
        (templatesResult.data || []).forEach(function (row) {
          var id = String(row.id || "").trim();
          if (!id) {
            return;
          }

          state.templatesById[id] = {
            name: String(row.name || "").trim(),
            description: String(row.description || ""),
            payload: parseTemplatePayload(row.description)
          };
        });
      }
    }).catch(function () {
      // Reference data is optional; list still works with ids.
    });
  }

  function populateScopeFilterOptions() {
    var athleteSelect = document.querySelector("[data-schedule-filter-athlete-id]");
    if (athleteSelect) {
      var athleteRows = Object.keys(state.athletesById || {}).map(function (id) {
        var athlete = state.athletesById[id] || {};
        var name = String(athlete.name || "").trim();
        var email = String(athlete.email || "").trim();
        return {
          id: id,
          label: name ? (name + (email ? " (" + email + ")" : "")) : (email || "Athlete")
        };
      }).sort(function (a, b) {
        return String(a.label || "").localeCompare(String(b.label || ""));
      });

      athleteSelect.innerHTML =
        '<option value="">All athletes</option>' +
        athleteRows.map(function (row) {
          return '<option value="' + escapeAttribute(row.id) + '">' + escapeHtml(row.label) + '</option>';
        }).join("");
    }

    var templateSelect = document.querySelector("[data-schedule-filter-template-id]");
    if (templateSelect) {
      var templateRows = Object.keys(state.templatesById || {}).map(function (id) {
        var template = state.templatesById[id] || {};
        return {
          id: id,
          label: String(template.name || "Template")
        };
      }).sort(function (a, b) {
        return String(a.label || "").localeCompare(String(b.label || ""));
      });

      templateSelect.innerHTML =
        '<option value="">All templates</option>' +
        templateRows.map(function (row) {
          return '<option value="' + escapeAttribute(row.id) + '">' + escapeHtml(row.label) + '</option>';
        }).join("");
    }
  }

  function applyInitialScopeFilters() {
    var templateId = String(state.initialScope && state.initialScope.templateId || "").trim();
    var athleteId = String(state.initialScope && state.initialScope.athleteId || "").trim();

    if (templateId) {
      ensureSelectValue("[data-schedule-filter-template-id]", templateId, resolveTemplateLabel(templateId));
    }

    if (athleteId) {
      ensureSelectValue("[data-schedule-filter-athlete-id]", athleteId, resolveAthleteLabel(athleteId));
    }
  }

  function loadCalendarRows() {
    var filters = readFilters();
    if (!filters.start || !filters.end) {
      setStatus("Select both start and end dates.", "error");
      return;
    }

    if (filters.end < filters.start) {
      setStatus("End date must be on or after start date.", "error");
      return;
    }

    setStatus("Loading scheduled sessions...", "info");

    var query = state.client
      .from("athlete_program_schedule")
      .select("id,athlete_user_id,user_training_program_id,program_id,slot_key,session_label,scheduled_for,status,notes,updated_at")
      .gte("scheduled_for", filters.start)
      .lte("scheduled_for", filters.end)
      .order("scheduled_for", { ascending: true });

    if (filters.templateId) {
      query = query.eq("program_id", filters.templateId);
    }

    if (filters.athleteId) {
      query = query.eq("athlete_user_id", filters.athleteId);
    }

    query.then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          renderRows([]);
          return;
        }

        var rows = Array.isArray(result.data) ? result.data : [];
        rows = rows.filter(function (row) {
          if (filters.status !== "all" && String(row.status || "") !== filters.status) {
            return false;
          }

          if (filters.templateId && String(row.program_id || "") !== filters.templateId) {
            return false;
          }

          if (filters.athleteId && String(row.athlete_user_id || "") !== filters.athleteId) {
            return false;
          }

          if (!filters.athleteQuery) {
            return true;
          }

          var athlete = state.athletesById[String(row.athlete_user_id || "")] || {};
          var name = String(athlete.name || "").toLowerCase();
          var email = String(athlete.email || "").toLowerCase();
          return name.indexOf(filters.athleteQuery) >= 0 || email.indexOf(filters.athleteQuery) >= 0;
        });

        state.rows = rows;
        keepSelectionInSync(rows);
        renderCalendarGrid();
        renderRows(rows);
        updateSelectionCount();
        setStatus("Loaded " + rows.length + " scheduled session" + (rows.length === 1 ? "" : "s") + ".", "success");
      }).catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not load scheduled sessions.", "error");
        state.rows = [];
        keepSelectionInSync([]);
        renderCalendarGrid();
        updateSelectionCount();
        renderRows([]);
      });
  }

  function readFilters() {
    var start = String((document.querySelector("[data-schedule-filter-start]") || {}).value || "").trim();
    var end = String((document.querySelector("[data-schedule-filter-end]") || {}).value || "").trim();
    var athleteQuery = String((document.querySelector("[data-schedule-filter-athlete]") || {}).value || "").trim().toLowerCase();
    var status = String((document.querySelector("[data-schedule-filter-status]") || {}).value || "all").trim();
    var templateId = String((document.querySelector("[data-schedule-filter-template-id]") || {}).value || "").trim();
    var athleteId = String((document.querySelector("[data-schedule-filter-athlete-id]") || {}).value || "").trim();

    return {
      start: start,
      end: end,
      athleteQuery: athleteQuery,
      status: status || "all",
      templateId: templateId,
      athleteId: athleteId
    };
  }

  function renderRows(rows) {
    var list = document.querySelector("[data-schedule-list]");
    if (!list) {
      return;
    }

    if (!rows.length) {
      list.innerHTML = '<p class="admin-loading">No scheduled sessions match the current filters.</p>';
      return;
    }

    list.innerHTML = rows.map(function (row) {
      var athlete = state.athletesById[String(row.athlete_user_id || "")] || {};
      var assignment = state.assignmentsById[String(row.user_training_program_id || "")] || {};
      var athleteName = String(athlete.name || athlete.email || "Athlete");
      var athleteEmail = String(athlete.email || "");
      var programName = String(assignment.program_name || "Program");
      var slotKey = String(row.slot_key || "");
      var sessionLabel = String(row.session_label || slotKey || "Workout");
      var assignmentId = String(row.user_training_program_id || "");
      var programId = String(row.program_id || assignment.program_id || "");
      var sessionDate = String(row.scheduled_for || "");
      var noteValue = String(row.notes || "");

      var workoutUrl =
        "training-program-example.html?program=" + encodeURIComponent(programName) +
        (programId ? "&templateId=" + encodeURIComponent(programId) : "") +
        (assignmentId ? "&assignmentId=" + encodeURIComponent(assignmentId) : "") +
        "&athleteName=" + encodeURIComponent(athleteName) +
        (slotKey ? "&day=" + encodeURIComponent(slotKey) : "");

      return (
        '<article class="calendar-editor-row" data-session-row="' + escapeAttribute(String(row.id || "")) + '">' +
          '<div class="calendar-editor-row-main">' +
            '<p class="calendar-editor-row-title">' + escapeHtml(sessionLabel) + '</p>' +
            '<p class="calendar-editor-row-meta">' +
              escapeHtml(formatDate(sessionDate)) + ' · ' + escapeHtml(programName) +
              ' · ' + escapeHtml(athleteName) +
              (athleteEmail ? ' (' + escapeHtml(athleteEmail) + ')' : '') +
            '</p>' +
          '</div>' +
          '<div class="calendar-editor-row-controls">' +
            '<label><span>Date</span><input type="date" value="' + escapeAttribute(sessionDate) + '" data-session-date /></label>' +
            '<label><span>Status</span><select data-session-status>' +
              buildStatusOptions(String(row.status || "scheduled")) +
            '</select></label>' +
            '<label><span>Notes</span><input type="text" value="' + escapeAttribute(noteValue) + '" placeholder="Optional note" data-session-notes /></label>' +
          '</div>' +
          '<div class="calendar-editor-row-actions">' +
            '<a class="btn admin-btn-small" href="' + workoutUrl + '">Open Workout</a>' +
            '<button type="button" class="btn admin-btn-primary" data-session-save="' + escapeAttribute(String(row.id || "")) + '">Save</button>' +
            '<button type="button" class="btn admin-btn-delete-mini" data-session-delete="' + escapeAttribute(String(row.id || "")) + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function renderCalendarGrid() {
    var grid = document.querySelector("[data-calendar-grid]");
    if (!grid) {
      return;
    }

    var range = getViewRange();
    renderRangeLabel(range);

    var days = buildCalendarDays(range);
    if (!days.length) {
      grid.innerHTML = '<p class="calendar-grid-empty">No calendar range selected.</p>';
      return;
    }

    var rowsByDate = groupRowsByDate(state.rows || []);
    var weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var headerHtml =
      '<div class="calendar-grid-header">' +
      weekdayNames.map(function (name) {
        return '<div class="calendar-grid-header-cell">' + name.slice(0, 3) + '</div>';
      }).join("") +
      '</div>';

    var body = [];
    for (var i = 0; i < days.length; i += 7) {
      var weekSlice = days.slice(i, i + 7);
      body.push(
        '<div class="calendar-grid-row">' +
        weekSlice.map(function (dayInfo) {
          return renderCalendarDayCell(dayInfo, rowsByDate[String(dayInfo.isoDate || "")] || []);
        }).join("") +
        '</div>'
      );
    }

    grid.innerHTML = headerHtml + body.join("");
  }

  function renderCalendarDayCell(dayInfo, rows) {
    var classNames = ["calendar-grid-day"];
    if (!dayInfo.isInViewMonth && state.viewMode === "month") {
      classNames.push("is-outside");
    }
    if (dayInfo.isToday) {
      classNames.push("is-today");
    }
    if (state.activeDropDate && state.activeDropDate === dayInfo.isoDate) {
      classNames.push("is-drop-target");
    }

    var itemHtml = rows.map(function (row) {
      return renderCalendarSessionCard(row);
    }).join("");

    return (
      '<div class="' + classNames.join(" ") + '" data-calendar-day="' + escapeAttribute(dayInfo.isoDate) + '">' +
        '<p class="calendar-grid-day-label">' +
          '<span>' + escapeHtml(dayInfo.dayLabel) + '</span>' +
          '<span class="calendar-grid-day-count">' + rows.length + '</span>' +
        '</p>' +
        '<div class="calendar-grid-day-actions">' +
          '<button type="button" class="btn admin-btn-small" data-calendar-add-open="' + escapeAttribute(dayInfo.isoDate) + '">+ Add</button>' +
        '</div>' +
        (state.inlineAddDate === dayInfo.isoDate ? buildInlineAddFormHtml(dayInfo.isoDate) : '') +
        '<div class="calendar-grid-day-items">' + itemHtml + '</div>' +
      '</div>'
    );
  }

  function buildInlineAddFormHtml(isoDate) {
    var defaultAthleteId = String((document.querySelector("[data-schedule-filter-athlete-id]") || {}).value || "").trim();
    var defaultTemplateId = String((document.querySelector("[data-schedule-filter-template-id]") || {}).value || "").trim();

    return (
      '<div class="calendar-inline-add" data-calendar-add-form="' + escapeAttribute(isoDate) + '">' +
        '<label><span>Athlete</span><select data-inline-athlete>' + buildAthleteOptionsHtml(defaultAthleteId) + '</select></label>' +
        '<label><span>Template</span><select data-inline-template>' + buildTemplateOptionsHtml(defaultTemplateId) + '</select></label>' +
        '<label><span>Slot</span><input type="text" value="w1d1" data-inline-slot /></label>' +
        '<label><span>Label</span><input type="text" placeholder="Optional" data-inline-label /></label>' +
        '<div class="calendar-inline-add-actions">' +
          '<button type="button" class="btn admin-btn-primary" data-calendar-add-submit="' + escapeAttribute(isoDate) + '">Add</button>' +
          '<button type="button" class="btn admin-btn-refresh" data-calendar-add-cancel="' + escapeAttribute(isoDate) + '">Cancel</button>' +
        '</div>' +
      '</div>'
    );
  }

  function buildAthleteOptionsHtml(selectedId) {
    var rows = Object.keys(state.athletesById || {}).map(function (id) {
      var athlete = state.athletesById[id] || {};
      var name = String(athlete.name || "").trim();
      var email = String(athlete.email || "").trim();
      return {
        id: id,
        label: name ? (name + (email ? " (" + email + ")" : "")) : (email || "Athlete")
      };
    }).sort(function (a, b) {
      return String(a.label || "").localeCompare(String(b.label || ""));
    });

    return '<option value="">Select athlete</option>' + rows.map(function (row) {
      var isSelected = String(row.id || "") === String(selectedId || "");
      return '<option value="' + escapeAttribute(String(row.id || "")) + '"' + (isSelected ? ' selected' : '') + '>' + escapeHtml(String(row.label || "")) + '</option>';
    }).join('');
  }

  function buildTemplateOptionsHtml(selectedId) {
    var rows = Object.keys(state.templatesById || {}).map(function (id) {
      return {
        id: id,
        label: String((state.templatesById[id] || {}).name || "Template")
      };
    }).sort(function (a, b) {
      return String(a.label || "").localeCompare(String(b.label || ""));
    });

    return '<option value="">Select template</option>' + rows.map(function (row) {
      var isSelected = String(row.id || "") === String(selectedId || "");
      return '<option value="' + escapeAttribute(String(row.id || "")) + '"' + (isSelected ? ' selected' : '') + '>' + escapeHtml(String(row.label || "")) + '</option>';
    }).join('');
  }

  function renderCalendarSessionCard(row) {
    var rowId = String(row.id || "");
    var athlete = state.athletesById[String(row.athlete_user_id || "")] || {};
    var assignment = state.assignmentsById[String(row.user_training_program_id || "")] || {};
    var athleteName = String(athlete.name || athlete.email || "Athlete");
    var sessionLabel = String(row.session_label || row.slot_key || "Workout");
    var programName = String(assignment.program_name || "Program");
    var status = String(row.status || "scheduled");
    var isSelected = !!state.selectedRowIds[rowId];
    var cardClasses = ["calendar-session-card"];
    if (isSelected) {
      cardClasses.push("is-selected");
    }

    return (
      '<article class="' + cardClasses.join(" ") + '" draggable="true" data-session-card="' + escapeAttribute(rowId) + '">' +
        '<div class="calendar-session-top">' +
          '<input type="checkbox" aria-label="Select session" data-session-select="' + escapeAttribute(rowId) + '"' + (isSelected ? ' checked' : '') + ' />' +
          '<p class="calendar-session-title">' + escapeHtml(sessionLabel) + '</p>' +
        '</div>' +
        '<p class="calendar-session-meta">' + escapeHtml(athleteName) + ' · ' + escapeHtml(programName) + '</p>' +
        '<span class="calendar-session-status status-' + escapeAttribute(status) + '">' + escapeHtml(capitalize(status)) + '</span>' +
      '</article>'
    );
  }

  function onCalendarDrop(draggedRowId, targetDate) {
    var draggedId = String(draggedRowId || "").trim();
    if (!draggedId || !isIsoDate(targetDate)) {
      return;
    }

    var moveIds = [];
    if (state.selectedRowIds[draggedId]) {
      moveIds = Object.keys(state.selectedRowIds);
    } else {
      moveIds = [draggedId];
    }

    var rowsById = indexRowsById(state.rows || []);
    moveIds = moveIds.filter(function (id) {
      var row = rowsById[id];
      return row && String(row.scheduled_for || "") !== targetDate;
    });

    if (!moveIds.length) {
      state.activeDropDate = "";
      renderCalendarGrid();
      return;
    }

    setStatus("Moving " + moveIds.length + " session" + (moveIds.length === 1 ? "" : "s") + "...", "info");

    state.client
      .from("athlete_program_schedule")
      .update({
        scheduled_for: targetDate
      })
      .in("id", moveIds)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.rows = (state.rows || []).map(function (row) {
          var id = String(row.id || "");
          if (moveIds.indexOf(id) === -1) {
            return row;
          }
          var copy = Object.assign({}, row);
          copy.scheduled_for = targetDate;
          return copy;
        });

        state.activeDropDate = "";
        renderCalendarGrid();
        renderRows(state.rows);
        setStatus("Session date updated.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not move session.", "error");
      });
  }

  function applyBulkActionToSelected() {
    var ids = Object.keys(state.selectedRowIds || {});
    if (!ids.length) {
      setStatus("Select one or more sessions first.", "error");
      return;
    }

    var statusValue = String((document.querySelector("[data-bulk-status]") || {}).value || "").trim();
    var dateValue = String((document.querySelector("[data-bulk-date]") || {}).value || "").trim();
    var updatePayload = {};

    if (statusValue) {
      updatePayload.status = statusValue;
    }
    if (dateValue) {
      if (!isIsoDate(dateValue)) {
        setStatus("Choose a valid bulk move date.", "error");
        return;
      }
      updatePayload.scheduled_for = dateValue;
    }

    if (!Object.keys(updatePayload).length) {
      setStatus("Choose a status and/or date for bulk update.", "error");
      return;
    }

    setStatus("Applying bulk update to " + ids.length + " session" + (ids.length === 1 ? "" : "s") + "...", "info");

    state.client
      .from("athlete_program_schedule")
      .update(updatePayload)
      .in("id", ids)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.rows = (state.rows || []).map(function (row) {
          var id = String(row.id || "");
          if (ids.indexOf(id) === -1) {
            return row;
          }

          var copy = Object.assign({}, row);
          if (updatePayload.status) {
            copy.status = updatePayload.status;
          }
          if (updatePayload.scheduled_for) {
            copy.scheduled_for = updatePayload.scheduled_for;
          }
          return copy;
        });

        renderCalendarGrid();
        renderRows(state.rows);
        setStatus("Bulk update applied.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not apply bulk update.", "error");
      });
  }

  function selectVisibleRows() {
    (state.rows || []).forEach(function (row) {
      var id = String(row.id || "");
      if (id) {
        state.selectedRowIds[id] = true;
      }
    });

    renderCalendarGrid();
    updateSelectionCount();
  }

  function updateSelectionCount() {
    var label = document.querySelector("[data-selection-count]");
    if (!label) {
      return;
    }

    var count = Object.keys(state.selectedRowIds || {}).length;
    label.textContent = count + " selected";
  }

  function keepSelectionInSync(rows) {
    var available = indexRowsById(rows || []);
    Object.keys(state.selectedRowIds || {}).forEach(function (id) {
      if (!available[id]) {
        delete state.selectedRowIds[id];
      }
    });
  }

  function updateViewButtons() {
    var buttons = document.querySelectorAll("[data-calendar-view]");
    buttons.forEach(function (btn) {
      var mode = String(btn.getAttribute("data-calendar-view") || "").trim();
      btn.classList.toggle("is-active", mode === state.viewMode);
    });
  }

  function moveCalendarWindow(action) {
    var current = state.viewAnchorDate instanceof Date ? new Date(state.viewAnchorDate.getTime()) : new Date();
    if (isNaN(current.getTime())) {
      state.viewAnchorDate = new Date();
      syncFilterWindowToCurrentView();
      loadCalendarRows();
      return;
    }

    if (action === "today") {
      state.viewAnchorDate = new Date();
    } else if (action === "prev") {
      if (state.viewMode === "week") {
        current.setDate(current.getDate() - 7);
      } else {
        current.setMonth(current.getMonth() - 1);
      }
      state.viewAnchorDate = current;
    } else if (action === "next") {
      if (state.viewMode === "week") {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
      state.viewAnchorDate = current;
    }

    syncFilterWindowToCurrentView();
    loadCalendarRows();
  }

  function syncFilterWindowToCurrentView() {
    var range = getViewRange();
    var startInput = document.querySelector("[data-schedule-filter-start]");
    var endInput = document.querySelector("[data-schedule-filter-end]");
    if (startInput) {
      startInput.value = range.start;
    }
    if (endInput) {
      endInput.value = range.end;
    }
    renderRangeLabel(range);
  }

  function renderRangeLabel(range) {
    var label = document.querySelector("[data-calendar-range-label]");
    if (!label) {
      return;
    }

    if (!range || !range.start || !range.end) {
      label.textContent = "";
      return;
    }

    label.textContent = formatDate(range.start) + " to " + formatDate(range.end);
  }

  function getViewRange() {
    var anchor = state.viewAnchorDate instanceof Date ? new Date(state.viewAnchorDate.getTime()) : new Date();
    if (isNaN(anchor.getTime())) {
      anchor = new Date();
    }
    anchor.setHours(0, 0, 0, 0);

    if (state.viewMode === "week") {
      var weekStart = startOfWeek(anchor);
      var weekEnd = addDays(weekStart, 6);
      return {
        start: toDateInputValue(weekStart),
        end: toDateInputValue(weekEnd),
        monthYearLabel: weekStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })
      };
    }

    var monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
    var monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
    var gridStart = startOfWeek(monthStart);
    var gridEnd = addDays(startOfWeek(monthEnd), 6);
    return {
      start: toDateInputValue(gridStart),
      end: toDateInputValue(gridEnd),
      monthYearLabel: monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    };
  }

  function buildCalendarDays(range) {
    var startDate = parseIsoDate(range && range.start);
    var endDate = parseIsoDate(range && range.end);
    if (!startDate || !endDate || endDate < startDate) {
      return [];
    }

    var anchor = state.viewAnchorDate instanceof Date ? new Date(state.viewAnchorDate.getTime()) : new Date();
    var anchorMonth = anchor.getMonth();
    var anchorYear = anchor.getFullYear();
    var todayIso = toDateInputValue(new Date());

    var days = [];
    var cursor = new Date(startDate.getTime());
    while (cursor <= endDate) {
      var isoDate = toDateInputValue(cursor);
      var inViewMonth = state.viewMode === "week" || (cursor.getMonth() === anchorMonth && cursor.getFullYear() === anchorYear);
      days.push({
        isoDate: isoDate,
        dayLabel: String(cursor.getDate()),
        isInViewMonth: inViewMonth,
        isToday: isoDate === todayIso
      });
      cursor = addDays(cursor, 1);
    }

    return days;
  }

  function groupRowsByDate(rows) {
    var grouped = {};
    (rows || []).forEach(function (row) {
      var date = String(row.scheduled_for || "");
      if (!isIsoDate(date)) {
        return;
      }
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(row);
    });

    Object.keys(grouped).forEach(function (date) {
      grouped[date].sort(function (a, b) {
        var athleteA = getAthleteSortKey(a);
        var athleteB = getAthleteSortKey(b);
        if (athleteA < athleteB) {
          return -1;
        }
        if (athleteA > athleteB) {
          return 1;
        }
        return String(a.session_label || a.slot_key || "").localeCompare(String(b.session_label || b.slot_key || ""));
      });
    });

    return grouped;
  }

  function getAthleteSortKey(row) {
    var athlete = state.athletesById[String(row && row.athlete_user_id || "")] || {};
    return String(athlete.name || athlete.email || "").toLowerCase();
  }

  function readScopeFromQuery() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return {
        templateId: String(params.get("templateId") || "").trim(),
        athleteId: String(params.get("athleteId") || "").trim()
      };
    } catch (e) {
      return {
        templateId: "",
        athleteId: ""
      };
    }
  }

  function ensureSelectValue(selector, value, label) {
    var select = document.querySelector(selector);
    var id = String(value || "").trim();
    if (!select || !id) {
      return;
    }

    var hasOption = Array.prototype.some.call(select.options || [], function (option) {
      return String(option.value || "") === id;
    });

    if (!hasOption) {
      var option = document.createElement("option");
      option.value = id;
      option.textContent = String(label || id);
      select.appendChild(option);
    }

    select.value = id;
  }

  function resolveAthleteLabel(athleteId) {
    var athlete = state.athletesById[String(athleteId || "")] || {};
    var name = String(athlete.name || "").trim();
    var email = String(athlete.email || "").trim();
    if (name && email) {
      return name + " (" + email + ")";
    }
    return name || email || "Scoped athlete";
  }

  function resolveTemplateLabel(templateId) {
    var template = state.templatesById[String(templateId || "")] || {};
    return String(template.name || "Scoped template");
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

  function ensureAthleteTemplateAssignment(athleteId, templateId) {
    var userId = String(athleteId || "").trim();
    var programId = String(templateId || "").trim();
    if (!userId || !programId) {
      return Promise.resolve(null);
    }

    return state.client
      .from("user_training_programs")
      .select("id,user_id,program_id,program_name,is_active,assigned_at")
      .eq("user_id", userId)
      .eq("program_id", programId)
      .eq("is_active", true)
      .order("assigned_at", { ascending: false })
      .limit(1)
      .then(function (result) {
        if (!result.error && Array.isArray(result.data) && result.data.length) {
          var existing = result.data[0];
          var existingId = String(existing.id || "").trim();
          if (existingId) {
            state.assignmentsById[existingId] = {
              program_name: String(existing.program_name || resolveTemplateLabel(programId)).trim(),
              program_id: programId,
              user_id: userId
            };
          }
          return existing;
        }

        var programName = resolveTemplateLabel(programId);
        return state.client
          .from("user_training_programs")
          .insert({
            user_id: userId,
            program_id: programId,
            program_name: programName,
            is_active: true,
            assigned_at: new Date().toISOString(),
            assigned_by: state.user ? state.user.id : null
          })
          .select("id,user_id,program_id,program_name,is_active,assigned_at")
          .single()
          .then(function (insertResult) {
            if (insertResult.error) {
              throw insertResult.error;
            }

            var inserted = insertResult.data || null;
            var insertedId = String(inserted && inserted.id || "").trim();
            if (insertedId) {
              state.assignmentsById[insertedId] = {
                program_name: String(inserted.program_name || programName).trim(),
                program_id: programId,
                user_id: userId
              };
            }
            return inserted;
          });
      });
  }

  function buildTemplateScheduleBlueprint(templateRecord) {
    var payload = templateRecord && templateRecord.payload && typeof templateRecord.payload === "object"
      ? templateRecord.payload
      : {};
    var days = payload.days && typeof payload.days === "object" ? payload.days : {};
    var slotKeys = Object.keys(days || {}).filter(function (key) {
      return /^w\d+d\d+$/i.test(String(key || ""));
    }).sort(function (a, b) {
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

    if (!slotKeys.length) {
      slotKeys = ["w1d1"];
    }

    return slotKeys.map(function (slotKey) {
      return {
        slot_key: slotKey,
        session_label: resolveTemplateSlotLabel(templateRecord, slotKey)
      };
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

  function resolveTemplateSlotLabel(templateRecord, slotKey) {
    var payload = templateRecord && templateRecord.payload && typeof templateRecord.payload === "object"
      ? templateRecord.payload
      : {};
    var customNames = payload.custom_day_names && typeof payload.custom_day_names === "object"
      ? payload.custom_day_names
      : {};

    if (customNames[slotKey]) {
      return String(customNames[slotKey]);
    }

    var parsed = parseTemplateSlotKey(slotKey);
    if (parsed) {
      return "Week " + parsed.week + " - Workout " + parsed.workout;
    }

    return String(templateRecord && templateRecord.name || "Workout");
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

    while (results.length < totalSessions && safety < 1460) {
      if (allowedDays.indexOf(cursor.getDay()) >= 0) {
        results.push(toDateInputValue(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
      safety += 1;
    }

    return results;
  }

  function indexRowsById(rows) {
    var indexed = {};
    (rows || []).forEach(function (row) {
      var id = String(row.id || "");
      if (id) {
        indexed[id] = row;
      }
    });
    return indexed;
  }

  function startOfWeek(date) {
    var d = new Date(date.getTime());
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  function addDays(date, count) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + Number(count || 0));
    return d;
  }

  function parseIsoDate(value) {
    var text = String(value || "").trim();
    if (!isIsoDate(text)) {
      return null;
    }
    var parts = text.split("-");
    var year = Number(parts[0]);
    var monthIndex = Number(parts[1]) - 1;
    var day = Number(parts[2]);
    var date = new Date(year, monthIndex, day);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  function isIsoDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(String(value || "").trim());
  }

  function buildStatusOptions(selectedStatus) {
    var selected = String(selectedStatus || "scheduled");
    var statuses = ["scheduled", "completed", "missed", "skipped"];
    return statuses.map(function (status) {
      return '<option value="' + status + '"' + (selected === status ? ' selected' : '') + '>' + capitalize(status) + '</option>';
    }).join("");
  }

  function saveSessionRow(rowId) {
    var id = String(rowId || "").trim();
    if (!id) {
      return;
    }

    var rowEl = document.querySelector('[data-session-row="' + cssEscape(id) + '"]');
    if (!rowEl) {
      return;
    }

    var dateInput = rowEl.querySelector("[data-session-date]");
    var statusInput = rowEl.querySelector("[data-session-status]");
    var notesInput = rowEl.querySelector("[data-session-notes]");

    var scheduledFor = String(dateInput && dateInput.value || "").trim();
    var status = String(statusInput && statusInput.value || "scheduled").trim();
    var notes = String(notesInput && notesInput.value || "").trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledFor)) {
      setStatus("Please choose a valid date before saving.", "error");
      return;
    }

    setStatus("Saving session update...", "info");

    state.client
      .from("athlete_program_schedule")
      .update({
        scheduled_for: scheduledFor,
        status: status,
        notes: notes || null
      })
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.rows = (state.rows || []).map(function (row) {
          if (String(row.id || "") !== id) {
            return row;
          }

          var copy = Object.assign({}, row);
          copy.scheduled_for = scheduledFor;
          copy.status = status;
          copy.notes = notes;
          return copy;
        });

        setStatus("Session updated.", "success");
        loadCalendarRows();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not update session.", "error");
      });
  }

  function deleteSessionRow(rowId) {
    var id = String(rowId || "").trim();
    if (!id) {
      return;
    }

    if (!window.confirm("Delete this scheduled workout?")) {
      return;
    }

    setStatus("Deleting session...", "info");

    state.client
      .from("athlete_program_schedule")
      .delete()
      .eq("id", id)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        delete state.selectedRowIds[id];
        state.rows = (state.rows || []).filter(function (row) {
          return String(row.id || "") !== id;
        });

        renderCalendarGrid();
        renderRows(state.rows);
        updateSelectionCount();
        setStatus("Session deleted.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not delete session.", "error");
      });
  }

  function deleteSelectedRows() {
    var ids = Object.keys(state.selectedRowIds || {});
    if (!ids.length) {
      setStatus("Select one or more sessions to delete.", "error");
      return;
    }

    if (!window.confirm("Delete " + ids.length + " selected session" + (ids.length === 1 ? "" : "s") + "?")) {
      return;
    }

    setStatus("Deleting selected sessions...", "info");

    state.client
      .from("athlete_program_schedule")
      .delete()
      .in("id", ids)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.selectedRowIds = {};
        state.rows = (state.rows || []).filter(function (row) {
          return ids.indexOf(String(row.id || "")) === -1;
        });

        renderCalendarGrid();
        renderRows(state.rows);
        updateSelectionCount();
        setStatus("Selected sessions deleted.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not delete selected sessions.", "error");
      });
  }

  function addWorkoutFromInlineForm(form, scheduledFor) {
    var formEl = form || null;
    var dateValue = String(scheduledFor || "").trim();
    if (!formEl) {
      return;
    }

    var athleteId = String((formEl.querySelector("[data-inline-athlete]") || {}).value || "").trim();
    var templateId = String((formEl.querySelector("[data-inline-template]") || {}).value || "").trim();
    var rawSlotKey = String((formEl.querySelector("[data-inline-slot]") || {}).value || "").trim();
    var slotKey = rawSlotKey ? rawSlotKey.toLowerCase() : "w1d1";
    var sessionLabelInput = String((formEl.querySelector("[data-inline-label]") || {}).value || "").trim();

    if (!athleteId) {
      setStatus("Choose an athlete for inline add.", "error");
      return;
    }
    if (!templateId) {
      setStatus("Choose a template for inline add.", "error");
      return;
    }
    if (!isIsoDate(dateValue)) {
      setStatus("Inline add requires a valid date.", "error");
      return;
    }
    if (!/^w\d+d\d+$/i.test(slotKey)) {
      setStatus("Slot key must look like w1d1.", "error");
      return;
    }

    createSingleWorkoutDay(athleteId, templateId, dateValue, slotKey, sessionLabelInput)
      .then(function (result) {
        if (result && result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.inlineAddDate = "";
        setStatus("Workout day added on calendar.", "success");
        loadReferenceData().then(function () {
          populateScopeFilterOptions();
          loadCalendarRows();
        });
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not add workout on calendar.", "error");
      });
  }

  function createSingleWorkoutDay(athleteId, templateId, scheduledFor, slotKey, sessionLabelInput) {
    var athleteUserId = String(athleteId || "").trim();
    var programId = String(templateId || "").trim();
    var dateValue = String(scheduledFor || "").trim();
    var slot = String(slotKey || "").trim().toLowerCase();
    var templateRecord = state.templatesById[programId] || {};
    var sessionLabel = String(sessionLabelInput || "").trim() || resolveTemplateSlotLabel(templateRecord, slot);

    setStatus("Adding workout day...", "info");

    return ensureAthleteTemplateAssignment(athleteUserId, programId)
      .then(function (assignment) {
        if (!assignment || !assignment.id) {
          throw new Error("Could not create assignment for this athlete/template.");
        }

        return state.client
          .from("athlete_program_schedule")
          .upsert([
            {
              athlete_user_id: athleteUserId,
              user_training_program_id: assignment.id,
              program_id: programId,
              slot_key: slot,
              session_label: sessionLabel,
              scheduled_for: dateValue,
              status: "scheduled",
              scheduled_by: state.user ? state.user.id : null
            }
          ], {
            onConflict: "user_training_program_id,slot_key,scheduled_for"
          });
      });
  }

  function setStatus(message, variant) {
    var statusEl = document.querySelector("[data-schedule-status]");
    if (!statusEl) {
      return;
    }

    statusEl.textContent = String(message || "");
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
    var guard = document.querySelector("[data-schedule-guard]");
    var content = document.querySelector("[data-schedule-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function showGuardError(message) {
    var guard = document.querySelector("[data-schedule-guard]");
    if (!guard) {
      return;
    }

    guard.innerHTML =
      '<div style="padding:2rem;text-align:center;color:#9f2d20;">' +
      '<p style="font-size:1.05rem;font-weight:700;">' + escapeHtml(message || "Access denied.") + '</p>' +
      '<p><a href="admin.html" class="btn" style="display:inline-block;margin-top:1rem;">Return to Dashboard</a></p>' +
      '</div>';
  }

  function formatDate(value) {
    try {
      var date = new Date(String(value || ""));
      if (!date || isNaN(date.getTime())) {
        return value || "—";
      }

      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch (e) {
      return value || "—";
    }
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

  function capitalize(value) {
    var text = String(value || "");
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }

  function cssEscape(value) {
    return String(value || "").replace(/([\\"'\[\]#.:>+~*^$|=(){} ])/g, "\\$1");
  }

  function escapeHtml(value) {
    var map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return String(value || "").replace(/[&<>"']/g, function (char) {
      return map[char];
    });
  }

  function escapeAttribute(value) {
    return escapeHtml(String(value || "")).replace(/`/g, "");
  }
})();
