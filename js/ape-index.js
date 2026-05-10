/**
 * Ape Index Utility Functions
 * Calculates arm span to height ratios and indices for athletes
 */

var ApeIndexUtil = (function () {
  /**
   * Calculate ape index using the difference method
   * @param {number} armSpanCm - Arm span in centimeters
   * @param {number} heightCm - Height in centimeters
   * @returns {object} Object with difference, ratio, and classification
   */
  function calculateApeIndex(armSpanCm, heightCm) {
    if (armSpanCm == null || heightCm == null || armSpanCm <= 0 || heightCm <= 0) {
      return {
        valid: false,
        error: "Both arm span and height must be positive numbers"
      };
    }

    var difference = armSpanCm - heightCm;
    var ratio = armSpanCm / heightCm;

    // Classify the ape index
    var classification;
    if (Math.abs(difference) < 1) {
      classification = "neutral";
    } else if (difference > 0) {
      classification = "positive";
    } else {
      classification = "negative";
    }

    return {
      valid: true,
      armSpan: armSpanCm,
      height: heightCm,
      difference: Math.round(difference * 10) / 10, // Round to 1 decimal place
      ratio: Math.round(ratio * 1000) / 1000, // Round to 3 decimal places
      classification: classification,
      description: getClassificationDescription(classification, difference)
    };
  }

  /**
   * Get human-readable description of ape index classification
   * @param {string} classification - "positive", "neutral", or "negative"
   * @param {number} difference - The difference value
   * @returns {string} Description text
   */
  function getClassificationDescription(classification, difference) {
    switch (classification) {
      case "positive":
        return "Arms longer than height (+) — generally advantageous for reaching holds.";
      case "neutral":
        return "Arm span roughly equals height (0) — average for most humans.";
      case "negative":
        return "Height greater than arm span (-) — can be compensated with technique and strength.";
      default:
        return "";
    }
  }

  /**
   * Format ape index for display
   * @param {object} apeIndexData - Object returned from calculateApeIndex
   * @param {string} format - "short" (just difference), "full" (all data)
   * @returns {string} Formatted string
   */
  function formatForDisplay(apeIndexData, format) {
    if (!apeIndexData.valid) {
      return "—";
    }

    format = format || "short";

    if (format === "short") {
      var sign = apeIndexData.difference > 0 ? "+" : "";
      return sign + apeIndexData.difference + " in";
    }

    if (format === "full") {
      var sign = apeIndexData.difference > 0 ? "+" : "";
      return (
        sign + apeIndexData.difference + ' in (' +
        'Ratio: ' + apeIndexData.ratio + ', ' +
        'Classification: ' + apeIndexData.classification + ')'
      );
    }

    return "—";
  }

  /**
   * Validate arm span and height inputs
   * @param {number|string} armSpan
   * @param {number|string} height
   * @returns {object} Validation result
   */
  function validateInputs(armSpan, height) {
    var errors = [];

    var armSpanNum = parseFloat(armSpan);
    if (isNaN(armSpanNum) || armSpanNum <= 0) {
      errors.push("Arm span must be a positive number");
    }

    var heightNum = parseFloat(height);
    if (isNaN(heightNum) || heightNum <= 0) {
      errors.push("Height must be a positive number");
    }

    // Check for reasonable values (in cm, typical range 50-300)
    if (!isNaN(armSpanNum) && (armSpanNum < 50 || armSpanNum > 300)) {
      errors.push("Arm span should be between 50 and 300 cm");
    }

    if (!isNaN(heightNum) && (heightNum < 50 || heightNum > 300)) {
      errors.push("Height should be between 50 and 300 cm");
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      armSpan: armSpanNum,
      height: heightNum
    };
  }

  /**
   * Get benchmark guidance for a given classification
   * @param {string} classification - "positive", "neutral", or "negative"
   * @returns {string} Guidance text
   */
  function getBenchmarkGuidance(classification) {
    switch (classification) {
      case "positive":
        return "You have a mechanical advantage for reaching. Focus on technique refinement and power endurance to maximize this leverage.";
      case "neutral":
        return "You're in the average range. Technique, footwork, and climbing strength are your primary limiters, not reach.";
      case "negative":
        return "You may need to compensate with superior technique and body positioning. Work on footwork precision and core control.";
      default:
        return "";
    }
  }

  // Public API
  return {
    calculateApeIndex: calculateApeIndex,
    formatForDisplay: formatForDisplay,
    validateInputs: validateInputs,
    getBenchmarkGuidance: getBenchmarkGuidance,
    getClassificationDescription: getClassificationDescription
  };
})();
