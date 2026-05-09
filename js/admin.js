(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var state = {
    client: null,
    user: null,
    guardElement: null,
    contentElement: null,
    athletes: [],
    currentAthlete: null,
    currentMetrics: [],
    currentPage: 1,
    pageSize: 10,
    searchTerm: ""
  };

  document.addEventListener("DOMContentLoaded", function () {
    initializeAdmin();
  });

  function initializeAdmin() {
    state.guardElement = document.querySelector("[data-admin-guard]");
    state.contentElement = document.querySelector("[data-admin-content]");

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
      if (!session) {
        redirectToHome();
        return;
      }

      state.user = session.user;
      verifyAdmin();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectToHome();
      }
    });
  }

  function verifyAdmin() {
    if (!state.user || state.user.email !== ADMIN_EMAIL) {
      showError("You do not have permission to access this page.");
      setTimeout(function () {
        redirectToHome();
      }, 2000);
      return;
    }

    hideGuard();
    showContent();
    setupEventHandlers();
    loadAthletes();
  }

  function setupEventHandlers() {
    var searchInput = document.querySelector("[data-admin-search]");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        state.searchTerm = e.target.value.toLowerCase();
        state.currentPage = 1;
        renderAthletesTable();
      });
    }

    var refreshBtn = document.querySelector("[data-admin-refresh]");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        loadAthletes();
      });
    }

    var modalBackdrop = document.querySelector("[data-admin-modal-close]");
    if (modalBackdrop) {
      modalBackdrop.addEventListener("click", closeModal);
    }

    var modalCloseBtn = document.querySelector(".admin-modal-close");
    if (modalCloseBtn) {
      modalCloseBtn.addEventListener("click", closeModal);
    }

    var saveBtn = document.querySelector("[data-admin-modal-save]");
    if (saveBtn) {
      saveBtn.addEventListener("click", onSaveChanges);
    }

    var resetBtn = document.querySelector("[data-admin-modal-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", onResetPassword);
    }

    var deleteBtn = document.querySelector("[data-admin-modal-delete]");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", onDeleteAthlete);
    }

    var addMetricBtn = document.querySelector("[data-admin-metric-add]");
    if (addMetricBtn) {
      addMetricBtn.addEventListener("click", function () {
        appendMetricRow({
          metric_name: "",
          metric_value: "",
          metric_unit: "",
          metric_category: "Performance"
        });
      });
    }

    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (metricRows) {
      metricRows.addEventListener("click", function (event) {
        if (event.target && event.target.matches("[data-admin-metric-remove]")) {
          var row = event.target.closest(".admin-metric-row");
          if (row) {
            row.remove();
          }
        }
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeModal();
      }
    });
  }

  function loadAthletes() {
    setStatus("Loading users...");

    state.client
      .from("admin_all_users")
      .select("*")
      .order("user_created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.athletes = result.data || [];
        state.currentPage = 1;
        renderAthletesTable();
        updateStats();
        setStatus("Users loaded successfully.", "success");
        setTimeout(function () {
          clearStatus();
        }, 1500);
      })
      .catch(function (error) {
        setStatus(
          error && error.message ? error.message : "Failed to load users.",
          "error"
        );
      });
  }

  function renderAthletesTable() {
    var tbody = document.querySelector("[data-admin-table-body]");
    if (!tbody) {
      return;
    }

    var filtered = state.athletes.filter(function (a) {
      if (!state.searchTerm) return true;
      return (
        (a.email && a.email.toLowerCase().includes(state.searchTerm)) ||
        (a.name && a.name.toLowerCase().includes(state.searchTerm)) ||
        (a.sport && a.sport.toLowerCase().includes(state.searchTerm))
      );
    });

    var start = (state.currentPage - 1) * state.pageSize;
    var end = start + state.pageSize;
    var paginated = filtered.slice(start, end);

    tbody.innerHTML = paginated
      .map(function (athlete) {
        return (
          "<tr>" +
          "<td>" + escapeHtml(athlete.email || "N/A") + "</td>" +
          "<td>" + (athlete.name ? escapeHtml(athlete.name) : "—") + "</td>" +
          "<td>" + (athlete.sport ? escapeHtml(athlete.sport) : "—") + "</td>" +
          "<td>" + (athlete.level ? escapeHtml(athlete.level) : "—") + "</td>" +
          "<td>" + formatDate(athlete.user_created_at) + "</td>" +
          "<td><button class='btn admin-btn-small' data-athlete-id='" +
          escapeHtml(athlete.user_id) +
          "'>Edit</button></td>" +
          "</tr>"
        );
      })
      .join("");

    document.querySelectorAll("[data-athlete-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var userId = btn.getAttribute("data-athlete-id");
        openAthleteModal(userId);
      });
    });

    renderPagination(filtered.length);
  }

  function renderPagination(totalItems) {
    var paginationDiv = document.querySelector("[data-admin-pagination]");
    if (!paginationDiv) {
      return;
    }

    var totalPages = Math.ceil(totalItems / state.pageSize);
    if (totalPages <= 1) {
      paginationDiv.innerHTML = "";
      return;
    }

    var html = '<div style="display: flex; gap: 0.5rem; justify-content: center; margin-top: 2rem;">';

    for (var i = 1; i <= totalPages; i++) {
      var isActive = i === state.currentPage;
      html +=
        '<button class="btn admin-pagination-btn ' +
        (isActive ? "active" : "") +
        '" data-page="' +
        i +
        '">' +
        i +
        "</button>";
    }

    html += "</div>";
    paginationDiv.innerHTML = html;

    document.querySelectorAll("[data-page]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.currentPage = parseInt(btn.getAttribute("data-page"), 10);
        renderAthletesTable();
      });
    });
  }

  function openAthleteModal(userId) {
    var athlete = state.athletes.find(function (a) {
      return a.user_id === userId;
    });

    if (!athlete) {
      setStatus("User not found.", "error");
      return;
    }

    state.currentAthlete = athlete;

    populateModal(athlete);
    loadAthleteMetrics(userId);
    showModal();
  }

  function populateModal(athlete) {
    document.querySelector("[data-admin-modal-email]").textContent =
      athlete.email || "N/A";
    document.querySelector("[data-admin-modal-created]").textContent = formatDate(
      athlete.user_created_at
    );
    document.querySelector("[data-admin-modal-last-signin]").textContent =
      athlete.last_sign_in_at ? formatDate(athlete.last_sign_in_at) : "N/A";

    document.querySelector("[data-admin-modal-input='name']").value =
      athlete.name || "";
    document.querySelector("[data-admin-modal-input='sport']").value =
      athlete.sport || "";
    document.querySelector("[data-admin-modal-input='level']").value =
      athlete.level || "";
    document.querySelector("[data-admin-modal-input='bio']").value =
      athlete.bio || "";
    document.querySelector("[data-admin-modal-input='age']").value =
      athlete.age || "";
    document.querySelector("[data-admin-modal-input='location']").value =
      athlete.location || "";

    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (metricRows) {
      metricRows.innerHTML = '<p class="admin-loading">Loading metrics...</p>';
    }

    clearModalStatus();
  }

  function loadAthleteMetrics(userId) {
    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (!metricRows || !state.client || !userId) {
      return;
    }

    metricRows.innerHTML = '<p class="admin-loading">Loading metrics...</p>';

    state.client
      .from("athlete_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          if (isMissingTableError(result.error)) {
            state.currentMetrics = [];
            renderMetricRows([]);
            setModalStatus(
              "Metrics table not found yet. Create athlete_metrics in Supabase to enable coach metric editing.",
              "info"
            );
            return;
          }

          setModalStatus(result.error.message, "error");
          return;
        }

        state.currentMetrics = result.data || [];
        renderMetricRows(state.currentMetrics);
      })
      .catch(function (error) {
        setModalStatus(
          error && error.message ? error.message : "Failed to load metrics.",
          "error"
        );
      });
  }

  function renderMetricRows(metrics) {
    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (!metricRows) {
      return;
    }

    metricRows.innerHTML = "";

    if (!metrics || !metrics.length) {
      appendMetricRow({
        metric_name: "Max HR",
        metric_value: "",
        metric_unit: "bpm",
        metric_category: "Cardio"
      });
      appendMetricRow({
        metric_name: "Resting HR",
        metric_value: "",
        metric_unit: "bpm",
        metric_category: "Cardio"
      });
      return;
    }

    metrics.forEach(function (metric) {
      appendMetricRow(metric);
    });
  }

  function appendMetricRow(metric) {
    var metricRows = document.querySelector("[data-admin-metric-rows]");
    if (!metricRows) {
      return;
    }

    var row = document.createElement("div");
    row.className = "admin-metric-row";
    row.innerHTML =
      '<input type="text" data-admin-metric-name placeholder="Metric name" value="' +
      escapeAttribute(metric.metric_name || "") +
      '" />' +
      '<input type="text" data-admin-metric-value placeholder="Value" value="' +
      escapeAttribute(metric.metric_value || "") +
      '" />' +
      '<input type="text" data-admin-metric-unit placeholder="Unit" value="' +
      escapeAttribute(metric.metric_unit || "") +
      '" />' +
      '<input type="text" data-admin-metric-category placeholder="Category" value="' +
      escapeAttribute(metric.metric_category || "Performance") +
      '" />' +
      '<button type="button" class="admin-metric-remove" data-admin-metric-remove>Remove</button>';

    metricRows.appendChild(row);
  }

  function collectMetricsFromModal() {
    var rows = Array.prototype.slice.call(
      document.querySelectorAll(".admin-metric-row")
    );

    return rows
      .map(function (row) {
        var name = String((row.querySelector("[data-admin-metric-name]") || {}).value || "").trim();
        var value = String((row.querySelector("[data-admin-metric-value]") || {}).value || "").trim();
        var unit = String((row.querySelector("[data-admin-metric-unit]") || {}).value || "").trim();
        var category = String((row.querySelector("[data-admin-metric-category]") || {}).value || "").trim();

        return {
          metric_name: name,
          metric_value: value,
          metric_unit: unit,
          metric_category: category || "Performance"
        };
      })
      .filter(function (metric) {
        return metric.metric_name && metric.metric_value;
      });
  }

  function onSaveChanges() {
    if (!state.currentAthlete || !state.client) {
      setModalStatus("No athlete selected.", "error");
      return;
    }

    var updated = {
      name: document.querySelector("[data-admin-modal-input='name']").value,
      sport: document.querySelector("[data-admin-modal-input='sport']").value,
      level: document.querySelector("[data-admin-modal-input='level']").value,
      bio: document.querySelector("[data-admin-modal-input='bio']").value,
      age: parseInt(
        document.querySelector("[data-admin-modal-input='age']").value || 0,
        10
      ) || null,
      location: document.querySelector("[data-admin-modal-input='location']")
        .value,
      updated_at: new Date().toISOString()
    };

    var metricsPayload = collectMetricsFromModal().map(function (metric) {
      return Object.assign({}, metric, {
        user_id: state.currentAthlete.user_id,
        updated_at: new Date().toISOString()
      });
    });

    setModalStatus("Saving changes...", "info");

    state.client
      .from("athlete_profiles")
      .upsert(Object.assign({}, updated, { user_id: state.currentAthlete.user_id }))
      .then(function (result) {
        if (result.error) {
          setModalStatus(result.error.message, "error");
          return;
        }

        saveAthleteMetrics(metricsPayload, function (metricsSaved, metricsMessage) {
          state.currentAthlete = Object.assign({}, state.currentAthlete, updated);
          var statusMessage = metricsSaved
            ? "Profile and metrics updated successfully!"
            : "Profile updated. " + metricsMessage;
          setModalStatus(statusMessage, metricsSaved ? "success" : "info");
          setTimeout(function () {
            loadAthletes();
          }, 1000);
        });
      })
      .catch(function (error) {
        setModalStatus(
          error && error.message ? error.message : "Failed to save changes.",
          "error"
        );
      });
  }

  function saveAthleteMetrics(metricsPayload, done) {
    if (!state.currentAthlete || !state.client) {
      done(false, "No athlete selected for metric save.");
      return;
    }

    state.client
      .from("athlete_metrics")
      .delete()
      .eq("user_id", state.currentAthlete.user_id)
      .then(function (deleteResult) {
        if (deleteResult.error) {
          if (isMissingTableError(deleteResult.error)) {
            done(false, "Metrics table is not set up yet.");
            return;
          }

          done(false, deleteResult.error.message);
          return;
        }

        if (!metricsPayload.length) {
          done(true, "Metrics cleared.");
          return;
        }

        state.client
          .from("athlete_metrics")
          .insert(metricsPayload)
          .then(function (insertResult) {
            if (insertResult.error) {
              done(false, insertResult.error.message);
              return;
            }

            done(true, "Metrics saved.");
          })
          .catch(function (error) {
            done(false, error && error.message ? error.message : "Failed to save metrics.");
          });
      })
      .catch(function (error) {
        done(false, error && error.message ? error.message : "Failed to save metrics.");
      });
  }

  function onResetPassword() {
    if (!state.currentAthlete || !confirm("Send password reset email?")) {
      return;
    }

    setModalStatus("Sending password reset email...", "info");

    state.client.auth
      .resetPasswordForEmail(state.currentAthlete.email)
      .then(function (result) {
        if (result.error) {
          setModalStatus(result.error.message, "error");
          return;
        }

        setModalStatus(
          "Password reset email sent to " +
            state.currentAthlete.user_id,
          "success"
        );
      })
      .catch(function (error) {
        setModalStatus(
          error && error.message
            ? error.message
            : "Failed to send password reset email.",
          "error"
        );
      });
  }

  function onDeleteAthlete() {
    if (
      !state.currentAthlete ||
      !confirm("Permanently delete this athlete account?")
    ) {
      return;
    }

    if (!confirm("This action cannot be undone. Continue?")) {
      return;
    }

    setModalStatus("Deleting account...", "info");

    state.client
      .from("athlete_profiles")
      .delete()
      .eq("user_id", state.currentAthlete.user_id)
      .then(function (result) {
        if (result.error) {
          setModalStatus(result.error.message, "error");
          return;
        }

        setModalStatus("Account deleted successfully.", "success");
        setTimeout(function () {
          closeModal();
          loadAthletes();
        }, 1000);
      })
      .catch(function (error) {
        setModalStatus(
          error && error.message ? error.message : "Failed to delete account.",
          "error"
        );
      });
  }

  function showModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (modal) {
      modal.hidden = false;
      document.body.classList.add("admin-modal-open");
    }
  }

  function closeModal() {
    var modal = document.querySelector("[data-admin-modal]");
    if (modal) {
      modal.hidden = true;
      document.body.classList.remove("admin-modal-open");
    }

    state.currentAthlete = null;
    state.currentMetrics = [];
  }

  function updateStats() {
    var totalEl = document.querySelector("[data-stat-total-athletes]");
    var profilesEl = document.querySelector("[data-stat-profiles]");

    if (totalEl) {
      totalEl.textContent = state.athletes.length;
    }

    var withProfiles = state.athletes.filter(function (a) {
      return a.name || a.sport || a.bio;
    }).length;

    if (profilesEl) {
      profilesEl.textContent = withProfiles;
    }
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
    if (state.guardElement) {
      state.guardElement.innerHTML =
        "<div style=\"padding: 2rem; text-align: center; color: #9f2d20;\">" +
        "<p style=\"font-size: 1.1rem; font-weight: 700;\">" +
        message +
        "</p>" +
        "<p><a href=\"index.html\" class=\"btn\" style=\"display: inline-block; margin-top: 1rem;\">Return Home</a></p>" +
        "</div>";
    }
  }

  function redirectToHome() {
    window.location.href = "index.html";
  }

  function setStatus(message, variant) {
    var statusEl = document.querySelector(".admin-status");
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

  function clearStatus() {
    var statusEl = document.querySelector(".admin-status");
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.remove("is-error", "is-success", "is-info");
    }
  }

  function setModalStatus(message, variant) {
    var statusEl = document.querySelector("[data-admin-modal-status]");
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

  function clearModalStatus() {
    var statusEl = document.querySelector("[data-admin-modal-status]");
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.classList.remove("is-error", "is-success", "is-info");
    }
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
    return text.replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  function escapeAttribute(text) {
    return escapeHtml(String(text || "")).replace(/`/g, "");
  }

  function isMissingTableError(error) {
    var msg = error && error.message ? error.message.toLowerCase() : "";
    return error && error.code === "42P01" || msg.indexOf("does not exist") > -1;
  }
})();
