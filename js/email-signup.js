(function () {
  const DEFAULT_ENDPOINT = "";

  function showStatus(form, message, isSuccess) {
    const statusEl =
      form.querySelector("[data-signup-status]") ||
      (form.parentElement
        ? form.parentElement.querySelector("[data-signup-status]")
        : null);
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.style.display = "block";
    statusEl.style.padding = "0.7rem 0.9rem";
    statusEl.style.borderRadius = "10px";
    statusEl.style.border = isSuccess
      ? "1px solid #9bc7b8"
      : "1px solid #e2b3a0";
    statusEl.style.background = isSuccess ? "#e7f5ef" : "#fff2ec";
    statusEl.style.color = isSuccess ? "#18463a" : "#8a3a15";
  }

  async function submitForm(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const endpoint = (form.dataset.endpoint || DEFAULT_ENDPOINT).trim();
    const downloadUrl = (form.dataset.downloadUrl || "").trim();
    const downloadTarget = (form.dataset.downloadTarget || "_blank").trim();
    const programName = (form.dataset.programName || "").trim();
    const submitButton = form.querySelector("button[type='submit']");
    const emailInput = form.querySelector("input[name='email']");

    if (!endpoint) {
      showStatus(
        form,
        "Signup endpoint is not configured yet. Add your Google Apps Script URL first.",
        false
      );
      return;
    }

    if (!emailInput || !emailInput.value.trim()) {
      showStatus(form, "Please enter your email address.", false);
      return;
    }

    const payload = new URLSearchParams();
    payload.set("email", emailInput.value.trim());
    payload.set("source", form.dataset.source || "site-newsletter");
    payload.set("program_name", programName);
    payload.set("page_url", window.location.href);
    payload.set("submitted_at", new Date().toISOString());
    payload.set("user_agent", navigator.userAgent);

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: payload.toString(),
      });

      form.reset();

      if (downloadUrl) {
        showStatus(form, "Success. Redirecting you to your PDF...", true);
        await new Promise(function (resolve) {
          setTimeout(resolve, 1000);
        });

        if (downloadTarget === "_self") {
          window.location.assign(downloadUrl);
        } else {
          const openedWindow = window.open(downloadUrl, downloadTarget, "noopener");
          // If popups are blocked, still provide access by navigating in the same tab.
          if (!openedWindow) {
            window.location.assign(downloadUrl);
          }
        }
      } else {
        showStatus(form, "Thanks. You are on the list.", true);
      }
    } catch (error) {
      showStatus(
        form,
        "Could not submit right now. Please try again in a moment.",
        false
      );
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Subscribe";
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll("[data-google-sheet-signup]");
    forms.forEach(function (form) {
      form.addEventListener("submit", submitForm);
    });
  });
})();
