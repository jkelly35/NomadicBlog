(function () {
  "use strict";

  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var COACH_FORMS_TEMPLATE_KEY = "nomadic_coach_forms_templates_v1";

  var state = {
    client: null,
    coachUser: null,
    templates: [],
    editingTemplateId: "",
    templateSearchTerm: "",
    questionDrafts: []
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
      renderTemplateList();
      renderQuestionList();
      updateCreateActionButtons();
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
        id: "default-liability-waiver-v1",
        name: "Liability Waiver",
        description: "Required waiver acknowledging risk, medical clearance responsibility, and agreement to proceed.",
        task_type: "liability_waiver",
        questions: [
          {
            key: "waiver_statement",
            label: "Nomadic Performance Liability Waiver",
            type: "statement",
            content: "By participating in any training, coaching, rehabilitation, or related activities provided by Nomadic Performance, you acknowledge and agree to the following:\n\n1) Assumption of Risk\nI understand that physical training and outdoor sport preparation involve inherent risks, including but not limited to falls, strains, sprains, fractures, illness, and in rare cases serious injury or death. I voluntarily assume all such risks.\n\n2) Medical Readiness\nI confirm that I am medically able to participate, and I will disclose relevant medical conditions, medications, injuries, or restrictions to my coach or provider.\n\n3) Personal Responsibility\nI agree to train within my limits, follow coaching instructions to the best of my ability, and stop any activity that causes unusual pain, dizziness, or concerning symptoms.\n\n4) Limitation of Liability\nTo the fullest extent permitted by law, I release and hold harmless Nomadic Performance and its owners, coaches, contractors, and affiliates from claims or liabilities arising from my participation, except in cases of gross negligence or willful misconduct.\n\n5) Emergency and Safety Acknowledgement\nI understand I am responsible for maintaining a safe training environment, using equipment appropriately, and seeking emergency care when needed.\n\n6) Voluntary Agreement\nI have read this waiver, understand its contents, and agree voluntarily without coercion.",
            required: false
          },
          {
            key: "legal_name",
            label: "Legal Full Name",
            type: "text",
            required: true,
            placeholder: "First and last name"
          },
          {
            key: "dob",
            label: "Date of Birth",
            type: "date",
            required: true
          },
          {
            key: "waiver_acknowledgement",
            label: "Liability Waiver Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I have read and agree to the Nomadic Performance liability waiver."
            ]
          },
          {
            key: "medical_clearance_acknowledgement",
            label: "Medical Clearance Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I confirm I am medically cleared to participate in training and will disclose relevant conditions."
            ]
          },
          {
            key: "signature_name",
            label: "Electronic Signature (Type Full Name)",
            type: "text",
            required: true,
            placeholder: "Type your full legal name"
          },
          {
            key: "signed_at_date",
            label: "Signature Date",
            type: "date",
            required: true
          }
        ]
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
      },
      {
        id: "par-q-plus-screen-v1",
        name: "PAR-Q+ Pre-Screen",
        description: "Readiness screen to identify potential medical red flags before training progression.",
        questions: [
          {
            key: "parq_statement",
            label: "Pre-Exercise Screening Notice",
            type: "statement",
            content: "Answer the following honestly. If you answer YES to any red-flag item, your coach may request medical clearance before you continue with higher-intensity training.",
            required: false
          },
          { key: "chest_pain_with_activity", label: "Do you experience chest pain during activity?", type: "select", options: ["No", "Yes"], required: true },
          { key: "dizziness_or_fainting", label: "Do you experience dizziness, fainting, or unexplained shortness of breath?", type: "select", options: ["No", "Yes"], required: true },
          { key: "known_cardiac_condition", label: "Have you been told you have a heart or cardiovascular condition?", type: "select", options: ["No", "Yes"], required: true },
          { key: "taking_related_medication", label: "Are you taking medication that may affect exercise tolerance?", type: "select", options: ["No", "Yes"], required: true },
          { key: "physician_advice_limit_activity", label: "Has a provider advised you to limit or avoid physical activity?", type: "select", options: ["No", "Yes"], required: true },
          { key: "parq_additional_notes", label: "Additional details", type: "textarea", rows: 3, placeholder: "Include any details that help your coach keep training safe." }
        ]
      },
      {
        id: "medical-injury-history-v1",
        name: "Medical and Injury History",
        description: "Capture injury history, current symptoms, and provider context to guide safe programming.",
        questions: [
          { key: "current_injury_or_pain", label: "Current Injury or Pain", type: "textarea", rows: 3, required: true, placeholder: "Body region, sensation, and current severity." },
          { key: "injury_mechanism", label: "How did it start?", type: "textarea", rows: 3, placeholder: "Gradual onset, acute incident, overuse, etc." },
          { key: "aggravating_activities", label: "What makes symptoms worse?", type: "textarea", rows: 2 },
          { key: "easing_activities", label: "What helps symptoms improve?", type: "textarea", rows: 2 },
          { key: "prior_surgeries_or_major_injuries", label: "Prior Surgeries or Major Injuries", type: "textarea", rows: 3 },
          { key: "imaging_or_diagnosis", label: "Imaging or Diagnosis", type: "textarea", rows: 2, placeholder: "MRI, X-ray, PT diagnosis, etc." },
          { key: "current_provider_name", label: "Current Medical Provider (if any)", type: "text", placeholder: "Provider name or clinic" },
          { key: "provider_guidance", label: "Provider Guidance / Restrictions", type: "textarea", rows: 2 }
        ]
      },
      {
        id: "informed-consent-coaching-v1",
        name: "Informed Consent for Coaching",
        description: "Consent to coaching scope, communication, and athlete responsibilities.",
        questions: [
          {
            key: "coaching_consent_statement",
            label: "Coaching Consent Statement",
            type: "statement",
            content: "I understand this service provides coaching and educational guidance for performance and training. It does not replace individualized medical diagnosis or treatment. I agree to communicate honestly, follow guidance to the best of my ability, and report symptoms that may require plan modification.",
            required: false
          },
          {
            key: "consent_acknowledgement",
            label: "Consent Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I understand and agree to the coaching scope and my responsibilities as an athlete."
            ]
          },
          {
            key: "communication_consent",
            label: "Communication Consent",
            type: "checkbox",
            required: true,
            options: [
              "I consent to receive coaching communications related to my training plan and progress."
            ]
          },
          { key: "consent_signature_name", label: "Electronic Signature (Type Full Name)", type: "text", required: true, placeholder: "Type your full legal name" },
          { key: "consent_signature_date", label: "Signature Date", type: "date", required: true }
        ]
      },
      {
        id: "emergency-contact-health-v1",
        name: "Emergency Contact and Health Info",
        description: "Critical contact and health context for safety planning.",
        questions: [
          { key: "emergency_contact_name", label: "Emergency Contact Name", type: "text", required: true },
          { key: "emergency_contact_relationship", label: "Relationship", type: "text", required: true, placeholder: "Parent, spouse, partner, friend" },
          { key: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", required: true },
          { key: "known_allergies", label: "Known Allergies", type: "textarea", rows: 2, placeholder: "Food, medication, environmental, or none." },
          { key: "health_conditions", label: "Relevant Health Conditions", type: "textarea", rows: 2 },
          { key: "current_medications", label: "Current Medications", type: "textarea", rows: 2 },
          { key: "training_environment_notes", label: "Training Environment Notes", type: "textarea", rows: 2, placeholder: "Home gym, climbing gym, trail setting, etc." }
        ]
      },
      {
        id: "weekly-check-in-v1",
        name: "Weekly Check-In",
        description: "Recurring check-in for adherence, recovery, and coach feedback.",
        questions: [
          { key: "week_of", label: "Week Of", type: "date", required: true },
          { key: "sessions_completed", label: "Sessions Completed", type: "number", min: 0, max: 21, step: 1, required: true },
          { key: "avg_session_rpe", label: "Average Session RPE", type: "number", min: 1, max: 10, step: 0.5, required: true },
          { key: "sleep_quality", label: "Sleep Quality", type: "select", options: ["Poor", "Fair", "Good", "Excellent"], required: true },
          { key: "stress_level", label: "Stress Level", type: "select", options: ["Low", "Moderate", "High", "Very High"], required: true },
          { key: "pain_or_symptom_flags", label: "Pain or Symptom Flags", type: "textarea", rows: 2, placeholder: "Where, when, and how severe?" },
          { key: "weekly_win", label: "Biggest Win This Week", type: "textarea", rows: 2 },
          { key: "coach_question", label: "Question for Coach", type: "textarea", rows: 2 }
        ]
      },
      {
        id: "goal-definition-success-v1",
        name: "Goal Definition and Success Criteria",
        description: "Define primary goals, constraints, and measurable success criteria.",
        questions: [
          { key: "primary_goal", label: "Primary Goal", type: "text", required: true, placeholder: "What matters most this cycle?" },
          { key: "secondary_goals", label: "Secondary Goals", type: "textarea", rows: 2 },
          { key: "target_event_name", label: "Target Event / Milestone", type: "text" },
          { key: "target_date", label: "Target Date", type: "date" },
          { key: "success_looks_like", label: "What does success look like?", type: "textarea", rows: 3, required: true },
          { key: "top_constraints", label: "Top Constraints", type: "textarea", rows: 2, placeholder: "Time, equipment, recovery, travel, etc." },
          { key: "confidence_score", label: "Confidence (1-10)", type: "number", min: 1, max: 10, step: 1, required: true },
          { key: "non_negotiables", label: "Non-Negotiables", type: "textarea", rows: 2, placeholder: "What must stay true during this plan?" }
        ]
      }
    ];
  }

  function readTemplates() {
    var defaults = getDefaultTemplates().map(sanitizeTemplate);
    try {
      var raw = window.localStorage.getItem(COACH_FORMS_TEMPLATE_KEY);
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
      name: String(entry && entry.name || "Untitled Form").trim(),
      description: String(entry && entry.description || "").trim(),
      task_type: "form_template",
      action_label: String(entry && entry.action_label || "").trim(),
      action_url: String(entry && entry.action_url || "").trim(),
      action_target: "_self",
      questions: sanitizeQuestions(entry && entry.questions)
    };
  }

  function sanitizeQuestions(rawQuestions) {
    var source = Array.isArray(rawQuestions) ? rawQuestions : [];
    return source.map(function (question, index) {
      var label = String(question && question.label || "").trim();
      var key = String(question && question.key || "").trim() || slugifyQuestionKey(label || "question-" + String(index + 1));
      var type = String(question && question.type || "text").trim().toLowerCase();
      var normalizedType = ["text", "textarea", "number", "date", "select", "checkbox", "statement"].indexOf(type) > -1 ? type : "text";
      var options = Array.isArray(question && question.options)
        ? question.options.map(function (value) { return String(value || "").trim(); }).filter(Boolean)
        : [];
      return {
        key: key,
        label: label || key,
        type: normalizedType,
        required: question && question.required === true,
        placeholder: String(question && question.placeholder || "").trim(),
        content: String(question && question.content || "").trim(),
        options: options
      };
    }).filter(function (question) {
      return !!String(question && question.label || "").trim();
    });
  }

  function writeTemplates(templates) {
    try {
      window.localStorage.setItem(COACH_FORMS_TEMPLATE_KEY, JSON.stringify(templates));
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

    var previewToggle = document.querySelector("[data-coach-form-preview-toggle]");
    if (previewToggle) {
      previewToggle.addEventListener("change", renderFormPreview);
    }

    var cancelEditBtn = document.querySelector("[data-coach-task-cancel-edit]");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", function () {
        resetEditingState();
        clearCreateForm();
        setStatus("Edit cancelled.", "info");
      });
    }

    document.querySelectorAll("[data-coach-task-add-question-type]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var type = String(btn.getAttribute("data-coach-task-add-question-type") || "text").trim().toLowerCase();
        state.questionDrafts.push(createEmptyQuestionDraft(type));
        renderQuestionList();
      });
    });

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

    var questionList = document.querySelector("[data-coach-task-question-list]");
    if (questionList) {
      questionList.addEventListener("click", function (event) {
        var moveBtn = event.target && event.target.closest("[data-coach-task-question-move]");
        if (moveBtn) {
          var moveIndex = parseInt(moveBtn.getAttribute("data-q-index") || "-1", 10);
          var direction = String(moveBtn.getAttribute("data-coach-task-question-move") || "");
          moveQuestionDraft(moveIndex, direction);
          return;
        }

        var duplicateBtn = event.target && event.target.closest("[data-coach-task-question-duplicate]");
        if (duplicateBtn) {
          var duplicateIndex = parseInt(duplicateBtn.getAttribute("data-q-index") || "-1", 10);
          duplicateQuestionDraft(duplicateIndex);
          return;
        }

        var removeBtn = event.target && event.target.closest("[data-coach-task-question-remove]");
        if (!removeBtn) {
          return;
        }

        var index = parseInt(removeBtn.getAttribute("data-coach-task-question-remove") || "-1", 10);
        if (!Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
          return;
        }

        state.questionDrafts.splice(index, 1);
        renderQuestionList();
      });

      questionList.addEventListener("input", onQuestionDraftInput);
      questionList.addEventListener("change", onQuestionDraftInput);
    }

    [
      "[data-coach-task-create-title]",
      "[data-coach-task-create-description]",
      "[data-coach-task-create-action-label]",
      "[data-coach-task-create-action-url]"
    ].forEach(function (selector) {
      var input = document.querySelector(selector);
      if (!input) {
        return;
      }
      input.addEventListener("input", renderFormPreview);
      input.addEventListener("change", renderFormPreview);
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
      container.innerHTML = '<p class="admin-loading">No matching form templates.</p>';
      return;
    }

    container.innerHTML = templates.map(function (template) {
      var id = String(template && template.id || "");
      var isDefault = id === "default-liability-waiver-v1" || id === "founding-member-intake-v1" || id === "performance-readiness-screen-v1";
      return (
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">' + escapeHtml(template.name || "Form") + '</p>' +
            '<p class="admin-overview-item-meta">' + escapeHtml(template.description || "No description") + '</p>' +
            '<p class="admin-overview-item-meta">Form fields: ' + escapeHtml(String(Array.isArray(template.questions) ? template.questions.length : 0)) + '</p>' +
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
      var normalizedType = String(question && question.type || "text").trim().toLowerCase();
      var optionsValue = Array.isArray(question.options)
        ? question.options.join(", ")
        : "";
      return (
        '<div class="admin-overview-item coach-forms-question-card">' +
          '<div class="coach-forms-question-head">' +
            '<p class="coach-forms-question-index">Question ' + escapeHtml(String(index + 1)) + '</p>' +
            '<div class="coach-forms-question-actions">' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-move="up" data-q-index="' + String(index) + '"' + (index === 0 ? ' disabled' : '') + '>↑</button>' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-move="down" data-q-index="' + String(index) + '"' + (index === state.questionDrafts.length - 1 ? ' disabled' : '') + '>↓</button>' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-duplicate data-q-index="' + String(index) + '">Duplicate</button>' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-remove="' + String(index) + '">Delete</button>' +
            '</div>' +
          '</div>' +
          '<div class="coach-forms-question-grid">' +
            '<div class="admin-modal-info-row">' +
              '<label>Question Label</label>' +
              '<input class="admin-search" type="text" data-q-field="label" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.label || "") + '" placeholder="e.g. Weekly Reflection" />' +
            '</div>' +
            '<div class="admin-modal-info-row">' +
              '<label>Field Type</label>' +
              '<select class="admin-search" data-q-field="type" data-q-index="' + String(index) + '">' +
                buildQuestionTypeOptions(question.type) +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="admin-modal-info-row"' + (normalizedType === "statement" ? ' hidden' : '') + '>' +
            '<label>Question Key (optional)</label>' +
            '<input class="admin-search" type="text" data-q-field="key" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.key || "") + '" placeholder="e.g. weekly_reflection" />' +
          '</div>' +
          '<div class="admin-modal-info-row"' + (normalizedType === "statement" ? ' hidden' : '') + '>' +
            '<label>Placeholder (optional)</label>' +
            '<input class="admin-search" type="text" data-q-field="placeholder" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.placeholder || "") + '" placeholder="Optional helper text" />' +
          '</div>' +
          '<div class="admin-modal-info-row"' + (normalizedType === "statement" ? '' : ' hidden') + '>' +
            '<label>Statement Content</label>' +
            '<textarea class="admin-search" rows="10" data-q-field="content" data-q-index="' + String(index) + '" placeholder="Paste waiver or instructional text here">' + escapeHtml(String(question.content || "")) + '</textarea>' +
          '</div>' +
          '<div class="admin-modal-info-row"' + ((normalizedType === "select" || normalizedType === "checkbox") ? '' : ' hidden') + '>' +
            '<label>Options (comma separated, for select)</label>' +
            '<input class="admin-search" type="text" data-q-field="options" data-q-index="' + String(index) + '" value="' + escapeAttribute(optionsValue) + '" placeholder="Low, Moderate, High" />' +
          '</div>' +
          '<div class="admin-controls-actions coach-forms-question-foot"' + (normalizedType === "statement" ? ' hidden' : '') + '>' +
            '<label style="display:flex;align-items:center;gap:0.4rem;">' +
              '<input type="checkbox" data-q-field="required" data-q-index="' + String(index) + '"' + (question.required ? ' checked' : '') + ' /> Required' +
            '</label>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    renderFormPreview();
  }

  function buildQuestionTypeOptions(selectedType) {
    var selected = String(selectedType || "text").trim().toLowerCase();
    var options = ["text", "textarea", "number", "date", "select", "checkbox", "statement"];
    return options.map(function (type) {
      var isSelected = type === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(type) + '"' + isSelected + '>' + escapeHtml(type) + '</option>';
    }).join("");
  }

  function createEmptyQuestionDraft(typeValue) {
    var type = String(typeValue || "text").trim().toLowerCase();
    var normalizedType = ["text", "textarea", "number", "date", "select", "checkbox", "statement"].indexOf(type) > -1 ? type : "text";
    return {
      label: "",
      key: "",
      type: normalizedType,
      placeholder: "",
      content: "",
      options: normalizedType === "select" || normalizedType === "checkbox" ? ["Option 1"] : [],
      required: false
    };
  }

  function duplicateQuestionDraft(index) {
    if (!Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
      return;
    }
    var copy = JSON.parse(JSON.stringify(state.questionDrafts[index] || createEmptyQuestionDraft()));
    state.questionDrafts.splice(index + 1, 0, copy);
    renderQuestionList();
  }

  function moveQuestionDraft(index, direction) {
    if (!Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
      return;
    }
    var toIndex = direction === "up" ? index - 1 : direction === "down" ? index + 1 : index;
    if (toIndex < 0 || toIndex >= state.questionDrafts.length || toIndex === index) {
      return;
    }

    var list = state.questionDrafts.slice();
    var moved = list.splice(index, 1)[0];
    list.splice(toIndex, 0, moved);
    state.questionDrafts = list;
    renderQuestionList();
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
    renderFormPreview();
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
      setStatus("Form template was not found.", "error");
      return;
    }

    state.editingTemplateId = id;

    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");

    if (titleInput) titleInput.value = String(template.name || "");
    if (descriptionInput) descriptionInput.value = String(template.description || "");
    if (actionLabelInput) actionLabelInput.value = String(template.action_label || "");
    if (actionUrlInput) actionUrlInput.value = String(template.action_url || "");

    state.questionDrafts = sanitizeQuestions(template.questions).map(function (question) {
      return {
        label: String(question.label || ""),
        key: String(question.key || ""),
        type: String(question.type || "text"),
        placeholder: String(question.placeholder || ""),
        options: Array.isArray(question.options) ? question.options.slice() : [],
        required: question.required === true
      };
    });

    renderQuestionList();
    updateCreateActionButtons();
    setStatus("Editing form template.", "info");
    renderFormPreview();
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
    setStatus("Form template deleted.", "success");
  }

  function onCreateTemplate() {
    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");

    var name = String(titleInput && titleInput.value || "").trim();
    var description = String(descriptionInput && descriptionInput.value || "").trim();
    var actionLabel = String(actionLabelInput && actionLabelInput.value || "").trim();
    var actionUrl = String(actionUrlInput && actionUrlInput.value || "").trim();

    if (!name) {
      setStatus("Enter a form title.", "error");
      return;
    }

    var questions = collectQuestionsFromDrafts();
    var isEditing = !!state.editingTemplateId;

    var id = isEditing ? state.editingTemplateId : ("coach-form-template-" + Date.now());
    var next = {
      id: id,
      name: name,
      description: description,
      task_type: "form_template",
      action_label: actionLabel,
      action_url: actionUrl,
      action_target: "_self",
      questions: questions
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
    setStatus(isEditing ? "Form template updated." : "Form template saved.", "success");
    renderFormPreview();
  }

  function clearCreateForm() {
    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");

    if (titleInput) titleInput.value = "";
    if (descriptionInput) descriptionInput.value = "";
    if (actionLabelInput) actionLabelInput.value = "";
    if (actionUrlInput) actionUrlInput.value = "";

    resetEditingState();
    state.questionDrafts = [];
    renderQuestionList();
    updateCreateActionButtons();
    renderFormPreview();
  }

  function renderFormPreview() {
    var preview = document.querySelector("[data-coach-form-preview]");
    var toggle = document.querySelector("[data-coach-form-preview-toggle]");
    var enabled = !toggle || !!toggle.checked;
    if (!preview) {
      return;
    }

    if (!enabled) {
      preview.innerHTML = '<p class="admin-loading">Preview is off.</p>';
      return;
    }

    var title = String((document.querySelector("[data-coach-task-create-title]") || {}).value || "").trim() || "Untitled Form";
    var description = String((document.querySelector("[data-coach-task-create-description]") || {}).value || "").trim();
    var questions = sanitizeQuestions(state.questionDrafts || []);

    preview.innerHTML = [
      '<div class="coach-forms-preview-card">',
      '<h3>' + escapeHtml(title) + '</h3>',
      description ? '<p>' + escapeHtml(description) + '</p>' : '<p class="coach-forms-preview-muted">No description yet.</p>',
      questions.length
        ? '<div class="coach-forms-preview-fields">' + questions.map(function (question, index) {
            return [
              '<label class="coach-forms-preview-field">',
              '<span>' + escapeHtml(String(index + 1) + '. ' + (question.label || question.key || 'Question')) + (question.required ? ' *' : '') + '</span>',
              buildPreviewField(question),
              '</label>'
            ].join('');
          }).join('') + '</div>'
        : '<p class="coach-forms-preview-muted">Add questions to see the athlete experience.</p>',
      '</div>'
    ].join('');
  }

  function buildPreviewField(question) {
    var type = String(question && question.type || "text").trim().toLowerCase();
    var placeholder = String(question && question.placeholder || "").trim();
    var options = Array.isArray(question && question.options) ? question.options : [];

    if (type === "textarea") {
      return '<textarea class="admin-search" rows="3" placeholder="' + escapeAttribute(placeholder || 'Your response') + '" disabled></textarea>';
    }
    if (type === "statement") {
      var content = String(question && question.content || "").trim();
      if (!content) {
        return '<p class="coach-forms-preview-muted">No statement content yet.</p>';
      }
      return '<div class="coach-forms-preview-statement">' + escapeHtml(content).replace(/\n/g, '<br />') + '</div>';
    }
    if (type === "number") {
      return '<input class="admin-search" type="number" placeholder="' + escapeAttribute(placeholder || '0') + '" disabled />';
    }
    if (type === "date") {
      return '<input class="admin-search" type="date" disabled />';
    }
    if (type === "select") {
      return '<select class="admin-search" disabled>' +
        '<option value="">Select an option</option>' +
        options.map(function (option) {
          return '<option>' + escapeHtml(option) + '</option>';
        }).join('') +
      '</select>';
    }
    if (type === "checkbox") {
      if (!options.length) {
        return '<label style="display:flex;align-items:center;gap:0.4rem;"><input type="checkbox" disabled /> <span>Option</span></label>';
      }
      return '<div class="coach-forms-preview-checkboxes">' + options.map(function (option) {
        return '<label style="display:flex;align-items:center;gap:0.4rem;"><input type="checkbox" disabled /> <span>' + escapeHtml(option) + '</span></label>';
      }).join('') + '</div>';
    }
    return '<input class="admin-search" type="text" placeholder="' + escapeAttribute(placeholder || 'Your response') + '" disabled />';
  }

  function resetEditingState() {
    state.editingTemplateId = "";
  }

  function updateCreateActionButtons() {
    var saveBtn = document.querySelector("[data-coach-task-create]");
    var cancelEditBtn = document.querySelector("[data-coach-task-cancel-edit]");
    var isEditing = !!state.editingTemplateId;

    if (saveBtn) {
      saveBtn.textContent = isEditing ? "Save Form Changes" : "Save Form Template";
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
