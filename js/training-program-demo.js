(function () {
  var state = {
    rows: [],
    day: "day-1",
    storagePrefix: "nomadic_training_program_demo_"
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    setProgramTitleFromQuery();

    var daySelect = document.querySelector("[data-workout-day]");
    var addRowBtn = document.querySelector("[data-add-set-row]");
    var saveBtn = document.querySelector("[data-save-workout]");
    var clearBtn = document.querySelector("[data-clear-workout]");

    if (!daySelect) {
      return;
    }

    state.day = daySelect.value || "day-1";

    daySelect.addEventListener("change", function () {
      state.day = daySelect.value;
      loadRowsForDay();
      renderRows();
      setStatus("");
    });

    if (addRowBtn) {
      addRowBtn.addEventListener("click", function () {
        state.rows.push(blankRow());
        renderRows();
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        saveRowsForDay();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        if (!confirm("Clear all logged sets for this workout day?")) {
          return;
        }

        state.rows = defaultRowsForDay(state.day);
        saveRowsForDay();
        renderRows();
        setStatus("Workout log cleared for this day.", "info");
      });
    }

    loadRowsForDay();
    renderRows();
  }

  function setProgramTitleFromQuery() {
    var heading = document.querySelector("[data-program-title]");
    if (!heading) {
      return;
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var programName = params.get("program");
      if (programName) {
        heading.textContent = programName;
      }
    } catch (e) {
      // Ignore malformed query parameters.
    }
  }

  function loadRowsForDay() {
    var stored = readFromStorage(storageKeyForDay());
    if (stored && Array.isArray(stored.rows)) {
      state.rows = stored.rows;
      return;
    }

    state.rows = defaultRowsForDay(state.day);
  }

  function saveRowsForDay() {
    var payload = {
      rows: state.rows,
      saved_at: new Date().toISOString()
    };

    writeToStorage(storageKeyForDay(), payload);
    setStatus("Workout log saved.", "success");
  }

  function renderRows() {
    var tbody = document.querySelector("[data-workout-rows]");
    if (!tbody) {
      return;
    }

    tbody.innerHTML = "";

    state.rows.forEach(function (row, index) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><input type="text" data-field="exercise" data-index="' +
        index +
        '" value="' +
        escapeAttribute(row.exercise) +
        '" placeholder="e.g. Back Squat" /></td>' +
        '<td><input type="number" min="1" data-field="set" data-index="' +
        index +
        '" value="' +
        escapeAttribute(row.set) +
        '" /></td>' +
        '<td><input type="text" data-field="reps" data-index="' +
        index +
        '" value="' +
        escapeAttribute(row.reps) +
        '" placeholder="e.g. 5" /></td>' +
        '<td><input type="text" data-field="weight" data-index="' +
        index +
        '" value="' +
        escapeAttribute(row.weight) +
        '" placeholder="e.g. 80 kg" /></td>' +
        '<td><input type="text" data-field="rpe" data-index="' +
        index +
        '" value="' +
        escapeAttribute(row.rpe) +
        '" placeholder="1-10" /></td>' +
        '<td><input type="text" data-field="notes" data-index="' +
        index +
        '" value="' +
        escapeAttribute(row.notes) +
        '" placeholder="Tempo / quality notes" /></td>' +
        '<td><input type="checkbox" data-field="done" data-index="' +
        index +
        '" ' +
        (row.done ? "checked" : "") +
        ' /></td>' +
        '<td><button type="button" class="program-row-remove" data-remove-row="' +
        index +
        '">Remove</button></td>';

      tbody.appendChild(tr);
    });

    tbody.querySelectorAll("input").forEach(function (input) {
      input.addEventListener("input", onRowInput);
      input.addEventListener("change", onRowInput);
    });

    tbody.querySelectorAll("[data-remove-row]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-remove-row"), 10);
        if (isNaN(idx)) {
          return;
        }

        state.rows.splice(idx, 1);
        if (!state.rows.length) {
          state.rows.push(blankRow());
        }
        renderRows();
      });
    });

    renderCompletionSummary();
  }

  function onRowInput(event) {
    var input = event.target;
    var field = input.getAttribute("data-field");
    var index = parseInt(input.getAttribute("data-index"), 10);

    if (!field || isNaN(index) || !state.rows[index]) {
      return;
    }

    if (field === "done") {
      state.rows[index][field] = !!input.checked;
    } else {
      state.rows[index][field] = input.value;
    }

    renderCompletionSummary();
  }

  function renderCompletionSummary() {
    var summary = document.querySelector("[data-completion-summary]");
    if (!summary) {
      return;
    }

    var total = state.rows.length;
    var completed = state.rows.filter(function (row) {
      return !!row.done;
    }).length;

    summary.textContent = "Completion: " + completed + " / " + total + " sets marked done";
  }

  function defaultRowsForDay(day) {
    if (day === "day-2") {
      return [
        { exercise: "Weighted Pull-Up", set: "1", reps: "5", weight: "", rpe: "", notes: "", done: false },
        { exercise: "Weighted Pull-Up", set: "2", reps: "5", weight: "", rpe: "", notes: "", done: false },
        { exercise: "20mm Edge Pull", set: "1", reps: "10s", weight: "", rpe: "", notes: "", done: false },
        { exercise: "Hollow Hold", set: "1", reps: "45s", weight: "BW", rpe: "", notes: "", done: false }
      ];
    }

    if (day === "day-3") {
      return [
        { exercise: "Assault Bike Intervals", set: "1", reps: "8 rounds", weight: "", rpe: "", notes: "20s on / 100s off", done: false },
        { exercise: "Sled Push", set: "1", reps: "6 x 20m", weight: "", rpe: "", notes: "", done: false },
        { exercise: "Mobility Cooldown", set: "1", reps: "10 min", weight: "BW", rpe: "", notes: "", done: false }
      ];
    }

    return [
      { exercise: "Back Squat", set: "1", reps: "5", weight: "", rpe: "", notes: "", done: false },
      { exercise: "Back Squat", set: "2", reps: "5", weight: "", rpe: "", notes: "", done: false },
      { exercise: "Romanian Deadlift", set: "1", reps: "8", weight: "", rpe: "", notes: "", done: false },
      { exercise: "Box Jump", set: "1", reps: "5", weight: "BW", rpe: "", notes: "", done: false }
    ];
  }

  function blankRow() {
    return {
      exercise: "",
      set: "",
      reps: "",
      weight: "",
      rpe: "",
      notes: "",
      done: false
    };
  }

  function storageKeyForDay() {
    return state.storagePrefix + state.day;
  }

  function readFromStorage(key) {
    try {
      var raw = window.localStorage.getItem(key);
      if (!raw) {
        return null;
      }

      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function writeToStorage(key, data) {
    try {
      window.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      setStatus("Could not persist log in this browser session.", "info");
    }
  }

  function setStatus(message, variant) {
    var status = document.querySelector("[data-workout-status]");
    if (!status) {
      return;
    }

    status.textContent = message || "";
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

  function escapeAttribute(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
