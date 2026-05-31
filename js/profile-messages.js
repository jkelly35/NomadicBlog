(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    client: null,
    user: null,
    isCoachView: false,
    coachUserId: "",
    athleteUserId: "",
    threadEl: null,
    formEl: null,
    bodyEl: null,
    statusEl: null,
    copyEl: null,
    openLinkEls: [],
    summaryUnreadEl: null,
    summaryTotalEl: null,
    summaryListEl: null,
    statsEl: null,
    quickActionsEl: null,
    composerMetaEl: null,
    refreshTimer: null,
    messages: []
  };

  document.addEventListener("DOMContentLoaded", initProfileMessages);

  function initProfileMessages() {
    state.threadEl = document.querySelector("[data-profile-messages-thread]");
    state.formEl = document.querySelector("[data-profile-messages-form]");
    state.bodyEl = document.querySelector("[data-profile-message-body]");
    state.statusEl = document.querySelector("[data-profile-messages-status]");
    state.copyEl = document.querySelector("[data-profile-messages-copy]");
    state.openLinkEls = Array.prototype.slice.call(document.querySelectorAll("[data-profile-messages-open]"));
    state.summaryUnreadEl = document.querySelector("[data-profile-msg-summary-unread]");
    state.summaryTotalEl = document.querySelector("[data-profile-msg-summary-total]");
    state.summaryListEl = document.querySelector("[data-profile-msg-summary-list]");
    state.statsEl = document.querySelector("[data-profile-message-stats]");
    state.quickActionsEl = document.querySelector("[data-profile-message-quick-actions]");
    state.composerMetaEl = document.querySelector("[data-profile-message-composer-meta]");

    if ((!state.threadEl && !state.summaryListEl) || !window.supabase || !window.supabase.createClient) {
      return;
    }

    if (!window.NOMADIC_SUPABASE_URL || !window.NOMADIC_SUPABASE_ANON_KEY) {
      setStatus("Messaging unavailable: Supabase configuration is missing.", "error");
      return;
    }

    state.client = window.supabase.createClient(window.NOMADIC_SUPABASE_URL, window.NOMADIC_SUPABASE_ANON_KEY);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session || !session.user) {
        return;
      }

      state.user = session.user;
      resolveContext()
        .then(function (ok) {
          if (!ok) return;
          bindEvents();
          loadThread(false);
          startAutoRefresh();
        })
        .catch(function (error) {
          setStatus(error && error.message ? error.message : "Could not initialize messaging.", "error");
        });
    });
  }

  function resolveContext() {
    var params = new URLSearchParams(window.location.search || "");
    var wantsCoachView = params.get("coachView") === "1";
    var athleteId = String(params.get("athleteId") || "").trim();

    if (wantsCoachView && athleteId) {
      return resolveCoachAdminAccess().then(function (isCoachAdmin) {
        if (!isCoachAdmin) {
          setStatus("Coach conversation view requires admin access.", "error");
          disableComposer();
          return false;
        }

        state.isCoachView = true;
        state.coachUserId = state.user.id;
        state.athleteUserId = athleteId;
        if (state.quickActionsEl) {
          state.quickActionsEl.hidden = true;
        }
        if (state.copyEl) {
          state.copyEl.textContent = "Direct thread with this athlete.";
        }
        updateOpenMessagesLink();
        return true;
      });
    }

    state.isCoachView = false;
    state.athleteUserId = state.user.id;

    if (String(state.user.email || "").toLowerCase() === ADMIN_EMAIL && state.copyEl) {
      state.copyEl.textContent = "Dual-role mode: this is your athlete-side thread view.";
    }

    return resolveCoachUserId().then(function (coachId) {
      if (!coachId) {
        disableComposer();
        setStatus("No coach is assigned to this athlete yet.", "error");
        return false;
      }

      state.coachUserId = coachId;
      if (state.copyEl) {
        state.copyEl.textContent = "Secure thread with your coach.";
      }
      updateOpenMessagesLink();
      return true;
    });
  }

  function updateOpenMessagesLink() {
    if (!state.openLinkEls || !state.openLinkEls.length) return;
    var href = state.isCoachView && state.athleteUserId
      ? "athlete-messages.html?coachView=1&athleteId=" + encodeURIComponent(state.athleteUserId)
      : "athlete-messages.html";

    state.openLinkEls.forEach(function (link) {
      if (link) {
        link.href = href;
      }
    });
  }

  function resolveCoachAdminAccess() {
    var emailIsAdmin = String(state.user && state.user.email || "").toLowerCase() === ADMIN_EMAIL;
    if (emailIsAdmin) {
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

  function resolveCoachUserId() {
    return state.client
      .from("athlete_profiles")
      .select("coach_user_id")
      .eq("user_id", state.athleteUserId)
      .maybeSingle()
      .then(function (result) {
        if (!result.error && result.data && result.data.coach_user_id) {
          return String(result.data.coach_user_id);
        }

        return state.client
          .from("coach_athlete_messages")
          .select("coach_user_id")
          .eq("athlete_user_id", state.athleteUserId)
          .order("created_at", { ascending: false })
          .limit(1)
          .then(function (messagesResult) {
            if (messagesResult.error) {
              return resolveCoachFromHelperFunction();
            }
            var rows = Array.isArray(messagesResult.data) ? messagesResult.data : [];
            if (rows.length) {
              return String(rows[0].coach_user_id || "");
            }

            return resolveCoachFromHelperFunction();
          });
      });
  }

  function resolveCoachFromHelperFunction() {
    if (!state.client || !state.client.rpc) {
      return Promise.resolve("");
    }

    return state.client
      .rpc("nomadic_admin_user_id")
      .then(function (rpcResult) {
        if (rpcResult && !rpcResult.error && rpcResult.data) {
          return String(rpcResult.data);
        }

        return "";
      })
      .catch(function () {
        return "";
      });
  }

  function bindEvents() {
    if (state.formEl) {
      state.formEl.addEventListener("submit", onSendMessage);
    }

    if (state.bodyEl) {
      state.bodyEl.addEventListener("input", renderComposerMeta);
      state.bodyEl.addEventListener("keydown", function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && state.formEl) {
          event.preventDefault();
          state.formEl.requestSubmit();
        }
      });
      renderComposerMeta();
    }

    if (state.quickActionsEl) {
      state.quickActionsEl.addEventListener("click", function (event) {
        var button = event.target && event.target.closest("[data-profile-quick-reply]");
        if (!button || !state.bodyEl) return;
        var text = String(button.getAttribute("data-profile-quick-reply") || "").trim();
        if (!text) return;
        state.bodyEl.value = text;
        renderComposerMeta();
        state.bodyEl.focus();
      });
    }
  }

  function loadThread(silent) {
    if (!state.client || !state.coachUserId || !state.athleteUserId) {
      return;
    }

    if (!silent) {
      setStatus("Loading conversation...", "info");
    }
    state.client
      .from("coach_athlete_messages")
      .select("id,coach_user_id,athlete_user_id,sender_user_id,sender_role,body,read_by_coach_at,read_by_athlete_at,created_at")
      .eq("coach_user_id", state.coachUserId)
      .eq("athlete_user_id", state.athleteUserId)
      .order("created_at", { ascending: true })
      .limit(500)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.messages = Array.isArray(result.data) ? result.data : [];
        renderThread();
        renderStats();
        renderSummary();
        if (state.threadEl) {
          markRead();
        }
        if (!silent) {
          setStatus("", "info");
        }
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load messages.", "error");
      });
  }

  function renderThread() {
    if (!state.threadEl) return;
    if (!state.messages.length) {
      state.threadEl.innerHTML = '<p class="profile-loading">No messages yet. Start the conversation below.</p>';
      return;
    }

    state.threadEl.innerHTML = state.messages
      .map(function (message) {
        var mine = state.isCoachView
          ? message.sender_role === "coach"
          : message.sender_role === "athlete";
        return (
          '<article class="profile-message-row' + (mine ? ' is-mine' : ' is-other') + '">' +
            '<div class="profile-message-bubble">' +
              '<p>' + escapeHtml(String(message.body || "")) + '</p>' +
              '<time>' + escapeHtml(formatDateTime(message.created_at)) + '</time>' +
            '</div>' +
          '</article>'
        );
      })
      .join('');

    state.threadEl.scrollTop = state.threadEl.scrollHeight;
  }

  function renderStats() {
    if (!state.statsEl) return;

    var unreadFromOther = state.messages.filter(function (message) {
      var fromCoach = message.sender_role === "coach";
      if (state.isCoachView) {
        return message.sender_role === "athlete" && !message.read_by_coach_at;
      }
      return fromCoach && !message.read_by_athlete_at;
    }).length;

    var lastMessage = state.messages.length ? state.messages[state.messages.length - 1] : null;
    var roleLabel = state.isCoachView ? "Athlete" : "Coach";
    var chips = [
      '<span class="profile-message-chip">Messages: ' + escapeHtml(String(state.messages.length)) + '</span>',
      '<span class="profile-message-chip">Unread from ' + escapeHtml(roleLabel) + ': ' + escapeHtml(String(unreadFromOther)) + '</span>'
    ];

    if (lastMessage) {
      chips.push('<span class="profile-message-chip">Last update: ' + escapeHtml(formatDateTime(lastMessage.created_at)) + '</span>');
    }

    state.statsEl.innerHTML = chips.join('');
  }

  function renderSummary() {
    var unreadFromCoach = state.messages.filter(function (message) {
      if (state.isCoachView) {
        return message.sender_role === "athlete" && !message.read_by_coach_at;
      }
      return message.sender_role === "coach" && !message.read_by_athlete_at;
    }).length;

    if (state.summaryUnreadEl) {
      state.summaryUnreadEl.textContent = unreadFromCoach > 0
        ? String(unreadFromCoach) + " unread"
        : "No new messages";
    }

    if (state.summaryTotalEl) {
      state.summaryTotalEl.textContent = String(state.messages.length);
    }

    if (!state.summaryListEl) {
      return;
    }

    if (!state.messages.length) {
      state.summaryListEl.innerHTML = '<p class="profile-loading">No messages yet.</p>';
      return;
    }

    var latest = state.messages.slice().sort(function (a, b) {
      return String(b.created_at || "").localeCompare(String(a.created_at || ""));
    }).slice(0, 5);

    state.summaryListEl.innerHTML = latest
      .map(function (message) {
        var fromCoach = message.sender_role === "coach";
        var unread = state.isCoachView ? (!fromCoach && !message.read_by_coach_at) : (fromCoach && !message.read_by_athlete_at);
        var label = fromCoach ? "Coach" : "You";
        return (
          '<article class="profile-message-summary-item">' +
            '<div class="profile-message-summary-item-head">' +
              '<strong>' + escapeHtml(label) + '</strong>' +
              (unread ? '<span class="coach-inbox-unread">New</span>' : '<time>' + escapeHtml(formatDateTime(message.created_at)) + '</time>') +
            '</div>' +
            '<p>' + escapeHtml(String(message.body || "").trim()) + '</p>' +
          '</article>'
        );
      })
      .join('');
  }

  function onSendMessage(event) {
    event.preventDefault();

    var body = state.bodyEl ? String(state.bodyEl.value || "").trim() : "";
    if (!body) {
      setStatus("Write a message first.", "error");
      return;
    }

    setStatus("Sending message...", "info");

    sendProfileMessage(body)
      .then(function () {
        if (state.bodyEl) {
          state.bodyEl.value = "";
          renderComposerMeta();
        }

        loadThread(false);
        setStatus("Message sent.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to send message.", "error");
      });
  }

  function sendProfileMessage(body) {
    if (!state.client) {
      return Promise.reject(new Error("Messaging client is unavailable."));
    }

    if (state.isCoachView) {
      if (state.client.rpc) {
        return state.client.rpc("coach_send_message", {
          p_athlete_user_id: state.athleteUserId,
          p_body: body,
          p_delivery_scope: "direct",
          p_delivery_label: null
        }).then(function (result) {
          if (result && result.error) {
            throw result.error;
          }
        }).catch(function (rpcError) {
          return sendProfileMessageViaInsert(body, "coach").catch(function (insertError) {
            var rpcMessage = rpcError && rpcError.message ? rpcError.message : "RPC send failed.";
            var insertMessage = insertError && insertError.message ? insertError.message : "Insert fallback failed.";
            throw new Error(rpcMessage + " Fallback: " + insertMessage);
          });
        });
      }

      return sendProfileMessageViaInsert(body, "coach");
    }

    if (state.client.rpc) {
      return state.client.rpc("athlete_send_message", {
        p_body: body,
        p_coach_user_id: state.coachUserId || null
      }).then(function (result) {
        if (result && result.error) {
          throw result.error;
        }
      }).catch(function (rpcError) {
        return sendProfileMessageViaInsert(body, "athlete").catch(function (insertError) {
          var rpcMessage = rpcError && rpcError.message ? rpcError.message : "RPC send failed.";
          var insertMessage = insertError && insertError.message ? insertError.message : "Insert fallback failed.";
          throw new Error(rpcMessage + " Fallback: " + insertMessage);
        });
      });
    }

    return sendProfileMessageViaInsert(body, "athlete");
  }

  function sendProfileMessageViaInsert(body, senderRole) {
    var payload = {
      coach_user_id: state.coachUserId,
      athlete_user_id: state.athleteUserId,
      sender_user_id: state.user.id,
      sender_role: senderRole,
      delivery_scope: "direct",
      body: body,
      read_by_coach_at: senderRole === "coach" ? new Date().toISOString() : null,
      read_by_athlete_at: senderRole === "athlete" ? new Date().toISOString() : null
    };

    return state.client
      .from("coach_athlete_messages")
      .insert([payload])
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }
      });
  }

  function markRead() {
    if (!state.messages.length) {
      return;
    }

    var nowIso = new Date().toISOString();
    if (state.isCoachView) {
      state.client
        .from("coach_athlete_messages")
        .update({ read_by_coach_at: nowIso })
        .eq("coach_user_id", state.coachUserId)
        .eq("athlete_user_id", state.athleteUserId)
        .eq("sender_role", "athlete")
        .is("read_by_coach_at", null)
        .then(function () {});
      return;
    }

    state.client
      .from("coach_athlete_messages")
      .update({ read_by_athlete_at: nowIso })
      .eq("coach_user_id", state.coachUserId)
      .eq("athlete_user_id", state.athleteUserId)
      .eq("sender_role", "coach")
      .is("read_by_athlete_at", null)
      .then(function () {});
  }

  function disableComposer() {
    if (state.formEl) state.formEl.hidden = true;
    if (state.quickActionsEl) state.quickActionsEl.hidden = true;
  }

  function renderComposerMeta() {
    if (!state.composerMetaEl || !state.bodyEl) return;
    var count = String(state.bodyEl.value || "").length;
    state.composerMetaEl.textContent = count + " characters · Press Cmd/Ctrl + Enter to send";
  }

  function startAutoRefresh() {
    if (state.refreshTimer) {
      clearInterval(state.refreshTimer);
    }

    state.refreshTimer = setInterval(function () {
      loadThread(true);
    }, 30000);
  }

  function setStatus(message, variant) {
    if (!state.statusEl) return;
    state.statusEl.textContent = message || "";
    state.statusEl.classList.remove("status-success", "status-error", "status-info");
    if (!message) return;
    state.statusEl.classList.add(variant === "success" ? "status-success" : (variant === "error" ? "status-error" : "status-info"));
  }

  function formatDateTime(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
