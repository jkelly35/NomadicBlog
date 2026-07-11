(function () {
  "use strict";

  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var MEMBERSHIP_PAYMENT_TASK_FORM_ID = "membership-payment-task-v1";
  var MEMBERSHIP_PAYMENT_TASK_NAME = "Complete Membership Payment";
  var MEMBERSHIP_PAYMENT_TASK_URL = "founding-member.html?checkout=start";
  var COACH_TASK_TEMPLATE_KEY = "nomadic_coach_task_templates_v1";
  var COACH_FORMS_TEMPLATE_KEY = "nomadic_coach_forms_templates_v1";

  var state = {
    client: null,
    coachUser: null,
    templates: [],
    forms: [],
    editingTemplateId: "",
    templateSearchTerm: "",
    questionDrafts: [],
    athleteNamesById: {},
    workoutCompletionTodos: []
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
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
        window.location.replace("index.html");
        return;
      }

      state.coachUser = session.user;
      if (!isCoachUser(session.user)) {
        showGuardError("Coach access is required.");
        setTimeout(function () {
          window.location.replace("index.html");
        }, 1200);
        return;
      }

      showContent();
      bindEvents();
      state.templates = readTemplates();
      state.forms = readFormsIndex();
      renderTemplateList();
      renderAttachedFormOptions("");
      updateCreateActionButtons();
      loadWorkoutCompletionTodos();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        window.location.replace("index.html");
      }
    });
  }

  function isCoachUser(user) {
    return String(user && user.email || "").trim().toLowerCase() === ADMIN_EMAIL;
  }

  function getDefaultTemplates() {
    return [
      {
        id: MEMBERSHIP_PAYMENT_TASK_FORM_ID,
        name: MEMBERSHIP_PAYMENT_TASK_NAME,
        description: "Assign this when an athlete is approved for membership. Includes a direct checkout link.",
        task_type: "custom_task",
        action_label: "Open Payment",
        action_url: MEMBERSHIP_PAYMENT_TASK_URL,
        action_target: "_self",
        questions: []
      },
      {
        id: "founding-member-intake-v1",
        name: "Founding Member Intake",
        description: "Baseline onboarding form to align goals, history, equipment, and schedule.",
        questions: [
          { key: "primary_goal", label: "Primary Performance Goal", type: "text", required: true },
          { key: "training_days", label: "Preferred Training Days", type: "text", required: true },
          { key: "injury_history", label: "Recent Injury History", type: "textarea", rows: 3 },
          { key: "coaching_preferences", label: "Coaching Preferences", type: "textarea", rows: 3 }
        ]
      },
      {
        id: "performance-readiness-screen-v1",
        name: "Performance Readiness Screen",
        description: "Quick readiness and lifestyle intake before plan build.",
        questions: [
          { key: "sleep_hours", label: "Average Sleep (hours/night)", type: "number", min: 0, max: 14, step: 0.5, required: true },
          { key: "stress_level", label: "Current Life Stress", type: "select", options: ["Low", "Moderate", "High"], required: true }
        ]
      }
    ];
  }

  function readTemplates() {
    var defaults = getDefaultTemplates().map(sanitizeTemplate);
    try {
      var raw = window.localStorage.getItem(COACH_TASK_TEMPLATE_KEY);
      if (!raw) {
        writeTemplates(defaults);
        return defaults;
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        writeTemplates(defaults);
        return defaults;
      }

      var merged = defaults.slice();
      parsed.forEach(function (entry) {
        var normalized = sanitizeTemplate(entry);
        var id = String(normalized && normalized.id || "").trim();
        if (!id) {
          return;
        }

        var existingIndex = merged.findIndex(function (item) {
          return item.id === id;
        });

        if (existingIndex > -1) {
          merged[existingIndex] = normalized;
        } else {
          merged.push(normalized);
        }
      });

      writeTemplates(merged);
      return merged;
    } catch (_error) {
      writeTemplates(defaults);
      return defaults;
    }
  }

  function sanitizeTemplate(entry) {
    return {
      id: String(entry && entry.id || "coach-task-" + Date.now()).trim(),
      name: String(entry && entry.name || "Untitled Task").trim(),
      description: String(entry && entry.description || "").trim(),
      task_type: "custom_task",
      action_label: String(entry && entry.action_label || "").trim(),
      action_url: String(entry && entry.action_url || "").trim(),
      action_target: "_self",
      attached_form_id: String(entry && entry.attached_form_id || "").trim(),
      questions: sanitizeQuestions(entry && entry.questions)
    };
  }

  function readFormsIndex() {
    try {
      var raw = window.localStorage.getItem(COACH_FORMS_TEMPLATE_KEY);
      if (!raw) {
        return [];
      }
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed.map(function (entry) {
        return {
          id: String(entry && entry.id || "").trim(),
          name: String(entry && entry.name || "").trim()
        };
      }).filter(function (entry) {
        return !!entry.id && !!entry.name;
      });
    } catch (_error) {
      return [];
    }
  }

  function sanitizeQuestions(rawQuestions) {
    var source = Array.isArray(rawQuestions) ? rawQuestions : [];
    return source.map(function (question, index) {
      var label = String(question && question.label || "").trim();
      var key = String(question && question.key || "").trim() || slugifyQuestionKey(label || "question-" + String(index + 1));
      var type = String(question && question.type || "text").trim().toLowerCase();
      var normalizedType = ["text", "textarea", "number", "date", "select", "checkbox"].indexOf(type) > -1 ? type : "text";
      var options = Array.isArray(question && question.options)
        ? question.options.map(function (value) { return String(value || "").trim(); }).filter(Boolean)
        : [];
      return {
        key: key,
        label: label || key,
        type: normalizedType,
        required: question && question.required === true,
        placeholder: String(question && question.placeholder || "").trim(),
        options: options
      };
    }).filter(function (question) {
      return !!String(question && question.label || "").trim();
    });
  }

  function writeTemplates(templates) {
    try {
      window.localStorage.setItem(COACH_TASK_TEMPLATE_KEY, JSON.stringify(templates));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function bindEvents() {
    var searchInput = document.querySelector("[data-coach-task-search]");
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.templateSearchTerm = String(event && event.target && event.target.value || "").trim().toLowerCase();
        renderTemplateList();
      });
    }

    var createBtn = document.querySelector("[data-coach-task-create]");
    if (createBtn) {
      createBtn.addEventListener("click", onCreateTemplate);
    }

    var clearBtn = document.querySelector("[data-coach-task-clear-form]");
    if (clearBtn) {
      clearBtn.addEventListener("click", clearCreateForm);
    }

    var cancelEditBtn = document.querySelector("[data-coach-task-cancel-edit]");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", function () {
        resetEditingState();
        clearCreateForm();
        setStatus("Edit cancelled.", "info");
      });
    }

    var templateList = document.querySelector("[data-coach-task-template-list]");
    if (templateList) {
      templateList.addEventListener("click", function (event) {
        var editBtn = event.target && event.target.closest("[data-coach-task-edit]");
        if (editBtn) {
          var editId = String(editBtn.getAttribute("data-coach-task-edit") || "").trim();
          startEditingTemplate(editId);
          return;
        }

        var deleteBtn = event.target && event.target.closest("[data-coach-task-delete]");
        if (deleteBtn) {
          var deleteId = String(deleteBtn.getAttribute("data-coach-task-delete") || "").trim();
          onDeleteTemplate(deleteId);
        }
      });
    }

    var attachedFormSelect = document.querySelector("[data-coach-task-create-attached-form]");
    if (attachedFormSelect) {
      attachedFormSelect.addEventListener("focus", function () {
        state.forms = readFormsIndex();
        renderAttachedFormOptions(attachedFormSelect.value || "");
      });
    }

    var refreshWorkoutTodoBtn = document.querySelector("[data-coach-workout-todo-refresh]");
    if (refreshWorkoutTodoBtn) {
      refreshWorkoutTodoBtn.addEventListener("click", function () {
        loadWorkoutCompletionTodos();
      });
    }
  }

  function loadWorkoutCompletionTodos() {
    var list = document.querySelector("[data-coach-workout-todo-list]");
    if (!state.client || !state.coachUser || !list) {
      return;
    }

    list.innerHTML = '<p class="admin-loading">Loading workout completion notifications...</p>';

    state.client
      .from("athlete_exercise_history")
      .select("id,athlete_user_id,slot_key,workout_completed_at,exercise_name,total_sets,completed_sets,top_weight,volume_load")
      .order("workout_completed_at", { ascending: false })
      .limit(600)
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }

        state.workoutCompletionTodos = groupWorkoutCompletionHistoryRows(result && Array.isArray(result.data) ? result.data : []);
        return hydrateWorkoutTodoAthleteNames(state.workoutCompletionTodos);
      })
      .then(function () {
        renderWorkoutCompletionTodos();
      })
      .catch(function (error) {
        list.innerHTML = '<p class="admin-loading">Could not load workout completion notifications: ' + escapeHtml(error && error.message ? error.message : "Unknown error") + '</p>';
      });
  }

  function groupWorkoutCompletionHistoryRows(rows) {
    var grouped = {};

    (Array.isArray(rows) ? rows : []).forEach(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      var completedAt = String(row && row.workout_completed_at || "").trim();
      var slotKey = String(row && row.slot_key || "").trim();
      if (!athleteId || !completedAt) {
        return;
      }

      var key = athleteId + "|" + completedAt + "|" + slotKey;
      if (!grouped[key]) {
        grouped[key] = {
          athlete_user_id: athleteId,
          created_at: completedAt,
          slot_key: slotKey || null,
          exercises: [],
          total_sets: 0,
          completed_sets: 0,
          volume_load: 0,
          top_weight: null
        };
      }

      var target = grouped[key];
      var sets = Number(row && row.total_sets || 0);
      var done = Number(row && row.completed_sets || 0);
      var volume = Number(row && row.volume_load || 0);
      var topWeight = row && row.top_weight != null ? Number(row.top_weight) : null;

      target.total_sets += isNaN(sets) ? 0 : sets;
      target.completed_sets += isNaN(done) ? 0 : done;
      target.volume_load += isNaN(volume) ? 0 : volume;
      if (topWeight != null && !isNaN(topWeight) && (target.top_weight == null || topWeight > target.top_weight)) {
        target.top_weight = topWeight;
      }

      var exerciseName = String(row && row.exercise_name || "").trim();
      if (exerciseName && target.exercises.indexOf(exerciseName) === -1) {
        target.exercises.push(exerciseName);
      }
    });

    return Object.keys(grouped).map(function (key) {
      var item = grouped[key];
      var exerciseCount = item.exercises.length;
      var completionPct = item.total_sets > 0 ? Math.round((item.completed_sets / item.total_sets) * 100) : 0;
      var summaryLines = [];
      summaryLines.push("Workout complete");
      if (item.slot_key) {
        summaryLines.push("Slot: " + item.slot_key.toUpperCase());
      }
      summaryLines.push("Completion: " + String(completionPct) + "% (" + item.completed_sets + "/" + item.total_sets + " sets)");
      summaryLines.push("Exercises logged: " + String(exerciseCount));
      if (item.top_weight != null) {
        summaryLines.push("Top load: " + item.top_weight);
      }
      if (item.volume_load > 0) {
        summaryLines.push("Volume load: " + Math.round(item.volume_load * 100) / 100);
      }
      if (exerciseCount) {
        summaryLines.push("Exercises: " + item.exercises.slice(0, 5).join(", ") + (exerciseCount > 5 ? "..." : ""));
      }

      item.body = summaryLines.join("\n");
      return item;
    }).sort(function (a, b) {
      return String(b && b.created_at || "").localeCompare(String(a && a.created_at || ""));
    });
  }

  function hydrateWorkoutTodoAthleteNames(rows) {
    var ids = (Array.isArray(rows) ? rows : []).map(function (row) {
      return String(row && row.athlete_user_id || "").trim();
    }).filter(Boolean);

    if (!ids.length || !state.client) {
      return Promise.resolve();
    }

    var uniqueIds = ids.filter(function (id, index, all) {
      return all.indexOf(id) === index;
    });

    return state.client
      .from("athlete_profiles")
      .select("user_id,name")
      .in("user_id", uniqueIds)
      .then(function (result) {
        if (result && result.error) {
          return;
        }

        var map = {};
        (result && Array.isArray(result.data) ? result.data : []).forEach(function (profile) {
          var id = String(profile && profile.user_id || "").trim();
          if (!id) {
            return;
          }
          map[id] = String(profile && profile.name || "").trim();
        });
        state.athleteNamesById = map;
      })
      .catch(function () {
        // Keep rendering with fallback athlete labels.
      });
  }

  function renderWorkoutCompletionTodos() {
    var list = document.querySelector("[data-coach-workout-todo-list]");
    if (!list) {
      return;
    }

    var rows = Array.isArray(state.workoutCompletionTodos) ? state.workoutCompletionTodos.slice() : [];
    if (!rows.length) {
      list.innerHTML = '<p class="admin-loading">No workout completion notifications yet.</p>';
      return;
    }

    rows.sort(function (a, b) {
      return String(b && b.created_at || "").localeCompare(String(a && a.created_at || ""));
    });

    list.innerHTML = rows.map(function (row) {
      var athleteId = String(row && row.athlete_user_id || "").trim();
      var athleteName = state.athleteNamesById[athleteId] || "Athlete";
      var body = String(row && row.body || "").trim();
      return (
        '<details class="admin-overview-item" open>' +
          '<summary class="admin-overview-item-title" style="cursor:pointer; display:flex; align-items:center; justify-content:space-between; gap:0.5rem;">' +
            '<span>' + escapeHtml(athleteName) + ' • Workout Complete</span>' +
            '<span class="admin-overview-item-meta">' +
              escapeHtml(formatDateTime(row && row.created_at)) +
            '</span>' +
          '</summary>' +
          '<p class="admin-overview-item-meta" style="white-space: pre-wrap; margin-top: 0.5rem;">' + escapeHtml(body) + '</p>' +
          '<div class="admin-controls-actions" style="margin-top:0.5rem;">' +
            '<a class="btn admin-btn-small" href="coach-inbox.html?athlete=' + encodeURIComponent(athleteId) + '">Open Thread</a>' +
          '</div>' +
        '</details>'
      );
    }).join("");
  }

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    var date = new Date(value);
    if (isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function showGuardError(message) {
    var guard = document.querySelector("[data-coach-tasks-guard]");
    var content = document.querySelector("[data-coach-tasks-content]");
    if (guard) {
      guard.hidden = false;
      guard.innerHTML = '<p class="admin-loading">' + escapeHtml(message || "Access blocked.") + "</p>";
    }
    if (content) {
      content.hidden = true;
    }
  }

  function showContent() {
    var guard = document.querySelector("[data-coach-tasks-guard]");
    var content = document.querySelector("[data-coach-tasks-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function renderTemplateList() {
    var container = document.querySelector("[data-coach-task-template-list]");
    if (!container) {
      return;
    }

    var search = state.templateSearchTerm;
    var templates = (state.templates || []).filter(function (template) {
      if (!search) {
        return true;
      }

      var haystack = [
        String(template && template.name || ""),
        String(template && template.description || "")
      ].join(" ").toLowerCase();
      return haystack.indexOf(search) > -1;
    });

    if (!templates.length) {
      container.innerHTML = '<p class="admin-loading">No matching task templates.</p>';
      return;
    }

    container.innerHTML = templates.map(function (template) {
      var id = String(template && template.id || "");
      var isDefault = id === MEMBERSHIP_PAYMENT_TASK_FORM_ID || id === "founding-member-intake-v1" || id === "performance-readiness-screen-v1";
      return (
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">' + escapeHtml(template.name || "Task") + '</p>' +
            '<p class="admin-overview-item-meta">' + escapeHtml(template.description || "No description") + '</p>' +
            '<p class="admin-overview-item-meta">Attached form: ' + escapeHtml(resolveFormName(template.attached_form_id)) + '</p>' +
          '</div>' +
          '<div class="admin-request-side">' +
            '<div class="admin-request-actions">' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-edit="' + escapeAttribute(id) + '">Edit</button>' +
              (isDefault
                ? ''
                : '<button type="button" class="btn admin-btn-small" data-coach-task-delete="' + escapeAttribute(id) + '">Delete</button>') +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function resolveFormName(formId) {
    var id = String(formId || "").trim();
    if (!id) {
      return "None";
    }
    var match = (state.forms || []).find(function (entry) {
      return String(entry && entry.id || "") === id;
    });
    return match && match.name ? match.name : "Unknown form";
  }

  function renderAttachedFormOptions(selectedId) {
    var select = document.querySelector("[data-coach-task-create-attached-form]");
    if (!select) {
      return;
    }
    var selected = String(selectedId || "").trim();
    var options = ['<option value="">No attached form</option>'];
    (state.forms || []).forEach(function (form) {
      var id = String(form && form.id || "").trim();
      var name = String(form && form.name || "").trim();
      if (!id || !name) {
        return;
      }
      options.push('<option value="' + escapeAttribute(id) + '"' + (selected === id ? ' selected' : '') + '>' + escapeHtml(name) + '</option>');
    });
    select.innerHTML = options.join("");
  }

  function renderQuestionList() {
    var container = document.querySelector("[data-coach-task-question-list]");
    if (!container) {
      return;
    }

    if (!state.questionDrafts.length) {
      container.innerHTML = '<p class="admin-loading">No form questions yet.</p>';
      return;
    }

    container.innerHTML = state.questionDrafts.map(function (question, index) {
      var optionsValue = Array.isArray(question.options)
        ? question.options.join(", ")
        : "";
      return (
        '<div class="admin-overview-item">' +
          '<div class="admin-modal-info-row">' +
            '<label>Question Label</label>' +
            '<input class="admin-search" type="text" data-q-field="label" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.label || "") + '" placeholder="e.g. Weekly Reflection" />' +
          '</div>' +
          '<div class="admin-modal-info-row">' +
            '<label>Question Key (optional)</label>' +
            '<input class="admin-search" type="text" data-q-field="key" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.key || "") + '" placeholder="e.g. weekly_reflection" />' +
          '</div>' +
          '<div class="admin-modal-info-row">' +
            '<label>Field Type</label>' +
            '<select class="admin-search" data-q-field="type" data-q-index="' + String(index) + '">' +
              buildQuestionTypeOptions(question.type) +
            '</select>' +
          '</div>' +
          '<div class="admin-modal-info-row">' +
            '<label>Placeholder (optional)</label>' +
            '<input class="admin-search" type="text" data-q-field="placeholder" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.placeholder || "") + '" placeholder="Optional helper text" />' +
          '</div>' +
          '<div class="admin-modal-info-row">' +
            '<label>Options (comma separated, for select)</label>' +
            '<input class="admin-search" type="text" data-q-field="options" data-q-index="' + String(index) + '" value="' + escapeAttribute(optionsValue) + '" placeholder="Low, Moderate, High" />' +
          '</div>' +
          '<div class="admin-controls-actions">' +
            '<label style="display:flex;align-items:center;gap:0.4rem;">' +
              '<input type="checkbox" data-q-field="required" data-q-index="' + String(index) + '"' + (question.required ? ' checked' : '') + ' /> Required' +
            '</label>' +
            '<button type="button" class="btn admin-btn-small" data-coach-task-question-remove="' + String(index) + '">Remove</button>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function buildQuestionTypeOptions(selectedType) {
    var selected = String(selectedType || "text").trim().toLowerCase();
    var options = ["text", "textarea", "number", "date", "select", "checkbox"];
    return options.map(function (type) {
      var isSelected = type === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(type) + '"' + isSelected + '>' + escapeHtml(type) + '</option>';
    }).join("");
  }

  function createEmptyQuestionDraft() {
    return {
      label: "",
      key: "",
      type: "text",
      placeholder: "",
      options: [],
      required: false
    };
  }

  function onQuestionDraftInput(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) {
      return;
    }

    var field = String(target.getAttribute("data-q-field") || "").trim();
    var index = parseInt(String(target.getAttribute("data-q-index") || "-1"), 10);
    if (!field || !Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
      return;
    }

    var question = state.questionDrafts[index] || createEmptyQuestionDraft();
    if (field === "required") {
      question.required = !!target.checked;
    } else if (field === "options") {
      question.options = String(target.value || "")
        .split(",")
        .map(function (item) { return String(item || "").trim(); })
        .filter(Boolean);
    } else {
      question[field] = String(target.value || "").trim();
    }

    state.questionDrafts[index] = question;
  }

  function startEditingTemplate(templateId) {
    var id = String(templateId || "").trim();
    if (!id) {
      return;
    }

    var template = (state.templates || []).find(function (entry) {
      return String(entry && entry.id || "") === id;
    });
    if (!template) {
      setStatus("Task template was not found.", "error");
      return;
    }

    state.editingTemplateId = id;

    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");
    var attachedFormInput = document.querySelector("[data-coach-task-create-attached-form]");

    if (titleInput) titleInput.value = String(template.name || "");
    if (descriptionInput) descriptionInput.value = String(template.description || "");
    if (actionLabelInput) actionLabelInput.value = String(template.action_label || "");
    if (actionUrlInput) actionUrlInput.value = String(template.action_url || "");
    if (attachedFormInput) {
      renderAttachedFormOptions(String(template.attached_form_id || ""));
    }
    updateCreateActionButtons();
    setStatus("Editing task template.", "info");
  }

  function onDeleteTemplate(templateId) {
    var id = String(templateId || "").trim();
    if (!id) {
      return;
    }

    state.templates = (state.templates || []).filter(function (template) {
      return String(template && template.id || "") !== id;
    });

    writeTemplates(state.templates);
    renderTemplateList();
    setStatus("Task template deleted.", "success");
  }

  function onCreateTemplate() {
    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");
    var attachedFormInput = document.querySelector("[data-coach-task-create-attached-form]");

    var name = String(titleInput && titleInput.value || "").trim();
    var description = String(descriptionInput && descriptionInput.value || "").trim();
    var actionLabel = String(actionLabelInput && actionLabelInput.value || "").trim();
    var actionUrl = String(actionUrlInput && actionUrlInput.value || "").trim();
    var attachedFormId = String(attachedFormInput && attachedFormInput.value || "").trim();

    if (!name) {
      setStatus("Enter a task title.", "error");
      return;
    }

    var isEditing = !!state.editingTemplateId;

    var id = isEditing ? state.editingTemplateId : ("coach-task-template-" + Date.now());
    var next = {
      id: id,
      name: name,
      description: description,
      task_type: "custom_task",
      action_label: actionLabel,
      action_url: actionUrl,
      action_target: "_self",
      attached_form_id: attachedFormId,
      questions: []
    };

    if (isEditing) {
      state.templates = (state.templates || []).map(function (template) {
        return String(template && template.id || "") === id ? sanitizeTemplate(next) : template;
      });
    } else {
      state.templates = [sanitizeTemplate(next)].concat(state.templates || []);
    }

    writeTemplates(state.templates);
    renderTemplateList();
    clearCreateForm();
    setStatus(isEditing ? "Task template updated." : "Task template saved.", "success");
  }

  function clearCreateForm() {
    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");
    var attachedFormInput = document.querySelector("[data-coach-task-create-attached-form]");

    if (titleInput) titleInput.value = "";
    if (descriptionInput) descriptionInput.value = "";
    if (actionLabelInput) actionLabelInput.value = "";
    if (actionUrlInput) actionUrlInput.value = "";
    if (attachedFormInput) {
      renderAttachedFormOptions("");
    }

    resetEditingState();
    updateCreateActionButtons();
  }

  function resetEditingState() {
    state.editingTemplateId = "";
  }

  function updateCreateActionButtons() {
    var saveBtn = document.querySelector("[data-coach-task-create]");
    var cancelEditBtn = document.querySelector("[data-coach-task-cancel-edit]");
    var isEditing = !!state.editingTemplateId;

    if (saveBtn) {
      saveBtn.textContent = isEditing ? "Save Task Changes" : "Save Task Template";
    }

    if (cancelEditBtn) {
      cancelEditBtn.hidden = !isEditing;
    }
  }

  function collectQuestionsFromDrafts() {
    return sanitizeQuestions((state.questionDrafts || []).map(function (question, index) {
      var label = String(question && question.label || "").trim();
      var key = String(question && question.key || "").trim() || slugifyQuestionKey(label || ("question-" + String(index + 1)));
      return {
        label: label,
        key: key,
        type: String(question && question.type || "text").trim().toLowerCase(),
        placeholder: String(question && question.placeholder || "").trim(),
        required: question && question.required === true,
        options: Array.isArray(question && question.options) ? question.options : String(question && question.options || "").split(",")
      };
    }));
  }

  function slugifyQuestionKey(value) {
    var text = String(value || "").trim().toLowerCase();
    if (!text) {
      return "question_" + String(Date.now());
    }

    return text
      .replace(/[^a-z0-9\s_-]/g, "")
      .replace(/[\s-]+/g, "_")
      .replace(/^_+|_+$/g, "") || ("question_" + String(Date.now()));
  }

  function setStatus(message, variant) {
    var status = document.querySelector("[data-coach-task-status]");
    if (!status) {
      return;
    }

    status.textContent = String(message || "");
    status.classList.remove("is-error", "is-success", "is-info");
    if (!message) {
      return;
    }

    if (variant === "error") {
      status.classList.add("is-error");
    } else if (variant === "success") {
      status.classList.add("is-success");
    } else {
      status.classList.add("is-info");
    }
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
