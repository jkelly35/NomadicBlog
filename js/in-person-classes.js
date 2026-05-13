(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var CLASSES_STORAGE_KEY = "nomadic_in_person_classes_v1";
  var TEMPLATE_LIBRARY_KEY = "nomadic_training_program_templates_v1";
  var CLASSES_TABLE = "in_person_classes";

  var state = {
    client: null,
    user: null,
    classes: [],
    templates: [],
    athletes: [],
    createSelectedAthletes: [],
    hasClassesTableWarning: false
  };
    selectedClassId: null,
    attendance: {}, // { [classId]: { [athleteId]: { [week]: attended } } }

  document.addEventListener("DOMContentLoaded", function () {
    init();
  });

  function init() {
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
      renderClasses();
        renderSidebarClassList();
      renderStats();
      loadTemplates();
      loadAthletes();
      loadClassesFromCloud();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectHome();
      }
    });
  }

  function bindEvents() {
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
    var dateInput = document.querySelector("[data-classes-date]");
    var timeInput = document.querySelector("[data-classes-time]");
    var locationInput = document.querySelector("[data-classes-location]");
    var programSelect = document.querySelector("[data-classes-program]");
    var rosterInput = document.querySelector("[data-classes-roster]");

    var className = String(nameInput && nameInput.value || "").trim();
    var classDate = String(dateInput && dateInput.value || "").trim();
    var startTime = String(timeInput && timeInput.value || "").trim();
    var location = String(locationInput && locationInput.value || "").trim();
    var programId = String(programSelect && programSelect.value || "").trim();
    var rosterRaw = String(rosterInput && rosterInput.value || "");

    if (!className || !classDate) {
      setStatus("Class name and date are required.", "error");
      return;
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
      class_date: classDate,
      start_time: startTime,
      location: location,
      program_id: programId,
      program_name: selectedTemplate ? selectedTemplate.name : "",
      notes: "",
      attendees: attendees,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.classes.unshift(newClass);
    persistClasses();
    saveClassToCloud(newClass, false);
    clearCreateForm();
    renderClasses();
    renderStats();
    setStatus("Class saved.", "success");
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
    var dateInput = card.querySelector("[data-class-date]");
    var timeInput = card.querySelector("[data-class-time]");
    var locationInput = card.querySelector("[data-class-location]");
    var programInput = card.querySelector("[data-class-program]");
    var notesInput = card.querySelector("[data-class-notes]");

    classItem.name = String(nameInput && nameInput.value || "").trim();
    classItem.class_date = String(dateInput && dateInput.value || "").trim();
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
      return String(b.class_date || '').localeCompare(String(a.class_date || ''));
    });
    sidebar.innerHTML = sorted.map(function (classItem) {
      var selected = classItem.id === state.selectedClassId ? ' class="selected"' : '';
      return '<li' + selected + ' data-class-sidebar-id="' + escapeAttribute(classItem.id) + '">' +
        '<strong>' + escapeHtml(classItem.name || 'Untitled') + '</strong><br>' +
        '<small>' + escapeHtml(classItem.class_date || '') + '</small>' +
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
    if (!classItem) {
      if (header) header.innerHTML = '<p>Select a class to view details.</p>';
      if (grid) grid.innerHTML = '';
      if (actions) actions.innerHTML = '';
      return;
    }
    // Header: class info
    if (header) {
      header.innerHTML =
        '<h2>' + escapeHtml(classItem.name || 'Untitled') + '</h2>' +
        '<p><strong>Date:</strong> ' + escapeHtml(classItem.class_date || '') +
        ' <strong>Time:</strong> ' + escapeHtml(classItem.start_time || '') +
        ' <strong>Location:</strong> ' + escapeHtml(classItem.location || '') + '</p>' +
        '<p><strong>Program:</strong> ' + escapeHtml(classItem.program_name || '') + '</p>' +
        '<p><strong>Notes:</strong> ' + escapeHtml(classItem.notes || '') + '</p>';
    }
    // Attendance grid
    if (grid) {
      grid.innerHTML = renderAttendanceGrid(classItem);
      // Bind checkboxes
      grid.querySelectorAll('input[data-attendance-week]').forEach(function (cb) {
        cb.addEventListener('change', function (e) {
          var athleteId = cb.getAttribute('data-athlete-id');
          var week = cb.getAttribute('data-attendance-week');
          var checked = !!cb.checked;
          setAttendance(classId, athleteId, week, checked);
        });
      });
    }
    // Actions (optional: add edit/save buttons here)
    if (actions) {
      actions.innerHTML = '';
    }
  }

  // Render week-by-week attendance grid (athletes × weeks)
  function renderAttendanceGrid(classItem) {
    // For demo: assume 8 weeks, can be dynamic
    var NUM_WEEKS = 8;
    var attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];
    if (!attendees.length) return '<p>No attendees for this class.</p>';
    var weeks = Array.from({length: NUM_WEEKS}, (_, i) => i + 1);
    var html = '<table class="attendance-grid"><thead><tr><th>Athlete</th>';
    weeks.forEach(function (w) { html += '<th>Week ' + w + '</th>'; });
    html += '</tr></thead><tbody>';
    attendees.forEach(function (att) {
      html += '<tr><td>' + escapeHtml(att.name || 'Athlete') + '</td>';
      weeks.forEach(function (w) {
        var checked = getAttendance(classItem.id, att.athlete_id || att.id, w) ? 'checked' : '';
        html += '<td><input type="checkbox" data-attendance-week="' + w + '" data-athlete-id="' + escapeAttribute(att.athlete_id || att.id) + '" ' + checked + '></td>';
      });
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
    var list = document.querySelector("[data-classes-list]");
    if (!list) {
      return;
    }

    if (!state.classes.length) {
      list.innerHTML = '<p class="admin-loading">No classes saved yet. Create your first class above.</p>';
      return;
    }

    var sorted = state.classes.slice().sort(function (a, b) {
      var aDate = String(a.class_date || "");
      var bDate = String(b.class_date || "");
      if (aDate === bDate) {
        var aTime = String(a.start_time || "");
        var bTime = String(b.start_time || "");
        return bTime.localeCompare(aTime);
      }
      return bDate.localeCompare(aDate);
    });

    list.innerHTML = sorted.map(function (classItem) {
      var attendees = Array.isArray(classItem.attendees) ? classItem.attendees : [];
      var presentCount = attendees.filter(function (attendee) {
        return !!attendee.present;
      }).length;
      var attendanceSummary = attendees.length ? presentCount + " / " + attendees.length + " present" : "No attendees yet";

      return (
        '<article class="class-card" data-class-card="' + escapeAttribute(classItem.id) + '">' +
          '<div class="class-card-header">' +
            '<h3>' + escapeHtml(classItem.name || "Untitled Class") + '</h3>' +
            '<span class="class-attendance-pill">' + escapeHtml(attendanceSummary) + '</span>' +
          '</div>' +
          '<div class="class-card-grid">' +
            '<label class="admin-modal-info-row"><span>Class Name</span><input type="text" data-class-name value="' + escapeAttribute(classItem.name || "") + '" /></label>' +
            '<label class="admin-modal-info-row"><span>Date</span><input type="date" data-class-date value="' + escapeAttribute(classItem.class_date || "") + '" /></label>' +
            '<label class="admin-modal-info-row"><span>Start Time</span><input type="time" data-class-time value="' + escapeAttribute(classItem.start_time || "") + '" /></label>' +
            '<label class="admin-modal-info-row"><span>Location</span><input type="text" data-class-location value="' + escapeAttribute(classItem.location || "") + '" /></label>' +
            '<label class="admin-modal-info-row class-card-program"><span>Program Used</span>' + renderProgramSelect(classItem.program_id) + '</label>' +
            '<label class="admin-modal-info-row class-card-notes"><span>Class Notes</span><textarea data-class-notes placeholder="Session notes, highlights, regressions/progressions...">' + escapeHtml(classItem.notes || "") + '</textarea></label>' +
          '</div>' +
          '<div class="class-attendance">' +
            '<h4>Attendance</h4>' +
            '<div class="class-attendance-list">' +
              (attendees.length
                ? attendees.map(function (attendee) {
                    return (
                      '<label class="class-attendance-item">' +
                        '<input type="checkbox" data-attendee-present="' + escapeAttribute(attendee.id) + '" ' + (attendee.present ? "checked" : "") + ' />' +
                        '<span>' + escapeHtml(attendee.name || "Attendee") + (attendee && attendee.athlete_id ? ' <small class="class-athlete-tag">Athlete</small>' : '') + '</span>' +
                        '<button type="button" class="btn admin-btn-delete-mini" data-class-action="remove-attendee" data-class-id="' + escapeAttribute(classItem.id) + '" data-attendee-id="' + escapeAttribute(attendee.id) + '">Remove</button>' +
                      '</label>'
                    );
                  }).join("")
                : '<p class="class-attendance-empty">No attendees yet.</p>') +
            '</div>' +
            '<div class="class-attendance-add">' +
              '<select data-class-athlete-select>' + renderAthleteOptions("", attendees) + '</select>' +
              '<button type="button" class="btn admin-btn-small" data-class-action="add-athlete" data-class-id="' + escapeAttribute(classItem.id) + '">+ Add Athlete</button>' +
              '<input type="text" placeholder="Add attendee name..." data-new-attendee />' +
              '<button type="button" class="btn admin-btn-small" data-class-action="add-attendee" data-class-id="' + escapeAttribute(classItem.id) + '">+ Add</button>' +
            '</div>' +
          '</div>' +
          '<div class="class-card-actions">' +
            '<button type="button" class="btn admin-btn-primary" data-class-action="save-class" data-class-id="' + escapeAttribute(classItem.id) + '">Save Updates</button>' +
            '<button type="button" class="btn admin-btn-delete" data-class-action="delete-class" data-class-id="' + escapeAttribute(classItem.id) + '">Delete Class</button>' +
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
      return String(classItem.class_date || "") >= isoToday;
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
      hydrateProgramSelect();
      renderClasses();
      return;
    }

    state.client
      .from("training_programs")
      .select("id,name,updated_at")
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          state.templates = readTemplateLibrary();
          hydrateProgramSelect();
          renderClasses();
          setStatus("Using local program library for class program options.", "info");
          return;
        }

        state.templates = (result.data || []).map(function (row) {
          return {
            id: String(row.id || uniqueId("template")),
            name: String(row.name || "Untitled Program")
          };
        });

        hydrateProgramSelect();
        renderClasses();
      })
      .catch(function () {
        state.templates = readTemplateLibrary();
        hydrateProgramSelect();
        renderClasses();
      });
  }

  function loadAthletes() {
    if (!state.client) {
      state.athletes = [];
      hydrateCreateAthleteSelect();
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
          hydrateCreateAthleteSelect();
          renderClasses();
          return;
        }

        state.athletes = (result.data || []).map(function (row) {
          return {
            id: String(row.user_id || ""),
            email: String(row.email || ""),
            name: String(row.name || "")
          };
        });

        hydrateCreateAthleteSelect();
        renderCreatePickedAthletes();
        renderClasses();
      })
      .catch(function () {
        state.athletes = [];
        hydrateCreateAthleteSelect();
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

    state.client
      .from(CLASSES_TABLE)
      .select("id,name,class_date,start_time,location,program_id,program_name,notes,attendees,created_at,updated_at")
      .order("class_date", { ascending: false })
      .order("start_time", { ascending: false })
      .then(function (result) {
        if (result.error) {
          handleClassesCloudError(result.error, false);
          return;
        }

        var cloudClasses = (result.data || []).map(normalizeClassRecordFromCloud);

        if (cloudClasses.length) {
          state.classes = cloudClasses;
          persistClasses();
          renderClasses();
          renderStats();
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

  function normalizeClassRecordFromCloud(item) {
    return {
      id: String(item && item.id || uniqueId("class")),
      name: String(item && item.name || "Untitled Class"),
      class_date: String(item && item.class_date || ""),
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
    return {
      id: String(classItem.id || uniqueId("class")),
      name: String(classItem.name || "Untitled Class"),
      class_date: String(classItem.class_date || ""),
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
  }

  function clearCreateForm() {
    var nameInput = document.querySelector("[data-classes-name]");
    var dateInput = document.querySelector("[data-classes-date]");
    var timeInput = document.querySelector("[data-classes-time]");
    var locationInput = document.querySelector("[data-classes-location]");
    var programSelect = document.querySelector("[data-classes-program]");
    var rosterInput = document.querySelector("[data-classes-roster]");

    if (nameInput) nameInput.value = "";
    if (dateInput) dateInput.value = "";
    if (timeInput) timeInput.value = "";
    if (locationInput) locationInput.value = "";
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
