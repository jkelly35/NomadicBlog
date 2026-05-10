/**
 * Climbing Assessment Page JavaScript
 * Handles ape index calculator functionality
 */

(function () {
  var state = {
    client: null,
    user: null,
    form: null,
    resultsDiv: null,
    errorDiv: null
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    state.form = document.getElementById("apeIndexForm");
    state.resultsDiv = document.getElementById("apeIndexResults");
    state.errorDiv = document.getElementById("apeIndexError");

    if (state.form) {
      state.form.addEventListener("submit", onApeIndexSubmit);
    }
  }

  function onApeIndexSubmit(event) {
    event.preventDefault();

    var heightInput = document.getElementById("heightInput");
    var armSpanInput = document.getElementById("armSpanInput");

    if (!heightInput || !armSpanInput) {
      showError("Form fields not found");
      return;
    }

    var height = heightInput.value;
    var armSpan = armSpanInput.value;

    // Validate inputs
    var validation = ApeIndexUtil.validateInputs(armSpan, height);
    if (!validation.valid) {
      showError(validation.errors.join(", "));
      return;
    }

    // Calculate ape index
    var result = ApeIndexUtil.calculateApeIndex(validation.armSpan, validation.height);
    if (!result.valid) {
      showError(result.error);
      return;
    }

    // Display results
    displayResults(result);
  }

  function displayResults(apeResult) {
    if (!state.resultsDiv) {
      return;
    }

    // Hide error if it was showing
    if (state.errorDiv) {
      state.errorDiv.style.display = "none";
    }

    // Update results
    var differenceEl = document.getElementById("apeIndexDifference");
    var classificationEl = document.getElementById("apeIndexClassification");
    var guidanceEl = document.getElementById("apeIndexGuidance");

    if (differenceEl) {
      var sign = apeResult.difference > 0 ? "+" : "";
      differenceEl.textContent = sign + apeResult.difference + " inches (ratio: " + apeResult.ratio + ")";
    }

    if (classificationEl) {
      classificationEl.textContent = apeResult.classification.charAt(0).toUpperCase() + apeResult.classification.slice(1);
    }

    if (guidanceEl) {
      guidanceEl.textContent = ApeIndexUtil.getBenchmarkGuidance(apeResult.classification);
    }

    // Show results
    state.resultsDiv.style.display = "block";

    // Scroll to results
    state.resultsDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function showError(message) {
    if (!state.errorDiv) {
      return;
    }

    // Hide results if showing
    if (state.resultsDiv) {
      state.resultsDiv.style.display = "none";
    }

    state.errorDiv.textContent = message;
    state.errorDiv.style.display = "block";

    // Scroll to error
    state.errorDiv.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
})();
