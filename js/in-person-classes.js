(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var CLASSES_STORAGE_KEY = "nomadic_in_person_classes_v1";
  var TEMPLATE_LIBRARY_KEY = "nomadic_training_program_templates_v1";
  var CLASSES_TABLE = "in_person_classes";

  var state = {
    client: null,
    user: null,
    pageMode: "list",
    classes: [],
    templates: [],
    athletes: [],
    createSelectedAthletes: [],
    hasClassesTableWarning: false,
    supportsClassScheduleColumns: null,
    supportsClassEndDateColumn: null,
    selectedClassId: null,
    attendance: {}, // { [classId]: { [athleteId]: { [week]: attended } } }
  };

  document.addEventListener("DOMContentLoaded", function () {
    init();
  });

  function getPageMode() {
    return String(document.body && document.body.dataset && document.body.dataset.classesPage || "list").toLowerCase();
  }

  function getClassIdFromUrl() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      return String(params.get("id") || params.get("classId") || "").trim();
    } catch (_error) {
      return "";
    }
  }

  function getWeekdayLabels() {
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }

  function getDayLabel(dayNumber) {
    var labels = getWeekdayLabels();
    return labels[Number(dayNumber) >= 0 && Number(dayNumber) <= 6 ? Number(dayNumber) : 0] || "Sun";
  }

  function getLongDayLabel(dayNumber) {
    var labels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return labels[Number(dayNumber) >= 0 && Number(dayNumber) <= 6 ? Number(dayNumber) : 0] || "Sunday";
  }

  function parseIsoDate(dateValue) {
    if (!dateValue) {
      return null;
    }

    var date = new Date(String(dateValue) + "T00:00:00");
    return isNaN(date.getTime()) ? null : date;
  }

  function formatDateLabel(dateValue) {
    var date = parseIsoDate(dateValue);
    if (!date) {
      return String(dateValue || "");
    }

    return date.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatShortDateLabel(dateValue) {
    var date = parseIsoDate(dateValue);
    if (!date) {
      return String(dateValue || "");
    }

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric"
    });
  }

  function formatIsoDateLocal(date) {
    return [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate())
    ].join("-");
  }

  function getMeetingDaysFromClass(classItem) {
    var source = classItem && classItem.meeting_days;
    if (!Array.isArray(source) || !source.length) {
      var fallbackDate = getClassStartDate(classItem);
      var fallback = parseIsoDate(fallbackDate);
      return fallback ? [fallback.getDay()] : [];
    }

    return source
      .map(function (day) {
        return Number(day);
      })
      .filter(function (day) {
        return day >= 0 && day <= 6;
      });
  }

  function getClassSessionDates(classItem) {
    var startDate = parseIsoDate(getClassStartDate(classItem));
    var endDate = parseIsoDate(getClassEndDate(classItem));
    if (!startDate) {
      return [];
    }

    if (!endDate || endDate < startDate) {
      endDate = new Date(startDate.getTime());
    }

    var meetingDays = getMeetingDaysFromClass(classItem);
    if (!meetingDays.length) {
      meetingDays = [startDate.getDay()];
    }

    var meetingLookup = {};
    meetingDays.forEach(function (day) {
      meetingLookup[day] = true;
    });

    var dates = [];
    var cursor = new Date(startDate.getTime());
    while (cursor <= endDate) {
      if (meetingLookup[cursor.getDay()]) {
        dates.push(formatIsoDateLocal(cursor));
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (!dates.length) {
      dates.push(formatIsoDateLocal(startDate));
    }

    return dates;
  }

  function getClassDescription(classItem) {
    return String(classItem && classItem.description || "").trim();
  }

  function getMeetingDaysText(classItem) {
    var meetingDays = getMeetingDaysFromClass(classItem);
    if (!meetingDays.length) {
      return "No repeat days set";
    }

    return meetingDays.map(function (day) {
      return getLongDayLabel(day);
    }).join(", ");
  }

  function getAttendanceByDate(classItem) {
    return classItem && classItem.attendance_by_date && typeof classItem.attendance_by_date === "object"
      ? classItem.attendance_by_date
      : {};
  }

  function getAttendanceForDate(classItem, attendeeId, dateValue) {
    var dateMap = getAttendanceByDate(classItem)[dateValue];
    if (!dateMap || typeof dateMap !== "object") {
      return true;
    }

    if (Object.prototype.hasOwnProperty.call(dateMap, attendeeId)) {
      return !!dateMap[attendeeId];
    }

    return true;
  }

  function setAttendanceForDate(classItem, dateValue, attendeeId, present) {
    if (!classItem || !dateValue || !attendeeId) {
      return;
    }

    if (!classItem.attendance_by_date || typeof classItem.attendance_by_date !== "object") {
      classItem.attendance_by_date = {};
    }

    if (!classItem.attendance_by_date[dateValue] || typeof classItem.attendance_by_date[dateValue] !== "object") {
      classItem.attendance_by_date[dateValue] = {};
    }

    classItem.attendance_by_date[dateValue][attendeeId] = !!present;
    classItem.updated_at = new Date().toISOString();
  }

  function getSessionAttendanceCount(classItem, dateValue) {
    var attendees = Array.isArray(classItem && classItem.attendees) ? classItem.attendees : [];
    return attendees.filter(function (attendee) {
      return getAttendanceForDate(classItem, attendee.id, dateValue);
    }).length;
  }

  function getClassCapacityText(classItem, dateValue) {
    var attendees = Array.isArray(classItem && classItem.attendees) ? classItem.attendees : [];
    return getSessionAttendanceCount(classItem, dateValue) + " / " + attendees.length + " attending";
  }

  function getSelectedMeetingDays(dayPicker, fallbackDate) {
    var selected = [];
    if (dayPicker) {
      dayPicker.querySelectorAll('input[type="checkbox"]:checked').forEach(function (input) {
        selected.push(Number(input.value));
      });
    }

    if (!selected.length) {
      var fallback = parseIsoDate(fallbackDate);
      if (fallback) {
        selected.push(fallback.getDay());
      }
    }

    return selected
      .filter(function (day, index, array) {
        return day >= 0 && day <= 6 && array.indexOf(day) === index;
      })
      .sort(function (a, b) {
        return a - b;
      });
  }

  function getClassListUrl() {
    return "in-person-classes.html";
  }

  function getClassCreateUrl() {
    return "in-person-class-create.html";
  }

  function getClassDetailUrl(classId) {
    var url = "in-person-class-detail.html";
    if (classId) {
      url += "?id=" + encodeURIComponent(classId);
    }
    return url;
  }

  function init() {
    state.pageMode = getPageMode();
    state.selectedClassId = getClassIdFromUrl();

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
      loadClasses();
      loadTemplates();
      loadAthletes();
      loadClassesFromCloud();
      renderActivePage();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectHome();
      }
    });
  }

  function bindEvents() {
    var createPageButton = document.querySelector("[data-classes-open-create]");
    if (createPageButton) {
      createPageButton.addEventListener("click", function () {
        window.location.href = getClassCreateUrl();
      });
    }

    var createBtn = document.querySelector("[data-classes-create]");
    if (createBtn) {
      createBtn.addEventListener("click", onCreateClass);
    }
      var sidebarList = document.querySelector('[data-classes-sidebar-list]');
      if (sidebarList) {
        sidebarList.addEventListener('click', function (event) {
          var li = event.target.closest('[data-class-sidebar-id]');
          if (li) {
            var classId = li.getAttribute('data-class-sidebar-id');
            if (classId) {
              state.selectedClassId = classId;
              renderClassDetailPanel();
              renderSidebarClassList();
            }
          }
        });
      }

      var refreshBtn = document.querySelector('[data-classes-refresh]');
      if (refreshBtn) {
        refreshBtn.addEventListener('click', function () {
          loadClassesFromCloud();
        });
      }

    var clearBtn = document.querySelector("[data-classes-clear]");
    if (clearBtn) {
      clearBtn.addEventListener("click", clearCreateForm);
    }

    var startDateInput = document.querySelector("[data-classes-date]");
    var dayPicker = document.querySelector("[data-classes-day-picker]");
    if (startDateInput && dayPicker) {
      startDateInput.addEventListener("change", function () {
        var parsed = parseIsoDate(startDateInput.value);
        if (!parsed) {
          return;
        }

        var hasSelectedDays = dayPicker.querySelectorAll('input[type="checkbox"]:checked').length > 0;
        if (!hasSelectedDays) {
          dayPicker.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
            checkbox.checked = Number(checkbox.value) === parsed.getDay();
          });
        }
      });
    }

    var createAthleteAddBtn = document.querySelector("[data-classes-athlete-add]");
    if (createAthleteAddBtn) {
      createAthleteAddBtn.addEventListener("click", onAddCreateAthlete);
    }

    var pickedAthletes = document.querySelector("[data-classes-athlete-picked]");
    if (pickedAthletes) {
      pickedAthletes.addEventListener("click", function (event) {
        var removeBtn = event.target.closest("[data-picked-athlete-remove]");
        if (!removeBtn) {
          return;
        }

        var athleteId = removeBtn.getAttribute("data-picked-athlete-remove");
        if (!athleteId) {
          return;
        }

        state.createSelectedAthletes = state.createSelectedAthletes.filter(function (item) {
          return item.id !== athleteId;
        });
        renderCreatePickedAthletes();
      });
    }

    var list = document.querySelector("[data-classes-list]");
    if (list) {
      list.addEventListener("click", function (event) {
        var target = event.target;
        var viewBtn = target.closest("[data-class-view]");
        if (viewBtn) {
          var viewClassId = viewBtn.getAttribute("data-class-view");
          if (viewClassId) {
            window.location.href = getClassDetailUrl(viewClassId);
            return;
          }
        }

        var actionBtn = target.closest("[data-class-action]");

        if (actionBtn) {
          var action = actionBtn.getAttribute("data-class-action");
          var classId = actionBtn.getAttribute("data-class-id");
          if (!classId) {
            return;
          }

          if (action === "add-attendee") {
            onAddAttendee(classId);
            return;
          }

          if (action === "add-athlete") {
            onAddAthleteToClass(classId);
            return;
          }

          if (action === "remove-attendee") {
            var attendeeId = actionBtn.getAttribute("data-attendee-id");
            onRemoveAttendee(classId, attendeeId);
            return;
          }

          if (action === "delete-class") {
            onDeleteClass(classId);
            return;
          }

          if (action === "save-class") {
            onSaveClass(classId);
          }
        }
      });

      list.addEventListener("change", function (event) {
        var input = event.target;
        var classCard = input.closest("[data-class-card]");
        if (!classCard) {
          return;
        }

        var classId = classCard.getAttribute("data-class-card");
        if (!classId) {
          return;
        }

        if (input.matches("[data-attendee-present]")) {
          var attendeeId = input.getAttribute("data-attendee-present");
          onToggleAttendance(classId, attendeeId, !!input.checked);
        }
      });
    }
  }

  function onCreateClass() {
    var nameInput = document.querySelector("[data-classes-name]");
    var startDateInput = document.querySelector("[data-classes-date]");
    var endDateInput = document.querySelector("[data-classes-end-date]");
    var timeInput = document.querySelector("[data-classes-time]");
    var locationInput = document.querySelector("[data-classes-location]");
    var descriptionInput = document.querySelector("[data-classes-description]");
    var dayPicker = document.querySelector("[data-classes-day-picker]");
    var programSelect = document.querySelector("[data-classes-program]");
    var rosterInput = document.querySelector("[data-classes-roster]");

    var className = String(nameInput && nameInput.value || "").trim();
    var classStartDate = String(startDateInput && startDateInput.value || "").trim();
    var classEndDate = String(endDateInput && endDateInput.value || "").trim();
    var startTime = String(timeInput && timeInput.value || "").trim();
    var location = String(locationInput && locationInput.value || "").trim();
    var description = String(descriptionInput && descriptionInput.value || "").trim();
    var programId = String(programSelect && programSelect.value || "").trim();
    var rosterRaw = String(rosterInput && rosterInput.value || "");
    var meetingDays = getSelectedMeetingDays(dayPicker, classStartDate);

    if (!className || !classStartDate) {
      setStatus("Class name and start date are required.", "error");
      return;
    }

    if (classEndDate && classEndDate < classStartDate) {
      setStatus("End date cannot be before start date.", "error");
      return;
    }

    if (!classEndDate) {
      classEndDate = classStartDate;
    }

    var selectedTemplate = getTemplateById(programId);
    var athleteAttendees = state.createSelectedAthletes.map(function (athlete) {
      return {
        id: uniqueId("attendee"),
        athlete_id: String(athlete.id || ""),
        name: String(athlete.name || athlete.email || "Athlete"),
        present: false
      };
    });

    var manualAttendees = rosterRaw
      .split(",")
      .map(function (name) {
        return String(name || "").trim();
      })
      .filter(function (name) {
        return !!name;
      })
      .map(function (name) {
        return {
          id: uniqueId("attendee"),
          name: name,
          present: false
        };
      });

    var attendees = athleteAttendees.concat(manualAttendees);

    var newClass = {
      id: uniqueId("class"),
      name: className,
      class_date: classStartDate,
      class_end_date: classEndDate,
      description: description,
      meeting_days: meetingDays,
      start_time: startTime,
      location: location,
      program_id: programId,
      program_name: selectedTemplate ? selectedTemplate.name : "",
      notes: "",
      attendees: attendees,
      attendance_by_date: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.classes.unshift(newClass);
    persistClasses();
    saveClassToCloud(newClass, false);
    clearCreateForm();
    window.location.href = getClassDetailUrl(newClass.id);
  }

  function onAddAttendee(classId) {
    var card = document.querySelector('[data-class-card="' + escapeSelector(classId) + '"]');
    if (!card) {
      return;
    }

    var input = card.querySelector("[data-new-attendee]");
    if (!input) {
      return;
    }

    var attendeeName = String(input.value || "").trim();
    if (!attendeeName) {
      setStatus("Enter an attendee name before adding.", "error");
      return;
    }

    var classItem = getClassById(classId);
    if (!classItem) {
      return;
    }

    classItem.attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];
    var duplicateByName = classItem.attendees.some(function (attendee) {
      return String(attendee && attendee.name || "").toLowerCase() === attendeeName.toLowerCase();
    });
    if (duplicateByName) {
      setStatus("This attendee is already in the class.", "info");
      return;
    }

    classItem.attendees.push({
      id: uniqueId("attendee"),
      name: attendeeName,
      present: false
    });
    classItem.updated_at = new Date().toISOString();

    persistClasses();
    saveClassToCloud(classItem, true);
    renderClasses();
    renderStats();
    setStatus("Attendee added.", "success");
  }

  function onAddAthleteToClass(classId) {
    var classItem = getClassById(classId);
    var card = document.querySelector('[data-class-card="' + escapeSelector(classId) + '"]');
    if (!classItem || !card) {
      return;
    }

    var select = card.querySelector("[data-class-athlete-select]");
    if (!select) {
      return;
    }

    var athleteId = String(select.value || "").trim();
    if (!athleteId) {
      setStatus("Select an athlete to add.", "error");
      return;
    }

    var athlete = getAthleteById(athleteId);
    if (!athlete) {
      setStatus("Selected athlete not found.", "error");
      return;
    }

    classItem.attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];

    var duplicate = classItem.attendees.some(function (attendee) {
      if (attendee && attendee.athlete_id) {
        return String(attendee.athlete_id) === athleteId;
      }
      return String(attendee && attendee.name || "").toLowerCase() === String(athlete.name || athlete.email || "").toLowerCase();
    });

    if (duplicate) {
      setStatus("Athlete already added to this class.", "info");
      return;
    }

    classItem.attendees.push({
      id: uniqueId("attendee"),
      athlete_id: athleteId,
      name: String(athlete.name || athlete.email || "Athlete"),
      present: false
    });
    classItem.updated_at = new Date().toISOString();

    persistClasses();
    saveClassToCloud(classItem, true);
    renderClasses();
    renderStats();
    setStatus("Athlete added to class.", "success");
  }

  function onRemoveAttendee(classId, attendeeId) {
    var classItem = getClassById(classId);
    if (!classItem || !attendeeId) {
      return;
    }

    classItem.attendees = (classItem.attendees || []).filter(function (attendee) {
      return attendee.id !== attendeeId;
    });
    classItem.updated_at = new Date().toISOString();

    persistClasses();
    saveClassToCloud(classItem, true);
    renderClasses();
    renderStats();
    setStatus("Attendee removed.", "info");
  }

  function onToggleAttendance(classId, attendeeId, isPresent) {
    var classItem = getClassById(classId);
    if (!classItem || !attendeeId) {
      return;
    }

    (classItem.attendees || []).forEach(function (attendee) {
      if (attendee.id === attendeeId) {
        attendee.present = !!isPresent;
      }
    });

    classItem.updated_at = new Date().toISOString();
    persistClasses();
    saveClassToCloud(classItem, true);
    renderStats();
  }

  function onSaveClass(classId) {
    var classItem = getClassById(classId);
    var card = document.querySelector('[data-class-card="' + escapeSelector(classId) + '"]');
    if (!classItem || !card) {
      return;
    }

    var nameInput = card.querySelector("[data-class-name]");
    var startDateInput = card.querySelector("[data-class-date]");
    var endDateInput = card.querySelector("[data-class-end-date]");
    var timeInput = card.querySelector("[data-class-time]");
    var locationInput = card.querySelector("[data-class-location]");
    var programInput = card.querySelector("[data-class-program]");
    var notesInput = card.querySelector("[data-class-notes]");

    var startDate = String(startDateInput && startDateInput.value || "").trim();
    var endDate = String(endDateInput && endDateInput.value || "").trim();

    if (!startDate) {
      setStatus("Start date is required.", "error");
      return;
    }

    if (endDate && endDate < startDate) {
      setStatus("End date cannot be before start date.", "error");
      return;
    }

    if (!endDate) {
      endDate = startDate;
    }

    classItem.name = String(nameInput && nameInput.value || "").trim();
    classItem.class_date = startDate;
    classItem.class_end_date = endDate;
    classItem.start_time = String(timeInput && timeInput.value || "").trim();
    classItem.location = String(locationInput && locationInput.value || "").trim();
    classItem.program_id = String(programInput && programInput.value || "").trim();
    classItem.notes = String(notesInput && notesInput.value || "").trim();

    var selectedTemplate = getTemplateById(classItem.program_id);
    classItem.program_name = selectedTemplate ? selectedTemplate.name : "";
    classItem.updated_at = new Date().toISOString();

    persistClasses();
    saveClassToCloud(classItem, false);
    renderClasses();
    renderStats();
    setStatus("Class updated.", "success");
  }

  function onDeleteClass(classId) {
    if (!confirm("Delete this class and all attendance records?")) {
      return;
    }

    state.classes = state.classes.filter(function (classItem) {
      return classItem.id !== classId;
    });

    persistClasses();
    deleteClassFromCloud(classId, false);
    renderClasses();
    renderStats();
    setStatus("Class deleted.", "info");
  }

  // Render sidebar class list for selection
  function renderSidebarClassList() {
    var sidebar = document.querySelector('[data-classes-sidebar-list]');
    if (!sidebar) return;
    if (!state.classes.length) {
      sidebar.innerHTML = '<li class="admin-loading">No classes yet.</li>';
      return;
    }
    var sorted = state.classes.slice().sort(function (a, b) {
      return getClassSortDate(b).localeCompare(getClassSortDate(a));
    });
    sidebar.innerHTML = sorted.map(function (classItem) {
      var selected = classItem.id === state.selectedClassId ? ' class="selected"' : '';
      return '<li' + selected + ' data-class-sidebar-id="' + escapeAttribute(classItem.id) + '">' +
        '<strong>' + escapeHtml(classItem.name || 'Untitled') + '</strong><br>' +
        '<small>' + escapeHtml(getClassDateRangeText(classItem)) + '</small>' +
      '</li>';
    }).join('');
    // Auto-select first if none selected
    if (!state.selectedClassId && sorted.length) {
      state.selectedClassId = sorted[0].id;
      renderClassDetailPanel();
      renderSidebarClassList();
    }
  }

  // Render main class detail panel and attendance grid
  function renderClassDetailPanel() {
    var classId = state.selectedClassId;
    var classItem = getClassById(classId);
    var header = document.querySelector('[data-classes-detail-header]');
    var grid = document.querySelector('[data-classes-attendance-grid]');
    var actions = document.querySelector('[data-classes-detail-actions]');
    var titleEl = document.querySelector('[data-classes-detail-page-title]');
    var templateSelect = document.querySelector('[data-class-template-select]');
    var templateSaveBtn = document.querySelector('[data-class-template-save]');
    var templatePanel = document.querySelector('[data-class-template-panel]');
    var sessionDates = getClassSessionDates(classItem);

    if (titleEl) {
      titleEl.textContent = classItem ? (classItem.name || 'Class Detail') : 'Class Detail';
    }

    if (!classItem) {
      if (templatePanel) {
        templatePanel.hidden = true;
      }
      if (header) header.innerHTML = '<p>Select a class to view details.</p>';
      if (grid) grid.innerHTML = '';
      if (actions) actions.innerHTML = '';
      return;
    }

    if (templatePanel) {
      templatePanel.hidden = false;
    }

    if (templateSelect) {
      renderProgramsIntoSelect(templateSelect, classItem.program_id);
    }

    if (templateSaveBtn) {
      templateSaveBtn.onclick = function () {
        var selectedTemplateId = String(templateSelect && templateSelect.value || '').trim();
        var selectedTemplate = getTemplateById(selectedTemplateId);

        classItem.program_id = selectedTemplateId;
        classItem.program_name = selectedTemplate ? selectedTemplate.name : '';
        classItem.updated_at = new Date().toISOString();

        persistClasses();
        saveClassToCloud(classItem, false);
        renderClassDetailPanel();
        renderClasses();
        setStatus(selectedTemplate ? 'Training program template saved to class.' : 'Training program template cleared from class.', 'success');
      };
    }

    // Header: class info
    if (header) {
      header.innerHTML =
        '<div class="classes-detail-hero">' +
          '<div>' +
            '<h2>' + escapeHtml(classItem.name || 'Untitled') + '</h2>' +
            '<p class="classes-detail-description">' + escapeHtml(getClassDescription(classItem) || 'No class description added yet.') + '</p>' +
          '</div>' +
          '<div class="classes-detail-pill-row">' +
            '<span class="class-attendance-pill">' + escapeHtml(getClassDateRangeText(classItem)) + '</span>' +
            '<span class="class-attendance-pill">' + escapeHtml(getMeetingDaysText(classItem)) + '</span>' +
            '<span class="class-attendance-pill">' + escapeHtml(String(sessionDates.length) + ' sessions') + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="classes-detail-meta-grid">' +
          '<div><strong>Start Date</strong><span>' + escapeHtml(getClassStartDate(classItem)) + '</span></div>' +
          '<div><strong>End Date</strong><span>' + escapeHtml(getClassEndDate(classItem)) + '</span></div>' +
          '<div><strong>Days</strong><span>' + escapeHtml(getMeetingDaysText(classItem)) + '</span></div>' +
          '<div><strong>Time</strong><span>' + escapeHtml(classItem.start_time || '') + '</span></div>' +
          '<div><strong>Location</strong><span>' + escapeHtml(classItem.location || '') + '</span></div>' +
          '<div><strong>Program</strong><span>' + escapeHtml(classItem.program_name || '') + '</span></div>' +
        '</div>';
    }
    // Attendance grid
    if (grid) {
      grid.innerHTML = renderAttendanceMatrix(classItem, sessionDates);
      grid.querySelectorAll('input[data-session-date]').forEach(function (cb) {
        cb.addEventListener('change', function (e) {
          var attendeeId = cb.getAttribute('data-attendee-id');
          var sessionDate = cb.getAttribute('data-session-date');
          var checked = !!cb.checked;
          setAttendanceForDate(classItem, sessionDate, attendeeId, checked);
          persistClasses();
          saveClassToCloud(classItem, true);
          renderClassDetailPanel();
          renderStats();
        });
      });

      var addMemberBtn = grid.querySelector('[data-class-detail-add-member]');
      if (addMemberBtn) {
        addMemberBtn.addEventListener('click', function () {
          var select = grid.querySelector('[data-class-detail-member-select]');
          if (!select) {
            return;
          }

          var athleteId = String(select.value || '').trim();
          if (!athleteId) {
            setStatus('Select an athlete before adding them to the class.', 'error');
            return;
          }

          var athlete = getAthleteById(athleteId);
          if (!athlete) {
            setStatus('Selected athlete not found.', 'error');
            return;
          }

          var alreadyExists = (classItem.attendees || []).some(function (attendee) {
            return String(attendee.athlete_id || '') === athleteId || String(attendee.name || '').toLowerCase() === String(athlete.name || athlete.email || '').toLowerCase();
          });

          if (alreadyExists) {
            setStatus('Athlete is already in this class.', 'info');
            return;
          }

          classItem.attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];
          classItem.attendees.push({
            id: uniqueId('attendee'),
            athlete_id: athleteId,
            name: String(athlete.name || athlete.email || 'Athlete'),
            present: false
          });
          classItem.updated_at = new Date().toISOString();
          persistClasses();
          saveClassToCloud(classItem, true);
          renderClassDetailPanel();
          renderStats();
          setStatus('Athlete added to class.', 'success');
        });
      }

      grid.querySelectorAll('[data-class-detail-remove-member]').forEach(function (button) {
        button.addEventListener('click', function () {
          var attendeeId = button.getAttribute('data-class-detail-remove-member');
          if (!attendeeId) {
            return;
          }

          classItem.attendees = (classItem.attendees || []).filter(function (attendee) {
            return attendee.id !== attendeeId;
          });

          if (classItem.attendance_by_date && typeof classItem.attendance_by_date === 'object') {
            Object.keys(classItem.attendance_by_date).forEach(function (dateKey) {
              if (classItem.attendance_by_date[dateKey] && typeof classItem.attendance_by_date[dateKey] === 'object') {
                delete classItem.attendance_by_date[dateKey][attendeeId];
              }
            });
          }

          classItem.updated_at = new Date().toISOString();
          persistClasses();
          saveClassToCloud(classItem, true);
          renderClassDetailPanel();
          renderStats();
          setStatus('Member removed from class.', 'info');
        });
      });
    }
    if (actions) {
      actions.innerHTML =
        '<a class="btn admin-btn-reset-password" href="' + escapeAttribute(getClassListUrl()) + '">Back to Classes</a>' +
        '<a class="btn admin-btn-refresh" href="' + escapeAttribute(getClassCreateUrl()) + '">Create Another Class</a>' +
        (classItem.program_id ? '<a class="btn admin-btn-primary" href="training-program-example.html?templateId=' + encodeURIComponent(classItem.program_id) + '">Open Assigned Template</a>' : '');
    }
  }

  function renderClassDetailPage() {
    if (!state.selectedClassId) {
      state.selectedClassId = getClassIdFromUrl();
    }

    renderClassDetailPanel();
  }

  function renderCreatePage() {
    hydrateProgramSelect();
    hydrateCreateAthleteSelect();
    renderCreatePickedAthletes();
    hydrateMeetingDayPicker();
  }

  function hydrateMeetingDayPicker() {
    var picker = document.querySelector('[data-classes-day-picker]');
    if (!picker) {
      return;
    }

    var selectedDays = getSelectedMeetingDays(picker, document.querySelector('[data-classes-date]') ? document.querySelector('[data-classes-date]').value : '');
    picker.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
      checkbox.checked = selectedDays.indexOf(Number(checkbox.value)) !== -1;
    });
  }

  // Render per-session attendance grid (members × session dates)
  function renderAttendanceMatrix(classItem, sessionDates) {
    var attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];
    var dates = Array.isArray(sessionDates) ? sessionDates : [];
    var html = '<div class="classes-attendance-tools">' +
      '<div class="classes-attendance-add">' +
        '<select data-class-detail-member-select>' + renderAthleteOptions("", attendees) + '</select>' +
        '<button type="button" class="btn admin-btn-small" data-class-detail-add-member>+ Add Member</button>' +
      '</div>' +
      '<p class="classes-attendance-caption">Toggle a member off for a specific date if they miss a session, or back on if they can attend.</p>' +
    '</div>';

    if (!attendees.length) {
      return html + '<p class="class-attendance-empty">No members in this class yet.</p>';
    }

    if (!dates.length) {
      return html + '<p class="class-attendance-empty">No session dates could be generated from this range and day pattern.</p>';
    }

    html += '<table class="attendance-grid"><thead><tr><th>Member</th>';
    dates.forEach(function (dateValue) {
      html += '<th><span class="attendance-grid-date">' + escapeHtml(formatShortDateLabel(dateValue)) + '</span><span class="attendance-grid-day">' + escapeHtml(formatDateLabel(dateValue).split(',')[0] || '') + '</span><span class="attendance-grid-count">' + escapeHtml(getClassCapacityText(classItem, dateValue)) + '</span></th>';
    });
    html += '<th>Remove</th></tr></thead><tbody>';

    attendees.forEach(function (attendee) {
      html += '<tr><td class="attendance-grid-member">' + escapeHtml(attendee.name || 'Athlete') + (attendee && attendee.athlete_id ? ' <small class="class-athlete-tag">Member</small>' : '') + '</td>';
      dates.forEach(function (dateValue) {
        var checked = getAttendanceForDate(classItem, attendee.id, dateValue) ? 'checked' : '';
        html += '<td><input type="checkbox" data-session-date="' + escapeAttribute(dateValue) + '" data-attendee-id="' + escapeAttribute(attendee.id) + '" ' + checked + '></td>';
      });
      html += '<td><button type="button" class="btn admin-btn-delete-mini" data-class-detail-remove-member="' + escapeAttribute(attendee.id) + '">Remove</button></td>';
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  // Attendance state helpers
  function getAttendance(classId, athleteId, week) {
    if (!state.attendance[classId]) return false;
    if (!state.attendance[classId][athleteId]) return false;
    return !!state.attendance[classId][athleteId][week];
  }
  function setAttendance(classId, athleteId, week, present) {
    if (!state.attendance[classId]) state.attendance[classId] = {};
    if (!state.attendance[classId][athleteId]) state.attendance[classId][athleteId] = {};
    state.attendance[classId][athleteId][week] = !!present;
    // TODO: persist to Supabase/localStorage as needed
  }

  function renderClasses() {
    var list = document.querySelector("[data-classes-list]");
    if (!list) {
      return;
    }

    if (!state.classes.length) {
      list.innerHTML = '<p class="admin-loading">No classes saved yet. Create your first class above.</p>';
      return;
    }

    var sorted = state.classes.slice().sort(function (a, b) {
      var aDate = getClassSortDate(a);
      var bDate = getClassSortDate(b);
      if (aDate === bDate) {
        var aTime = String(a.start_time || "");
        var bTime = String(b.start_time || "");
        return bTime.localeCompare(aTime);
      }
      return bDate.localeCompare(aDate);
    });

    list.innerHTML = sorted.map(function (classItem) {
      var attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];
      var attendanceSummary = attendees.length ? attendees.length + " members · " + getClassSessionDates(classItem).length + " sessions" : "No members yet";

      return (
        '<article class="class-card class-card-summary" data-class-card="' + escapeAttribute(classItem.id) + '">' +
          '<div class="class-card-header">' +
            '<h3>' + escapeHtml(classItem.name || "Untitled Class") + '</h3>' +
            '<span class="class-attendance-pill">' + escapeHtml(attendanceSummary) + '</span>' +
          '</div>' +
          '<p class="class-card-meta"><strong>Dates:</strong> ' + escapeHtml(getClassDateRangeText(classItem)) + ' <strong>Days:</strong> ' + escapeHtml(getMeetingDaysText(classItem)) + '</p>' +
          '<p class="class-card-meta"><strong>Description:</strong> ' + escapeHtml(getClassDescription(classItem) || "No description added yet.") + '</p>' +
          '<p class="class-card-meta"><strong>Time:</strong> ' + escapeHtml(classItem.start_time || "") + ' <strong>Location:</strong> ' + escapeHtml(classItem.location || "") + '</p>' +
          '<p class="class-card-meta"><strong>Program:</strong> ' + escapeHtml(classItem.program_name || "") + '</p>' +
          '<p class="class-card-meta"><strong>Notes:</strong> ' + escapeHtml(classItem.notes || "") + '</p>' +
          '<div class="class-card-actions">' +
            '<a class="btn admin-btn-primary" href="' + escapeAttribute(getClassDetailUrl(classItem.id)) + '" data-class-view="' + escapeAttribute(classItem.id) + '">View Class</a>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function renderStats() {
    var totalEl = document.querySelector("[data-classes-total]");
    var upcomingEl = document.querySelector("[data-classes-upcoming]");
    var attendanceEl = document.querySelector("[data-classes-attendance]");

    var total = state.classes.length;
    var today = new Date();
    var isoToday = [
      today.getFullYear(),
      pad(today.getMonth() + 1),
      pad(today.getDate())
    ].join("-");

    var upcoming = state.classes.filter(function (classItem) {
      return getClassEndDate(classItem) >= isoToday;
    }).length;

    var attendanceTotals = state.classes.reduce(function (acc, classItem) {
      var attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];
      var present = attendees.filter(function (attendee) {
        return !!attendee.present;
      }).length;
      acc.present += present;
      acc.total += attendees.length;
      return acc;
    }, { present: 0, total: 0 });

    var attendanceRate = attendanceTotals.total
      ? Math.round((attendanceTotals.present / attendanceTotals.total) * 100)
      : 0;

    if (totalEl) {
      totalEl.textContent = String(total);
    }
    if (upcomingEl) {
      upcomingEl.textContent = String(upcoming);
    }
    if (attendanceEl) {
      attendanceEl.textContent = String(attendanceRate) + "%";
    }
  }

  function renderActivePage() {
    if (state.pageMode === "detail") {
      renderClassDetailPage();
      renderStats();
      return;
    }

    if (state.pageMode === "create") {
      renderCreatePage();
      return;
    }

    renderClasses();
    renderStats();
  }

  function renderProgramsIntoSelect(select, selectedId) {
    if (!select) {
      return;
    }

    var options = ['<option value="">No Program Assigned</option>'];
    state.templates.forEach(function (template) {
      options.push(
        '<option value="' + escapeAttribute(template.id) + '" ' + (template.id === selectedId ? "selected" : "") + '>' +
          escapeHtml(template.name || "Untitled Program") +
        '</option>'
      );
    });

    select.innerHTML = options.join("");
  }

  function renderProgramSelect(selectedId) {
    var options = ['<option value="">No Program Assigned</option>'];
    state.templates.forEach(function (template) {
      options.push(
        '<option value="' + escapeAttribute(template.id) + '" ' + (template.id === selectedId ? "selected" : "") + '>' +
          escapeHtml(template.name || "Untitled Program") +
        '</option>'
      );
    });

    return '<select data-class-program>' + options.join("") + '</select>';
  }

  function renderAthleteOptions(selectedId, attendees) {
    var attendeeList = Array.isArray(attendees) ? attendees : [];
    var selected = String(selectedId || "");
    var options = ['<option value="">Select Athlete...</option>'];

    state.athletes.forEach(function (athlete) {
      var athleteId = String(athlete.id || "");
      if (!athleteId) {
        return;
      }

      var alreadyInClass = attendeeList.some(function (attendee) {
        return attendee && String(attendee.athlete_id || "") === athleteId;
      });

      options.push(
        '<option value="' + escapeAttribute(athleteId) + '" ' +
          (athleteId === selected ? "selected" : "") +
          (alreadyInClass ? " disabled" : "") +
          '>' + escapeHtml(athlete.name || athlete.email || "Athlete") +
          (alreadyInClass ? " (Already Added)" : "") +
        '</option>'
      );
    });

    return options.join("");
  }

  function loadTemplates() {
    if (!state.client) {
      state.templates = readTemplateLibrary();
      renderActivePage();
      return;
    }

    state.client
      .from("training_programs")
      .select("id,name,updated_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          state.templates = readTemplateLibrary();
          renderActivePage();
          setStatus("Using local program library for class program options.", "info");
          return;
        }

        state.templates = (result.data || []).map(function (row) {
          return {
            id: String(row.id || uniqueId("template")),
            name: String(row.name || "Untitled Program")
          };
        });

        renderActivePage();
      })
      .catch(function () {
        state.templates = readTemplateLibrary();
        renderActivePage();
      });
  }

  function loadAthletes() {
    if (!state.client) {
      state.athletes = [];
      renderActivePage();
      return;
    }

    state.client
      .from("admin_all_users")
      .select("user_id,email,name")
      .order("name", { ascending: true })
      .then(function (result) {
        if (result.error) {
          setStatus("Could not load athlete list for class picker.", "info");
          state.athletes = [];
          renderActivePage();
          return;
        }

        state.athletes = (result.data || []).map(function (row) {
          return {
            id: String(row.user_id || ""),
            email: String(row.email || ""),
            name: String(row.name || "")
          };
        });

        renderActivePage();
      })
      .catch(function () {
        state.athletes = [];
        renderActivePage();
      });
  }

  function hydrateProgramSelect() {
    var createSelect = document.querySelector("[data-classes-program]");
    renderProgramsIntoSelect(createSelect, "");
  }

  function hydrateCreateAthleteSelect() {
    var select = document.querySelector("[data-classes-athlete-select]");
    if (!select) {
      return;
    }

    select.innerHTML = renderAthleteOptions("", state.createSelectedAthletes.map(function (athlete) {
      return { athlete_id: athlete.id };
    }));
  }

  function renderCreatePickedAthletes() {
    var container = document.querySelector("[data-classes-athlete-picked]");
    if (!container) {
      return;
    }

    if (!state.createSelectedAthletes.length) {
      container.innerHTML = '<p class="class-picked-athletes-empty">No athletes selected yet.</p>';
      hydrateCreateAthleteSelect();
      return;
    }

    container.innerHTML = state.createSelectedAthletes
      .map(function (athlete) {
        return (
          '<span class="class-picked-athlete-chip">' +
          escapeHtml(athlete.name || athlete.email || "Athlete") +
          '<button type="button" data-picked-athlete-remove="' + escapeAttribute(athlete.id) + '" aria-label="Remove">&times;</button>' +
          '</span>'
        );
      })
      .join("");

    hydrateCreateAthleteSelect();
  }

  function onAddCreateAthlete() {
    var select = document.querySelector("[data-classes-athlete-select]");
    if (!select) {
      return;
    }

    var athleteId = String(select.value || "").trim();
    if (!athleteId) {
      setStatus("Select an athlete to add to this class.", "error");
      return;
    }

    var athlete = getAthleteById(athleteId);
    if (!athlete) {
      setStatus("Selected athlete not found.", "error");
      return;
    }

    var exists = state.createSelectedAthletes.some(function (item) {
      return item.id === athleteId;
    });
    if (exists) {
      setStatus("Athlete already selected.", "info");
      return;
    }

    state.createSelectedAthletes.push({
      id: athleteId,
      name: String(athlete.name || athlete.email || "Athlete"),
      email: String(athlete.email || "")
    });

    renderCreatePickedAthletes();
    setStatus("Athlete added to class roster.", "success");
  }

  function loadClasses() {
    state.classes = readClassesFromStorage();
  }

  function loadClassesFromCloud() {
    if (!state.client) {
      return;
    }

    var localSnapshot = state.classes.slice();
    var selectFields = getClassesSelectFields();

    state.client
      .from(CLASSES_TABLE)
      .select(selectFields)
      .order("class_date", { ascending: false })
      .order("start_time", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingClassScheduleColumnError(result.error) && state.supportsClassScheduleColumns !== false) {
            state.supportsClassScheduleColumns = false;
            loadClassesFromCloud();
            return;
          }
          handleClassesCloudError(result.error, false);
          return;
        }

        if (state.supportsClassScheduleColumns === null) {
          state.supportsClassScheduleColumns = selectFields.indexOf("meeting_days") !== -1;
        }

        var cloudClasses = (result.data || []).map(normalizeClassRecordFromCloud);

        if (cloudClasses.length) {
          state.classes = cloudClasses;
          persistClasses();
          renderActivePage();
          return;
        }

        if (!localSnapshot.length) {
          return;
        }

        state.client
          .from(CLASSES_TABLE)
          .upsert(localSnapshot.map(toCloudClassPayload), { onConflict: "id" })
          .then(function (upsertResult) {
            if (upsertResult.error) {
              handleClassesCloudError(upsertResult.error, false);
              return;
            }

            setStatus("Migrated local classes to Supabase.", "success");
          })
          .catch(function () {
            setStatus("Classes saved locally. Could not sync migration to Supabase.", "info");
          });
      })
      .catch(function () {
        setStatus("Classes saved locally. Could not load Supabase classes.", "info");
      });
  }

  function persistClasses() {
    try {
      localStorage.setItem(CLASSES_STORAGE_KEY, JSON.stringify(state.classes));
    } catch (_error) {
      setStatus("Could not persist classes in this browser session.", "error");
    }
  }

  function readClassesFromStorage() {
    try {
      var raw = localStorage.getItem(CLASSES_STORAGE_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (item) {
        return {
          id: String(item.id || uniqueId("class")),
          name: String(item.name || "Untitled Class"),
          class_date: String(item.class_date || ""),
          class_end_date: String(item.class_end_date || item.class_date || ""),
          description: String(item.description || ""),
          meeting_days: Array.isArray(item.meeting_days)
            ? item.meeting_days.map(function (day) { return Number(day); }).filter(function (day) { return day >= 0 && day <= 6; })
            : [],
          attendance_by_date: item.attendance_by_date && typeof item.attendance_by_date === "object" ? item.attendance_by_date : {},
          start_time: String(item.start_time || ""),
          location: String(item.location || ""),
          program_id: String(item.program_id || ""),
          program_name: String(item.program_name || ""),
          notes: String(item.notes || ""),
          attendees: Array.isArray(item.attendees)
            ? item.attendees.map(function (attendee) {
                return {
                  id: String(attendee.id || uniqueId("attendee")),
                  athlete_id: String(attendee.athlete_id || ""),
                  name: String(attendee.name || ""),
                  present: !!attendee.present
                };
              })
            : [],
          created_at: String(item.created_at || new Date().toISOString()),
          updated_at: String(item.updated_at || new Date().toISOString())
        };
      });
    } catch (_error) {
      return [];
    }
  }

  function saveClassToCloud(classItem, silent) {
    if (!state.client || !classItem) {
      return;
    }

    state.client
      .from(CLASSES_TABLE)
      .upsert(toCloudClassPayload(classItem), { onConflict: "id" })
      .then(function (result) {
        if (result.error) {
          if (isMissingClassScheduleColumnError(result.error) && state.supportsClassScheduleColumns !== false) {
            state.supportsClassScheduleColumns = false;
            state.client
              .from(CLASSES_TABLE)
              .upsert(toCloudClassPayload(classItem), { onConflict: "id" })
              .then(function (retryResult) {
                if (retryResult.error) {
                  handleClassesCloudError(retryResult.error, silent);
                }
              })
              .catch(function () {
                if (!silent) {
                  setStatus("Class saved locally. Could not sync to Supabase.", "info");
                }
              });
            return;
          }
          handleClassesCloudError(result.error, silent);
        }
      })
      .catch(function () {
        if (!silent) {
          setStatus("Class saved locally. Could not sync to Supabase.", "info");
        }
      });
  }

  function deleteClassFromCloud(classId, silent) {
    if (!state.client || !classId) {
      return;
    }

    state.client
      .from(CLASSES_TABLE)
      .delete()
      .eq("id", classId)
      .then(function (result) {
        if (result.error) {
          handleClassesCloudError(result.error, silent);
        }
      })
      .catch(function () {
        if (!silent) {
          setStatus("Class deleted locally. Could not sync delete to Supabase.", "info");
        }
      });
  }

  function handleClassesCloudError(error, silent) {
    if (!error) {
      return;
    }

    if (isMissingClassesTableError(error)) {
      if (!state.hasClassesTableWarning) {
        state.hasClassesTableWarning = true;
        setStatus("Supabase table in_person_classes is missing. Using local class storage.", "info");
      }
      return;
    }

    if (!silent) {
      setStatus("Classes saved locally. Supabase sync failed.", "info");
    }
  }

  function isMissingClassesTableError(error) {
    var code = String(error && error.code || "");
    var message = String(error && error.message || "").toLowerCase();
    return code === "42P01" || (message.indexOf("in_person_classes") !== -1 && message.indexOf("does not exist") !== -1);
  }

  function isMissingClassEndDateColumnError(error) {
    var code = String(error && error.code || "");
    var message = String(error && error.message || "").toLowerCase();
    return code === "42703" && message.indexOf("class_end_date") !== -1;
  }

  function getClassesSelectFields() {
    var baseFields = "id,name,class_date,start_time,location,program_id,program_name,notes,attendees,created_at,updated_at";
    if (state.supportsClassScheduleColumns === false) {
      return baseFields;
    }
    return "id,name,class_date,class_end_date,description,meeting_days,attendance_by_date,start_time,location,program_id,program_name,notes,attendees,created_at,updated_at";
  }

  function getClassStartDate(classItem) {
    return String(classItem && classItem.class_date || "");
  }

  function getClassEndDate(classItem) {
    return String(classItem && (classItem.class_end_date || classItem.class_date) || "");
  }

  function getClassDateRangeText(classItem) {
    var startDate = getClassStartDate(classItem);
    var endDate = getClassEndDate(classItem);
    if (!startDate && !endDate) {
      return "";
    }
    if (!endDate || startDate === endDate) {
      return startDate;
    }
    if (!startDate) {
      return endDate;
    }
    return startDate + " to " + endDate;
  }

  function getClassSortDate(classItem) {
    return getClassStartDate(classItem);
  }

  function isMissingClassScheduleColumnError(error) {
    var code = String(error && error.code || "");
    var message = String(error && error.message || "").toLowerCase();
    if (code !== "42703") {
      return false;
    }

    return ["class_end_date", "description", "meeting_days", "attendance_by_date"].some(function (fieldName) {
      return message.indexOf(fieldName) !== -1;
    });
  }

  function normalizeClassRecordFromCloud(item) {
    return {
      id: String(item && item.id || uniqueId("class")),
      name: String(item && item.name || "Untitled Class"),
      class_date: String(item && item.class_date || ""),
      class_end_date: String(item && item.class_end_date || item && item.class_date || ""),
      description: String(item && item.description || ""),
      meeting_days: Array.isArray(item && item.meeting_days)
        ? item.meeting_days.map(function (day) {
            return Number(day);
          }).filter(function (day) {
            return day >= 0 && day <= 6;
          })
        : [],
      attendance_by_date: item && item.attendance_by_date && typeof item.attendance_by_date === "object"
        ? item.attendance_by_date
        : {},
      start_time: String(item && item.start_time || ""),
      location: String(item && item.location || ""),
      program_id: String(item && item.program_id || ""),
      program_name: String(item && item.program_name || ""),
      notes: String(item && item.notes || ""),
      attendees: Array.isArray(item && item.attendees)
        ? item.attendees.map(function (attendee) {
            return {
              id: String(attendee && attendee.id || uniqueId("attendee")),
              athlete_id: String(attendee && attendee.athlete_id || ""),
              name: String(attendee && attendee.name || ""),
              present: !!(attendee && attendee.present)
            };
          })
        : [],
      created_at: String(item && item.created_at || new Date().toISOString()),
      updated_at: String(item && item.updated_at || new Date().toISOString())
    };
  }

  function toCloudClassPayload(classItem) {
    var payload = {
      id: String(classItem.id || uniqueId("class")),
      name: String(classItem.name || "Untitled Class"),
      class_date: String(classItem.class_date || ""),
      class_end_date: String(classItem.class_end_date || classItem.class_date || ""),
      description: String(classItem.description || ""),
      meeting_days: Array.isArray(classItem.meeting_days) ? classItem.meeting_days : [],
      attendance_by_date: classItem.attendance_by_date && typeof classItem.attendance_by_date === "object" ? classItem.attendance_by_date : {},
      start_time: String(classItem.start_time || ""),
      location: String(classItem.location || ""),
      program_id: String(classItem.program_id || ""),
      program_name: String(classItem.program_name || ""),
      notes: String(classItem.notes || ""),
      attendees: Array.isArray(classItem.attendees)
        ? classItem.attendees.map(function (attendee) {
            return {
              id: String(attendee && attendee.id || uniqueId("attendee")),
              athlete_id: String(attendee && attendee.athlete_id || ""),
              name: String(attendee && attendee.name || ""),
              present: !!(attendee && attendee.present)
            };
          })
        : []
    };

    if (state.supportsClassScheduleColumns === false) {
      delete payload.class_end_date;
      delete payload.description;
      delete payload.meeting_days;
      delete payload.attendance_by_date;
    }

    return payload;
  }

  function clearCreateForm() {
    var nameInput = document.querySelector("[data-classes-name]");
    var dateInput = document.querySelector("[data-classes-date]");
    var endDateInput = document.querySelector("[data-classes-end-date]");
    var timeInput = document.querySelector("[data-classes-time]");
    var locationInput = document.querySelector("[data-classes-location]");
    var descriptionInput = document.querySelector("[data-classes-description]");
    var dayPicker = document.querySelector("[data-classes-day-picker]");
    var programSelect = document.querySelector("[data-classes-program]");
    var rosterInput = document.querySelector("[data-classes-roster]");

    if (nameInput) nameInput.value = "";
    if (dateInput) dateInput.value = "";
    if (endDateInput) endDateInput.value = "";
    if (timeInput) timeInput.value = "";
    if (locationInput) locationInput.value = "";
    if (descriptionInput) descriptionInput.value = "";
    if (dayPicker) {
      dayPicker.querySelectorAll('input[type="checkbox"]').forEach(function (checkbox) {
        checkbox.checked = false;
      });
    }
    if (programSelect) programSelect.value = "";
    if (rosterInput) rosterInput.value = "";
    state.createSelectedAthletes = [];
    renderCreatePickedAthletes();
  }

  function readTemplateLibrary() {
    try {
      var raw = localStorage.getItem(TEMPLATE_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter(function (template) {
          return template && !template.archived;
        })
        .map(function (template) {
          return {
            id: String(template.id || uniqueId("template")),
            name: String(template.name || "Untitled Program")
          };
        });
    } catch (_error) {
      return [];
    }
  }

  function getClassById(classId) {
    var found = null;
    state.classes.forEach(function (classItem) {
      if (classItem.id === classId) {
        found = classItem;
      }
    });
    return found;
  }

  function getAthleteById(athleteId) {
    var found = null;
    state.athletes.forEach(function (athlete) {
      if (String(athlete.id || "") === String(athleteId || "")) {
        found = athlete;
      }
    });
    return found;
  }

  function getTemplateById(templateId) {
    if (!templateId) {
      return null;
    }

    var found = null;
    state.templates.forEach(function (template) {
      if (template.id === templateId) {
        found = template;
      }
    });

    return found;
  }

  function showContent() {
    var guard = document.querySelector("[data-classes-guard]");
    var content = document.querySelector("[data-classes-content]");

    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function showGuardError(message) {
    var guard = document.querySelector("[data-classes-guard]");
    if (!guard) {
      return;
    }
    guard.innerHTML = '<p class="admin-status is-error" style="display:block;">' + escapeHtml(message) + "</p>";
  }

  function setStatus(message, variant) {
    var el = document.querySelector("[data-classes-status]");
    if (!el) {
      return;
    }

    el.classList.remove("is-error", "is-success", "is-info");
    if (variant === "error") {
      el.classList.add("is-error");
    } else if (variant === "success") {
      el.classList.add("is-success");
    } else {
      el.classList.add("is-info");
    }

    el.textContent = message || "";
  }

  function uniqueId(prefix) {
    return [prefix, Date.now(), Math.random().toString(16).slice(2, 8)].join("_");
  }

  function redirectHome() {
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
    return escapeHtml(value).replace(/`/g, "&#96;");
  }

  function escapeSelector(value) {
    return String(value || "").replace(/\"/g, '\\\"');
  }

  function pad(value) {
    return String(value).padStart(2, "0");
  }
})();
