(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";

  var state = {
    client: null,
    user: null,
    athletes: [],
    athletesById: {},
    messages: [],
    activeAthleteId: "",
    inboxEl: null,
    threadEl: null,
    threadFormEl: null,
    threadBodyEl: null,
    threadTitleEl: null,
    threadSubtitleEl: null,
    formEl: null,
    modeEl: null,
    athleteEl: null,
    groupWrapEl: null,
    groupListEl: null,
    bodyEl: null,
    statusEl: null,
    searchEl: null,
    sortEl: null,
    unreadOnlyEl: null,
    refreshEl: null,
    inboxSubtitleEl: null,
    threadMetaEl: null,
    summaryUnreadEl: null,
    summaryThreadsEl: null,
    summaryListEl: null,
    summaryStatusEl: null,
    refreshTimer: null,
    pinnedAthletes: {},
    isCoachAdmin: false
  };

  document.addEventListener("DOMContentLoaded", initCoachMessaging);

  function initCoachMessaging() {
    state.summaryUnreadEl = document.querySelector("[data-coach-msg-summary-unread]");
    state.summaryThreadsEl = document.querySelector("[data-coach-msg-summary-threads]");
    state.summaryListEl = document.querySelector("[data-coach-msg-summary-list]");
    state.summaryStatusEl = document.querySelector("[data-coach-msg-summary-status]");
    state.inboxEl = document.querySelector("[data-coach-msg-inbox]");
    state.searchEl = document.querySelector("[data-coach-msg-search]");
    state.sortEl = document.querySelector("[data-coach-msg-sort]");
    state.unreadOnlyEl = document.querySelector("[data-coach-msg-unread-only]");
    state.refreshEl = document.querySelector("[data-coach-msg-refresh]");
    state.inboxSubtitleEl = document.querySelector("[data-coach-msg-inbox-subtitle]");
    state.threadEl = document.querySelector("[data-coach-msg-thread]");
    state.threadFormEl = document.querySelector("[data-coach-msg-thread-form]");
    state.threadBodyEl = document.querySelector("[data-coach-msg-thread-body]");
    state.threadMetaEl = document.querySelector("[data-coach-msg-thread-meta]");
    state.threadTitleEl = document.querySelector("[data-coach-msg-thread-title]");
    state.threadSubtitleEl = document.querySelector("[data-coach-msg-thread-subtitle]");
    state.formEl = document.querySelector("[data-coach-msg-form]");
    state.modeEl = document.querySelector("[data-coach-msg-mode]");
    state.athleteEl = document.querySelector("[data-coach-msg-athlete]");
    state.groupWrapEl = document.querySelector("[data-coach-msg-group]");
    state.groupListEl = document.querySelector("[data-coach-msg-group-list]");
    state.bodyEl = document.querySelector("[data-coach-msg-body]");
    state.statusEl = document.querySelector("[data-coach-msg-status]");

    if ((!state.inboxEl && !state.summaryListEl) || !window.supabase || !window.supabase.createClient) {
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
      resolveCoachAdminAccess()
        .then(function (isCoachAdmin) {
          if (!isCoachAdmin) {
            setStatus("Messaging is only available in coach mode.", "error");
            return;
          }

          state.isCoachAdmin = true;
          state.pinnedAthletes = readPinnedState();

          bindEvents();
          loadAll();
          startAutoRefresh();
        })
        .catch(function () {
          setStatus("Could not verify coach access for messaging.", "error");
        });
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

  function bindEvents() {
    if (state.modeEl) {
      state.modeEl.addEventListener("change", updateComposeMode);
    }

    if (state.inboxEl) {
      state.inboxEl.addEventListener("click", function (event) {
        var pinButton = event.target && event.target.closest("[data-msg-pin]");
        if (pinButton) {
          event.preventDefault();
          event.stopPropagation();
          togglePinnedAthlete(String(pinButton.getAttribute("data-msg-pin") || ""));
          renderInbox();
          return;
        }

        var button = event.target && event.target.closest("[data-msg-athlete]");
        if (!button) return;
        state.activeAthleteId = String(button.getAttribute("data-msg-athlete") || "");
        if (state.modeEl) {
          state.modeEl.value = "direct";
        }
        if (state.athleteEl) {
          state.athleteEl.value = state.activeAthleteId;
        }
        updateComposeMode();
        renderInbox();
        renderThread();
        markThreadRead();
      });
    }

    if (state.summaryListEl) {
      state.summaryListEl.addEventListener("click", function (event) {
        var button = event.target && event.target.closest("[data-msg-open-thread]");
        if (!button) return;
        var athleteId = String(button.getAttribute("data-msg-open-thread") || "");
        if (!athleteId) return;
        window.location.href = "coach-inbox.html?athlete=" + encodeURIComponent(athleteId);
      });
    }

    if (state.formEl) {
      state.formEl.addEventListener("submit", onSendMessage);
    }

    if (state.threadFormEl) {
      state.threadFormEl.addEventListener("submit", onSendThreadReply);
    }

    if (state.threadEl) {
      state.threadEl.addEventListener("click", function (event) {
        var deleteBtn = event.target && event.target.closest("[data-msg-delete]");
        if (!deleteBtn) return;

        event.preventDefault();
        var messageId = String(deleteBtn.getAttribute("data-msg-delete") || "").trim();
        if (!messageId) return;

        onDeleteThreadMessage(messageId);
      });
    }

    if (state.bodyEl) {
      state.bodyEl.addEventListener("keydown", function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && state.formEl) {
          event.preventDefault();
          state.formEl.requestSubmit();
        }
      });
    }

    if (state.threadBodyEl) {
      state.threadBodyEl.addEventListener("keydown", function (event) {
        if ((event.metaKey || event.ctrlKey) && event.key === "Enter" && state.threadFormEl) {
          event.preventDefault();
          state.threadFormEl.requestSubmit();
        }
      });
    }

    if (state.searchEl) {
      state.searchEl.addEventListener("input", function () {
        renderInbox();
      });
    }

    if (state.unreadOnlyEl) {
      state.unreadOnlyEl.addEventListener("change", function () {
        renderInbox();
      });
    }

    if (state.sortEl) {
      state.sortEl.addEventListener("change", function () {
        renderInbox();
      });
    }

    if (state.refreshEl) {
      state.refreshEl.addEventListener("click", function () {
        refreshMessages("Refreshing inbox...");
      });
    }
  }

  function loadAll() {
    setStatus("Loading conversations...", "info");
    Promise.all([loadAthletes(), loadMessages()])
      .then(function () {
        if (!state.activeAthleteId) {
          state.activeAthleteId = resolveInitialAthleteId();
        }
        updateComposeMode();
        renderSummary();
        renderInbox();
        renderThread();
        setStatus("", "info");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load coach messaging.", "error");
      });
  }

  function loadAthletes() {
    return state.client
      .from("admin_all_users")
      .select("user_id,email,user_created_at")
      .order("user_created_at", { ascending: false })
      .then(function (result) {
        if (result.error) throw result.error;
        var users = Array.isArray(result.data) ? result.data : [];
        var ids = users.map(function (row) { return String(row.user_id || ""); }).filter(Boolean);

        if (!ids.length) {
          state.athletes = [];
          state.athletesById = {};
          return;
        }

        return state.client
          .from("athlete_profiles")
          .select("user_id,name,sport")
          .in("user_id", ids)
          .then(function (profileResult) {
            if (profileResult.error) throw profileResult.error;
            var profileMap = {};
            (profileResult.data || []).forEach(function (profile) {
              profileMap[String(profile.user_id || "")] = profile;
            });

            state.athletes = users.map(function (user) {
              var id = String(user.user_id || "");
              var profile = profileMap[id] || {};
              return {
                user_id: id,
                email: String(user.email || ""),
                name: String(profile.name || "").trim(),
                sport: String(profile.sport || "").trim()
              };
            });

            state.athletesById = {};
            state.athletes.forEach(function (athlete) {
              state.athletesById[athlete.user_id] = athlete;
            });
          });
      });
  }

  function loadMessages() {
    return state.client
      .from("coach_athlete_messages")
      .select("id,coach_user_id,athlete_user_id,sender_user_id,sender_role,delivery_scope,delivery_label,body,read_by_coach_at,read_by_athlete_at,created_at")
      .eq("coach_user_id", state.user.id)
      .order("created_at", { ascending: false })
      .limit(1500)
      .then(function (result) {
        if (result.error) throw result.error;
        state.messages = Array.isArray(result.data) ? result.data.slice() : [];
      });
  }

  function renderInbox() {
    if (!state.inboxEl) return;

    var allThreads = getThreadSummaries();
    var threads = applyThreadSorting(allThreads.filter(filterThread));

    if (state.inboxSubtitleEl) {
      var hiddenCount = Math.max(0, allThreads.length - threads.length);
      state.inboxSubtitleEl.textContent = hiddenCount
        ? "Showing " + threads.length + " of " + allThreads.length + " conversations."
        : "Latest athlete replies and unread counts.";
    }

    if (!threads.length) {
      state.inboxEl.innerHTML = '<p class="admin-loading">No conversations match your filters.</p>';
      return;
    }

    state.inboxEl.innerHTML = threads
      .map(function (thread) {
        var athlete = state.athletesById[thread.athleteId] || {};
        var label = athlete.name || athlete.email || "Athlete";
        var isActive = thread.athleteId === state.activeAthleteId;
        var isPinned = !!state.pinnedAthletes[thread.athleteId];
        var preview = String(thread.latest.body || "").trim();
        return (
          '<button type="button" class="coach-inbox-item' + (isActive ? ' is-active' : '') + (isPinned ? ' is-pinned' : '') + '" data-msg-athlete="' + escapeAttribute(thread.athleteId) + '">' +
            '<div class="coach-inbox-item-head">' +
              '<strong>' + escapeHtml(label) + '</strong>' +
              '<div class="coach-inbox-item-actions">' +
                (thread.unread ? '<span class="coach-inbox-unread">' + escapeHtml(String(thread.unread)) + '</span>' : '') +
                '<span class="coach-pin-btn" role="button" tabindex="0" data-msg-pin="' + escapeAttribute(thread.athleteId) + '" aria-label="' + (isPinned ? 'Unpin conversation' : 'Pin conversation') + '">' + (isPinned ? 'Pinned' : 'Pin') + '</span>' +
              '</div>' +
            '</div>' +
            '<div class="coach-inbox-item-meta">' +
              (thread.needsResponse ? '<span class="coach-needs-response">Needs Response</span> · ' : '') +
              escapeHtml(athlete.sport || "General") + ' · ' + escapeHtml(formatDateTime(thread.latest.created_at)) +
            '</div>' +
            '<p>' + escapeHtml(preview.length > 80 ? preview.slice(0, 80) + '...' : preview) + '</p>' +
          '</button>'
        );
      })
      .join('');
  }

  function renderSummary() {
    if (!state.summaryListEl) return;

    var threads = getThreadSummaries();
    var unreadTotal = threads.reduce(function (sum, thread) {
      return sum + (thread.unread || 0);
    }, 0);

    if (state.summaryUnreadEl) {
      state.summaryUnreadEl.textContent = String(unreadTotal);
    }

    if (state.summaryThreadsEl) {
      state.summaryThreadsEl.textContent = String(threads.length);
    }

    if (!threads.length) {
      state.summaryListEl.innerHTML = '<p class="admin-loading">No message threads yet.</p>';
      return;
    }

    state.summaryListEl.innerHTML = threads
      .slice(0, 5)
      .map(function (thread) {
        var athlete = state.athletesById[thread.athleteId] || {};
        var label = athlete.name || athlete.email || "Athlete";
        var preview = String(thread.latest.body || "").trim();
        return (
          '<button type="button" class="coach-summary-item" data-msg-open-thread="' + escapeAttribute(thread.athleteId) + '">' +
            '<div class="coach-summary-item-head">' +
              '<strong>' + escapeHtml(label) + '</strong>' +
              (thread.unread ? '<span class="coach-inbox-unread">' + escapeHtml(String(thread.unread)) + '</span>' : '<span class="coach-summary-time">' + escapeHtml(formatDateTime(thread.latest.created_at)) + '</span>') +
            '</div>' +
            '<p>' + escapeHtml(preview.length > 100 ? preview.slice(0, 100) + '...' : preview) + '</p>' +
          '</button>'
        );
      })
      .join('');
  }

  function renderThread() {
    if (!state.threadEl) return;

    var athleteId = String(state.activeAthleteId || "");
    if (!athleteId) {
      state.threadEl.innerHTML = '<p class="admin-loading">No conversation selected.</p>';
      if (state.threadMetaEl) {
        state.threadMetaEl.innerHTML = '<span class="coach-thread-chip">No thread selected</span>';
      }
      if (state.threadBodyEl) {
        state.threadBodyEl.disabled = true;
      }
      return;
    }

    if (state.threadBodyEl) {
      state.threadBodyEl.disabled = false;
    }

    var athlete = state.athletesById[athleteId] || {};
    var athleteLabel = athlete.name || athlete.email || "Athlete";
    var threadMessages = state.messages
      .filter(function (msg) { return String(msg.athlete_user_id || "") === athleteId; })
      .sort(function (a, b) {
        return String(a.created_at || "").localeCompare(String(b.created_at || ""));
      });
    var unreadCount = threadMessages.filter(function (msg) {
      return msg.sender_role === "athlete" && !msg.read_by_coach_at;
    }).length;

    if (state.threadTitleEl) {
      state.threadTitleEl.textContent = "Conversation: " + athleteLabel;
    }

    if (state.threadSubtitleEl) {
      state.threadSubtitleEl.textContent = "One-on-one thread with " + athleteLabel + ".";
    }

    if (state.threadMetaEl) {
      var lastMessage = threadMessages.length ? threadMessages[threadMessages.length - 1] : null;
      var parts = [
        '<span class="coach-thread-chip">Messages: ' + escapeHtml(String(threadMessages.length)) + '</span>',
        '<span class="coach-thread-chip">Unread: ' + escapeHtml(String(unreadCount)) + '</span>'
      ];
      if (lastMessage) {
        parts.push('<span class="coach-thread-chip">Last: ' + escapeHtml(formatDateTime(lastMessage.created_at)) + '</span>');
      }
      state.threadMetaEl.innerHTML = parts.join('');
    }

    if (!threadMessages.length) {
      state.threadEl.innerHTML = '<p class="admin-loading">No messages with this athlete yet.</p>';
      return;
    }

    state.threadEl.innerHTML = threadMessages
      .map(function (msg) {
        var mine = msg.sender_role === "coach";
        var deleteAction = state.isCoachAdmin
          ? '<button type="button" class="btn admin-btn-delete-mini" data-msg-delete="' + escapeAttribute(String(msg.id || "")) + '">Delete</button>'
          : '';
        return (
          '<article class="coach-thread-message' + (mine ? ' is-outbound' : ' is-inbound') + '">' +
            '<div class="coach-thread-message-meta">' +
              '<span>' + escapeHtml(mine ? 'You' : athleteLabel) + '</span>' +
              '<time>' + escapeHtml(formatDateTime(msg.created_at)) + '</time>' +
              deleteAction +
            '</div>' +
            '<p>' + escapeHtml(String(msg.body || "")) + '</p>' +
          '</article>'
        );
      })
      .join('');

    state.threadEl.scrollTop = state.threadEl.scrollHeight;
  }

  function updateComposeMode() {
    if (!state.modeEl && !state.athleteEl && !state.groupWrapEl && !state.groupListEl) {
      return;
    }

    var mode = state.modeEl ? String(state.modeEl.value || "direct") : "direct";
    var athleteOptions = ['<option value="">Select athlete</option>']
      .concat(state.athletes.map(function (athlete) {
        var label = athlete.name || athlete.email || "Athlete";
        var selected = state.activeAthleteId && athlete.user_id === state.activeAthleteId ? ' selected' : '';
        return '<option value="' + escapeAttribute(athlete.user_id) + '"' + selected + '>' + escapeHtml(label) + '</option>';
      }));

    if (state.athleteEl) {
      state.athleteEl.innerHTML = athleteOptions.join('');
      state.athleteEl.hidden = mode !== "direct";
      if (!state.athleteEl.value && state.activeAthleteId) {
        state.athleteEl.value = state.activeAthleteId;
      }
    }

    if (state.groupWrapEl) {
      state.groupWrapEl.hidden = mode !== "group";
    }

    if (state.groupListEl) {
      state.groupListEl.innerHTML = state.athletes.length
        ? state.athletes.map(function (athlete) {
            var label = athlete.name || athlete.email || "Athlete";
            var sub = athlete.sport ? ' <span>(' + escapeHtml(athlete.sport) + ')</span>' : '';
            return (
              '<label class="coach-group-picker-item">' +
                '<input type="checkbox" value="' + escapeAttribute(athlete.user_id) + '" data-msg-group-athlete /> ' +
                '<span>' + escapeHtml(label) + '</span>' + sub +
              '</label>'
            );
          }).join('')
        : '<p class="admin-loading">No athletes available.</p>';
    }
  }

  function getSelectedTargets(mode) {
    if (mode === "all") {
      return state.athletes.map(function (athlete) { return athlete.user_id; });
    }

    if (mode === "group") {
      var checks = state.groupListEl ? state.groupListEl.querySelectorAll("[data-msg-group-athlete]:checked") : [];
      return Array.prototype.slice.call(checks).map(function (input) {
        return String(input.value || "").trim();
      }).filter(Boolean);
    }

    var directId = state.athleteEl ? String(state.athleteEl.value || "").trim() : "";
    return directId ? [directId] : [];
  }

  function onSendMessage(event) {
    event.preventDefault();

    var body = state.bodyEl ? String(state.bodyEl.value || "").trim() : "";
    if (!body) {
      setStatus("Write a message before sending.", "error");
      return;
    }

    var mode = state.modeEl ? String(state.modeEl.value || "direct") : "direct";
    var targets = getSelectedTargets(mode);
    if (!targets.length) {
      setStatus("Select at least one athlete target.", "error");
      return;
    }

    setStatus("Sending message...", "info");

    sendCoachMessage(targets, body, mode)
      .then(function () {
        if (state.bodyEl) {
          state.bodyEl.value = "";
        }

        if (mode === "direct" && targets[0]) {
          state.activeAthleteId = targets[0];
        }

        return loadMessages();
      })
      .then(function () {
        renderSummary();
        renderInbox();
        renderThread();
        setStatus("Message sent.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to send message.", "error");
      });
  }

  function onSendThreadReply(event) {
    event.preventDefault();

    var athleteId = String(state.activeAthleteId || "");
    if (!athleteId) {
      setStatus("Select a conversation first.", "error");
      return;
    }

    var body = state.threadBodyEl ? String(state.threadBodyEl.value || "").trim() : "";
    if (!body) {
      setStatus("Write a reply before sending.", "error");
      return;
    }

    setStatus("Sending reply...", "info");

    sendCoachMessage([athleteId], body, "direct")
      .then(function () {
        if (state.threadBodyEl) {
          state.threadBodyEl.value = "";
        }

        if (state.modeEl) {
          state.modeEl.value = "direct";
        }
        if (state.athleteEl) {
          state.athleteEl.value = athleteId;
        }
        updateComposeMode();

        return loadMessages();
      })
      .then(function () {
        renderSummary();
        renderInbox();
        renderThread();
        setStatus("Reply sent.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to send reply.", "error");
      });
  }

  function sendCoachMessage(targets, body, mode) {
    return sendCoachMessagesViaRpc(targets, body, mode)
      .catch(function (rpcError) {
        return sendCoachMessagesViaInsert(targets, body, mode)
          .catch(function (insertError) {
            var rpcMessage = rpcError && rpcError.message ? rpcError.message : "RPC send failed.";
            var insertMessage = insertError && insertError.message ? insertError.message : "Insert fallback failed.";
            throw new Error(rpcMessage + " Fallback: " + insertMessage);
          });
      });
  }

  function sendCoachMessagesViaRpc(targets, body, mode) {
    if (!state.client || !state.client.rpc) {
      return Promise.reject(new Error("RPC unavailable"));
    }

    var tasks = targets.map(function (athleteId) {
      return state.client.rpc("coach_send_message", {
        p_athlete_user_id: athleteId,
        p_body: body,
        p_delivery_scope: mode,
        p_delivery_label: mode === "group" ? "Selected group" : null
      }).then(function (result) {
        if (result && result.error) {
          throw result.error;
        }
      });
    });

    return Promise.all(tasks).then(function () {});
  }

  function sendCoachMessagesViaInsert(targets, body, mode) {
    var nowIso = new Date().toISOString();
    var rows = targets.map(function (athleteId) {
      return {
        coach_user_id: state.user.id,
        athlete_user_id: athleteId,
        sender_user_id: state.user.id,
        sender_role: "coach",
        delivery_scope: mode,
        delivery_label: mode === "group" ? "Selected group" : null,
        body: body,
        read_by_coach_at: nowIso,
        read_by_athlete_at: null
      };
    });

    return state.client
      .from("coach_athlete_messages")
      .insert(rows)
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }
      });
  }

  function onDeleteThreadMessage(messageId) {
    if (!state.client || !state.user || !messageId) {
      setStatus("Unable to delete this message right now.", "error");
      return;
    }

    var match = (state.messages || []).find(function (msg) {
      return String(msg && msg.id || "") === messageId;
    });
    var preview = String(match && match.body || "message").trim();
    var promptText = preview ? ('Delete message: "' + (preview.length > 90 ? preview.slice(0, 90) + "..." : preview) + '"?') : "Delete this message?";
    if (!confirm(promptText)) {
      return;
    }

    setStatus("Deleting message...", "info");

    state.client
      .from("coach_athlete_messages")
      .delete()
      .eq("id", messageId)
      .eq("coach_user_id", state.user.id)
      .then(function (result) {
        if (result && result.error) {
          setStatus(result.error.message || "Failed to delete message.", "error");
          return;
        }

        state.messages = (state.messages || []).filter(function (msg) {
          return String(msg && msg.id || "") !== messageId;
        });

        renderSummary();
        renderInbox();
        renderThread();
        setStatus("Message deleted.", "success");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete message.", "error");
      });
  }

  function markThreadRead() {
    var athleteId = String(state.activeAthleteId || "");
    if (!athleteId || !state.client || !state.user) {
      return;
    }

    state.client
      .from("coach_athlete_messages")
      .update({ read_by_coach_at: new Date().toISOString() })
      .eq("coach_user_id", state.user.id)
      .eq("athlete_user_id", athleteId)
      .eq("sender_role", "athlete")
      .is("read_by_coach_at", null)
      .then(function () {
        loadMessages().then(function () {
          renderSummary();
          renderInbox();
          renderThread();
        });
      });
  }

  function refreshMessages(statusMessage) {
    if (statusMessage) {
      setStatus(statusMessage, "info");
    }
    return loadMessages()
      .then(function () {
        renderSummary();
        renderInbox();
        renderThread();
        if (statusMessage) {
          setStatus("", "info");
        }
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to refresh messages.", "error");
      });
  }

  function startAutoRefresh() {
    if (state.refreshTimer) {
      clearInterval(state.refreshTimer);
    }

    state.refreshTimer = setInterval(function () {
      refreshMessages();
    }, 30000);
  }

  function resolveInitialAthleteId() {
    var paramAthleteId = "";
    try {
      var params = new URLSearchParams(window.location.search || "");
      paramAthleteId = String(params.get("athlete") || "").trim();
    } catch (_error) {
      paramAthleteId = "";
    }

    if (paramAthleteId && state.athletesById[paramAthleteId]) {
      return paramAthleteId;
    }

    return state.athletes.length ? state.athletes[0].user_id : "";
  }

  function getThreadSummaries() {
    var grouped = {};
    state.messages.forEach(function (message) {
      var athleteId = String(message.athlete_user_id || "");
      if (!athleteId) return;
      if (!grouped[athleteId]) {
        grouped[athleteId] = {
          athleteId: athleteId,
          latest: message,
          unread: 0,
          needsResponse: false
        };
      }
      if (message.sender_role === "athlete" && !message.read_by_coach_at) {
        grouped[athleteId].unread += 1;
      }
    });

    return Object.keys(grouped)
      .map(function (key) { return grouped[key]; })
      .map(function (thread) {
        var latestSenderIsAthlete = thread.latest && thread.latest.sender_role === "athlete";
        thread.needsResponse = !!(thread.unread || latestSenderIsAthlete);
        return thread;
      })
      .sort(function (a, b) {
        return String(b.latest.created_at || "").localeCompare(String(a.latest.created_at || ""));
      });
  }

  function applyThreadSorting(threads) {
    var mode = state.sortEl ? String(state.sortEl.value || "needs-response") : "needs-response";
    var list = threads.slice();

    if (mode === "name") {
      list.sort(function (a, b) {
        var athleteA = state.athletesById[a.athleteId] || {};
        var athleteB = state.athletesById[b.athleteId] || {};
        var labelA = String(athleteA.name || athleteA.email || "Athlete").toLowerCase();
        var labelB = String(athleteB.name || athleteB.email || "Athlete").toLowerCase();
        return labelA.localeCompare(labelB);
      });
    } else if (mode === "newest") {
      list.sort(function (a, b) {
        return String(b.latest.created_at || "").localeCompare(String(a.latest.created_at || ""));
      });
    } else {
      list.sort(function (a, b) {
        if (a.needsResponse !== b.needsResponse) {
          return a.needsResponse ? -1 : 1;
        }
        if ((a.unread || 0) !== (b.unread || 0)) {
          return (b.unread || 0) - (a.unread || 0);
        }
        return String(b.latest.created_at || "").localeCompare(String(a.latest.created_at || ""));
      });
    }

    return list.sort(function (a, b) {
      var aPinned = !!state.pinnedAthletes[a.athleteId];
      var bPinned = !!state.pinnedAthletes[b.athleteId];
      if (aPinned === bPinned) return 0;
      return aPinned ? -1 : 1;
    });
  }

  function togglePinnedAthlete(athleteId) {
    if (!athleteId) return;
    if (state.pinnedAthletes[athleteId]) {
      delete state.pinnedAthletes[athleteId];
    } else {
      state.pinnedAthletes[athleteId] = true;
    }
    writePinnedState(state.pinnedAthletes);
  }

  function getPinnedStorageKey() {
    var coachId = state.user && state.user.id ? String(state.user.id) : "coach";
    return "nomadic_coach_msg_pins_" + coachId;
  }

  function readPinnedState() {
    try {
      var raw = window.localStorage.getItem(getPinnedStorageKey());
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function writePinnedState(nextPins) {
    try {
      window.localStorage.setItem(getPinnedStorageKey(), JSON.stringify(nextPins || {}));
    } catch (_error) {
      // no-op when storage is unavailable
    }
  }

  function filterThread(thread) {
    if (!thread) return false;
    var unreadOnly = !!(state.unreadOnlyEl && state.unreadOnlyEl.checked);
    if (unreadOnly && !thread.unread) {
      return false;
    }

    var search = state.searchEl ? String(state.searchEl.value || "").trim().toLowerCase() : "";
    if (!search) return true;

    var athlete = state.athletesById[thread.athleteId] || {};
    var haystack = [
      athlete.name,
      athlete.email,
      athlete.sport,
      thread.latest && thread.latest.body
    ].join(" ").toLowerCase();
    return haystack.indexOf(search) !== -1;
  }

  function setStatus(message, variant) {
    [state.statusEl, state.summaryStatusEl].forEach(function (el) {
      if (!el) return;
      el.textContent = message || "";
      el.classList.remove("status-success", "status-error", "status-info");
      if (!message) return;
      el.classList.add(variant === "success" ? "status-success" : (variant === "error" ? "status-error" : "status-info"));
    });
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

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
