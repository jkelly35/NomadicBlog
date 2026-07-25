(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_DRAFT_PREFIX = "nomadic_training_program_template_builder_draft_";
  var WORKOUT_BLOCK_LIBRARY_KEY = "nomadic_template_workout_blocks_v1";
  var DEFAULT_SECTION = "A Block";
  var DEFAULT_MODE = "reps";
  var SECTION_OPTIONS = ["Warm Up", "A Block", "B Block", "C Block", "Cool Down"];
  var STARTER_LIBRARY_ITEMS = [
    {
      title: "Back Squat",
      section: "A Block",
      tags: ["strength", "lower-body", "compound"],
      exercises: [
        {
          name: "Back Squat",
          section: "A Block",
          mode: "reps",
          sets: [{ reps: "5", weight: "", rpe: "RPE 7", rest: "120s", notes: "Brace trunk, controlled descent.", done: false }]
        }
      ]
    },
    {
      title: "Weighted Pull-Up",
      section: "A Block",
      tags: ["strength", "upper-body", "climbing"],
      exercises: [
        {
          name: "Weighted Pull-Up",
          section: "A Block",
          mode: "reps",
          sets: [{ reps: "4", weight: "", rpe: "RPE 8", rest: "120s", notes: "Full hang start, no kip.", done: false }]
        }
      ]
    },
    {
      title: "RFESS",
      section: "B Block",
      tags: ["strength", "unilateral", "durability"],
      exercises: [
        {
          name: "Rear Foot Elevated Split Squat",
          section: "B Block",
          mode: "reps",
          sets: [{ reps: "8 / side", weight: "", rpe: "RPE 7", rest: "90s", notes: "Stay tall, control tempo.", done: false }]
        }
      ]
    },
    {
      title: "Zone 2 Run",
      section: "A Block",
      tags: ["endurance", "aerobic", "running"],
      exercises: [
        {
          name: "Zone 2 Run",
          section: "A Block",
          mode: "endurance",
          sets: [{ reps: "45:00", weight: "Zone 2", rpe: "Z2", rest: "", notes: "Conversational effort.", done: false }]
        }
      ]
    },
    {
      title: "Mobility Flow",
      section: "Cool Down",
      tags: ["mobility", "recovery"],
      exercises: [
        {
          name: "Mobility Flow",
          section: "Cool Down",
          mode: "time",
          sets: [{ reps: "10:00", weight: "", rpe: "Easy", rest: "", notes: "Slow breathing and full range.", done: false }]
        }
      ]
    }
  ];

  var state = {
    client: null,
    coachUserId: null,
    items: [],
    editingId: null,
    filterTag: "all",
    filterType: "all",
    draftExercises: []
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    bindEvents();
    state.draftExercises = [createDefaultExercise()];
    renderDraftExercises();

    state.client = createSupabaseClient();
    if (!state.client) {
      enterLocalFallback("Supabase is not configured. Using local-only exercise library.");
      return;
    }

    resolveCoachAccess()
      .then(function (access) {
        if (!access || !access.allowed || !access.user) {
          enterLocalFallback("Coach access is not available. Using local-only exercise library.");
          return;
        }

        state.coachUserId = String(access.user.id || "").trim() || null;
        if (!state.coachUserId) {
          enterLocalFallback("Could not verify coach account. Using local-only exercise library.");
          return;
        }

        showManager();
        loadDraftDayOptions();
        clearEditState();
        loadLibraryItems();
      })
      .catch(function (error) {
        enterLocalFallback(
          "Could not verify coach access. Using local-only mode." +
            (error && error.message ? " " + String(error.message) : "")
        );
      });
  }

  function enterLocalFallback(message) {
    state.client = null;
    state.coachUserId = null;
    showManager();
    loadDraftDayOptions();
    clearEditState();
    state.items = readItemsFromStorage();
    renderItems();
    setStatus(String(message || "Using local-only mode."), "info");
  }

  function resolveCoachAccess() {
    if (!state.client || !state.client.auth) {
      return Promise.resolve({ allowed: false, user: null });
    }

    return resolveCurrentUser().then(function (user) {
      if (!user) {
        return { allowed: false, user: null };
      }

      return resolveIsCoach(user).then(function (allowed) {
        return {
          allowed: !!allowed,
          user: user
        };
      });
    });
  }

  function resolveCurrentUser() {
    return state.client.auth.getSession()
      .then(function (result) {
        var session = result && result.data && result.data.session;
        if (session && session.user) {
          return session.user;
        }
        return resolveCurrentUserFallback();
      })
      .catch(function () {
        return resolveCurrentUserFallback();
      });
  }

  function resolveCurrentUserFallback() {
    if (!state.client || !state.client.auth || typeof state.client.auth.getUser !== "function") {
      return Promise.resolve(null);
    }

    return state.client.auth.getUser()
      .then(function (result) {
        return result && result.data && result.data.user ? result.data.user : null;
      })
      .catch(function () {
        return null;
      });
  }

  function resolveIsCoach(user) {
    var email = String(user && user.email || "").toLowerCase();
    if (email && email === ADMIN_EMAIL) {
      return Promise.resolve(true);
    }

    if (!state.client || !state.client.rpc) {
      return Promise.resolve(false);
    }

    return state.client.rpc("is_nomadic_admin")
      .then(function (result) {
        if (result && result.error) {
          return false;
        }
        return !!(result && result.data === true);
      })
      .catch(function () {
        return false;
      });
  }

  function bindEvents() {
    var saveBtn = document.querySelector("[data-block-save]");
    var cancelBtn = document.querySelector("[data-block-cancel-edit]");
    var filterInput = document.querySelector("[data-block-filter]");
    var typeFilterInput = document.querySelector("[data-block-type-filter]");
    var addExerciseBtn = document.querySelector("[data-block-add-exercise]");
    var importBtn = document.querySelector("[data-block-import]");
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    var titleInput = document.querySelector("[data-block-title]");

    if (saveBtn) {
      saveBtn.addEventListener("click", saveOrUpdateItem);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", clearEditState);
    }

    if (filterInput) {
      filterInput.addEventListener("change", function () {
        state.filterTag = String(filterInput.value || "all").trim() || "all";
        renderItems();
      });
    }

    if (typeFilterInput) {
      typeFilterInput.addEventListener("change", function () {
        state.filterType = normalizeFilterType(typeFilterInput.value);
        renderItems();
      });
    }

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener("click", function () {
        if (getSelectedEntryType() === "exercise" && state.draftExercises.length >= 1) {
          setStatus("Single exercise items can only contain one exercise.", "info");
          return;
        }

        state.draftExercises.push(createDefaultExercise());
        renderDraftExercises();
      });
    }

    if (importBtn) {
      importBtn.addEventListener("click", importExercisesFromDraft);
    }

    if (entryTypeInput) {
      entryTypeInput.addEventListener("change", function () {
        if (getSelectedEntryType() === "exercise" && state.draftExercises.length > 1) {
          state.draftExercises = [cloneExercise(state.draftExercises[0])];
        }
        if (getSelectedEntryType() === "exercise") {
          syncSingleExerciseFromInputs();
        }
        renderDraftExercises();
        toggleComposerForEntryType();
      });
    }

    if (titleInput) {
      titleInput.addEventListener("keydown", function (event) {
        if (!event || event.key !== "Enter") {
          return;
        }
        event.preventDefault();
        saveOrUpdateItem();
      });
    }

    document.addEventListener("click", function (event) {
      var editBtn = event.target && event.target.closest("[data-block-edit]");
      if (editBtn) {
        startEditingItem(String(editBtn.getAttribute("data-block-edit") || ""));
        return;
      }

      var deleteBtn = event.target && event.target.closest("[data-block-delete]");
      if (deleteBtn) {
        deleteItem(String(deleteBtn.getAttribute("data-block-delete") || ""));
        return;
      }

      var moveBtn = event.target && event.target.closest("[data-block-move]");
      if (moveBtn) {
        moveItem(
          String(moveBtn.getAttribute("data-block-id") || ""),
          String(moveBtn.getAttribute("data-block-move") || "")
        );
        return;
      }

      var removeExerciseBtn = event.target && event.target.closest("[data-block-exercise-remove]");
      if (removeExerciseBtn) {
        removeDraftExercise(removeExerciseBtn.getAttribute("data-block-exercise-remove"));
      }
    });

    document.addEventListener("change", function (event) {
      if (event && event.target && event.target.closest && event.target.closest("[data-block-single-fields]")) {
        syncSingleExerciseFromInputs();
        return;
      }

      var exerciseItem = event.target && event.target.closest && event.target.closest("[data-block-exercise-item]");
      if (!exerciseItem) {
        return;
      }

      var index = parseInt(exerciseItem.getAttribute("data-block-exercise-item") || "-1", 10);
      if (!Number.isFinite(index) || index < 0 || index >= state.draftExercises.length) {
        return;
      }

      updateDraftExerciseFromRow(index, exerciseItem);
    });
  }

  function toggleComposerForEntryType() {
    var entryType = getSelectedEntryType();
    var isExercise = entryType === "exercise";
    var importPanel = document.querySelector("[data-block-import-panel]");
    var singlePanel = document.querySelector("[data-block-single-fields]");
    var composerHeader = document.querySelector("[data-block-composer-header]");
    var exerciseList = document.querySelector("[data-block-exercise-list]");
    var addExerciseBtn = document.querySelector("[data-block-add-exercise]");

    if (importPanel) {
      importPanel.hidden = isExercise;
    }
    if (singlePanel) {
      singlePanel.hidden = !isExercise;
    }
    if (composerHeader) {
      composerHeader.hidden = isExercise;
    }
    if (exerciseList) {
      exerciseList.hidden = isExercise;
    }
    if (addExerciseBtn) {
      addExerciseBtn.hidden = isExercise;
    }

    if (isExercise) {
      populateSingleExerciseInputs();
    }
  }

  function populateSingleExerciseInputs() {
    var exercise = normalizeExercises(state.draftExercises || [])[0] || createDefaultExercise();
    var set = exercise && Array.isArray(exercise.sets) && exercise.sets[0] ? exercise.sets[0] : {};

    setInputValue("[data-block-single-section]", String(exercise.section || DEFAULT_SECTION));
    setInputValue("[data-block-single-mode]", String(exercise.mode || DEFAULT_MODE));
    setInputValue("[data-block-single-reps]", set.reps != null ? String(set.reps) : "");
    setInputValue("[data-block-single-weight]", set.weight != null ? String(set.weight) : "");
    setInputValue("[data-block-single-rpe]", set.rpe != null ? String(set.rpe) : "");
    setInputValue("[data-block-single-rest]", set.rest != null ? String(set.rest) : "");
    setInputValue("[data-block-single-description]", String(exercise.description || set.notes || ""));
    setInputValue("[data-block-single-video]", String(exercise.video_demo_url || ""));
  }

  function syncSingleExerciseFromInputs() {
    if (getSelectedEntryType() !== "exercise") {
      return;
    }

    var nameInput = document.querySelector("[data-block-title]");
    var title = String(nameInput && nameInput.value || "").trim();
    var description = readValue("[data-block-single-description]");
    var video = readValue("[data-block-single-video]");
    var reps = readValue("[data-block-single-reps]");
    var weight = readValue("[data-block-single-weight]");
    var rpe = readValue("[data-block-single-rpe]");
    var rest = readValue("[data-block-single-rest]");

    state.draftExercises = [normalizeExercises([{
      name: title || "Exercise",
      section: readValue("[data-block-single-section]") || DEFAULT_SECTION,
      mode: readValue("[data-block-single-mode]") || DEFAULT_MODE,
      description: description,
      video_demo_url: video,
      superset_group: null,
      field_toggles: null,
      sets: [{
        reps: reps,
        weight: weight,
        rpe: rpe,
        rest: rest,
        notes: description,
        done: false,
        target_reps: reps,
        target_weight: weight,
        target_rpe: rpe,
        target_rest: rest,
        target_notes: description
      }]
    }])[0]];
  }

  function readValue(selector) {
    var el = document.querySelector(selector);
    return String(el && el.value || "").trim();
  }

  function setInputValue(selector, value) {
    var el = document.querySelector(selector);
    if (el) {
      el.value = String(value || "");
    }
  }

  function showGuardMessage(message) {
    var guard = document.querySelector("[data-block-manager-guard]");
    var content = document.querySelector("[data-block-manager-content]");
    if (guard) {
      guard.hidden = false;
      guard.innerHTML = '<p class="admin-loading">' + escapeHtml(message) + '</p>';
    }
    if (content) {
      content.hidden = true;
    }
  }

  function showManager() {
    var guard = document.querySelector("[data-block-manager-guard]");
    var content = document.querySelector("[data-block-manager-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function loadDraftDayOptions() {
    var daySelect = document.querySelector("[data-block-source-day]");
    if (!daySelect) {
      return;
    }

    var draftDays = getTemplateDraftDays();
    daySelect.innerHTML = ['<option value="">Select a source day</option>']
      .concat(draftDays.map(function (day) {
        return '<option value="' + escapeAttribute(day) + '">' + escapeHtml(labelForSlot(day)) + '</option>';
      }))
      .join("");
  }

  function getTemplateDraftDays() {
    var days = [];
    var seen = {};
    try {
      for (var i = 0; i < window.localStorage.length; i += 1) {
        var key = window.localStorage.key(i);
        if (!key || key.indexOf(TEMPLATE_DRAFT_PREFIX) !== 0) {
          continue;
        }

        var slot = String(key).slice(TEMPLATE_DRAFT_PREFIX.length);
        if (!parseSlotKey(slot) || seen[slot]) {
          continue;
        }

        seen[slot] = true;
        days.push(slot);
      }
    } catch (error) {
      return [];
    }

    return days.sort(compareSlotKeysAsc);
  }

  function loadLibraryItems() {
    if (!state.client || !state.coachUserId) {
      state.items = readItemsFromStorage();
      if (!state.items.length) {
        seedStarterLibraryItems().then(function (seeded) {
          state.items = sortItems(seeded);
          writeItemsToStorage(state.items);
          renderItems();
          setStatus("Added starter preset exercises (local mode).", "success");
        });
        return;
      }

      renderItems();
      return;
    }

    state.items = readItemsFromStorage();
    renderItems();

    state.client
      .from("coach_workout_blocks")
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .eq("coach_user_id", state.coachUserId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (!state.items.length) {
            seedStarterLibraryItems().then(function (seeded) {
              state.items = sortItems(seeded);
              writeItemsToStorage(state.items);
              renderItems();
              setStatus("Added starter preset exercises.", "success");
            });
            return;
          }
          setStatus("Using local cache. Cloud read failed.", "info");
          return;
        }

        var cloudItems = normalizeCloudItems(result.data || []);
        mergeAndBackfillCloudItems(cloudItems).then(function (merged) {
          if (!merged.length) {
            seedStarterLibraryItems().then(function (seeded) {
              state.items = sortItems(seeded);
              writeItemsToStorage(state.items);
              renderItems();
              setStatus("Added starter preset exercises.", "success");
            });
            return;
          }

          state.items = sortItems(merged);
          writeItemsToStorage(state.items);
          renderItems();
          setStatus("Library loaded.", "success");
        });
      })
      .catch(function () {
        if (!state.items.length) {
          seedStarterLibraryItems().then(function (seeded) {
            state.items = sortItems(seeded);
            writeItemsToStorage(state.items);
            renderItems();
            setStatus("Added starter preset exercises.", "success");
          });
          return;
        }
        setStatus("Using local cache. Cloud read failed.", "info");
      });
  }

  function seedStarterLibraryItems() {
    var baseItems = STARTER_LIBRARY_ITEMS.map(function (item, index) {
      var now = new Date().toISOString();
      return {
        id: "seed_" + String(index + 1) + "_" + String(Date.now()) + "_" + String(Math.floor(Math.random() * 1000)),
        title: String(item && item.title || "Library Item"),
        section: String(item && item.section || DEFAULT_SECTION),
        tags: normalizeTags(item && item.tags || []),
        sort_order: index,
        exercises: normalizeExercises(item && item.exercises || []),
        created_at: now,
        updated_at: now
      };
    });

    if (!state.client || !state.coachUserId || !baseItems.length) {
      return Promise.resolve(baseItems);
    }

    return state.client
      .from("coach_workout_blocks")
      .insert(baseItems.map(function (item) { return buildCloudPayload(item); }))
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .then(function (result) {
        if (result && !result.error) {
          var inserted = normalizeCloudItems(result.data || []);
          if (inserted.length) {
            return sortItems(inserted);
          }
        }
        return baseItems;
      })
      .catch(function () {
        return baseItems;
      });
  }

  function mergeAndBackfillCloudItems(cloudItems) {
    var localItems = readItemsFromStorage();
    var signatures = {};
    cloudItems.forEach(function (item) {
      signatures[itemSignature(item)] = true;
    });

    var unsyncedItems = localItems.filter(function (item) {
      return !signatures[itemSignature(item)];
    });

    if (!unsyncedItems.length) {
      return Promise.resolve(cloudItems);
    }

    var rows = unsyncedItems.map(function (item) {
      return buildCloudPayload(item);
    });

    return state.client
      .from("coach_workout_blocks")
      .insert(rows)
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .then(function (result) {
        if (result.error) {
          return cloudItems;
        }
        return sortItems(cloudItems.concat(normalizeCloudItems(result.data || [])));
      })
      .catch(function () {
        return cloudItems;
      });
  }

  function saveOrUpdateItem() {
    var titleInput = document.querySelector("[data-block-title]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var title = String((titleInput && titleInput.value) || "").trim();
    var tags = parseTags((tagsInput && tagsInput.value) || "");
    var entryType = getSelectedEntryType();
    var exercises = normalizeExercises(state.draftExercises);

    if (!title) {
      setStatus("Title is required.", "error");
      if (titleInput) {
        titleInput.focus();
      }
      return;
    }

    if (!exercises.length) {
      setStatus("Add at least one exercise before saving.", "info");
      return;
    }

    if (entryType === "exercise" && exercises.length !== 1) {
      setStatus("Single exercise items must contain exactly one exercise.", "info");
      return;
    }

    var payload = {
      title: title,
      section: deriveItemSection(exercises, entryType),
      tags: tags,
      exercises: exercises
    };

    if (state.editingId) {
      updateItem(findItemById(state.editingId), payload);
      return;
    }

    createItem(payload);
  }

  function createItem(payload) {
    var localItem = {
      id: "block_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      title: payload.title,
      section: payload.section,
      tags: normalizeTags(payload.tags || []),
      sort_order: 0,
      exercises: normalizeExercises(payload.exercises || []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (!state.client || !state.coachUserId) {
      saveLocalOnly(localItem, "Saved locally.");
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .insert(buildCloudPayload(localItem))
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .single()
      .then(function (result) {
        if (result.error) {
          saveLocalOnly(localItem, "Saved locally. Cloud sync failed.");
          return;
        }

        state.items.unshift(mapCloudItem(result.data || {}));
        reindexItems();
        writeItemsToStorage(state.items);
        renderItems();
        clearEditState();
        setStatus("Saved item: " + localItem.title + ".", "success");
        persistOrderToCloud();
      })
      .catch(function () {
        saveLocalOnly(localItem, "Saved locally. Cloud sync failed.");
      });
  }

  function updateItem(existing, payload) {
    if (!existing) {
      setStatus("Library item not found.", "error");
      clearEditState();
      return;
    }

    var updated = {
      id: existing.id,
      title: payload.title,
      section: payload.section,
      tags: normalizeTags(payload.tags || []),
      sort_order: parseSortOrder(existing.sort_order),
      exercises: normalizeExercises(payload.exercises || existing.exercises || []),
      created_at: existing.created_at,
      updated_at: new Date().toISOString()
    };

    var applyLocal = function () {
      state.items = state.items.map(function (item) {
        return String(item.id) === String(updated.id) ? updated : item;
      });
      reindexItems();
      writeItemsToStorage(state.items);
      renderItems();
      clearEditState();
      setStatus("Updated item: " + updated.title + ".", "success");
      persistOrderToCloud();
    };

    if (!state.client || !state.coachUserId || !isUuid(existing.id)) {
      applyLocal();
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .update({
        title: updated.title,
        source_section: updated.section,
        tags: updated.tags,
        exercises: updated.exercises
      })
      .eq("id", existing.id)
      .eq("coach_user_id", state.coachUserId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message || "Could not update item.", "error");
          return;
        }
        applyLocal();
      })
      .catch(function () {
        setStatus("Could not update item.", "error");
      });
  }

  function saveLocalOnly(item, message) {
    state.items.unshift(item);
    reindexItems();
    writeItemsToStorage(state.items);
    renderItems();
    clearEditState();
    setStatus(message, "info");
  }

  function startEditingItem(itemId) {
    var item = findItemById(itemId);
    var titleInput = document.querySelector("[data-block-title]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    var saveButton = document.querySelector("[data-block-save]");
    var cancelButton = document.querySelector("[data-block-cancel-edit]");
    var dayInput = document.querySelector("[data-block-source-day]");

    if (!item) {
      return;
    }

    state.editingId = String(item.id || "");
    state.draftExercises = normalizeExercises(item.exercises || []);

    if (titleInput) {
      titleInput.value = String(item.title || "");
      titleInput.focus();
    }
    if (tagsInput) {
      tagsInput.value = normalizeTags(item.tags || []).join(", ");
    }
    if (entryTypeInput) {
      entryTypeInput.value = normalizeExercises(item.exercises || []).length === 1 ? "exercise" : "block";
    }
    if (saveButton) {
      saveButton.textContent = "Update Item";
    }
    if (cancelButton) {
      cancelButton.hidden = false;
    }
    if (dayInput) {
      dayInput.value = "";
    }

    renderDraftExercises();
    renderItems();
    setStatus("Editing item: " + String(item.title || "Library Item") + ".", "info");
  }

  function clearEditState() {
    var titleInput = document.querySelector("[data-block-title]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    var dayInput = document.querySelector("[data-block-source-day]");
    var sectionInput = document.querySelector("[data-block-section]");
    var saveButton = document.querySelector("[data-block-save]");
    var cancelButton = document.querySelector("[data-block-cancel-edit]");

    state.editingId = null;
    state.draftExercises = [createDefaultExercise()];

    if (titleInput) {
      titleInput.value = "";
    }
    if (tagsInput) {
      tagsInput.value = "";
    }
    if (entryTypeInput) {
      entryTypeInput.value = "exercise";
    }
    if (dayInput) {
      dayInput.value = "";
    }
    if (sectionInput) {
      sectionInput.value = DEFAULT_SECTION;
    }
    if (saveButton) {
      saveButton.textContent = "Save Item";
    }
    if (cancelButton) {
      cancelButton.hidden = true;
    }

    renderDraftExercises();
    renderItems();
  }

  function deleteItem(itemId) {
    var item = findItemById(itemId);
    if (!item) {
      return;
    }

    if (!confirm("Delete saved item '" + String(item.title || "Library Item") + "'?")) {
      return;
    }

    var removeLocal = function () {
      state.items = state.items.filter(function (entry) {
        return String(entry.id) !== String(itemId);
      });
      if (String(state.editingId || "") === String(itemId)) {
        clearEditState();
      }
      reindexItems();
      writeItemsToStorage(state.items);
      renderItems();
      setStatus("Library item deleted.", "info");
      persistOrderToCloud();
    };

    if (!state.client || !state.coachUserId || !isUuid(itemId)) {
      removeLocal();
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .delete()
      .eq("id", itemId)
      .eq("coach_user_id", state.coachUserId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message || "Could not delete item.", "error");
          return;
        }
        removeLocal();
      })
      .catch(function () {
        setStatus("Could not delete item.", "error");
      });
  }

  function moveItem(itemId, direction) {
    var delta = direction === "up" ? -1 : (direction === "down" ? 1 : 0);
    if (!delta) {
      return;
    }

    var ordered = sortItems(state.items);
    var index = ordered.findIndex(function (item) {
      return String(item.id) === String(itemId);
    });
    if (index < 0) {
      return;
    }

    var target = index + delta;
    if (target < 0 || target >= ordered.length) {
      return;
    }

    var moved = ordered.splice(index, 1)[0];
    ordered.splice(target, 0, moved);
    state.items = ordered;
    reindexItems();
    writeItemsToStorage(state.items);
    renderItems();
    setStatus("Item order updated.", "success");
    persistOrderToCloud();
  }

  function persistOrderToCloud() {
    if (!state.client || !state.coachUserId) {
      return;
    }

    var cloudItems = (Array.isArray(state.items) ? state.items : []).filter(function (item) {
      return item && isUuid(item.id);
    });
    if (!cloudItems.length) {
      return;
    }

    Promise.all(cloudItems.map(function (item) {
      return state.client
        .from("coach_workout_blocks")
        .update({ sort_order: parseSortOrder(item.sort_order) })
        .eq("id", item.id)
        .eq("coach_user_id", state.coachUserId)
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    }));
  }

  function importExercisesFromDraft() {
    var dayInput = document.querySelector("[data-block-source-day]");
    var sectionInput = document.querySelector("[data-block-section]");
    var exercises = buildExercisesFromSource(dayInput && dayInput.value, sectionInput && sectionInput.value);

    if (!exercises.length) {
      setStatus("No exercises found in that draft section.", "info");
      return;
    }

    if (getSelectedEntryType() === "exercise") {
      state.draftExercises = [cloneExercise(exercises[0])];
    } else {
      state.draftExercises = exercises.map(cloneExercise);
    }

    renderDraftExercises();
    setStatus("Imported " + state.draftExercises.length + " exercise" + (state.draftExercises.length === 1 ? "" : "s") + ".", "success");
  }

  function removeDraftExercise(indexValue) {
    var index = parseInt(indexValue, 10);
    if (!Number.isFinite(index) || index < 0 || index >= state.draftExercises.length) {
      return;
    }

    state.draftExercises.splice(index, 1);
    if (!state.draftExercises.length) {
      state.draftExercises = [createDefaultExercise()];
    }
    renderDraftExercises();
  }

  function renderDraftExercises() {
    var list = document.querySelector("[data-block-exercise-list]");
    var addExerciseBtn = document.querySelector("[data-block-add-exercise]");
    if (!list) {
      return;
    }

    state.draftExercises = normalizeExercises(state.draftExercises);
    if (!state.draftExercises.length) {
      state.draftExercises = [createDefaultExercise()];
    }

    list.innerHTML = state.draftExercises.map(function (exercise, index) {
      return buildDraftExerciseMarkup(exercise, index);
    }).join("");

    if (addExerciseBtn) {
      addExerciseBtn.hidden = getSelectedEntryType() === "exercise";
    }

    toggleComposerForEntryType();
  }

  function buildDraftExerciseMarkup(exercise, index) {
    return (
      '<article class="block-manager-exercise-item" data-block-exercise-item="' + index + '">' +
        '<div class="block-manager-exercise-row">' +
          '<input type="text" class="program-builder-block-title" placeholder="Exercise name" data-field="name" value="' + escapeAttribute(exercise.name || "") + '" />' +
          '<select class="program-builder-block-section" data-field="section">' +
            renderSectionOptions(exercise.section) +
          '</select>' +
          '<select class="program-builder-block-section" data-field="mode">' +
            renderModeOptions(exercise.mode) +
          '</select>' +
        '</div>' +
        '<div class="block-manager-exercise-row">' +
          '<input type="text" class="program-builder-block-section" placeholder="Reps / Time" data-field="reps" value="' + escapeAttribute(firstSetValue(exercise, "reps")) + '" />' +
          '<input type="text" class="program-builder-block-section" placeholder="Weight / Metric" data-field="weight" value="' + escapeAttribute(firstSetValue(exercise, "weight")) + '" />' +
          '<input type="text" class="program-builder-block-section" placeholder="RPE" data-field="rpe" value="' + escapeAttribute(firstSetValue(exercise, "rpe")) + '" />' +
          '<input type="text" class="program-builder-block-section" placeholder="Rest" data-field="rest" value="' + escapeAttribute(firstSetValue(exercise, "rest")) + '" />' +
        '</div>' +
        '<textarea class="program-builder-block-section block-manager-exercise-notes" placeholder="How to perform (coaching cues)" data-field="description">' + escapeHtml(String(exercise.description || firstSetValue(exercise, "notes"))) + '</textarea>' +
        '<input type="url" class="program-builder-block-section" placeholder="Video demonstration URL (https://...)" data-field="video_demo_url" value="' + escapeAttribute(String(exercise.video_demo_url || "")) + '" />' +
        '<div class="block-manager-exercise-actions">' +
          '<button type="button" class="btn admin-btn-delete-mini" data-block-exercise-remove="' + index + '">Remove</button>' +
        '</div>' +
      '</article>'
    );
  }

  function updateDraftExerciseFromRow(index, exerciseItem) {
    var description = readFieldValue(exerciseItem, '[data-field="description"]');
    state.draftExercises[index] = {
      name: readFieldValue(exerciseItem, '[data-field="name"]') || "Exercise",
      section: readFieldValue(exerciseItem, '[data-field="section"]') || DEFAULT_SECTION,
      mode: readFieldValue(exerciseItem, '[data-field="mode"]') || DEFAULT_MODE,
      description: description,
      video_demo_url: readFieldValue(exerciseItem, '[data-field="video_demo_url"]'),
      superset_group: null,
      field_toggles: null,
      sets: [{
        reps: readFieldValue(exerciseItem, '[data-field="reps"]'),
        weight: readFieldValue(exerciseItem, '[data-field="weight"]'),
        rpe: readFieldValue(exerciseItem, '[data-field="rpe"]'),
        rest: readFieldValue(exerciseItem, '[data-field="rest"]'),
        notes: description,
        done: false,
        target_reps: readFieldValue(exerciseItem, '[data-field="reps"]'),
        target_weight: readFieldValue(exerciseItem, '[data-field="weight"]'),
        target_rpe: readFieldValue(exerciseItem, '[data-field="rpe"]'),
        target_rest: readFieldValue(exerciseItem, '[data-field="rest"]'),
        target_notes: description
      }]
    };
  }

  function renderItems() {
    var list = document.querySelector("[data-block-list]");
    var filterInput = document.querySelector("[data-block-filter]");
    var filterTypeInput = document.querySelector("[data-block-type-filter]");
    if (!list) {
      return;
    }

    var allItems = sortItems(state.items);
    var availableTags = collectTags(allItems);

    if (filterInput) {
      filterInput.innerHTML = ['<option value="all">All tags</option>']
        .concat(availableTags.map(function (tag) {
          return '<option value="' + escapeAttribute(tag) + '">' + escapeHtml(tag) + '</option>';
        }))
        .join("");

      if (state.filterTag !== "all" && availableTags.indexOf(state.filterTag) < 0) {
        state.filterTag = "all";
      }
      filterInput.value = state.filterTag;
    }

    if (filterTypeInput) {
      filterTypeInput.value = state.filterType;
    }

    var items = filterItems(allItems, state.filterTag, state.filterType);
    if (!items.length) {
      list.innerHTML = '<p class="admin-loading">No saved library items yet.</p>';
      return;
    }

    list.innerHTML = items.map(function (item, index) {
      var exerciseCount = Array.isArray(item.exercises) ? item.exercises.length : 0;
      var editingBadge = String(state.editingId || "") === String(item.id) ? '<p class="program-builder-block-item-editing">Editing</p>' : "";
      var preview = (Array.isArray(item.exercises) ? item.exercises : []).slice(0, 3).map(function (exercise) {
        return '<li>' + escapeHtml(String(exercise && exercise.name || "Exercise")) + '</li>';
      }).join("");
      var typeLabel = exerciseCount === 1 ? "Single Exercise" : "Exercise Block";

      return (
        '<article class="program-builder-block-item block-manager-library-item">' +
          '<div class="program-builder-block-main">' +
            editingBadge +
            '<div class="block-manager-library-head">' +
              '<span class="block-manager-item-type">' + escapeHtml(typeLabel) + '</span>' +
              '<p class="program-builder-block-name">' + escapeHtml(item.title || "Library Item") + '</p>' +
            '</div>' +
            '<p class="program-builder-block-meta">' +
              escapeHtml(String(item.section || DEFAULT_SECTION)) + ' - ' +
              escapeHtml(String(exerciseCount)) + ' exercise' + (exerciseCount === 1 ? '' : 's') +
            '</p>' +
            renderTags(item.tags || []) +
            '<ul class="block-manager-preview-list">' + preview + '</ul>' +
          '</div>' +
          '<div class="program-builder-block-actions">' +
            '<button type="button" class="btn admin-btn-small" data-block-move="up" data-block-id="' + escapeAttribute(item.id) + '"' + (index === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-move="down" data-block-id="' + escapeAttribute(item.id) + '"' + (index === items.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-edit="' + escapeAttribute(item.id) + '">Edit</button>' +
            '<button type="button" class="btn admin-btn-delete-mini" data-block-delete="' + escapeAttribute(item.id) + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function renderTags(tags) {
    var normalized = normalizeTags(tags || []);
    if (!normalized.length) {
      return "";
    }

    return '<ul class="program-builder-block-tags-list">' + normalized.map(function (tag) {
      return '<li>' + escapeHtml(tag) + '</li>';
    }).join("") + '</ul>';
  }

  function buildExercisesFromSource(dayKey, sectionRaw) {
    var day = String(dayKey || "").trim();
    var section = String(sectionRaw || DEFAULT_SECTION).trim();
    if (!day) {
      return [];
    }

    var payload = readFromStorage(TEMPLATE_DRAFT_PREFIX + day);
    var sourceExercises = payload && Array.isArray(payload.exercises)
      ? normalizeExercises(payload.exercises)
      : [];

    if (!sourceExercises.length) {
      return [];
    }

    return (section === "__all__"
      ? sourceExercises
      : sourceExercises.filter(function (exercise) {
          return String(exercise && exercise.section || "").trim() === section;
        }))
      .map(cloneExercise);
  }

  function filterItems(items, tag, filterType) {
    var targetTag = String(tag || "all").trim().toLowerCase();
    var targetType = normalizeFilterType(filterType);
    return sortItems(items || []).filter(function (item) {
      var exerciseCount = Array.isArray(item && item.exercises) ? item.exercises.length : 0;
      var itemType = exerciseCount === 1 ? "exercise" : "block";
      var tagMatch = targetTag === "all" || normalizeTags(item && item.tags || []).indexOf(targetTag) >= 0;
      var typeMatch = targetType === "all" || itemType === targetType;
      return tagMatch && typeMatch;
    });
  }

  function findItemById(itemId) {
    return (Array.isArray(state.items) ? state.items : []).find(function (item) {
      return String(item && item.id || "") === String(itemId || "");
    }) || null;
  }

  function reindexItems() {
    var ordered = sortItems(state.items);
    ordered.forEach(function (item, index) {
      if (!item) {
        return;
      }
      item.sort_order = index;
      item.tags = normalizeTags(item.tags || []);
    });
    state.items = ordered;
  }

  function sortItems(items) {
    return (Array.isArray(items) ? items : []).slice().sort(function (a, b) {
      var aSort = parseSortOrder(a && a.sort_order);
      var bSort = parseSortOrder(b && b.sort_order);
      if (aSort !== bSort) {
        return aSort - bSort;
      }

      var aTime = Date.parse(String(a && a.created_at || ""));
      var bTime = Date.parse(String(b && b.created_at || ""));
      var safeATime = Number.isFinite(aTime) ? aTime : 0;
      var safeBTime = Number.isFinite(bTime) ? bTime : 0;
      return safeBTime - safeATime;
    });
  }

  function normalizeCloudItems(rows) {
    return (Array.isArray(rows) ? rows : []).map(mapCloudItem).filter(function (item) {
      return !!item;
    });
  }

  function mapCloudItem(row) {
    var src = row && typeof row === "object" ? row : {};
    var id = String(src.id || "").trim();
    var title = String(src.title || "").trim();
    var exercises = normalizeExercises(src.exercises || []);
    if (!id || !title || !exercises.length) {
      return null;
    }

    return {
      id: id,
      title: title,
      section: String(src.source_section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
      tags: normalizeTags(src.tags || []),
      sort_order: parseSortOrder(src.sort_order),
      exercises: exercises,
      created_at: String(src.created_at || ""),
      updated_at: String(src.updated_at || "")
    };
  }

  function readItemsFromStorage() {
    try {
      var raw = window.localStorage.getItem(WORKOUT_BLOCK_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (item) {
        var safe = item && typeof item === "object" ? item : {};
        var exercises = normalizeExercises(safe.exercises || []);
        var id = String(safe.id || "").trim();
        var title = String(safe.title || "").trim();
        if (!id || !title || !exercises.length) {
          return null;
        }

        return {
          id: id,
          title: title,
          section: String(safe.section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
          tags: normalizeTags(safe.tags || []),
          sort_order: parseSortOrder(safe.sort_order),
          exercises: exercises,
          created_at: String(safe.created_at || ""),
          updated_at: String(safe.updated_at || "")
        };
      }).filter(function (item) {
        return !!item;
      });
    } catch (error) {
      return [];
    }
  }

  function writeItemsToStorage(items) {
    try {
      window.localStorage.setItem(WORKOUT_BLOCK_LIBRARY_KEY, JSON.stringify(sortItems(items).slice(0, 150)));
    } catch (error) {
      setStatus("Could not write local library cache.", "info");
    }
  }

  function itemSignature(item) {
    var safe = item && typeof item === "object" ? item : {};
    return [
      String(safe.title || "").trim().toLowerCase(),
      String(safe.section || "").trim().toLowerCase(),
      JSON.stringify(normalizeTags(safe.tags || [])),
      JSON.stringify(normalizeExercises(safe.exercises || []))
    ].join("|");
  }

  function collectTags(items) {
    var seen = {};
    var tags = [];
    (Array.isArray(items) ? items : []).forEach(function (item) {
      normalizeTags(item && item.tags || []).forEach(function (tag) {
        if (seen[tag]) {
          return;
        }
        seen[tag] = true;
        tags.push(tag);
      });
    });
    return tags.sort();
  }

  function parseTags(raw) {
    return normalizeTags(String(raw || "").split(","));
  }

  function normalizeTags(tags) {
    var list = Array.isArray(tags) ? tags : [];
    var seen = {};
    return list.map(function (tag) {
      return String(tag || "").trim().toLowerCase();
    }).filter(function (tag) {
      if (!tag || seen[tag]) {
        return false;
      }
      seen[tag] = true;
      return true;
    }).slice(0, 12);
  }

  function normalizeExercises(exercises) {
    return (Array.isArray(exercises) ? exercises : []).map(function (exercise) {
      var safe = exercise && typeof exercise === "object" ? exercise : {};
      return {
        name: String(safe.name || "Exercise").trim() || "Exercise",
        section: String(safe.section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
        mode: String(safe.mode || DEFAULT_MODE).trim() || DEFAULT_MODE,
        superset_group: safe.superset_group || null,
        field_toggles: safe.field_toggles && typeof safe.field_toggles === "object" ? safe.field_toggles : null,
        sets: normalizeSets(safe.sets)
      };
    }).filter(function (exercise) {
      return Array.isArray(exercise.sets) && exercise.sets.length > 0 && String(exercise.name || "").trim();
    });
  }

  function normalizeSets(sets) {
    var list = Array.isArray(sets) && sets.length ? sets : [{}];
    return list.map(function (set) {
      var safe = set && typeof set === "object" ? set : {};
      return {
        reps: safe.reps != null ? safe.reps : "",
        weight: safe.weight != null ? safe.weight : "",
        rpe: safe.rpe != null ? safe.rpe : "",
        rest: safe.rest != null ? safe.rest : "",
        notes: safe.notes != null ? safe.notes : "",
        done: !!safe.done,
        target_reps: safe.target_reps != null ? safe.target_reps : safe.reps,
        target_weight: safe.target_weight != null ? safe.target_weight : safe.weight,
        target_rpe: safe.target_rpe != null ? safe.target_rpe : safe.rpe,
        target_rest: safe.target_rest != null ? safe.target_rest : safe.rest,
        target_notes: safe.target_notes != null ? safe.target_notes : safe.notes
      };
    });
  }

  function createDefaultExercise() {
    return {
      name: "",
      section: DEFAULT_SECTION,
      mode: DEFAULT_MODE,
      superset_group: null,
      field_toggles: null,
      sets: [{
        reps: "",
        weight: "",
        rpe: "",
        rest: "",
        notes: "",
        done: false,
        target_reps: "",
        target_weight: "",
        target_rpe: "",
        target_rest: "",
        target_notes: ""
      }]
    };
  }

  function cloneExercise(exercise) {
    var cloned = clone([exercise]);
    return normalizeExercises(cloned)[0] || createDefaultExercise();
  }

  function deriveItemSection(exercises, entryType) {
    if (!Array.isArray(exercises) || !exercises.length) {
      return DEFAULT_SECTION;
    }

    if (entryType === "exercise") {
      return String(exercises[0].section || DEFAULT_SECTION);
    }

    var firstSection = String(exercises[0].section || DEFAULT_SECTION);
    var mixed = exercises.some(function (exercise) {
      return String(exercise && exercise.section || DEFAULT_SECTION) !== firstSection;
    });
    return mixed ? "Mixed Block" : firstSection;
  }

  function buildCloudPayload(item) {
    return {
      coach_user_id: state.coachUserId,
      title: String(item && item.title || "Library Item").trim() || "Library Item",
      source_section: String(item && item.section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
      tags: normalizeTags(item && item.tags || []),
      sort_order: parseSortOrder(item && item.sort_order),
      exercises: normalizeExercises(item && item.exercises || [])
    };
  }

  function getSelectedEntryType() {
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    return String(entryTypeInput && entryTypeInput.value || "exercise").toLowerCase() === "block" ? "block" : "exercise";
  }

  function normalizeFilterType(value) {
    var type = String(value || "all").trim().toLowerCase();
    return type === "exercise" || type === "block" ? type : "all";
  }

  function renderSectionOptions(selected) {
    return SECTION_OPTIONS.map(function (section) {
      return '<option value="' + escapeAttribute(section) + '"' + (section === selected ? ' selected' : '') + '>' + escapeHtml(section) + '</option>';
    }).join("");
  }

  function renderModeOptions(selected) {
    return ["reps", "time", "endurance"].map(function (mode) {
      return '<option value="' + escapeAttribute(mode) + '"' + (mode === selected ? ' selected' : '') + '>' + escapeHtml(mode) + '</option>';
    }).join("");
  }

  function readFieldValue(root, selector) {
    var field = root && root.querySelector ? root.querySelector(selector) : null;
    return String(field && field.value || "").trim();
  }

  function firstSetValue(exercise, key) {
    var firstSet = exercise && Array.isArray(exercise.sets) && exercise.sets[0] ? exercise.sets[0] : {};
    return firstSet && firstSet[key] != null ? String(firstSet[key]) : "";
  }

  function parseSortOrder(value) {
    var num = parseInt(value, 10);
    return Number.isFinite(num) ? num : 0;
  }

  function setStatus(message, tone) {
    var status = document.querySelector("[data-block-status]");
    if (!status) {
      return;
    }

    status.textContent = String(message || "");
    status.classList.remove("status-success", "status-error", "status-info");
    status.classList.add(tone === "success" ? "status-success" : tone === "error" ? "status-error" : "status-info");
  }

  function parseSlotKey(slotKey) {
    var match = /^w(\d+)d(\d+)$/i.exec(String(slotKey || ""));
    if (!match) {
      return null;
    }

    return {
      week: parseInt(match[1], 10),
      workout: parseInt(match[2], 10)
    };
  }

  function compareSlotKeysAsc(a, b) {
    var left = parseSlotKey(a);
    var right = parseSlotKey(b);
    if (!left || !right) {
      return String(a || "").localeCompare(String(b || ""));
    }
    if (left.week !== right.week) {
      return left.week - right.week;
    }
    return left.workout - right.workout;
  }

  function labelForSlot(slotKey) {
    var parsed = parseSlotKey(slotKey);
    if (!parsed) {
      return String(slotKey || "Workout Day");
    }
    return "Week " + parsed.week + " - Workout " + parsed.workout;
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function readFromStorage(key) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function createSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
      return null;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return null;
    }

    try {
      return window.supabase.createClient(url, key);
    } catch (error) {
      return null;
    }
  }

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value || []));
    } catch (error) {
      return Array.isArray(value) ? value.slice() : [];
    }
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
})();
/*
(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_DRAFT_PREFIX = "nomadic_training_program_template_builder_draft_";
  var WORKOUT_BLOCK_LIBRARY_KEY = "nomadic_template_workout_blocks_v1";
  var DEFAULT_SECTION = "A Block";
  var DEFAULT_MODE = "reps";
  var SECTION_OPTIONS = ["Warm Up", "A Block", "B Block", "C Block", "Cool Down"];

  var state = {
    client: null,
    coachUserId: null,
    items: [],
    editingId: null,
    filterTag: "all",
    filterType: "all",
    draftExercises: [createDefaultExercise()]
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    bindEvents();
    renderDraftExercises();

    state.client = createSupabaseClient();
    if (!state.client) {
      showGuardMessage("Supabase is not configured. Cannot load the exercise library.");
      return;
    }

    resolveCoachAccess()
      .then(function (access) {
        if (!access || !access.allowed || !access.user) {
          showGuardMessage("Coach access is required to manage the exercise library.");
          return;
        }

        state.coachUserId = String(access.user.id || "").trim() || null;
        if (!state.coachUserId) {
          showGuardMessage("Could not verify coach account.");
          return;
        }

        showManager();
        loadDraftDayOptions();
        clearEditState();
        loadLibraryItems();
      })
      .catch(function () {
        showGuardMessage("Could not verify coach access.");
      });
  }

  function resolveCoachAccess() {
    if (!state.client || !state.client.auth) {
      return Promise.resolve({ allowed: false, user: null });
    }

    return resolveCurrentUser().then(function (user) {
      if (!user) {
        return { allowed: false, user: null };
      }

      return resolveIsCoach(user).then(function (allowed) {
        return {
          allowed: !!allowed,
          user: user
        };
      });
    });
  }

  function resolveCurrentUser() {
    return state.client.auth.getSession()
      .then(function (result) {
        var session = result && result.data && result.data.session;
        if (session && session.user) {
          return session.user;
        }
        return resolveCurrentUserFallback();
      })
      .catch(function () {
        return resolveCurrentUserFallback();
      });
  }

  function resolveCurrentUserFallback() {
    if (!state.client || !state.client.auth || typeof state.client.auth.getUser !== "function") {
      return Promise.resolve(null);
    }

    return state.client.auth.getUser()
      .then(function (result) {
        return result && result.data && result.data.user ? result.data.user : null;
      })
      .catch(function () {
        return null;
      });
  }

  function resolveIsCoach(user) {
    var email = String(user && user.email || "").toLowerCase();
    if (email && email === ADMIN_EMAIL) {
      return Promise.resolve(true);
    }

    if (!state.client || !state.client.rpc) {
      return Promise.resolve(false);
    }

    return state.client.rpc("is_nomadic_admin")
      .then(function (result) {
        if (result && result.error) {
          return false;
        }
        return !!(result && result.data === true);
      })
      .catch(function () {
        return false;
      });
  }

  function bindEvents() {
    var saveBtn = document.querySelector("[data-block-save]");
    var cancelBtn = document.querySelector("[data-block-cancel-edit]");
    var filterInput = document.querySelector("[data-block-filter]");
    var typeFilterInput = document.querySelector("[data-block-type-filter]");
    var addExerciseBtn = document.querySelector("[data-block-add-exercise]");
    var importBtn = document.querySelector("[data-block-import]");
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    var titleInput = document.querySelector("[data-block-title]");

    if (saveBtn) {
      saveBtn.addEventListener("click", saveOrUpdateItem);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", clearEditState);
    }

    if (filterInput) {
      filterInput.addEventListener("change", function () {
        state.filterTag = String(filterInput.value || "all").trim() || "all";
        renderItems();
      });
    }

    if (typeFilterInput) {
      typeFilterInput.addEventListener("change", function () {
        state.filterType = normalizeFilterType(typeFilterInput.value);
        renderItems();
      });
    }

    if (addExerciseBtn) {
      addExerciseBtn.addEventListener("click", function () {
        if (getSelectedEntryType() === "exercise" && state.draftExercises.length >= 1) {
          setStatus("Single exercise items can only contain one exercise.", "info");
          return;
        }

        state.draftExercises.push(createDefaultExercise());
        renderDraftExercises();
      });
    }

    if (importBtn) {
      importBtn.addEventListener("click", importExercisesFromDraft);
    }

    if (entryTypeInput) {
      entryTypeInput.addEventListener("change", function () {
        if (getSelectedEntryType() === "exercise" && state.draftExercises.length > 1) {
          state.draftExercises = [cloneExercise(state.draftExercises[0] || createDefaultExercise())];
        }
        renderDraftExercises();
      });
    }

    if (titleInput) {
      titleInput.addEventListener("keydown", function (event) {
        if (!event || event.key !== "Enter") {
          return;
        }
        event.preventDefault();
        saveOrUpdateItem();
      });
    }

    document.addEventListener("click", function (event) {
      var editBtn = event.target && event.target.closest("[data-block-edit]");
      if (editBtn) {
        startEditingItem(String(editBtn.getAttribute("data-block-edit") || ""));
        return;
      }

      var deleteBtn = event.target && event.target.closest("[data-block-delete]");
      if (deleteBtn) {
        deleteItem(String(deleteBtn.getAttribute("data-block-delete") || ""));
        return;
      }

      var moveBtn = event.target && event.target.closest("[data-block-move]");
      if (moveBtn) {
        moveItem(
          String(moveBtn.getAttribute("data-block-id") || ""),
          String(moveBtn.getAttribute("data-block-move") || "")
        );
        return;
      }

      var removeExerciseBtn = event.target && event.target.closest("[data-block-exercise-remove]");
      if (removeExerciseBtn) {
        removeDraftExercise(removeExerciseBtn.getAttribute("data-block-exercise-remove"));
      }
    });

    document.addEventListener("change", function (event) {
      var exerciseItem = event.target && event.target.closest && event.target.closest("[data-block-exercise-item]");
      if (!exerciseItem) {
        return;
      }

      var index = parseInt(exerciseItem.getAttribute("data-block-exercise-item") || "-1", 10);
      if (!Number.isFinite(index) || index < 0 || index >= state.draftExercises.length) {
        return;
      }

      updateDraftExerciseFromRow(index, exerciseItem);
    });
  }

  function showGuardMessage(message) {
    var guard = document.querySelector("[data-block-manager-guard]");
    var content = document.querySelector("[data-block-manager-content]");
    if (guard) {
      guard.hidden = false;
      guard.innerHTML = '<p class="admin-loading">' + escapeHtml(message) + '</p>';
    }
    if (content) {
      content.hidden = true;
    }
  }

  function showManager() {
    var guard = document.querySelector("[data-block-manager-guard]");
    var content = document.querySelector("[data-block-manager-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function loadDraftDayOptions() {
    var daySelect = document.querySelector("[data-block-source-day]");
    if (!daySelect) {
      return;
    }

    var draftDays = getTemplateDraftDays();
    daySelect.innerHTML = ['<option value="">Select a source day</option>']
      .concat(draftDays.map(function (day) {
        return '<option value="' + escapeAttribute(day) + '">' + escapeHtml(labelForSlot(day)) + '</option>';
      }))
      .join("");
  }

  function getTemplateDraftDays() {
    var days = [];
    var seen = {};
    try {
      for (var i = 0; i < window.localStorage.length; i += 1) {
        var key = window.localStorage.key(i);
        if (!key || key.indexOf(TEMPLATE_DRAFT_PREFIX) !== 0) {
          continue;
        }

        var slot = String(key).slice(TEMPLATE_DRAFT_PREFIX.length);
        if (!parseSlotKey(slot) || seen[slot]) {
          continue;
        }

        seen[slot] = true;
        days.push(slot);
      }
    } catch (error) {
      return [];
    }

    return days.sort(compareSlotKeysAsc);
  }

  function loadLibraryItems() {
    state.items = readItemsFromStorage();
    renderItems();

    state.client
      .from("coach_workout_blocks")
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at,item_type")
      .eq("coach_user_id", state.coachUserId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          setStatus("Using local cache. Cloud read failed.", "info");
          return;
        }

        var cloudItems = normalizeCloudItems(result.data || []);
        mergeAndBackfillCloudItems(cloudItems).then(function (merged) {
          state.items = sortItems(merged);
          writeItemsToStorage(state.items);
          renderItems();
          setStatus("Library loaded.", "success");
        });
      })
      .catch(function () {
        setStatus("Using local cache. Cloud read failed.", "info");
      });
  }

  function mergeAndBackfillCloudItems(cloudItems) {
    var localItems = readItemsFromStorage();
    var signatures = {};
    cloudItems.forEach(function (item) {
      signatures[itemSignature(item)] = true;
    });

    var unsyncedItems = localItems.filter(function (item) {
      return !signatures[itemSignature(item)];
    });

    if (!unsyncedItems.length) {
      return Promise.resolve(cloudItems);
    }

    var rows = unsyncedItems.map(function (item) {
      return buildCloudPayload(item);
    });

    return state.client
      .from("coach_workout_blocks")
      .insert(rows)
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at,item_type")
      .then(function (result) {
        if (result.error) {
          return cloudItems;
        }
        return sortItems(cloudItems.concat(normalizeCloudItems(result.data || [])));
      })
      .catch(function () {
        return cloudItems;
      });
  }

  function saveOrUpdateItem() {
    var titleInput = document.querySelector("[data-block-title]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var title = String((titleInput && titleInput.value) || "").trim();
    var tags = parseTags((tagsInput && tagsInput.value) || "");
    var entryType = getSelectedEntryType();
    if (entryType === "exercise") {
      syncSingleExerciseFromInputs();
    }

    var exercises = normalizeExercises(state.draftExercises);

    if (!title) {
      setStatus("Title is required.", "error");
      if (titleInput) {
        titleInput.focus();
      }
      return;
    }

    if (!exercises.length) {
      setStatus("Add at least one exercise before saving.", "info");
      return;
    }

    if (entryType === "exercise" && exercises.length !== 1) {
      setStatus("Single exercise items must contain exactly one exercise.", "info");
      return;
    }

    var payload = {
      title: title,
      item_type: entryType,
      section: deriveItemSection(exercises, entryType),
      tags: tags,
      exercises: exercises
    };

    if (state.editingId) {
      updateItem(findItemById(state.editingId), payload);
      return;
    }

    createItem(payload);
  }

  function createItem(payload) {
    var localItem = {
      id: "block_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      title: payload.title,
      item_type: payload.item_type,
      section: payload.section,
      tags: normalizeTags(payload.tags || []),
      sort_order: 0,
      exercises: normalizeExercises(payload.exercises || []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.client
      .from("coach_workout_blocks")
      .insert(buildCloudPayload(localItem))
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at,item_type")
      .single()
      .then(function (result) {
        if (result.error) {
          saveLocalOnly(localItem, "Saved locally. Cloud sync failed.");
          return;
        }

        state.items.unshift(mapCloudItem(result.data || {}));
        reindexItems();
        writeItemsToStorage(state.items);
        renderItems();
        clearEditState();
        setStatus("Saved item: " + localItem.title + ".", "success");
        persistOrderToCloud();
      })
      .catch(function () {
        saveLocalOnly(localItem, "Saved locally. Cloud sync failed.");
      });
  }

  function updateItem(existing, payload) {
    if (!existing) {
      setStatus("Library item not found.", "error");
      clearEditState();
      return;
    }

    var updated = {
      id: existing.id,
      title: payload.title,
      item_type: payload.item_type,
      section: payload.section,
      tags: normalizeTags(payload.tags || []),
      sort_order: parseSortOrder(existing.sort_order),
      exercises: normalizeExercises(payload.exercises || existing.exercises || []),
      created_at: existing.created_at,
      updated_at: new Date().toISOString()
    };

    var applyLocal = function () {
      state.items = state.items.map(function (item) {
        return String(item.id) === String(updated.id) ? updated : item;
      });
      reindexItems();
      writeItemsToStorage(state.items);
      renderItems();
      clearEditState();
      setStatus("Updated item: " + updated.title + ".", "success");
      persistOrderToCloud();
    };

    if (!isUuid(existing.id)) {
      applyLocal();
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .update({
        title: updated.title,
        item_type: updated.item_type,
        source_section: updated.section,
        tags: updated.tags,
        exercises: updated.exercises
      })
      .eq("id", existing.id)
      .eq("coach_user_id", state.coachUserId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message || "Could not update item.", "error");
          return;
        }
        applyLocal();
      })
      .catch(function () {
        setStatus("Could not update item.", "error");
      });
  }

  function saveLocalOnly(item, message) {
    state.items.unshift(item);
    reindexItems();
    writeItemsToStorage(state.items);
    renderItems();
    clearEditState();
    setStatus(message, "info");
  }

  function startEditingItem(itemId) {
    var item = findItemById(itemId);
    var titleInput = document.querySelector("[data-block-title]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    var saveButton = document.querySelector("[data-block-save]");
    var cancelButton = document.querySelector("[data-block-cancel-edit]");
    var dayInput = document.querySelector("[data-block-source-day]");

    if (!item) {
      return;
    }

    state.editingId = String(item.id || "");
    state.draftExercises = normalizeExercises(item.exercises || []);

    if (titleInput) {
      titleInput.value = String(item.title || "");
      titleInput.focus();
    }
    if (tagsInput) {
      tagsInput.value = normalizeTags(item.tags || []).join(", ");
    }
    if (entryTypeInput) {
      entryTypeInput.value = normalizeItemType(item.item_type, item.exercises);
    }
    if (saveButton) {
      saveButton.textContent = "Update Item";
    }
    if (cancelButton) {
      cancelButton.hidden = false;
    }
    if (dayInput) {
      dayInput.value = "";
    }

    renderDraftExercises();
    toggleComposerForEntryType();
    renderItems();
    setStatus("Editing item: " + String(item.title || "Library Item") + ".", "info");
  }

  function clearEditState() {
    var titleInput = document.querySelector("[data-block-title]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    var dayInput = document.querySelector("[data-block-source-day]");
    var sectionInput = document.querySelector("[data-block-section]");
    var saveButton = document.querySelector("[data-block-save]");
    var cancelButton = document.querySelector("[data-block-cancel-edit]");

    state.editingId = null;
    state.draftExercises = [createDefaultExercise()];

    if (titleInput) {
      titleInput.value = "";
    }
    if (tagsInput) {
      tagsInput.value = "";
    }
    if (entryTypeInput) {
      entryTypeInput.value = "exercise";
    }
    if (dayInput) {
      dayInput.value = "";
    }
    if (sectionInput) {
      sectionInput.value = DEFAULT_SECTION;
    }
    if (saveButton) {
      saveButton.textContent = "Save Item";
    }
    if (cancelButton) {
      cancelButton.hidden = true;
    }

    renderDraftExercises();
    populateSingleExerciseInputs();
    toggleComposerForEntryType();
    renderItems();
  }

  function deleteItem(itemId) {
    var item = findItemById(itemId);
    if (!item) {
      return;
    }

    if (!confirm("Delete saved item '" + String(item.title || "Library Item") + "'?")) {
      return;
    }

    var removeLocal = function () {
      state.items = state.items.filter(function (entry) {
        return String(entry.id) !== String(itemId);
      });
      if (String(state.editingId || "") === String(itemId)) {
        clearEditState();
      }
      reindexItems();
      writeItemsToStorage(state.items);
      renderItems();
      setStatus("Library item deleted.", "info");
      persistOrderToCloud();
    };

    if (!isUuid(itemId)) {
      removeLocal();
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .delete()
      .eq("id", itemId)
      .eq("coach_user_id", state.coachUserId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message || "Could not delete item.", "error");
          return;
        }
        removeLocal();
      })
      .catch(function () {
        setStatus("Could not delete item.", "error");
      });
  }

  function moveItem(itemId, direction) {
    var delta = direction === "up" ? -1 : (direction === "down" ? 1 : 0);
    if (!delta) {
      return;
    }

    var ordered = sortItems(state.items);
    var index = ordered.findIndex(function (item) {
      return String(item.id) === String(itemId);
    });
    if (index < 0) {
      return;
    }

    var target = index + delta;
    if (target < 0 || target >= ordered.length) {
      return;
    }

    var moved = ordered.splice(index, 1)[0];
    ordered.splice(target, 0, moved);
    state.items = ordered;
    reindexItems();
    writeItemsToStorage(state.items);
    renderItems();
    setStatus("Item order updated.", "success");
    persistOrderToCloud();
  }

  function persistOrderToCloud() {
    var cloudItems = (Array.isArray(state.items) ? state.items : []).filter(function (item) {
      return item && isUuid(item.id);
    });
    if (!cloudItems.length) {
      return;
    }

    Promise.all(cloudItems.map(function (item) {
      return state.client
        .from("coach_workout_blocks")
        .update({ sort_order: parseSortOrder(item.sort_order) })
        .eq("id", item.id)
        .eq("coach_user_id", state.coachUserId)
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    }));
  }

  function importExercisesFromDraft() {
    var dayInput = document.querySelector("[data-block-source-day]");
    var sectionInput = document.querySelector("[data-block-section]");
    var exercises = buildExercisesFromSource(dayInput && dayInput.value, sectionInput && sectionInput.value);

    if (!exercises.length) {
      setStatus("No exercises found in that draft section.", "info");
      return;
    }

    if (getSelectedEntryType() === "exercise") {
      state.draftExercises = [cloneExercise(exercises[0])];
    } else {
      state.draftExercises = exercises.map(cloneExercise);
    }

    renderDraftExercises();
    setStatus("Imported " + state.draftExercises.length + " exercise" + (state.draftExercises.length === 1 ? "" : "s") + ".", "success");
  }

  function renderDraftExercises() {
    var list = document.querySelector("[data-block-exercise-list]");
    var addExerciseBtn = document.querySelector("[data-block-add-exercise]");
    if (!list) {
      return;
    }

    state.draftExercises = normalizeExercises(state.draftExercises);
    if (!state.draftExercises.length) {
      state.draftExercises = [createDefaultExercise()];
    }

    list.innerHTML = state.draftExercises.map(function (exercise, index) {
      return buildDraftExerciseMarkup(exercise, index);
    }).join("");

    if (addExerciseBtn) {
      addExerciseBtn.hidden = getSelectedEntryType() === "exercise";
    }
  }

  function buildDraftExerciseMarkup(exercise, index) {
    return (
      '<article class="block-manager-exercise-item" data-block-exercise-item="' + index + '">' +
        '<div class="block-manager-exercise-row">' +
          '<input type="text" class="program-builder-block-title" placeholder="Exercise name" data-field="name" value="' + escapeAttribute(exercise.name || "") + '" />' +
          '<select class="program-builder-block-section" data-field="section">' + renderSectionOptions(exercise.section) + '</select>' +
          '<select class="program-builder-block-section" data-field="mode">' + renderModeOptions(exercise.mode) + '</select>' +
        '</div>' +
        '<div class="block-manager-exercise-row">' +
          '<input type="text" class="program-builder-block-section" placeholder="Reps / Time" data-field="reps" value="' + escapeAttribute(firstSetValue(exercise, "reps")) + '" />' +
          '<input type="text" class="program-builder-block-section" placeholder="Weight / Metric" data-field="weight" value="' + escapeAttribute(firstSetValue(exercise, "weight")) + '" />' +
          '<input type="text" class="program-builder-block-section" placeholder="RPE" data-field="rpe" value="' + escapeAttribute(firstSetValue(exercise, "rpe")) + '" />' +
          '<input type="text" class="program-builder-block-section" placeholder="Rest" data-field="rest" value="' + escapeAttribute(firstSetValue(exercise, "rest")) + '" />' +
        '</div>' +
        '<textarea class="program-builder-block-section block-manager-exercise-notes" placeholder="Notes or coaching cues" data-field="notes">' + escapeHtml(firstSetValue(exercise, "notes")) + '</textarea>' +
        '<div class="block-manager-exercise-actions">' +
          '<button type="button" class="btn admin-btn-delete-mini" data-block-exercise-remove="' + index + '">Remove</button>' +
        '</div>' +
      '</article>'
    );
  }

  function updateDraftExerciseFromRow(index, exerciseItem) {
    state.draftExercises[index] = {
      name: readFieldValue(exerciseItem, '[data-field="name"]') || "Exercise",
      section: readFieldValue(exerciseItem, '[data-field="section"]') || DEFAULT_SECTION,
      mode: readFieldValue(exerciseItem, '[data-field="mode"]') || DEFAULT_MODE,
      superset_group: null,
      field_toggles: null,
      sets: [{
        reps: readFieldValue(exerciseItem, '[data-field="reps"]'),
        weight: readFieldValue(exerciseItem, '[data-field="weight"]'),
        rpe: readFieldValue(exerciseItem, '[data-field="rpe"]'),
        rest: readFieldValue(exerciseItem, '[data-field="rest"]'),
        notes: readFieldValue(exerciseItem, '[data-field="notes"]'),
        done: false,
        target_reps: readFieldValue(exerciseItem, '[data-field="reps"]'),
        target_weight: readFieldValue(exerciseItem, '[data-field="weight"]'),
        target_rpe: readFieldValue(exerciseItem, '[data-field="rpe"]'),
        target_rest: readFieldValue(exerciseItem, '[data-field="rest"]'),
        target_notes: readFieldValue(exerciseItem, '[data-field="notes"]')
      }]
    };
  }

  function renderItems() {
    var list = document.querySelector("[data-block-list]");
    var filterInput = document.querySelector("[data-block-filter]");
    var filterTypeInput = document.querySelector("[data-block-type-filter]");
    if (!list) {
      return;
    }

    var allItems = sortItems(state.items);
    var availableTags = collectTags(allItems);

    if (filterInput) {
      filterInput.innerHTML = ['<option value="all">All tags</option>']
        .concat(availableTags.map(function (tag) {
          return '<option value="' + escapeAttribute(tag) + '">' + escapeHtml(tag) + '</option>';
        }))
        .join("");

      if (state.filterTag !== "all" && availableTags.indexOf(state.filterTag) < 0) {
        state.filterTag = "all";
      }
      filterInput.value = state.filterTag;
    }

    if (filterTypeInput) {
      filterTypeInput.value = state.filterType;
    }

    var items = filterItems(allItems, state.filterTag, state.filterType);
    if (!items.length) {
      list.innerHTML = '<p class="admin-loading">No saved library items yet.</p>';
      return;
    }

    list.innerHTML = items.map(function (item, index) {
      var exerciseCount = Array.isArray(item.exercises) ? item.exercises.length : 0;
      var editingBadge = String(state.editingId || "") === String(item.id) ? '<p class="program-builder-block-item-editing">Editing</p>' : "";
      var typeLabel = normalizeItemType(item.item_type, item.exercises) === "exercise" ? "Single Exercise" : "Exercise Block";
      var preview = (Array.isArray(item.exercises) ? item.exercises : []).slice(0, 3).map(function (exercise) {
        return '<li>' + escapeHtml(String(exercise && exercise.name || "Exercise")) + '</li>';
      }).join("");

      return (
        '<article class="program-builder-block-item block-manager-library-item">' +
          '<div class="program-builder-block-main">' +
            editingBadge +
            '<div class="block-manager-library-head">' +
              '<span class="block-manager-item-type">' + escapeHtml(typeLabel) + '</span>' +
              '<p class="program-builder-block-name">' + escapeHtml(item.title || "Library Item") + '</p>' +
            '</div>' +
            '<p class="program-builder-block-meta">' +
              escapeHtml(String(item.section || DEFAULT_SECTION)) + ' - ' +
              escapeHtml(String(exerciseCount)) + ' exercise' + (exerciseCount === 1 ? '' : 's') +
            '</p>' +
            renderTags(item.tags || []) +
            '<ul class="block-manager-preview-list">' + preview + '</ul>' +
          '</div>' +
          '<div class="program-builder-block-actions">' +
            '<button type="button" class="btn admin-btn-small" data-block-move="up" data-block-id="' + escapeAttribute(item.id) + '"' + (index === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-move="down" data-block-id="' + escapeAttribute(item.id) + '"' + (index === items.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-edit="' + escapeAttribute(item.id) + '">Edit</button>' +
            '<button type="button" class="btn admin-btn-delete-mini" data-block-delete="' + escapeAttribute(item.id) + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function renderTags(tags) {
    var normalized = normalizeTags(tags || []);
    if (!normalized.length) {
      return "";
    }

    return '<ul class="program-builder-block-tags-list">' + normalized.map(function (tag) {
      return '<li>' + escapeHtml(tag) + '</li>';
    }).join("") + '</ul>';
  }

  function buildExercisesFromSource(dayKey, sectionRaw) {
    var day = String(dayKey || "").trim();
    var section = String(sectionRaw || DEFAULT_SECTION).trim();
    if (!day) {
      return [];
    }

    var payload = readFromStorage(TEMPLATE_DRAFT_PREFIX + day);
    var sourceExercises = payload && Array.isArray(payload.exercises)
      ? normalizeExercises(payload.exercises)
      : [];

    if (!sourceExercises.length) {
      return [];
    }

    return (section === "__all__" ? sourceExercises : sourceExercises.filter(function (exercise) {
      return String(exercise && exercise.section || "").trim() === section;
    })).map(cloneExercise);
  }

  function filterItems(items, tag, entryType) {
    var targetTag = String(tag || "all").trim().toLowerCase();
    var targetType = normalizeFilterType(entryType);
    return sortItems(items || []).filter(function (item) {
      var tagMatch = targetTag === "all" || normalizeTags(item && item.tags || []).indexOf(targetTag) >= 0;
      var typeMatch = targetType === "all" || normalizeItemType(item && item.item_type, item && item.exercises) === targetType;
      return tagMatch && typeMatch;
    });
  }

  function findItemById(itemId) {
    return (Array.isArray(state.items) ? state.items : []).find(function (item) {
      return String(item && item.id || "") === String(itemId || "");
    }) || null;
  }

  function reindexItems() {
    var ordered = sortItems(state.items);
    ordered.forEach(function (item, index) {
      if (!item) {
        return;
      }
      item.sort_order = index;
      item.tags = normalizeTags(item.tags || []);
      item.item_type = normalizeItemType(item.item_type, item.exercises);
    });
    state.items = ordered;
  }

  function sortItems(items) {
    return (Array.isArray(items) ? items : []).slice().sort(function (a, b) {
      var aSort = parseSortOrder(a && a.sort_order);
      var bSort = parseSortOrder(b && b.sort_order);
      if (aSort !== bSort) {
        return aSort - bSort;
      }

      var aTime = Date.parse(String(a && a.created_at || ""));
      var bTime = Date.parse(String(b && b.created_at || ""));
      var safeATime = Number.isFinite(aTime) ? aTime : 0;
      var safeBTime = Number.isFinite(bTime) ? bTime : 0;
      return safeBTime - safeATime;
    });
  }

  function normalizeCloudItems(rows) {
    return (Array.isArray(rows) ? rows : []).map(mapCloudItem).filter(function (item) {
      return !!item;
    });
  }

  function mapCloudItem(row) {
    var src = row && typeof row === "object" ? row : {};
    var id = String(src.id || "").trim();
    var title = String(src.title || "").trim();
    var exercises = normalizeExercises(src.exercises || []);
    if (!id || !title || !exercises.length) {
      return null;
    }

    return {
      id: id,
      title: title,
      item_type: normalizeItemType(src.item_type, exercises),
      section: String(src.source_section || src.section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
      tags: normalizeTags(src.tags || []),
      sort_order: parseSortOrder(src.sort_order),
      exercises: exercises,
      created_at: String(src.created_at || ""),
      updated_at: String(src.updated_at || "")
    };
  }

  function readItemsFromStorage() {
    try {
      var raw = window.localStorage.getItem(WORKOUT_BLOCK_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (item) {
        var safe = item && typeof item === "object" ? item : {};
        var id = String(safe.id || "").trim();
        var title = String(safe.title || "").trim();
        var exercises = normalizeExercises(safe.exercises || []);
        if (!id || !title || !exercises.length) {
          return null;
        }

        return {
          id: id,
          title: title,
          item_type: normalizeItemType(safe.item_type, exercises),
          section: String(safe.section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
          tags: normalizeTags(safe.tags || []),
          sort_order: parseSortOrder(safe.sort_order),
          exercises: exercises,
          created_at: String(safe.created_at || ""),
          updated_at: String(safe.updated_at || "")
        };
      }).filter(function (item) {
        return !!item;
      });
    } catch (error) {
      return [];
    }
  }

  function writeItemsToStorage(items) {
    try {
      window.localStorage.setItem(WORKOUT_BLOCK_LIBRARY_KEY, JSON.stringify(sortItems(items).slice(0, 150)));
    } catch (error) {
      setStatus("Could not write local library cache.", "info");
    }
  }

  function itemSignature(item) {
    var safe = item && typeof item === "object" ? item : {};
    return [
      String(safe.title || "").trim().toLowerCase(),
      String(safe.section || "").trim().toLowerCase(),
      normalizeItemType(safe.item_type, safe.exercises),
      JSON.stringify(normalizeTags(safe.tags || [])),
      JSON.stringify(normalizeExercises(safe.exercises || []))
    ].join("|");
  }

  function collectTags(items) {
    var seen = {};
    var tags = [];
    (Array.isArray(items) ? items : []).forEach(function (item) {
      normalizeTags(item && item.tags || []).forEach(function (tag) {
        if (seen[tag]) {
          return;
        }
        seen[tag] = true;
        tags.push(tag);
      });
    });
    return tags.sort();
  }

  function parseTags(raw) {
    return normalizeTags(String(raw || "").split(","));
  }

  function normalizeTags(tags) {
    var list = Array.isArray(tags) ? tags : [];
    var seen = {};
    return list.map(function (tag) {
      return String(tag || "").trim().toLowerCase();
    }).filter(function (tag) {
      if (!tag || seen[tag]) {
        return false;
      }
      seen[tag] = true;
      return true;
    }).slice(0, 12);
  }

  function normalizeExercises(exercises) {
    return (Array.isArray(exercises) ? exercises : []).map(function (exercise) {
      var safe = exercise && typeof exercise === "object" ? exercise : {};
      var sets = normalizeSets(safe.sets);
      var description = String(safe.description || (sets[0] && sets[0].notes) || "");
      return {
        name: String(safe.name || "Exercise").trim() || "Exercise",
        section: String(safe.section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
        mode: String(safe.mode || DEFAULT_MODE).trim() || DEFAULT_MODE,
        description: description,
        video_demo_url: String(safe.video_demo_url || "").trim(),
        superset_group: safe.superset_group || null,
        field_toggles: safe.field_toggles && typeof safe.field_toggles === "object" ? safe.field_toggles : null,
        sets: sets.map(function (set) {
          var next = Object.assign({}, set);
          if (!String(next.notes || "").trim() && description) {
            next.notes = description;
          }
          if (!String(next.target_notes || "").trim() && description) {
            next.target_notes = description;
          }
          return next;
        })
      };
    }).filter(function (exercise) {
      return Array.isArray(exercise.sets) && exercise.sets.length > 0 && String(exercise.name || "").trim();
    });
  }

  function normalizeSets(sets) {
    var list = Array.isArray(sets) && sets.length ? sets : [{}];
    return list.map(function (set) {
      var safe = set && typeof set === "object" ? set : {};
      return {
        reps: safe.reps != null ? safe.reps : "",
        weight: safe.weight != null ? safe.weight : "",
        rpe: safe.rpe != null ? safe.rpe : "",
        rest: safe.rest != null ? safe.rest : "",
        notes: safe.notes != null ? safe.notes : "",
        done: !!safe.done,
        target_reps: safe.target_reps != null ? safe.target_reps : safe.reps,
        target_weight: safe.target_weight != null ? safe.target_weight : safe.weight,
        target_rpe: safe.target_rpe != null ? safe.target_rpe : safe.rpe,
        target_rest: safe.target_rest != null ? safe.target_rest : safe.rest,
        target_notes: safe.target_notes != null ? safe.target_notes : safe.notes
      };
    });
  }

  function createDefaultExercise() {
    return {
      name: "",
      section: DEFAULT_SECTION,
      mode: DEFAULT_MODE,
      description: "",
      video_demo_url: "",
      superset_group: null,
      field_toggles: null,
      sets: [{
        reps: "",
        weight: "",
        rpe: "",
        rest: "",
        notes: "",
        done: false,
        target_reps: "",
        target_weight: "",
        target_rpe: "",
        target_rest: "",
        target_notes: ""
      }]
    };
  }

  function cloneExercise(exercise) {
    return normalizeExercises(clone([exercise]))[0] || createDefaultExercise();
  }

  function deriveItemSection(exercises, entryType) {
    if (!Array.isArray(exercises) || !exercises.length) {
      return DEFAULT_SECTION;
    }

    if (entryType === "exercise") {
      return String(exercises[0].section || DEFAULT_SECTION);
    }

    var firstSection = String(exercises[0].section || DEFAULT_SECTION);
    var mixed = exercises.some(function (exercise) {
      return String(exercise && exercise.section || DEFAULT_SECTION) !== firstSection;
    });
    return mixed ? "Mixed Block" : firstSection;
  }

  function buildCloudPayload(item) {
    return {
      coach_user_id: state.coachUserId,
      title: String(item && item.title || "Library Item").trim() || "Library Item",
      item_type: normalizeItemType(item && item.item_type, item && item.exercises),
      source_section: String(item && item.section || DEFAULT_SECTION).trim() || DEFAULT_SECTION,
      tags: normalizeTags(item && item.tags || []),
      sort_order: parseSortOrder(item && item.sort_order),
      exercises: normalizeExercises(item && item.exercises || [])
    };
  }

  function getSelectedEntryType() {
    var entryTypeInput = document.querySelector("[data-block-entry-type]");
    return normalizeItemType(entryTypeInput && entryTypeInput.value, state.draftExercises);
  }

  function normalizeItemType(value, exercises) {
    var type = String(value || "").trim().toLowerCase();
    if (type === "exercise" || type === "block") {
      return type;
    }
    return Array.isArray(exercises) && exercises.length === 1 ? "exercise" : "block";
  }

  function normalizeFilterType(value) {
    var type = String(value || "all").trim().toLowerCase();
    return type === "exercise" || type === "block" ? type : "all";
  }

  function renderSectionOptions(selected) {
    return SECTION_OPTIONS.map(function (section) {
      return '<option value="' + escapeAttribute(section) + '"' + (section === selected ? ' selected' : '') + '>' + escapeHtml(section) + '</option>';
    }).join("");
  }

  function renderModeOptions(selected) {
    return ["reps", "time", "endurance"].map(function (mode) {
      return '<option value="' + escapeAttribute(mode) + '"' + (mode === selected ? ' selected' : '') + '>' + escapeHtml(mode) + '</option>';
    }).join("");
  }

  function readFieldValue(root, selector) {
    var field = root && root.querySelector ? root.querySelector(selector) : null;
    return String(field && field.value || "").trim();
  }

  function firstSetValue(exercise, key) {
    var firstSet = exercise && Array.isArray(exercise.sets) && exercise.sets[0] ? exercise.sets[0] : {};
    return firstSet && firstSet[key] != null ? String(firstSet[key]) : "";
  }

  function parseSortOrder(value) {
    var num = parseInt(value, 10);
    return Number.isFinite(num) ? num : 0;
  }

  function setStatus(message, tone) {
    var status = document.querySelector("[data-block-status]");
    if (!status) {
      return;
    }

    status.textContent = String(message || "");
    status.classList.remove("status-success", "status-error", "status-info");
    status.classList.add(tone === "success" ? "status-success" : tone === "error" ? "status-error" : "status-info");
  }

  function parseSlotKey(slotKey) {
    var match = /^w(\d+)d(\d+)$/i.exec(String(slotKey || ""));
    if (!match) {
      return null;
    }

    return {
      week: parseInt(match[1], 10),
      workout: parseInt(match[2], 10)
    };
  }

  function compareSlotKeysAsc(a, b) {
    var left = parseSlotKey(a);
    var right = parseSlotKey(b);
    if (!left || !right) {
      return String(a || "").localeCompare(String(b || ""));
    }
    if (left.week !== right.week) {
      return left.week - right.week;
    }
    return left.workout - right.workout;
  }

  function labelForSlot(slotKey) {
    var parsed = parseSlotKey(slotKey);
    if (!parsed) {
      return String(slotKey || "Workout Day");
    }
    return "Week " + parsed.week + " - Workout " + parsed.workout;
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function readFromStorage(key) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function createSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
      return null;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return null;
    }

    try {
      return window.supabase.createClient(url, key);
    } catch (error) {
      return null;
    }
  }

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value || []));
    } catch (error) {
      return Array.isArray(value) ? value.slice() : [];
    }
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
})();
*/