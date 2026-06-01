(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_DRAFT_PREFIX = "nomadic_training_program_template_builder_draft_";
  var WORKOUT_BLOCK_LIBRARY_KEY = "nomadic_template_workout_blocks_v1";

  var state = {
    client: null,
    coachUserId: null,
    blocks: [],
    filterTag: "all",
    editingId: null
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    state.client = createSupabaseClient();
    if (!state.client) {
      showGuard("Supabase is unavailable. Check client configuration.");
      return;
    }

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      var user = session && session.user;
      var email = String(user && user.email || "").toLowerCase();
      if (!user || email !== ADMIN_EMAIL) {
        showGuard("Workout block management is available to coach accounts only.");
        return;
      }

      state.coachUserId = String(user.id || "");
      showContent();
      bindEvents();
      loadDraftDayOptions();
      loadBlocksFromCloud();
    }).catch(function () {
      showGuard("Could not verify coach access.");
    });
  }

  function showGuard(message) {
    var guard = document.querySelector("[data-block-manager-guard]");
    var content = document.querySelector("[data-block-manager-content]");
    if (guard) {
      guard.innerHTML = '<p class="admin-loading">' + escapeHtml(message) + "</p>";
    }
    if (content) {
      content.hidden = true;
    }
  }

  function showContent() {
    var guard = document.querySelector("[data-block-manager-guard]");
    var content = document.querySelector("[data-block-manager-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function bindEvents() {
    var saveButton = document.querySelector("[data-block-save]");
    var cancelButton = document.querySelector("[data-block-cancel-edit]");
    var filterInput = document.querySelector("[data-block-filter]");
    var titleInput = document.querySelector("[data-block-title]");

    if (saveButton) {
      saveButton.addEventListener("click", onSaveBlock);
    }

    if (cancelButton) {
      cancelButton.addEventListener("click", clearEditState);
    }

    if (filterInput) {
      filterInput.addEventListener("change", function () {
        state.filterTag = String(filterInput.value || "all").trim() || "all";
        renderBlocks();
      });
    }

    if (titleInput) {
      titleInput.addEventListener("keydown", function (event) {
        if (!event || event.key !== "Enter") {
          return;
        }
        event.preventDefault();
        onSaveBlock();
      });
    }

    document.addEventListener("click", function (event) {
      var editBtn = event.target && event.target.closest("[data-block-edit]");
      if (editBtn) {
        startEditingBlock(String(editBtn.getAttribute("data-block-edit") || ""));
        return;
      }

      var deleteBtn = event.target && event.target.closest("[data-block-delete]");
      if (deleteBtn) {
        deleteBlock(String(deleteBtn.getAttribute("data-block-delete") || ""));
        return;
      }

      var moveBtn = event.target && event.target.closest("[data-block-move]");
      if (moveBtn) {
        moveBlock(
          String(moveBtn.getAttribute("data-block-id") || ""),
          String(moveBtn.getAttribute("data-block-move") || "")
        );
      }
    });
  }

  function loadDraftDayOptions() {
    var daySelect = document.querySelector("[data-block-source-day]");
    if (!daySelect) {
      return;
    }

    var draftDays = getTemplateDraftDays();
    var options = ['<option value="">Select a source day</option>']
      .concat(draftDays.map(function (day) {
        return '<option value="' + escapeAttribute(day) + '">' + escapeHtml(labelForSlot(day)) + '</option>';
      }))
      .join("");

    daySelect.innerHTML = options;
  }

  function getTemplateDraftDays() {
    var days = [];
    var seen = {};
    try {
      for (var i = 0; i < window.localStorage.length; i++) {
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
    } catch (e) {
      return [];
    }

    return days.sort(compareSlotKeysAsc);
  }

  function loadBlocksFromCloud() {
    state.blocks = readBlocksFromStorage();

    state.client
      .from("coach_workout_blocks")
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .eq("coach_user_id", state.coachUserId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          renderBlocks();
          setStatus("Using local cache. Cloud read failed.", "info");
          return;
        }

        var cloudBlocks = normalizeCloudBlocks(result.data || []);
        mergeAndBackfillCloud(cloudBlocks).then(function (merged) {
          state.blocks = sortBlocks(merged);
          writeBlocksToStorage(state.blocks);
          renderBlocks();
          setStatus("Workout blocks loaded.", "success");
        });
      })
      .catch(function () {
        renderBlocks();
        setStatus("Using local cache. Cloud read failed.", "info");
      });
  }

  function mergeAndBackfillCloud(cloudBlocks) {
    var localBlocks = readBlocksFromStorage();
    var signatures = {};
    cloudBlocks.forEach(function (block) {
      signatures[blockSignature(block)] = true;
    });

    var unsynced = localBlocks.filter(function (block) {
      return !signatures[blockSignature(block)];
    });

    if (!unsynced.length) {
      return Promise.resolve(cloudBlocks);
    }

    var rows = unsynced.map(function (block) {
      return {
        coach_user_id: state.coachUserId,
        title: block.title,
        source_section: block.section,
        tags: normalizeTags(block.tags || []),
        sort_order: parseSortOrder(block.sort_order),
        exercises: normalizeExercises(block.exercises || [])
      };
    });

    return state.client
      .from("coach_workout_blocks")
      .insert(rows)
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .then(function (result) {
        if (result.error) {
          return cloudBlocks;
        }
        return sortBlocks(cloudBlocks.concat(normalizeCloudBlocks(result.data || [])));
      })
      .catch(function () {
        return cloudBlocks;
      });
  }

  function onSaveBlock() {
    var titleInput = document.querySelector("[data-block-title]");
    var dayInput = document.querySelector("[data-block-source-day]");
    var sectionInput = document.querySelector("[data-block-section]");
    var tagsInput = document.querySelector("[data-block-tags]");

    var title = String((titleInput && titleInput.value) || "").trim();
    var sourceDay = String((dayInput && dayInput.value) || "").trim();
    var sectionRaw = String((sectionInput && sectionInput.value) || "Warm Up").trim();
    var section = sectionRaw === "__all__" ? "Entire Day" : sectionRaw;
    var tags = parseTags((tagsInput && tagsInput.value) || "");

    if (!title) {
      setStatus("Title is required.", "error");
      if (titleInput) {
        titleInput.focus();
      }
      return;
    }

    var existing = findBlockById(state.editingId);
    var exercises = buildExercisesFromSource(sourceDay, sectionRaw, existing);
    if (!exercises.length) {
      setStatus("Select a source day with exercises for this section.", "info");
      return;
    }

    if (state.editingId) {
      updateBlock(existing, {
        title: title,
        section: section,
        tags: tags,
        exercises: exercises
      });
      return;
    }

    createBlock({
      title: title,
      section: section,
      tags: tags,
      exercises: exercises
    });
  }

  function createBlock(payload) {
    var localBlock = {
      id: "block_" + Date.now() + "_" + Math.floor(Math.random() * 10000),
      title: payload.title,
      section: payload.section,
      tags: normalizeTags(payload.tags || []),
      sort_order: 0,
      exercises: normalizeExercises(payload.exercises || []),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    state.client
      .from("coach_workout_blocks")
      .insert({
        coach_user_id: state.coachUserId,
        title: localBlock.title,
        source_section: localBlock.section,
        tags: localBlock.tags,
        sort_order: 0,
        exercises: localBlock.exercises
      })
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .single()
      .then(function (result) {
        if (result.error) {
          saveLocalOnly(localBlock, "Saved locally. Cloud sync failed.");
          return;
        }

        var cloudBlock = mapCloudBlock(result.data || {});
        state.blocks.unshift(cloudBlock);
        reindexBlocks();
        writeBlocksToStorage(state.blocks);
        renderBlocks();
        clearEditState();
        setStatus("Saved block: " + localBlock.title + ".", "success");
        persistOrderToCloud();
      })
      .catch(function () {
        saveLocalOnly(localBlock, "Saved locally. Cloud sync failed.");
      });
  }

  function updateBlock(existing, payload) {
    if (!existing) {
      setStatus("Block not found.", "error");
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
      state.blocks = state.blocks.map(function (block) {
        return String(block.id) === String(updated.id) ? updated : block;
      });
      reindexBlocks();
      writeBlocksToStorage(state.blocks);
      renderBlocks();
      clearEditState();
      setStatus("Updated block: " + updated.title + ".", "success");
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
        source_section: updated.section,
        tags: updated.tags,
        exercises: updated.exercises
      })
      .eq("id", existing.id)
      .eq("coach_user_id", state.coachUserId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message || "Could not update block.", "error");
          return;
        }
        applyLocal();
      })
      .catch(function () {
        setStatus("Could not update block.", "error");
      });
  }

  function saveLocalOnly(block, message) {
    state.blocks.unshift(block);
    reindexBlocks();
    writeBlocksToStorage(state.blocks);
    renderBlocks();
    clearEditState();
    setStatus(message, "info");
  }

  function startEditingBlock(blockId) {
    var block = findBlockById(blockId);
    if (!block) {
      return;
    }

    var titleInput = document.querySelector("[data-block-title]");
    var sectionInput = document.querySelector("[data-block-section]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var dayInput = document.querySelector("[data-block-source-day]");
    var saveButton = document.querySelector("[data-block-save]");
    var cancelButton = document.querySelector("[data-block-cancel-edit]");

    state.editingId = String(block.id);

    if (titleInput) {
      titleInput.value = String(block.title || "");
      titleInput.focus();
    }
    if (sectionInput) {
      sectionInput.value = block.section === "Entire Day" ? "__all__" : String(block.section || "Warm Up");
    }
    if (tagsInput) {
      tagsInput.value = normalizeTags(block.tags || []).join(", ");
    }
    if (dayInput) {
      dayInput.value = "";
    }
    if (saveButton) {
      saveButton.textContent = "Update Block";
    }
    if (cancelButton) {
      cancelButton.hidden = false;
    }

    renderBlocks();
    setStatus("Editing block: " + String(block.title || "Workout Block") + ".", "info");
  }

  function clearEditState() {
    state.editingId = null;

    var titleInput = document.querySelector("[data-block-title]");
    var sectionInput = document.querySelector("[data-block-section]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var dayInput = document.querySelector("[data-block-source-day]");
    var saveButton = document.querySelector("[data-block-save]");
    var cancelButton = document.querySelector("[data-block-cancel-edit]");

    if (titleInput) {
      titleInput.value = "";
    }
    if (sectionInput) {
      sectionInput.value = "Warm Up";
    }
    if (tagsInput) {
      tagsInput.value = "";
    }
    if (dayInput) {
      dayInput.value = "";
    }
    if (saveButton) {
      saveButton.textContent = "Save Block";
    }
    if (cancelButton) {
      cancelButton.hidden = true;
    }

    renderBlocks();
  }

  function deleteBlock(blockId) {
    var block = findBlockById(blockId);
    if (!block) {
      return;
    }

    if (!confirm("Delete saved block '" + String(block.title || "Workout Block") + "'?")) {
      return;
    }

    var removeLocal = function () {
      state.blocks = state.blocks.filter(function (entry) {
        return String(entry.id) !== String(blockId);
      });
      if (String(state.editingId || "") === String(blockId)) {
        clearEditState();
      }
      reindexBlocks();
      writeBlocksToStorage(state.blocks);
      renderBlocks();
      setStatus("Block deleted.", "info");
      persistOrderToCloud();
    };

    if (!isUuid(blockId)) {
      removeLocal();
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .delete()
      .eq("id", blockId)
      .eq("coach_user_id", state.coachUserId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message || "Could not delete block.", "error");
          return;
        }
        removeLocal();
      })
      .catch(function () {
        setStatus("Could not delete block.", "error");
      });
  }

  function moveBlock(blockId, direction) {
    var delta = direction === "up" ? -1 : (direction === "down" ? 1 : 0);
    if (!delta) {
      return;
    }

    var ordered = sortBlocks(state.blocks);
    var index = ordered.findIndex(function (block) {
      return String(block.id) === String(blockId);
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
    state.blocks = ordered;
    reindexBlocks();
    writeBlocksToStorage(state.blocks);
    renderBlocks();
    setStatus("Block order updated.", "success");
    persistOrderToCloud();
  }

  function persistOrderToCloud() {
    var cloudBlocks = (Array.isArray(state.blocks) ? state.blocks : []).filter(function (block) {
      return block && isUuid(block.id);
    });
    if (!cloudBlocks.length) {
      return;
    }

    Promise.all(cloudBlocks.map(function (block) {
      return state.client
        .from("coach_workout_blocks")
        .update({ sort_order: parseSortOrder(block.sort_order) })
        .eq("id", block.id)
        .eq("coach_user_id", state.coachUserId)
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    }));
  }

  function renderBlocks() {
    var list = document.querySelector("[data-block-list]");
    var filterInput = document.querySelector("[data-block-filter]");
    if (!list) {
      return;
    }

    var allBlocks = sortBlocks(state.blocks);
    var availableTags = collectTags(allBlocks);
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

    var blocks = filterBlocksByTag(allBlocks, state.filterTag);
    if (!blocks.length) {
      list.innerHTML = '<p class="admin-loading">No saved blocks yet.</p>';
      return;
    }

    list.innerHTML = blocks.map(function (block, idx) {
      var tags = normalizeTags(block.tags || []);
      var tagsHtml = tags.length
        ? '<ul class="program-builder-block-tags-list">' + tags.map(function (tag) {
            return '<li>' + escapeHtml(tag) + '</li>';
          }).join("") + "</ul>"
        : "";
      var exerciseCount = Array.isArray(block.exercises) ? block.exercises.length : 0;
      var editingBadge = String(state.editingId || "") === String(block.id) ? '<p class="program-builder-block-item-editing">Editing</p>' : "";

      return (
        '<article class="program-builder-block-item">' +
          '<div class="program-builder-block-main">' +
            editingBadge +
            '<p class="program-builder-block-name">' + escapeHtml(block.title || "Workout Block") + '</p>' +
            '<p class="program-builder-block-meta">' +
              escapeHtml(String(block.section || "Workout Block")) +
              " - " +
              escapeHtml(String(exerciseCount)) +
              " exercise" + (exerciseCount === 1 ? "" : "s") +
            '</p>' +
            tagsHtml +
          '</div>' +
          '<div class="program-builder-block-actions">' +
            '<button type="button" class="btn admin-btn-small" data-block-move="up" data-block-id="' + escapeAttribute(block.id) + '"' + (idx === 0 ? " disabled" : "") + '>↑</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-move="down" data-block-id="' + escapeAttribute(block.id) + '"' + (idx === blocks.length - 1 ? " disabled" : "") + '>↓</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-edit="' + escapeAttribute(block.id) + '">Edit</button>' +
            '<button type="button" class="btn admin-btn-delete-mini" data-block-delete="' + escapeAttribute(block.id) + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function buildExercisesFromSource(dayKey, sectionRaw, existing) {
    var day = String(dayKey || "").trim();
    var section = String(sectionRaw || "Warm Up").trim();

    if (!day) {
      return normalizeExercises(existing && existing.exercises || []);
    }

    var payload = readFromStorage(TEMPLATE_DRAFT_PREFIX + day);
    var sourceExercises = payload && Array.isArray(payload.exercises)
      ? normalizeExercises(payload.exercises)
      : [];

    if (!sourceExercises.length) {
      return [];
    }

    var selected = section === "__all__"
      ? clone(sourceExercises)
      : clone(sourceExercises.filter(function (exercise) {
          return String(exercise && exercise.section || "").trim() === section;
        }));

    return normalizeExercises(selected).map(function (exercise) {
      var nextExercise = Object.assign({}, exercise, { superset_group: null });
      nextExercise.sets = (Array.isArray(exercise.sets) ? exercise.sets : []).map(function (set) {
        return Object.assign({}, set, { done: false });
      });
      return nextExercise;
    });
  }

  function findBlockById(blockId) {
    return (Array.isArray(state.blocks) ? state.blocks : []).find(function (block) {
      return String(block && block.id || "") === String(blockId || "");
    }) || null;
  }

  function reindexBlocks() {
    var ordered = sortBlocks(state.blocks);
    ordered.forEach(function (block, index) {
      if (!block) {
        return;
      }
      block.sort_order = index;
      block.tags = normalizeTags(block.tags || []);
    });
    state.blocks = ordered;
  }

  function sortBlocks(blocks) {
    return (Array.isArray(blocks) ? blocks : []).slice().sort(function (a, b) {
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

  function normalizeCloudBlocks(rows) {
    return (Array.isArray(rows) ? rows : [])
      .map(function (row) {
        return mapCloudBlock(row);
      })
      .filter(function (block) {
        return !!block;
      });
  }

  function mapCloudBlock(row) {
    var src = row && typeof row === "object" ? row : {};
    var id = String(src.id || "").trim();
    var title = String(src.title || "").trim();
    var section = String(src.source_section || src.section || "Workout Block").trim() || "Workout Block";
    var exercises = normalizeExercises(src.exercises || []);

    if (!id || !title || !exercises.length) {
      return null;
    }

    return {
      id: id,
      title: title,
      section: section,
      tags: normalizeTags(src.tags || []),
      sort_order: parseSortOrder(src.sort_order),
      exercises: exercises,
      created_at: String(src.created_at || ""),
      updated_at: String(src.updated_at || "")
    };
  }

  function readBlocksFromStorage() {
    try {
      var raw = window.localStorage.getItem(WORKOUT_BLOCK_LIBRARY_KEY);
      if (!raw) {
        return [];
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map(function (item) {
          var block = item && typeof item === "object" ? item : {};
          var id = String(block.id || "").trim();
          var title = String(block.title || "").trim();
          var section = String(block.section || "Workout Block").trim() || "Workout Block";
          var exercises = normalizeExercises(block.exercises || []);

          if (!id || !title || !exercises.length) {
            return null;
          }

          return {
            id: id,
            title: title,
            section: section,
            tags: normalizeTags(block.tags || []),
            sort_order: parseSortOrder(block.sort_order),
            exercises: exercises,
            created_at: String(block.created_at || ""),
            updated_at: String(block.updated_at || "")
          };
        })
        .filter(function (item) {
          return !!item;
        });
    } catch (e) {
      return [];
    }
  }

  function writeBlocksToStorage(blocks) {
    try {
      var payload = sortBlocks(blocks).slice(0, 150);
      window.localStorage.setItem(WORKOUT_BLOCK_LIBRARY_KEY, JSON.stringify(payload));
    } catch (e) {
      setStatus("Could not write local block cache.", "info");
    }
  }

  function blockSignature(block) {
    var safe = block && typeof block === "object" ? block : {};
    var title = String(safe.title || "").trim().toLowerCase();
    var section = String(safe.section || "").trim().toLowerCase();
    var tags = normalizeTags(safe.tags || []);
    var exercises = normalizeExercises(safe.exercises || []);
    return title + "|" + section + "|" + JSON.stringify(tags) + "|" + JSON.stringify(exercises);
  }

  function filterBlocksByTag(blocks, tag) {
    var target = String(tag || "all").trim().toLowerCase();
    var sorted = sortBlocks(blocks || []);
    if (target === "all") {
      return sorted;
    }

    return sorted.filter(function (block) {
      return normalizeTags(block.tags || []).indexOf(target) >= 0;
    });
  }

  function collectTags(blocks) {
    var seen = {};
    var tags = [];
    (Array.isArray(blocks) ? blocks : []).forEach(function (block) {
      normalizeTags(block.tags || []).forEach(function (tag) {
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
    return list
      .map(function (tag) {
        return String(tag || "").trim().toLowerCase();
      })
      .filter(function (tag) {
        if (!tag || seen[tag]) {
          return false;
        }
        seen[tag] = true;
        return true;
      })
      .slice(0, 12);
  }

  function normalizeExercises(exercises) {
    var source = Array.isArray(exercises) ? exercises : [];
    return source.map(function (exercise) {
      var safe = exercise && typeof exercise === "object" ? exercise : {};
      return {
        name: String(safe.name || "Exercise"),
        section: String(safe.section || "A Block"),
        mode: String(safe.mode || "reps"),
        superset_group: safe.superset_group || null,
        field_toggles: safe.field_toggles && typeof safe.field_toggles === "object" ? safe.field_toggles : null,
        sets: normalizeSets(safe.sets)
      };
    }).filter(function (exercise) {
      return Array.isArray(exercise.sets) && exercise.sets.length > 0;
    });
  }

  function normalizeSets(sets) {
    var source = Array.isArray(sets) ? sets : [];
    return source.map(function (set) {
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
    var uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidPattern.test(String(value || ""));
  }

  function readFromStorage(key) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
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
    } catch (e) {
      return null;
    }
  }

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value || []));
    } catch (e) {
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
(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var TEMPLATE_DRAFT_PREFIX = "nomadic_training_program_template_builder_draft_";
  var WORKOUT_BLOCK_LIBRARY_KEY = "nomadic_template_workout_blocks_v1";

  var state = {
    client: null,
    coachUserId: null,
    blocks: [],
    editingId: null,
    filterTag: "all"
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    bindEvents();

    state.client = createSupabaseClient();
    if (!state.client) {
      showGuardMessage("Supabase is not configured. Cannot load workout block manager.");
      return;
    }

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      var user = session && session.user;
      var email = String(user && user.email || "").toLowerCase();
      var isCoach = !!email && email === ADMIN_EMAIL;

      if (!isCoach) {
        showGuardMessage("Coach access is required to manage workout blocks.");
        return;
      }

      state.coachUserId = String(user && user.id || "").trim() || null;
      if (!state.coachUserId) {
        showGuardMessage("Could not verify coach account.");
        return;
      }

      showManager();
      loadDraftDayOptions();
      loadWorkoutBlocks();
    }).catch(function () {
      showGuardMessage("Could not verify session. Please sign in again.");
    });
  }

  function bindEvents() {
    var saveBtn = document.querySelector("[data-block-save]");
    var cancelBtn = document.querySelector("[data-block-cancel-edit]");
    var filterInput = document.querySelector("[data-block-filter]");
    var list = document.querySelector("[data-block-list]");

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        saveOrUpdateBlock();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        clearEditState();
      });
    }

    if (filterInput) {
      filterInput.addEventListener("change", function () {
        state.filterTag = String(filterInput.value || "all").trim() || "all";
        renderBlocks();
      });
    }

    if (list) {
      list.addEventListener("click", function (event) {
        var editBtn = event.target && event.target.closest("[data-block-edit]");
        if (editBtn) {
          startEditById(String(editBtn.getAttribute("data-block-edit") || ""));
          return;
        }

        var deleteBtn = event.target && event.target.closest("[data-block-delete]");
        if (deleteBtn) {
          deleteById(String(deleteBtn.getAttribute("data-block-delete") || ""));
          return;
        }

        var moveBtn = event.target && event.target.closest("[data-block-move]");
        if (moveBtn) {
          moveBlock(String(moveBtn.getAttribute("data-block-id") || ""), String(moveBtn.getAttribute("data-block-move") || ""));
        }
      });
    }
  }

  function showGuardMessage(message) {
    var guard = document.querySelector("[data-block-manager-guard]");
    var content = document.querySelector("[data-block-manager-content]");

    if (guard) {
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

  function setStatus(message, tone) {
    var el = document.querySelector("[data-block-status]");
    if (!el) {
      return;
    }

    el.textContent = String(message || "").trim();
    el.className = tone === "error" ? "profile-status profile-status-error" : "admin-loading";
  }

  function loadDraftDayOptions() {
    var sourceSelect = document.querySelector("[data-block-source-day]");
    if (!sourceSelect) {
      return;
    }

    var days = readTemplateDraftDays();
    var options = ['<option value="">Select a source day</option>']
      .concat(days.map(function (dayKey) {
        return '<option value="' + escapeAttribute(dayKey) + '">' + escapeHtml(labelForSlot(dayKey)) + '</option>';
      }))
      .join("");

    sourceSelect.innerHTML = options;
  }

  function loadWorkoutBlocks() {
    var local = readBlocksFromStorage();

    state.client
      .from("coach_workout_blocks")
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .eq("coach_user_id", state.coachUserId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          state.blocks = sortBlocks(local);
          renderBlocks();
          setStatus("Loaded local block cache. Cloud read failed.", "error");
          return;
        }

        var cloudBlocks = normalizeCloudRows(result.data || []);
        mergeAndBackfillLocal(cloudBlocks, local).then(function (merged) {
          state.blocks = sortBlocks(merged);
          writeBlocksToStorage(state.blocks);
          renderBlocks();
        });
      })
      .catch(function () {
        state.blocks = sortBlocks(local);
        renderBlocks();
        setStatus("Loaded local block cache.", "error");
      });
  }

  function mergeAndBackfillLocal(cloudBlocks, localBlocks) {
    var cloud = Array.isArray(cloudBlocks) ? cloudBlocks : [];
    var local = Array.isArray(localBlocks) ? localBlocks : [];

    var signatures = {};
    cloud.forEach(function (block) {
      signatures[blockSignature(block)] = true;
    });

    var unsyncedLocal = local.filter(function (block) {
      return !signatures[blockSignature(block)];
    });

    if (!unsyncedLocal.length) {
      return Promise.resolve(cloud);
    }

    var rows = unsyncedLocal.map(function (block) {
      return {
        coach_user_id: state.coachUserId,
        title: block.title,
        source_section: block.section,
        tags: normalizeTags(block.tags || []),
        sort_order: parseSortOrder(block.sort_order),
        exercises: normalizeExercises(block.exercises)
      };
    });

    return state.client
      .from("coach_workout_blocks")
      .insert(rows)
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .then(function (insertResult) {
        if (insertResult.error) {
          return cloud;
        }

        var inserted = normalizeCloudRows(insertResult.data || []);
        return sortBlocks(cloud.concat(inserted));
      })
      .catch(function () {
        return cloud;
      });
  }

  function saveOrUpdateBlock() {
    var titleInput = document.querySelector("[data-block-title]");
    var sourceDayInput = document.querySelector("[data-block-source-day]");
    var sectionInput = document.querySelector("[data-block-section]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var saveBtn = document.querySelector("[data-block-save]");

    var title = String(titleInput && titleInput.value || "").trim();
    var sourceDay = String(sourceDayInput && sourceDayInput.value || "").trim();
    var sectionInputValue = String(sectionInput && sectionInput.value || "Warm Up").trim();
    var sectionLabel = sectionInputValue === "__all__" ? "Entire Day" : sectionInputValue;
    var tags = parseTags(tagsInput && tagsInput.value || "");

    if (!title) {
      setStatus("Enter a block title.", "error");
      if (titleInput) {
        titleInput.focus();
      }
      return;
    }

    var editingBlock = findBlockById(state.editingId);
    var sourceExercises = readDraftExercisesForDay(sourceDay);
    var exercises = [];

    if (sourceDay) {
      exercises = sectionInputValue === "__all__"
        ? clone(sourceExercises)
        : clone(sourceExercises.filter(function (exercise) {
            return String(exercise && exercise.section || "").trim() === sectionInputValue;
          }));
    } else if (editingBlock) {
      exercises = clone(editingBlock.exercises || []);
    }

    exercises = normalizeExercises(exercises).map(function (exercise) {
      var nextExercise = Object.assign({}, exercise, { superset_group: null });
      nextExercise.sets = (Array.isArray(nextExercise.sets) ? nextExercise.sets : []).map(function (set) {
        return Object.assign({}, set, { done: false });
      });
      return nextExercise;
    });

    if (!exercises.length) {
      setStatus("Choose a source day with exercises for this section.", "error");
      return;
    }

    if (saveBtn) {
      saveBtn.disabled = true;
    }

    var nextBlock = {
      id: editingBlock ? editingBlock.id : ("block_" + Date.now() + "_" + Math.floor(Math.random() * 10000)),
      title: title,
      section: sectionLabel,
      tags: tags,
      sort_order: editingBlock ? parseSortOrder(editingBlock.sort_order) : 0,
      exercises: exercises,
      created_at: editingBlock ? String(editingBlock.created_at || "") : new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (editingBlock) {
      updateBlock(nextBlock, saveBtn);
      return;
    }

    createBlock(nextBlock, saveBtn);
  }

  function createBlock(block, saveBtn) {
    var onComplete = function () {
      if (saveBtn) {
        saveBtn.disabled = false;
      }
    };

    state.client
      .from("coach_workout_blocks")
      .insert({
        coach_user_id: state.coachUserId,
        title: block.title,
        source_section: block.section,
        tags: block.tags,
        sort_order: 0,
        exercises: block.exercises
      })
      .select("id,title,source_section,tags,sort_order,exercises,created_at,updated_at")
      .single()
      .then(function (result) {
        if (result.error) {
          state.blocks.unshift(block);
          reindexBlocks();
          writeBlocksToStorage(state.blocks);
          renderBlocks();
          clearEditState();
          setStatus("Saved locally. Cloud save failed.", "error");
          onComplete();
          return;
        }

        var saved = mapCloudRow(result.data || {});
        state.blocks.unshift(saved);
        reindexBlocks();
        writeBlocksToStorage(state.blocks);
        renderBlocks();
        clearEditState();
        persistOrder();
        setStatus("Saved workout block.", "success");
        onComplete();
      })
      .catch(function () {
        state.blocks.unshift(block);
        reindexBlocks();
        writeBlocksToStorage(state.blocks);
        renderBlocks();
        clearEditState();
        setStatus("Saved locally. Cloud save failed.", "error");
        onComplete();
      });
  }

  function updateBlock(block, saveBtn) {
    var onComplete = function () {
      if (saveBtn) {
        saveBtn.disabled = false;
      }
    };

    if (!isUuid(block.id)) {
      applyUpdatedBlockLocal(block);
      onComplete();
      return;
    }

    state.client
      .from("coach_workout_blocks")
      .update({
        title: block.title,
        source_section: block.section,
        tags: block.tags,
        exercises: block.exercises
      })
      .eq("id", block.id)
      .eq("coach_user_id", state.coachUserId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message || "Could not update block.", "error");
          onComplete();
          return;
        }

        applyUpdatedBlockLocal(block);
        persistOrder();
        setStatus("Updated workout block.", "success");
        onComplete();
      })
      .catch(function () {
        setStatus("Could not update block.", "error");
        onComplete();
      });
  }

  function applyUpdatedBlockLocal(block) {
    var idx = state.blocks.findIndex(function (entry) {
      return String(entry && entry.id || "") === String(block.id || "");
    });
    if (idx < 0) {
      return;
    }

    state.blocks[idx] = block;
    reindexBlocks();
    writeBlocksToStorage(state.blocks);
    renderBlocks();
    clearEditState();
  }

  function startEditById(blockId) {
    var block = findBlockById(blockId);
    if (!block) {
      return;
    }

    state.editingId = String(block.id || "");

    var titleInput = document.querySelector("[data-block-title]");
    var sectionInput = document.querySelector("[data-block-section]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var sourceDayInput = document.querySelector("[data-block-source-day]");
    var saveBtn = document.querySelector("[data-block-save]");
    var cancelBtn = document.querySelector("[data-block-cancel-edit]");

    if (titleInput) {
      titleInput.value = String(block.title || "");
    }
    if (sectionInput) {
      sectionInput.value = String(block.section || "") === "Entire Day" ? "__all__" : String(block.section || "Warm Up");
    }
    if (tagsInput) {
      tagsInput.value = normalizeTags(block.tags || []).join(", ");
    }
    if (sourceDayInput) {
      sourceDayInput.value = "";
    }
    if (saveBtn) {
      saveBtn.textContent = "Update Block";
    }
    if (cancelBtn) {
      cancelBtn.hidden = false;
    }

    renderBlocks();
    setStatus("Editing block: " + String(block.title || "Workout Block") + ".", "success");
  }

  function clearEditState() {
    state.editingId = null;

    var titleInput = document.querySelector("[data-block-title]");
    var sectionInput = document.querySelector("[data-block-section]");
    var tagsInput = document.querySelector("[data-block-tags]");
    var saveBtn = document.querySelector("[data-block-save]");
    var cancelBtn = document.querySelector("[data-block-cancel-edit]");

    if (titleInput) {
      titleInput.value = "";
    }
    if (sectionInput) {
      sectionInput.value = "Warm Up";
    }
    if (tagsInput) {
      tagsInput.value = "";
    }
    if (saveBtn) {
      saveBtn.textContent = "Save Block";
    }
    if (cancelBtn) {
      cancelBtn.hidden = true;
    }

    renderBlocks();
  }

  function deleteById(blockId) {
    var block = findBlockById(blockId);
    if (!block) {
      return;
    }

    if (!confirm("Delete saved block '" + String(block.title || "Workout Block") + "'?")) {
      return;
    }

    if (isUuid(block.id)) {
      state.client
        .from("coach_workout_blocks")
        .delete()
        .eq("id", block.id)
        .eq("coach_user_id", state.coachUserId)
        .then(function (result) {
          if (result.error) {
            setStatus(result.error.message || "Could not delete block.", "error");
            return;
          }

          removeBlockLocal(block.id);
          persistOrder();
          setStatus("Deleted block.", "success");
        })
        .catch(function () {
          setStatus("Could not delete block.", "error");
        });
      return;
    }

    removeBlockLocal(block.id);
    setStatus("Deleted local block.", "success");
  }

  function removeBlockLocal(blockId) {
    var id = String(blockId || "");
    state.blocks = (Array.isArray(state.blocks) ? state.blocks : []).filter(function (block) {
      return String(block && block.id || "") !== id;
    });

    if (String(state.editingId || "") === id) {
      clearEditState();
    }

    reindexBlocks();
    writeBlocksToStorage(state.blocks);
    renderBlocks();
  }

  function moveBlock(blockId, direction) {
    var id = String(blockId || "").trim();
    var list = sortBlocks(state.blocks || []);
    var idx = list.findIndex(function (block) {
      return String(block && block.id || "") === id;
    });
    if (idx < 0) {
      return;
    }

    var targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= list.length) {
      return;
    }

    var moved = list.splice(idx, 1)[0];
    list.splice(targetIdx, 0, moved);

    state.blocks = list;
    reindexBlocks();
    writeBlocksToStorage(state.blocks);
    renderBlocks();
    persistOrder();
  }

  function persistOrder() {
    var cloudBlocks = (Array.isArray(state.blocks) ? state.blocks : []).filter(function (block) {
      return block && isUuid(block.id);
    });

    if (!cloudBlocks.length) {
      return;
    }

    Promise.all(cloudBlocks.map(function (block) {
      return state.client
        .from("coach_workout_blocks")
        .update({ sort_order: parseSortOrder(block.sort_order) })
        .eq("id", block.id)
        .eq("coach_user_id", state.coachUserId)
        .then(function () {
          return true;
        })
        .catch(function () {
          return false;
        });
    }));
  }

  function renderBlocks() {
    var container = document.querySelector("[data-block-list]");
    var filterInput = document.querySelector("[data-block-filter]");
    if (!container) {
      return;
    }

    var allBlocks = sortBlocks(state.blocks || []);
    var tags = collectTags(allBlocks);

    if (filterInput) {
      var current = String(state.filterTag || "all");
      filterInput.innerHTML = ['<option value="all">All tags</option>']
        .concat(tags.map(function (tag) {
          return '<option value="' + escapeAttribute(tag) + '">' + escapeHtml(tag) + '</option>';
        }))
        .join("");

      if (current !== "all" && tags.indexOf(current) < 0) {
        current = "all";
        state.filterTag = "all";
      }
      filterInput.value = current;
    }

    var visible = filterBlocks(allBlocks, state.filterTag);
    if (!visible.length) {
      container.innerHTML = '<p class="admin-loading">No saved blocks for this filter.</p>';
      return;
    }

    container.innerHTML = visible.map(function (block, index) {
      var count = Array.isArray(block.exercises) ? block.exercises.length : 0;
      var tagList = normalizeTags(block.tags || []);
      var tagsHtml = tagList.length
        ? '<ul class="program-builder-block-tags-list">' + tagList.map(function (tag) {
            return '<li>' + escapeHtml(tag) + '</li>';
          }).join("") + '</ul>'
        : "";
      var isEditing = String(state.editingId || "") === String(block.id || "");

      return (
        '<article class="program-builder-block-item">' +
          '<div class="program-builder-block-main">' +
            (isEditing ? '<p class="program-builder-block-item-editing">Editing</p>' : '') +
            '<p class="program-builder-block-name">' + escapeHtml(block.title || "Workout Block") + '</p>' +
            '<p class="program-builder-block-meta">' +
              escapeHtml(String(block.section || "Workout Block")) +
              ' - ' + escapeHtml(String(count)) + ' exercise' + (count === 1 ? '' : 's') +
            '</p>' +
            tagsHtml +
          '</div>' +
          '<div class="program-builder-block-actions">' +
            '<button type="button" class="btn admin-btn-small" data-block-edit="' + escapeAttribute(String(block.id || "")) + '">Edit</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-id="' + escapeAttribute(String(block.id || "")) + '" data-block-move="up" ' + (index === 0 ? 'disabled' : '') + '>↑</button>' +
            '<button type="button" class="btn admin-btn-small" data-block-id="' + escapeAttribute(String(block.id || "")) + '" data-block-move="down" ' + (index === visible.length - 1 ? 'disabled' : '') + '>↓</button>' +
            '<button type="button" class="btn admin-btn-delete-mini" data-block-delete="' + escapeAttribute(String(block.id || "")) + '">Delete</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  function findBlockById(blockId) {
    var id = String(blockId || "").trim();
    if (!id) {
      return null;
    }

    return (Array.isArray(state.blocks) ? state.blocks : []).find(function (block) {
      return String(block && block.id || "") === id;
    }) || null;
  }

  function readTemplateDraftDays() {
    var days = [];

    try {
      for (var i = 0; i < window.localStorage.length; i++) {
        var key = String(window.localStorage.key(i) || "");
        if (key.indexOf(TEMPLATE_DRAFT_PREFIX) !== 0) {
          continue;
        }

        var dayKey = key.slice(TEMPLATE_DRAFT_PREFIX.length);
        if (/^w\d+d\d+$/i.test(dayKey)) {
          days.push(dayKey);
        }
      }
    } catch (e) {
      return [];
    }

    days.sort(function (a, b) {
      var pa = parseSlotKey(a);
      var pb = parseSlotKey(b);
      if (!pa || !pb) {
        return String(a).localeCompare(String(b));
      }
      if (pa.week !== pb.week) {
        return pa.week - pb.week;
      }
      return pa.day - pb.day;
    });

    return days;
  }

  function readDraftExercisesForDay(dayKey) {
    if (!dayKey) {
      return [];
    }

    try {
      var raw = window.localStorage.getItem(TEMPLATE_DRAFT_PREFIX + dayKey);
      var parsed = raw ? JSON.parse(raw) : null;
      var exercises = parsed && Array.isArray(parsed.exercises) ? parsed.exercises : [];
      return normalizeExercises(exercises);
    } catch (e) {
      return [];
    }
  }

  function normalizeCloudRows(rows) {
    return (Array.isArray(rows) ? rows : []).map(function (row) {
      return mapCloudRow(row);
    }).filter(function (row) {
      return !!row;
    });
  }

  function mapCloudRow(row) {
    var source = row && typeof row === "object" ? row : {};
    var id = String(source.id || "").trim();
    var title = String(source.title || "").trim();
    var section = String(source.source_section || source.section || "Workout Block").trim() || "Workout Block";
    var exercises = normalizeExercises(source.exercises || []);

    if (!id || !title || !exercises.length) {
      return null;
    }

    return {
      id: id,
      title: title,
      section: section,
      tags: normalizeTags(source.tags || []),
      sort_order: parseSortOrder(source.sort_order),
      exercises: exercises,
      created_at: String(source.created_at || ""),
      updated_at: String(source.updated_at || "")
    };
  }

  function readBlocksFromStorage() {
    try {
      var raw = window.localStorage.getItem(WORKOUT_BLOCK_LIBRARY_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed.map(function (item) {
        var block = item && typeof item === "object" ? item : {};
        var id = String(block.id || "").trim();
        var title = String(block.title || "").trim();
        var exercises = normalizeExercises(block.exercises || []);

        if (!id || !title || !exercises.length) {
          return null;
        }

        return {
          id: id,
          title: title,
          section: String(block.section || "Workout Block").trim() || "Workout Block",
          tags: normalizeTags(block.tags || []),
          sort_order: parseSortOrder(block.sort_order),
          exercises: exercises,
          created_at: String(block.created_at || ""),
          updated_at: String(block.updated_at || "")
        };
      }).filter(function (item) {
        return !!item;
      });
    } catch (e) {
      return [];
    }
  }

  function writeBlocksToStorage(blocks) {
    try {
      var payload = sortBlocks(blocks || []).slice(0, 100);
      window.localStorage.setItem(WORKOUT_BLOCK_LIBRARY_KEY, JSON.stringify(payload));
    } catch (e) {
      // Ignore local storage errors.
    }
  }

  function normalizeExercises(exercises) {
    return Array.isArray(exercises) ? exercises.filter(function (entry) {
      return entry && typeof entry === "object";
    }) : [];
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

  function parseTags(raw) {
    return normalizeTags(String(raw || "").split(","));
  }

  function collectTags(blocks) {
    var seen = {};
    var tags = [];

    (Array.isArray(blocks) ? blocks : []).forEach(function (block) {
      normalizeTags(block && block.tags || []).forEach(function (tag) {
        if (seen[tag]) {
          return;
        }
        seen[tag] = true;
        tags.push(tag);
      });
    });

    return tags.sort();
  }

  function filterBlocks(blocks, tag) {
    var target = String(tag || "all").trim().toLowerCase();
    var list = sortBlocks(blocks || []);
    if (target === "all") {
      return list;
    }

    return list.filter(function (block) {
      return normalizeTags(block && block.tags || []).indexOf(target) >= 0;
    });
  }

  function blockSignature(block) {
    var safe = block && typeof block === "object" ? block : {};
    return [
      String(safe.title || "").trim().toLowerCase(),
      String(safe.section || "").trim().toLowerCase(),
      JSON.stringify(normalizeTags(safe.tags || [])),
      JSON.stringify(normalizeExercises(safe.exercises))
    ].join("|");
  }

  function sortBlocks(blocks) {
    return (Array.isArray(blocks) ? blocks : []).slice().sort(function (a, b) {
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

  function reindexBlocks() {
    var sorted = sortBlocks(state.blocks || []);
    sorted.forEach(function (block, index) {
      if (!block || typeof block !== "object") {
        return;
      }
      block.sort_order = index;
      block.tags = normalizeTags(block.tags || []);
    });
    state.blocks = sorted;
  }

  function parseSortOrder(value) {
    var num = parseInt(value, 10);
    return Number.isFinite(num) ? num : 0;
  }

  function parseSlotKey(slotKey) {
    var match = /^w(\d+)d(\d+)$/i.exec(String(slotKey || ""));
    if (!match) {
      return null;
    }

    return {
      week: parseInt(match[1], 10),
      day: parseInt(match[2], 10)
    };
  }

  function labelForSlot(slotKey) {
    var parsed = parseSlotKey(slotKey);
    if (!parsed) {
      return String(slotKey || "");
    }

    return "Week " + parsed.week + " - Workout " + parsed.day;
  }

  function createSupabaseClient() {
    if (!window.supabase || !window.supabase.createClient) {
      return null;
    }

    if (!window.NOMADIC_SUPABASE_URL || !window.NOMADIC_SUPABASE_ANON_KEY) {
      return null;
    }

    try {
      return window.supabase.createClient(window.NOMADIC_SUPABASE_URL, window.NOMADIC_SUPABASE_ANON_KEY);
    } catch (e) {
      return null;
    }
  }

  function clone(value) {
    try {
      return JSON.parse(JSON.stringify(value || []));
    } catch (e) {
      return Array.isArray(value) ? value.slice() : [];
    }
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
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
