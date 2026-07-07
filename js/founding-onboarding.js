(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var STAGE_PENDING_DOCS = "first_login_pending_docs";
  var STAGE_DOCS_SIGNED = "docs_signed_pending_payment";

  var state = {
    client: null,
    user: null,
    onboardingRow: null,
    docs: [],
    guardEl: null,
    docsSectionEl: null,
    completeEl: null,
    statusEl: null,
    stageEl: null,
    docListEl: null,
    formEl: null,
    consentEl: null,
    signatureInputEl: null,
    submitButtonEl: null
  };

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    state.guardEl = document.querySelector("[data-onboarding-guard]");
    state.docsSectionEl = document.querySelector("[data-onboarding-documents]");
    state.completeEl = document.querySelector("[data-onboarding-complete]");
    state.statusEl = document.querySelector("[data-onboarding-status]");
    state.stageEl = document.querySelector("[data-onboarding-stage]");
    state.docListEl = document.querySelector("[data-onboarding-doc-list]");
    state.formEl = document.querySelector("[data-onboarding-form]");
    state.consentEl = document.querySelector("[data-onboarding-consent]");
    state.signatureInputEl = document.querySelector("#onboarding-signature-name");
    state.submitButtonEl = document.querySelector("[data-onboarding-submit]");

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      setStatus("Supabase client failed to load.", "error");
      return;
    }

    var url = String(window.NOMADIC_SUPABASE_URL || "").trim();
    var key = String(window.NOMADIC_SUPABASE_ANON_KEY || "").trim();
    if (!url || !key) {
      setStatus("Supabase configuration is missing.", "error");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    if (state.formEl) {
      state.formEl.addEventListener("submit", onSubmitDocuments);
    }

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session || !session.user) {
        window.location.href = "index.html";
        return;
      }

      state.user = session.user;
      var email = String(state.user.email || "").toLowerCase();
      if (email === ADMIN_EMAIL) {
        window.location.href = "admin.html";
        return;
      }

      loadOnboarding();
    });
  }

  function setStatus(message, tone) {
    if (!state.statusEl) {
      return;
    }

    state.statusEl.textContent = String(message || "");
    state.statusEl.classList.remove("status-error", "status-info", "status-success");

    if (tone === "error") {
      state.statusEl.classList.add("status-error");
    } else if (tone === "success") {
      state.statusEl.classList.add("status-success");
    } else {
      state.statusEl.classList.add("status-info");
    }
  }

  function setBusy(isBusy) {
    if (state.submitButtonEl) {
      state.submitButtonEl.disabled = !!isBusy;
      state.submitButtonEl.setAttribute("aria-busy", isBusy ? "true" : "false");
    }
  }

  function loadOnboarding() {
    setStatus("Loading onboarding requirements...", "info");

    state.client
      .from("founding_member_onboarding")
      .select("athlete_user_id,stage,is_founding_member,docs_signed_at,first_login_completed_at")
      .eq("athlete_user_id", state.user.id)
      .maybeSingle()
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        state.onboardingRow = result.data || null;

        if (!state.onboardingRow || state.onboardingRow.is_founding_member !== true) {
          showGuard();
          setStatus("No founding-member onboarding record found for this account.", "info");
          return;
        }

        if (state.stageEl) {
          state.stageEl.textContent = "Current stage: " + String(state.onboardingRow.stage || "invited").replace(/_/g, " ");
        }

        if (state.onboardingRow.stage === STAGE_DOCS_SIGNED || state.onboardingRow.docs_signed_at) {
          showComplete();
          setStatus("Documents already signed.", "success");
          return;
        }

        loadDocuments();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not load onboarding.", "error");
      });
  }

  function loadDocuments() {
    state.client
      .from("founding_member_legal_documents")
      .select("id,slug,title,version,content_markdown,requires_signature,is_active")
      .eq("is_active", true)
      .eq("requires_signature", true)
      .order("created_at", { ascending: true })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        state.docs = Array.isArray(result.data) ? result.data : [];
        if (!state.docs.length) {
          setStatus("No legal documents are configured yet. Please contact your coach.", "error");
          showGuard();
          return;
        }

        renderDocuments();
        showDocuments();
        setStatus("Review each document and sign to continue.", "info");
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not load legal documents.", "error");
      });
  }

  function renderDocuments() {
    if (!state.docListEl) {
      return;
    }

    state.docListEl.innerHTML = state.docs
      .map(function (doc) {
        return (
          '<article class="service-card" style="margin:0;">' +
            '<h3 style="margin-top:0;">' + escapeHtml(doc.title) + ' <span style="font-size:0.82rem;color:#6b7b78;">(' + escapeHtml(doc.version) + ')</span></h3>' +
            '<div style="background:#f8f3ed;border:1px solid #e1d3bf;border-radius:10px;padding:0.9rem;white-space:pre-wrap;line-height:1.6;">' + escapeHtml(doc.content_markdown || "") + '</div>' +
          '</article>'
        );
      })
      .join("");
  }

  function onSubmitDocuments(event) {
    event.preventDefault();

    if (!state.user || !state.onboardingRow) {
      setStatus("Onboarding context is not available.", "error");
      return;
    }

    var signatureName = String((state.signatureInputEl && state.signatureInputEl.value) || "").trim();
    if (!signatureName) {
      setStatus("Enter your full legal name to sign.", "error");
      return;
    }

    if (!state.consentEl || !state.consentEl.checked) {
      setStatus("You must confirm consent before signing.", "error");
      return;
    }

    setBusy(true);
    setStatus("Saving signatures...", "info");

    var signedAt = new Date().toISOString();
    var signatureText = "Electronically signed by " + signatureName + " on " + signedAt;
    var payload = state.docs.map(function (doc) {
      return {
        athlete_user_id: state.user.id,
        document_id: doc.id,
        document_slug: doc.slug,
        document_title: doc.title,
        document_version: doc.version,
        agreed_to_terms: true,
        signed_name: signatureName,
        signed_email: String(state.user.email || "").trim() || "unknown@nomadicperformance.com",
        signature_text: signatureText,
        user_agent: navigator.userAgent || null,
        signed_at: signedAt
      };
    });

    state.client
      .from("founding_member_legal_signatures")
      .upsert(payload, { onConflict: "athlete_user_id,document_id,document_version" })
      .then(function (result) {
        if (result.error) {
          throw result.error;
        }

        return state.client
          .from("founding_member_onboarding")
          .update({
            stage: STAGE_DOCS_SIGNED,
            docs_signed_at: signedAt,
            first_login_completed_at: state.onboardingRow.first_login_completed_at || signedAt
          })
          .eq("athlete_user_id", state.user.id);
      })
      .then(function (result) {
        if (result && result.error) {
          throw result.error;
        }

        state.onboardingRow.stage = STAGE_DOCS_SIGNED;
        state.onboardingRow.docs_signed_at = signedAt;
        setStatus("Documents signed successfully.", "success");
        showComplete();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Could not save your signature.", "error");
      })
      .finally(function () {
        setBusy(false);
      });
  }

  function showGuard() {
    if (state.guardEl) state.guardEl.style.display = "block";
    if (state.docsSectionEl) state.docsSectionEl.style.display = "none";
    if (state.completeEl) state.completeEl.style.display = "none";
  }

  function showDocuments() {
    if (state.guardEl) state.guardEl.style.display = "none";
    if (state.docsSectionEl) state.docsSectionEl.style.display = "block";
    if (state.completeEl) state.completeEl.style.display = "none";
  }

  function showComplete() {
    if (state.guardEl) state.guardEl.style.display = "none";
    if (state.docsSectionEl) state.docsSectionEl.style.display = "none";
    if (state.completeEl) state.completeEl.style.display = "block";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
