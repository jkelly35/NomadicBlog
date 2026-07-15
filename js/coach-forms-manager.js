(function () {
  "use strict";

  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var COACH_FORMS_TEMPLATE_KEY = "nomadic_coach_forms_templates_v1";

  var state = {
    client: null,
    coachUser: null,
    templates: [],
    editingTemplateId: "",
    templateSearchTerm: "",
    questionDrafts: []
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    if (!window.supabase || !window.supabase.createClient) {
      showGuardError("Supabase client library failed to load.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      showGuardError("Supabase configuration is incomplete.");
      return;
    }

    state.client = window.supabase.createClient(url, key);

    state.client.auth.getSession().then(function (result) {
      var session = result && result.data && result.data.session;
      if (!session || !session.user) {
        window.location.replace("index.html");
        return;
      }

      state.coachUser = session.user;
      if (!isCoachUser(session.user)) {
        showGuardError("Coach access is required.");
        setTimeout(function () {
          window.location.replace("index.html");
        }, 1200);
        return;
      }

      showContent();
      bindEvents();
      state.templates = readTemplates();
      renderTemplateList();
      renderQuestionList();
      updateCreateActionButtons();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        window.location.replace("index.html");
      }
    });
  }

  function isCoachUser(user) {
    return String(user && user.email || "").trim().toLowerCase() === ADMIN_EMAIL;
  }

  function getDefaultTemplates() {
    return [
      {
        id: "default-liability-waiver-v1",
        name: "Liability Waiver",
        description: "Required waiver acknowledging risk, medical clearance responsibility, and agreement to proceed.",
        task_type: "liability_waiver",
        questions: [
          {
            key: "waiver_statement",
            label: "Nomadic Performance Liability Waiver",
            type: "statement",
            content: "Nomadic Performance Liability Waiver, Assumption of Risk, and Release of Claims\n\nThis Liability Waiver, Assumption of Risk, and Release of Claims (\"Waiver\") is entered into by the undersigned participant (\"Participant,\" \"I,\" \"me,\" or \"my\") in favor of Nomadic Performance, its owner(s), employees, contractors, representatives, affiliates, successors, and assigns (\"Nomadic Performance,\" \"Company,\" \"we,\" \"us,\" or \"our\").\n\nBy signing this Waiver, I acknowledge that I have read, understood, and voluntarily agree to the terms below.\n\n1. Participation in Services\n\nI understand that Nomadic Performance may provide services including, but not limited to:\n\n- Strength and conditioning\n- Mobility training\n- Corrective exercise\n- Performance coaching\n- Sport-specific training guidance\n- Endurance training guidance\n- Exercise programming\n- Movement assessments\n- Performance assessments\n- Recovery guidance\n- Training load guidance\n- Outdoor sport preparation\n- Educational resources\n- In-person or remote coaching\n- General health, wellness, recovery, and performance guidance within appropriate scope\n\nI understand that participation may occur in person, remotely, at home, in a gym, outdoors, or in another training environment.\n\n2. Inherent Risks of Exercise and Sport\n\nI understand that physical activity, exercise, training, testing, and sport participation involve inherent risks.\n\nThese risks may include, but are not limited to:\n\n- Muscle soreness\n- Fatigue\n- Dizziness\n- Shortness of breath\n- Strains or sprains\n- Joint pain\n- Tendon irritation\n- Overuse injuries\n- Falls\n- Equipment-related injuries\n- Aggravation of pre-existing injuries\n- Worsening of current symptoms\n- Cardiovascular events\n- Serious injury\n- Permanent disability\n- Death\n\nI also understand that mountain sports and outdoor activities, including but not limited to skiing, snowboarding, climbing, mountain biking, trail running, hiking, mountaineering, and related activities, involve additional risks including:\n\n- Falls\n- Collisions\n- Changing terrain\n- Weather exposure\n- Altitude\n- Rockfall\n- Avalanches\n- Equipment failure\n- Remote location\n- Limited access to emergency services\n- Other unpredictable outdoor hazards\n\nI understand that these risks cannot be completely eliminated.\n\n3. Assumption of Risk\n\nI voluntarily choose to participate in Nomadic Performance services.\n\nI acknowledge and accept the risks associated with exercise, training, testing, sport participation, and related activities.\n\nI agree that I am responsible for determining whether I am physically and medically able to participate in any exercise, training session, program, assessment, or activity.\n\nI agree to stop any activity immediately if I experience concerning symptoms, including but not limited to chest pain, difficulty breathing, fainting, dizziness, sudden severe pain, numbness, weakness, loss of coordination, unusual shortness of breath, or any symptom that feels unsafe.\n\n4. Health and Medical Responsibility\n\nI certify that, to the best of my knowledge, I am physically able to participate in exercise and training activities.\n\nI agree to disclose any relevant health conditions, injuries, surgeries, medications, pain, symptoms, limitations, or medical concerns that may affect my ability to participate safely.\n\nI understand that Nomadic Performance relies on the accuracy and completeness of the information I provide.\n\nI understand that if I have any concern about whether I should participate in exercise or training, I should consult a physician or qualified healthcare provider before participating.\n\n5. No Guarantee of Results\n\nI understand that Nomadic Performance may provide programming, guidance, coaching, education, assessments, and recommendations, but no specific result is guaranteed.\n\nI understand that progress depends on many factors, including but not limited to:\n\n- Consistency\n- Training history\n- Recovery\n- Sleep\n- Nutrition\n- Stress\n- Genetics\n- Injury history\n- Lifestyle factors\n- Communication\n- Program adherence\n- Sport participation\n- Factors outside the control of Nomadic Performance\n\nNomadic Performance does not guarantee injury prevention, pain resolution, improved performance, weight loss, strength gains, fitness improvements, or successful completion of any sport-related goal, race, trip, climb, event, or activity.\n\n6. Release of Claims\n\nTo the fullest extent permitted by law, I voluntarily release, waive, discharge, and agree not to sue Nomadic Performance, its owner(s), employees, contractors, representatives, affiliates, successors, and assigns from any and all claims, demands, damages, losses, liabilities, costs, or expenses arising out of or related to my participation in Nomadic Performance services.\n\nThis includes claims related to:\n\n- Exercise participation\n- Training programs\n- Movement or performance assessments\n- Sport-specific training guidance\n- Remote or in-person coaching\n- Use of exercise equipment\n- Use of training facilities\n- Outdoor activity preparation\n- Following or not following recommendations\n- Injuries, pain, illness, or adverse outcomes connected to participation\n\nThis release includes claims arising from ordinary negligence to the fullest extent permitted by law.\n\nThis Waiver does not release claims that cannot legally be waived under applicable law.\n\n7. Indemnification\n\nI agree to indemnify, defend, and hold harmless Nomadic Performance, its owner(s), employees, contractors, representatives, affiliates, successors, and assigns from any claims, demands, damages, losses, liabilities, costs, or expenses, including reasonable attorney fees, arising out of or related to:\n\n- My participation in Nomadic Performance services\n- My failure to disclose relevant health or injury information\n- My failure to follow instructions\n- My unsafe or inappropriate use of equipment\n- My participation in sport or exercise outside of direct supervision\n- My violation of this Waiver or any related agreement\n\n8. Remote Coaching and Independent Training\n\nI understand that some Nomadic Performance services may be delivered remotely.\n\nWhen I perform exercises, workouts, mobility drills, testing, or sport activities outside of direct supervision, I am responsible for:\n\n- Choosing a safe environment\n- Using appropriate equipment\n- Ensuring equipment is properly set up\n- Following instructions carefully\n- Modifying or stopping activity when needed\n- Avoiding exercises that feel unsafe\n- Seeking medical care when appropriate\n\nI understand that Nomadic Performance cannot control my environment, equipment, technique, effort, decisions, or actions when I am training independently.\n\n9. Equipment and Facilities\n\nI understand that I may use exercise equipment, gym facilities, home equipment, outdoor terrain, or other environments as part of my training.\n\nI agree to inspect equipment and surroundings before use and to avoid using equipment or environments that appear unsafe.\n\nI understand that Nomadic Performance is not responsible for hazards, defects, unsafe conditions, or injuries arising from third-party facilities, equipment, trails, gyms, climbing areas, ski resorts, roads, or outdoor environments.\n\n10. Pain, Injury, and Symptom Reporting\n\nI agree to promptly inform Nomadic Performance of any pain, injury, symptom change, illness, or concern that may affect safe participation.\n\nI understand that continuing to train through pain or symptoms may increase risk of injury.\n\nI agree that if symptoms are severe, worsening, unusual, or concerning, I will stop activity and seek appropriate medical care.\n\n11. Emergency Medical Care\n\nI understand that Nomadic Performance does not provide emergency medical services.\n\nIf I experience a medical emergency, I will call 911 or seek emergency medical care immediately.\n\nI understand that direct messaging, email, online forms, or the Nomadic Performance platform should not be used for emergencies or urgent medical concerns.\n\n12. Physical Therapy and Medical Services\n\nI understand that general membership services, performance coaching, training guidance, and exercise programming are not a substitute for medical care, emergency care, or formal physical therapy treatment.\n\nIf I receive formal physical therapy services from Nomadic Performance, those services may require separate documentation, consent forms, evaluation, treatment notes, and payment.\n\nI understand that dry needling, manual therapy, physical therapy evaluation, and physical therapy treatment are not automatically included in general membership services unless specifically stated in writing.\n\n13. Dry Needling\n\nI understand that dry needling, if provided, is a separate skilled intervention that requires appropriate screening, informed consent, and clinical determination that the intervention is appropriate.\n\nI understand that dry needling is not covered by this general liability waiver alone and may require a separate dry needling informed consent form before treatment.\n\n14. Media and Testimonials\n\nI understand that Nomadic Performance will not use my name, image, likeness, testimonial, results, photos, videos, or identifiable information for marketing purposes without my separate written permission.\n\n15. Minors\n\nIf the Participant is under 18 years old, a parent or legal guardian must sign this Waiver on behalf of the minor Participant.\n\nThe parent or legal guardian represents that they have authority to sign this Waiver and agrees to its terms on behalf of the minor Participant to the fullest extent permitted by law.\n\n16. Governing Law\n\nThis Waiver shall be governed by the laws of the State of Utah, unless otherwise required by applicable law.\n\n17. Severability\n\nIf any portion of this Waiver is found to be invalid or unenforceable, the remaining portions shall remain in full force and effect to the fullest extent permitted by law.\n\n18. Acknowledgment\n\nI acknowledge that:\n\n- I have read this Waiver carefully.\n- I understand its terms.\n- I understand that I am giving up certain legal rights.\n- I am signing voluntarily.\n- I have had the opportunity to ask questions before signing.\n- I understand that participation involves risk.\n- I agree to assume those risks.",
            required: false
          },
          {
            key: "legal_name",
            label: "Legal Full Name",
            type: "text",
            required: true,
            placeholder: "First and last name"
          },
          {
            key: "dob",
            label: "Date of Birth",
            type: "date",
            required: true
          },
          {
            key: "waiver_acknowledgement",
            label: "Liability Waiver Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I have read and agree to the Nomadic Performance liability waiver."
            ]
          },
          {
            key: "medical_clearance_acknowledgement",
            label: "Medical Clearance Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I confirm I am medically cleared to participate in training and will disclose relevant conditions."
            ]
          },
          {
            key: "signature_name",
            label: "Electronic Signature (Type Full Name)",
            type: "text",
            required: true,
            placeholder: "Type your full legal name"
          },
          {
            key: "signed_at_date",
            label: "Signature Date",
            type: "date",
            required: true
          }
        ]
      },
      {
        id: "liability-data-consent-comprehensive-v1",
        name: "Comprehensive Liability + Data Consent",
        description: "Single-signature legal form covering risk, consent, privacy, and de-identified analytics use.",
        task_type: "legal_consent",
        questions: [
          {
            key: "liability_data_consent_statement",
            label: "Nomadic Performance Liability and Data Consent Agreement",
            type: "statement",
            content: "By participating in Nomadic Performance coaching, you acknowledge and agree to the following:\n\n1) Assumption of Risk\nYou understand training and sport preparation carry inherent risks, including injury, illness, or in rare cases serious harm.\n\n2) Medical Responsibility\nYou confirm you are medically able to participate and will disclose relevant health considerations.\n\n3) Coaching Scope\nYou understand coaching guidance is educational/performance-oriented and does not replace individualized medical diagnosis or treatment.\n\n4) Data Use\nYou consent to your submitted data being used for coaching operations and program optimization.\n\n5) De-Identified Analytics\nYou consent to de-identified, aggregated use of your data for analytics, benchmarking, education, and internal research.\n\n6) Withdrawal Rights\nYou may request withdrawal from de-identified analytics/research use in the future.\n\n7) Electronic Signature\nTyping your legal name serves as your electronic signature and confirms voluntary agreement.",
            required: false
          },
          {
            key: "liability_risk_ack",
            label: "Risk and Liability Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I understand and accept the risks associated with participation."
            ]
          },
          {
            key: "medical_readiness_ack",
            label: "Medical Readiness Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I confirm I am medically able to participate and will report relevant limitations."
            ]
          },
          {
            key: "data_use_ack",
            label: "Data Use Consent",
            type: "checkbox",
            required: true,
            options: [
              "I consent to data use for coaching operations and optimization."
            ]
          },
          {
            key: "deidentified_analytics_ack",
            label: "De-Identified Analytics Consent",
            type: "checkbox",
            required: true,
            options: [
              "I consent to de-identified and aggregated analytics/benchmarking use."
            ]
          },
          {
            key: "legal_full_name",
            label: "Legal Full Name",
            type: "text",
            required: true,
            placeholder: "First and last name"
          },
          {
            key: "signature_date",
            label: "Signature Date",
            type: "date",
            required: true
          }
        ]
      },
      {
        id: "protocol-intake-autofill-v1",
        name: "Protocol Intake and Profile Auto-Fill Waiver",
        description: "Onboarding waiver + intake that auto-populates profile/protocol fields on submission.",
        task_type: "protocol_autofill",
        questions: [
          {
            key: "protocol_autofill_statement",
            label: "Profile Auto-Fill Consent",
            type: "statement",
            content: "Complete this intake to help your coach build your protocol faster. By submitting, you consent to this information being used to auto-populate your athlete profile and protocol context."
          },
          { key: "legal_name", label: "Legal Full Name", type: "text", required: true, placeholder: "First and last name" },
          { key: "preferred_name", label: "Preferred Name", type: "text", placeholder: "What should your coach call you?" },
          { key: "date_of_birth", label: "Date of Birth", type: "date", required: true },
          { key: "gender", label: "Gender", type: "select", required: true, options: ["Male", "Female", "Non-binary", "Prefer not to say"] },
          { key: "primary_sport", label: "Primary Sport", type: "select", required: true, options: ["Climbing", "Running", "Skiing", "Snowboarding", "Cycling", "Other"] },
          { key: "secondary_sports", label: "Secondary Sports (comma-separated)", type: "text", placeholder: "e.g. Running, Skiing" },
          { key: "primary_goal", label: "Primary Goal", type: "textarea", rows: 2, required: true, placeholder: "What is your main outcome this cycle?" },
          { key: "secondary_goals", label: "Secondary Goals", type: "textarea", rows: 2 },
          { key: "key_event_name", label: "Key Event / Race / Objective", type: "text", placeholder: "Event name or objective" },
          { key: "key_event_date", label: "Key Event Date", type: "date" },
          { key: "milestone_1", label: "Milestone 1", type: "text", placeholder: "First milestone" },
          { key: "milestone_2", label: "Milestone 2", type: "text", placeholder: "Second milestone" },
          { key: "milestone_3", label: "Milestone 3", type: "text", placeholder: "Third milestone" },
          { key: "training_days", label: "Preferred Training Days", type: "text", placeholder: "e.g. Mon, Wed, Fri" },
          { key: "minutes_per_session", label: "Typical Session Length (minutes)", type: "number", min: 10, max: 300 },
          { key: "constraints", label: "Current Constraints / Notes", type: "textarea", rows: 3, placeholder: "Work schedule, travel, equipment, recovery constraints" },
          {
            key: "protocol_autofill_ack",
            label: "Protocol Auto-Fill Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I consent to this information being auto-populated into my athlete profile and protocol context."
            ]
          }
        ]
      },
      {
        id: "founding-member-intake-v1",
        name: "Founding Member Intake",
        description: "Baseline onboarding form to align goals, history, equipment, and schedule.",
        questions: [
          { key: "primary_goal", label: "Primary Performance Goal", type: "text", required: true },
          { key: "training_days", label: "Preferred Training Days", type: "text", required: true },
          { key: "injury_history", label: "Recent Injury History", type: "textarea", rows: 3 },
          { key: "coaching_preferences", label: "Coaching Preferences", type: "textarea", rows: 3 }
        ]
      },
      {
        id: "performance-readiness-screen-v1",
        name: "Performance Readiness Screen",
        description: "Quick readiness and lifestyle intake before plan build.",
        questions: [
          { key: "sleep_hours", label: "Average Sleep (hours/night)", type: "number", min: 0, max: 14, step: 0.5, required: true },
          { key: "stress_level", label: "Current Life Stress", type: "select", options: ["Low", "Moderate", "High"], required: true }
        ]
      },
      {
        id: "par-q-plus-screen-v1",
        name: "PAR-Q+ Pre-Screen",
        description: "Readiness screen to identify potential medical red flags before training progression.",
        questions: [
          {
            key: "parq_statement",
            label: "Pre-Exercise Screening Notice",
            type: "statement",
            content: "Answer the following honestly. If you answer YES to any red-flag item, your coach may request medical clearance before you continue with higher-intensity training.",
            required: false
          },
          { key: "chest_pain_with_activity", label: "Do you experience chest pain during activity?", type: "select", options: ["No", "Yes"], required: true },
          { key: "dizziness_or_fainting", label: "Do you experience dizziness, fainting, or unexplained shortness of breath?", type: "select", options: ["No", "Yes"], required: true },
          { key: "known_cardiac_condition", label: "Have you been told you have a heart or cardiovascular condition?", type: "select", options: ["No", "Yes"], required: true },
          { key: "taking_related_medication", label: "Are you taking medication that may affect exercise tolerance?", type: "select", options: ["No", "Yes"], required: true },
          { key: "physician_advice_limit_activity", label: "Has a provider advised you to limit or avoid physical activity?", type: "select", options: ["No", "Yes"], required: true },
          { key: "parq_additional_notes", label: "Additional details", type: "textarea", rows: 3, placeholder: "Include any details that help your coach keep training safe." }
        ]
      },
      {
        id: "medical-injury-history-v1",
        name: "Medical and Injury History",
        description: "Capture injury history, current symptoms, and provider context to guide safe programming.",
        questions: [
          { key: "current_injury_or_pain", label: "Current Injury or Pain", type: "textarea", rows: 3, required: true, placeholder: "Body region, sensation, and current severity." },
          { key: "injury_mechanism", label: "How did it start?", type: "textarea", rows: 3, placeholder: "Gradual onset, acute incident, overuse, etc." },
          { key: "aggravating_activities", label: "What makes symptoms worse?", type: "textarea", rows: 2 },
          { key: "easing_activities", label: "What helps symptoms improve?", type: "textarea", rows: 2 },
          { key: "prior_surgeries_or_major_injuries", label: "Prior Surgeries or Major Injuries", type: "textarea", rows: 3 },
          { key: "imaging_or_diagnosis", label: "Imaging or Diagnosis", type: "textarea", rows: 2, placeholder: "MRI, X-ray, PT diagnosis, etc." },
          { key: "current_provider_name", label: "Current Medical Provider (if any)", type: "text", placeholder: "Provider name or clinic" },
          { key: "provider_guidance", label: "Provider Guidance / Restrictions", type: "textarea", rows: 2 }
        ]
      },
      {
        id: "informed-consent-coaching-v1",
        name: "Informed Consent for Coaching",
        description: "Consent to coaching scope, communication, and athlete responsibilities.",
        questions: [
          {
            key: "coaching_consent_statement",
            label: "Coaching Consent Statement",
            type: "statement",
            content: "I understand this service provides coaching and educational guidance for performance and training. It does not replace individualized medical diagnosis or treatment. I agree to communicate honestly, follow guidance to the best of my ability, and report symptoms that may require plan modification.",
            required: false
          },
          {
            key: "consent_acknowledgement",
            label: "Consent Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I understand and agree to the coaching scope and my responsibilities as an athlete."
            ]
          },
          {
            key: "communication_consent",
            label: "Communication Consent",
            type: "checkbox",
            required: true,
            options: [
              "I consent to receive coaching communications related to my training plan and progress."
            ]
          },
          { key: "consent_signature_name", label: "Electronic Signature (Type Full Name)", type: "text", required: true, placeholder: "Type your full legal name" },
          { key: "consent_signature_date", label: "Signature Date", type: "date", required: true }
        ]
      },
      {
        id: "data-rights-privacy-consent-v1",
        name: "Data Rights and Privacy Consent",
        description: "Consent for data use in coaching, benchmarking, analytics, and de-identified research.",
        task_type: "data_consent",
        questions: [
          {
            key: "privacy_consent_statement",
            label: "Data Rights and Privacy Consent Statement",
            type: "statement",
            content: "Nomadic Performance uses athlete data to deliver coaching and improve outcomes. This may include training logs, wellness data, wearable data, assessment data, and communication history.\n\nHow your data may be used:\n1) Coaching Operations: To build, adjust, and monitor your training plan.\n2) Population Analytics and Benchmarking: To compare trends across athletes and improve programming quality.\n3) De-Identified Research and Education: We may use de-identified and aggregated data for internal analysis, educational content, or future publications.\n\nYour rights:\n- You can request to review your submitted data.\n- You can request correction of inaccurate data.\n- You can withdraw consent for de-identified research/benchmarking use at any time by contacting your coach.\n- Withdrawing consent does not affect core coaching operations that are necessary to provide service.\n\nData handling:\n- We limit access to authorized coaching/admin accounts.\n- We do not sell personal health data.\n- Identifiable data is handled according to our platform access controls and applicable law.",
            required: false
          },
          {
            key: "coaching_data_use_consent",
            label: "Coaching Data Use Consent",
            type: "checkbox",
            required: true,
            options: [
              "I understand and consent to my data being used for coaching operations and program optimization."
            ]
          },
          {
            key: "deidentified_research_consent",
            label: "De-Identified Research and Benchmarking Consent",
            type: "checkbox",
            required: true,
            options: [
              "I consent to de-identified and aggregated use of my data for analytics, benchmarking, and educational or research outputs."
            ]
          },
          {
            key: "withdrawal_acknowledgement",
            label: "Withdrawal Rights Acknowledgement",
            type: "checkbox",
            required: true,
            options: [
              "I understand I may request withdrawal from de-identified research/benchmarking use in the future."
            ]
          },
          { key: "privacy_signature_name", label: "Electronic Signature (Type Full Name)", type: "text", required: true, placeholder: "Type your full legal name" },
          { key: "privacy_signature_date", label: "Signature Date", type: "date", required: true }
        ]
      },
      {
        id: "emergency-contact-health-v1",
        name: "Emergency Contact and Health Info",
        description: "Critical contact and health context for safety planning.",
        questions: [
          { key: "emergency_contact_name", label: "Emergency Contact Name", type: "text", required: true },
          { key: "emergency_contact_relationship", label: "Relationship", type: "text", required: true, placeholder: "Parent, spouse, partner, friend" },
          { key: "emergency_contact_phone", label: "Emergency Contact Phone", type: "text", required: true },
          { key: "known_allergies", label: "Known Allergies", type: "textarea", rows: 2, placeholder: "Food, medication, environmental, or none." },
          { key: "health_conditions", label: "Relevant Health Conditions", type: "textarea", rows: 2 },
          { key: "current_medications", label: "Current Medications", type: "textarea", rows: 2 },
          { key: "training_environment_notes", label: "Training Environment Notes", type: "textarea", rows: 2, placeholder: "Home gym, climbing gym, trail setting, etc." }
        ]
      },
      {
        id: "weekly-check-in-v1",
        name: "Weekly Check-In",
        description: "Recurring check-in for adherence, recovery, and coach feedback.",
        questions: [
          { key: "week_of", label: "Week Of", type: "date", required: true },
          { key: "sessions_completed", label: "Sessions Completed", type: "number", min: 0, max: 21, step: 1, required: true },
          { key: "avg_session_rpe", label: "Average Session RPE", type: "number", min: 1, max: 10, step: 0.5, required: true },
          { key: "sleep_quality", label: "Sleep Quality", type: "select", options: ["Poor", "Fair", "Good", "Excellent"], required: true },
          { key: "stress_level", label: "Stress Level", type: "select", options: ["Low", "Moderate", "High", "Very High"], required: true },
          { key: "pain_or_symptom_flags", label: "Pain or Symptom Flags", type: "textarea", rows: 2, placeholder: "Where, when, and how severe?" },
          { key: "weekly_win", label: "Biggest Win This Week", type: "textarea", rows: 2 },
          { key: "coach_question", label: "Question for Coach", type: "textarea", rows: 2 }
        ]
      },
      {
        id: "goal-definition-success-v1",
        name: "Goal Definition and Success Criteria",
        description: "Define primary goals, constraints, and measurable success criteria.",
        questions: [
          { key: "primary_goal", label: "Primary Goal", type: "text", required: true, placeholder: "What matters most this cycle?" },
          { key: "secondary_goals", label: "Secondary Goals", type: "textarea", rows: 2 },
          { key: "target_event_name", label: "Target Event / Milestone", type: "text" },
          { key: "target_date", label: "Target Date", type: "date" },
          { key: "success_looks_like", label: "What does success look like?", type: "textarea", rows: 3, required: true },
          { key: "top_constraints", label: "Top Constraints", type: "textarea", rows: 2, placeholder: "Time, equipment, recovery, travel, etc." },
          { key: "confidence_score", label: "Confidence (1-10)", type: "number", min: 1, max: 10, step: 1, required: true },
          { key: "non_negotiables", label: "Non-Negotiables", type: "textarea", rows: 2, placeholder: "What must stay true during this plan?" }
        ]
      }
    ];
  }

  function readTemplates() {
    var defaults = getDefaultTemplates().map(sanitizeTemplate);
    try {
      var raw = window.localStorage.getItem(COACH_FORMS_TEMPLATE_KEY);
      if (!raw) {
        writeTemplates(defaults);
        return defaults;
      }

      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        writeTemplates(defaults);
        return defaults;
      }

      var merged = defaults.slice();
      parsed.forEach(function (entry) {
        var normalized = sanitizeTemplate(entry);
        var id = String(normalized && normalized.id || "").trim();
        if (!id) {
          return;
        }

        var existingIndex = merged.findIndex(function (item) {
          return item.id === id;
        });

        if (existingIndex > -1) {
          merged[existingIndex] = normalized;
        } else {
          merged.push(normalized);
        }
      });

      writeTemplates(merged);
      return merged;
    } catch (_error) {
      writeTemplates(defaults);
      return defaults;
    }
  }

  function sanitizeTemplate(entry) {
    return {
      id: String(entry && entry.id || "coach-task-" + Date.now()).trim(),
      name: String(entry && entry.name || "Untitled Form").trim(),
      description: String(entry && entry.description || "").trim(),
      task_type: String(entry && entry.task_type || "form_template").trim(),
      action_label: String(entry && entry.action_label || "").trim(),
      action_url: String(entry && entry.action_url || "").trim(),
      action_target: "_self",
      questions: sanitizeQuestions(entry && entry.questions)
    };
  }

  function sanitizeQuestions(rawQuestions) {
    var source = Array.isArray(rawQuestions) ? rawQuestions : [];
    return source.map(function (question, index) {
      var label = String(question && question.label || "").trim();
      var key = String(question && question.key || "").trim() || slugifyQuestionKey(label || "question-" + String(index + 1));
      var type = String(question && question.type || "text").trim().toLowerCase();
      var normalizedType = ["text", "textarea", "number", "date", "select", "checkbox", "statement"].indexOf(type) > -1 ? type : "text";
      var options = Array.isArray(question && question.options)
        ? question.options.map(function (value) { return String(value || "").trim(); }).filter(Boolean)
        : [];
      return {
        key: key,
        label: label || key,
        type: normalizedType,
        required: question && question.required === true,
        placeholder: String(question && question.placeholder || "").trim(),
        content: String(question && question.content || "").trim(),
        options: options
      };
    }).filter(function (question) {
      return !!String(question && question.label || "").trim();
    });
  }

  function writeTemplates(templates) {
    try {
      window.localStorage.setItem(COACH_FORMS_TEMPLATE_KEY, JSON.stringify(templates));
    } catch (_error) {
      // Ignore storage failures.
    }
  }

  function bindEvents() {
    var searchInput = document.querySelector("[data-coach-task-search]");
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.templateSearchTerm = String(event && event.target && event.target.value || "").trim().toLowerCase();
        renderTemplateList();
      });
    }

    var createBtn = document.querySelector("[data-coach-task-create]");
    if (createBtn) {
      createBtn.addEventListener("click", onCreateTemplate);
    }

    var clearBtn = document.querySelector("[data-coach-task-clear-form]");
    if (clearBtn) {
      clearBtn.addEventListener("click", clearCreateForm);
    }

    var previewToggle = document.querySelector("[data-coach-form-preview-toggle]");
    if (previewToggle) {
      previewToggle.addEventListener("change", renderFormPreview);
    }

    var cancelEditBtn = document.querySelector("[data-coach-task-cancel-edit]");
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener("click", function () {
        resetEditingState();
        clearCreateForm();
        setStatus("Edit cancelled.", "info");
      });
    }

    document.querySelectorAll("[data-coach-task-add-question-type]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var type = String(btn.getAttribute("data-coach-task-add-question-type") || "text").trim().toLowerCase();
        state.questionDrafts.push(createEmptyQuestionDraft(type));
        renderQuestionList();
      });
    });

    var templateList = document.querySelector("[data-coach-task-template-list]");
    if (templateList) {
      templateList.addEventListener("click", function (event) {
        var editBtn = event.target && event.target.closest("[data-coach-task-edit]");
        if (editBtn) {
          var editId = String(editBtn.getAttribute("data-coach-task-edit") || "").trim();
          startEditingTemplate(editId);
          return;
        }

        var deleteBtn = event.target && event.target.closest("[data-coach-task-delete]");
        if (deleteBtn) {
          var deleteId = String(deleteBtn.getAttribute("data-coach-task-delete") || "").trim();
          onDeleteTemplate(deleteId);
        }
      });
    }

    var questionList = document.querySelector("[data-coach-task-question-list]");
    if (questionList) {
      questionList.addEventListener("click", function (event) {
        var moveBtn = event.target && event.target.closest("[data-coach-task-question-move]");
        if (moveBtn) {
          var moveIndex = parseInt(moveBtn.getAttribute("data-q-index") || "-1", 10);
          var direction = String(moveBtn.getAttribute("data-coach-task-question-move") || "");
          moveQuestionDraft(moveIndex, direction);
          return;
        }

        var duplicateBtn = event.target && event.target.closest("[data-coach-task-question-duplicate]");
        if (duplicateBtn) {
          var duplicateIndex = parseInt(duplicateBtn.getAttribute("data-q-index") || "-1", 10);
          duplicateQuestionDraft(duplicateIndex);
          return;
        }

        var removeBtn = event.target && event.target.closest("[data-coach-task-question-remove]");
        if (!removeBtn) {
          return;
        }

        var index = parseInt(removeBtn.getAttribute("data-coach-task-question-remove") || "-1", 10);
        if (!Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
          return;
        }

        state.questionDrafts.splice(index, 1);
        renderQuestionList();
      });

      questionList.addEventListener("input", onQuestionDraftInput);
      questionList.addEventListener("change", onQuestionDraftInput);
    }

    [
      "[data-coach-task-create-title]",
      "[data-coach-task-create-description]",
      "[data-coach-task-create-action-label]",
      "[data-coach-task-create-action-url]"
    ].forEach(function (selector) {
      var input = document.querySelector(selector);
      if (!input) {
        return;
      }
      input.addEventListener("input", renderFormPreview);
      input.addEventListener("change", renderFormPreview);
    });
  }

  function showGuardError(message) {
    var guard = document.querySelector("[data-coach-tasks-guard]");
    var content = document.querySelector("[data-coach-tasks-content]");
    if (guard) {
      guard.hidden = false;
      guard.innerHTML = '<p class="admin-loading">' + escapeHtml(message || "Access blocked.") + "</p>";
    }
    if (content) {
      content.hidden = true;
    }
  }

  function showContent() {
    var guard = document.querySelector("[data-coach-tasks-guard]");
    var content = document.querySelector("[data-coach-tasks-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function renderTemplateList() {
    var container = document.querySelector("[data-coach-task-template-list]");
    if (!container) {
      return;
    }

    var search = state.templateSearchTerm;
    var templates = (state.templates || []).filter(function (template) {
      if (!search) {
        return true;
      }

      var haystack = [
        String(template && template.name || ""),
        String(template && template.description || "")
      ].join(" ").toLowerCase();
      return haystack.indexOf(search) > -1;
    });

    if (!templates.length) {
      container.innerHTML = '<p class="admin-loading">No matching form templates.</p>';
      return;
    }

    container.innerHTML = templates.map(function (template) {
      var id = String(template && template.id || "");
      var isDefault = id === "default-liability-waiver-v1" || id === "data-rights-privacy-consent-v1" || id === "founding-member-intake-v1" || id === "performance-readiness-screen-v1";
      return (
        '<div class="admin-overview-item admin-widget-row">' +
          '<div>' +
            '<p class="admin-overview-item-title">' + escapeHtml(template.name || "Form") + '</p>' +
            '<p class="admin-overview-item-meta">' + escapeHtml(template.description || "No description") + '</p>' +
            '<p class="admin-overview-item-meta">Form fields: ' + escapeHtml(String(Array.isArray(template.questions) ? template.questions.length : 0)) + '</p>' +
          '</div>' +
          '<div class="admin-request-side">' +
            '<div class="admin-request-actions">' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-edit="' + escapeAttribute(id) + '">Edit</button>' +
              (isDefault
                ? ''
                : '<button type="button" class="btn admin-btn-small" data-coach-task-delete="' + escapeAttribute(id) + '">Delete</button>') +
            '</div>' +
          '</div>' +
        '</div>'
      );
    }).join("");
  }

  function renderQuestionList() {
    var container = document.querySelector("[data-coach-task-question-list]");
    if (!container) {
      return;
    }

    if (!state.questionDrafts.length) {
      container.innerHTML = '<p class="admin-loading">No form questions yet.</p>';
      return;
    }

    container.innerHTML = state.questionDrafts.map(function (question, index) {
      var normalizedType = String(question && question.type || "text").trim().toLowerCase();
      var optionsValue = Array.isArray(question.options)
        ? question.options.join(", ")
        : "";
      return (
        '<div class="admin-overview-item coach-forms-question-card">' +
          '<div class="coach-forms-question-head">' +
            '<p class="coach-forms-question-index">Question ' + escapeHtml(String(index + 1)) + '</p>' +
            '<div class="coach-forms-question-actions">' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-move="up" data-q-index="' + String(index) + '"' + (index === 0 ? ' disabled' : '') + '>↑</button>' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-move="down" data-q-index="' + String(index) + '"' + (index === state.questionDrafts.length - 1 ? ' disabled' : '') + '>↓</button>' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-duplicate data-q-index="' + String(index) + '">Duplicate</button>' +
              '<button type="button" class="btn admin-btn-small" data-coach-task-question-remove="' + String(index) + '">Delete</button>' +
            '</div>' +
          '</div>' +
          '<div class="coach-forms-question-grid">' +
            '<div class="admin-modal-info-row">' +
              '<label>Question Label</label>' +
              '<input class="admin-search" type="text" data-q-field="label" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.label || "") + '" placeholder="e.g. Weekly Reflection" />' +
            '</div>' +
            '<div class="admin-modal-info-row">' +
              '<label>Field Type</label>' +
              '<select class="admin-search" data-q-field="type" data-q-index="' + String(index) + '">' +
                buildQuestionTypeOptions(question.type) +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="admin-modal-info-row"' + (normalizedType === "statement" ? ' hidden' : '') + '>' +
            '<label>Question Key (optional)</label>' +
            '<input class="admin-search" type="text" data-q-field="key" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.key || "") + '" placeholder="e.g. weekly_reflection" />' +
          '</div>' +
          '<div class="admin-modal-info-row"' + (normalizedType === "statement" ? ' hidden' : '') + '>' +
            '<label>Placeholder (optional)</label>' +
            '<input class="admin-search" type="text" data-q-field="placeholder" data-q-index="' + String(index) + '" value="' + escapeAttribute(question.placeholder || "") + '" placeholder="Optional helper text" />' +
          '</div>' +
          '<div class="admin-modal-info-row"' + (normalizedType === "statement" ? '' : ' hidden') + '>' +
            '<label>Statement Content</label>' +
            '<textarea class="admin-search" rows="10" data-q-field="content" data-q-index="' + String(index) + '" placeholder="Paste waiver or instructional text here">' + escapeHtml(String(question.content || "")) + '</textarea>' +
          '</div>' +
          '<div class="admin-modal-info-row"' + ((normalizedType === "select" || normalizedType === "checkbox") ? '' : ' hidden') + '>' +
            '<label>Options (comma separated, for select)</label>' +
            '<input class="admin-search" type="text" data-q-field="options" data-q-index="' + String(index) + '" value="' + escapeAttribute(optionsValue) + '" placeholder="Low, Moderate, High" />' +
          '</div>' +
          '<div class="admin-controls-actions coach-forms-question-foot"' + (normalizedType === "statement" ? ' hidden' : '') + '>' +
            '<label style="display:flex;align-items:center;gap:0.4rem;">' +
              '<input type="checkbox" data-q-field="required" data-q-index="' + String(index) + '"' + (question.required ? ' checked' : '') + ' /> Required' +
            '</label>' +
          '</div>' +
        '</div>'
      );
    }).join("");

    renderFormPreview();
  }

  function buildQuestionTypeOptions(selectedType) {
    var selected = String(selectedType || "text").trim().toLowerCase();
    var options = ["text", "textarea", "number", "date", "select", "checkbox", "statement"];
    return options.map(function (type) {
      var isSelected = type === selected ? ' selected' : '';
      return '<option value="' + escapeAttribute(type) + '"' + isSelected + '>' + escapeHtml(type) + '</option>';
    }).join("");
  }

  function createEmptyQuestionDraft(typeValue) {
    var type = String(typeValue || "text").trim().toLowerCase();
    var normalizedType = ["text", "textarea", "number", "date", "select", "checkbox", "statement"].indexOf(type) > -1 ? type : "text";
    return {
      label: "",
      key: "",
      type: normalizedType,
      placeholder: "",
      content: "",
      options: normalizedType === "select" || normalizedType === "checkbox" ? ["Option 1"] : [],
      required: false
    };
  }

  function duplicateQuestionDraft(index) {
    if (!Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
      return;
    }
    var copy = JSON.parse(JSON.stringify(state.questionDrafts[index] || createEmptyQuestionDraft()));
    state.questionDrafts.splice(index + 1, 0, copy);
    renderQuestionList();
  }

  function moveQuestionDraft(index, direction) {
    if (!Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
      return;
    }
    var toIndex = direction === "up" ? index - 1 : direction === "down" ? index + 1 : index;
    if (toIndex < 0 || toIndex >= state.questionDrafts.length || toIndex === index) {
      return;
    }

    var list = state.questionDrafts.slice();
    var moved = list.splice(index, 1)[0];
    list.splice(toIndex, 0, moved);
    state.questionDrafts = list;
    renderQuestionList();
  }

  function onQuestionDraftInput(event) {
    var target = event && event.target;
    if (!target || !target.getAttribute) {
      return;
    }

    var field = String(target.getAttribute("data-q-field") || "").trim();
    var index = parseInt(String(target.getAttribute("data-q-index") || "-1"), 10);
    if (!field || !Number.isFinite(index) || index < 0 || index >= state.questionDrafts.length) {
      return;
    }

    var question = state.questionDrafts[index] || createEmptyQuestionDraft();
    if (field === "required") {
      question.required = !!target.checked;
    } else if (field === "options") {
      question.options = String(target.value || "")
        .split(",")
        .map(function (item) { return String(item || "").trim(); })
        .filter(Boolean);
    } else {
      question[field] = String(target.value || "").trim();
    }

    state.questionDrafts[index] = question;
    renderFormPreview();
  }

  function startEditingTemplate(templateId) {
    var id = String(templateId || "").trim();
    if (!id) {
      return;
    }

    var template = (state.templates || []).find(function (entry) {
      return String(entry && entry.id || "") === id;
    });
    if (!template) {
      setStatus("Form template was not found.", "error");
      return;
    }

    state.editingTemplateId = id;

    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");

    if (titleInput) titleInput.value = String(template.name || "");
    if (descriptionInput) descriptionInput.value = String(template.description || "");
    if (actionLabelInput) actionLabelInput.value = String(template.action_label || "");
    if (actionUrlInput) actionUrlInput.value = String(template.action_url || "");

    state.questionDrafts = sanitizeQuestions(template.questions).map(function (question) {
      return {
        label: String(question.label || ""),
        key: String(question.key || ""),
        type: String(question.type || "text"),
        placeholder: String(question.placeholder || ""),
        options: Array.isArray(question.options) ? question.options.slice() : [],
        required: question.required === true
      };
    });

    renderQuestionList();
    updateCreateActionButtons();
    setStatus("Editing form template.", "info");
    renderFormPreview();
  }

  function onDeleteTemplate(templateId) {
    var id = String(templateId || "").trim();
    if (!id) {
      return;
    }

    state.templates = (state.templates || []).filter(function (template) {
      return String(template && template.id || "") !== id;
    });

    writeTemplates(state.templates);
    renderTemplateList();
    setStatus("Form template deleted.", "success");
  }

  function onCreateTemplate() {
    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");

    var name = String(titleInput && titleInput.value || "").trim();
    var description = String(descriptionInput && descriptionInput.value || "").trim();
    var actionLabel = String(actionLabelInput && actionLabelInput.value || "").trim();
    var actionUrl = String(actionUrlInput && actionUrlInput.value || "").trim();

    if (!name) {
      setStatus("Enter a form title.", "error");
      return;
    }

    var questions = collectQuestionsFromDrafts();
    var isEditing = !!state.editingTemplateId;

    var id = isEditing ? state.editingTemplateId : ("coach-form-template-" + Date.now());
    var next = {
      id: id,
      name: name,
      description: description,
      task_type: "form_template",
      action_label: actionLabel,
      action_url: actionUrl,
      action_target: "_self",
      questions: questions
    };

    if (isEditing) {
      state.templates = (state.templates || []).map(function (template) {
        return String(template && template.id || "") === id ? sanitizeTemplate(next) : template;
      });
    } else {
      state.templates = [sanitizeTemplate(next)].concat(state.templates || []);
    }

    writeTemplates(state.templates);
    renderTemplateList();
    clearCreateForm();
    setStatus(isEditing ? "Form template updated." : "Form template saved.", "success");
    renderFormPreview();
  }

  function clearCreateForm() {
    var titleInput = document.querySelector("[data-coach-task-create-title]");
    var descriptionInput = document.querySelector("[data-coach-task-create-description]");
    var actionLabelInput = document.querySelector("[data-coach-task-create-action-label]");
    var actionUrlInput = document.querySelector("[data-coach-task-create-action-url]");

    if (titleInput) titleInput.value = "";
    if (descriptionInput) descriptionInput.value = "";
    if (actionLabelInput) actionLabelInput.value = "";
    if (actionUrlInput) actionUrlInput.value = "";

    resetEditingState();
    state.questionDrafts = [];
    renderQuestionList();
    updateCreateActionButtons();
    renderFormPreview();
  }

  function renderFormPreview() {
    var preview = document.querySelector("[data-coach-form-preview]");
    var toggle = document.querySelector("[data-coach-form-preview-toggle]");
    var enabled = !toggle || !!toggle.checked;
    if (!preview) {
      return;
    }

    if (!enabled) {
      preview.innerHTML = '<p class="admin-loading">Preview is off.</p>';
      return;
    }

    var title = String((document.querySelector("[data-coach-task-create-title]") || {}).value || "").trim() || "Untitled Form";
    var description = String((document.querySelector("[data-coach-task-create-description]") || {}).value || "").trim();
    var questions = sanitizeQuestions(state.questionDrafts || []);

    preview.innerHTML = [
      '<div class="coach-forms-preview-card">',
      '<h3>' + escapeHtml(title) + '</h3>',
      description ? '<p>' + escapeHtml(description) + '</p>' : '<p class="coach-forms-preview-muted">No description yet.</p>',
      questions.length
        ? '<div class="coach-forms-preview-fields">' + questions.map(function (question, index) {
            return [
              '<label class="coach-forms-preview-field">',
              '<span>' + escapeHtml(String(index + 1) + '. ' + (question.label || question.key || 'Question')) + (question.required ? ' *' : '') + '</span>',
              buildPreviewField(question),
              '</label>'
            ].join('');
          }).join('') + '</div>'
        : '<p class="coach-forms-preview-muted">Add questions to see the athlete experience.</p>',
      '</div>'
    ].join('');
  }

  function buildPreviewField(question) {
    var type = String(question && question.type || "text").trim().toLowerCase();
    var placeholder = String(question && question.placeholder || "").trim();
    var options = Array.isArray(question && question.options) ? question.options : [];

    if (type === "textarea") {
      return '<textarea class="admin-search" rows="3" placeholder="' + escapeAttribute(placeholder || 'Your response') + '" disabled></textarea>';
    }
    if (type === "statement") {
      var content = String(question && question.content || "").trim();
      if (!content) {
        return '<p class="coach-forms-preview-muted">No statement content yet.</p>';
      }
      return '<div class="coach-forms-preview-statement">' + escapeHtml(content).replace(/\n/g, '<br />') + '</div>';
    }
    if (type === "number") {
      return '<input class="admin-search" type="number" placeholder="' + escapeAttribute(placeholder || '0') + '" disabled />';
    }
    if (type === "date") {
      return '<input class="admin-search" type="date" disabled />';
    }
    if (type === "select") {
      return '<select class="admin-search" disabled>' +
        '<option value="">Select an option</option>' +
        options.map(function (option) {
          return '<option>' + escapeHtml(option) + '</option>';
        }).join('') +
      '</select>';
    }
    if (type === "checkbox") {
      if (!options.length) {
        return '<label style="display:flex;align-items:center;gap:0.4rem;"><input type="checkbox" disabled /> <span>Option</span></label>';
      }
      return '<div class="coach-forms-preview-checkboxes">' + options.map(function (option) {
        return '<label style="display:flex;align-items:center;gap:0.4rem;"><input type="checkbox" disabled /> <span>' + escapeHtml(option) + '</span></label>';
      }).join('') + '</div>';
    }
    return '<input class="admin-search" type="text" placeholder="' + escapeAttribute(placeholder || 'Your response') + '" disabled />';
  }

  function resetEditingState() {
    state.editingTemplateId = "";
  }

  function updateCreateActionButtons() {
    var saveBtn = document.querySelector("[data-coach-task-create]");
    var cancelEditBtn = document.querySelector("[data-coach-task-cancel-edit]");
    var isEditing = !!state.editingTemplateId;

    if (saveBtn) {
      saveBtn.textContent = isEditing ? "Save Form Changes" : "Save Form Template";
    }

    if (cancelEditBtn) {
      cancelEditBtn.hidden = !isEditing;
    }
  }

  function collectQuestionsFromDrafts() {
    return sanitizeQuestions((state.questionDrafts || []).map(function (question, index) {
      var label = String(question && question.label || "").trim();
      var key = String(question && question.key || "").trim() || slugifyQuestionKey(label || ("question-" + String(index + 1)));
      return {
        label: label,
        key: key,
        type: String(question && question.type || "text").trim().toLowerCase(),
        placeholder: String(question && question.placeholder || "").trim(),
        required: question && question.required === true,
        options: Array.isArray(question && question.options) ? question.options : String(question && question.options || "").split(",")
      };
    }));
  }

  function slugifyQuestionKey(value) {
    var text = String(value || "").trim().toLowerCase();
    if (!text) {
      return "question_" + String(Date.now());
    }

    return text
      .replace(/[^a-z0-9\s_-]/g, "")
      .replace(/[\s-]+/g, "_")
      .replace(/^_+|_+$/g, "") || ("question_" + String(Date.now()));
  }

  function setStatus(message, variant) {
    var status = document.querySelector("[data-coach-task-status]");
    if (!status) {
      return;
    }

    status.textContent = String(message || "");
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
