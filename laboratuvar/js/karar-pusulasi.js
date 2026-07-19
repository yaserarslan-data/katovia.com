(function (global) {
  "use strict";

  const EPSILON = 1e-9;
  const PRACTICAL_TIE = 0.05 + EPSILON;
  const SCORE_LABELS = ["", "Çok zayıf", "Zayıf", "Orta", "Güçlü", "Çok güçlü"];
  const WEIGHT_LABELS = { 1: "Düşük", 2: "Önemli", 3: "Kritik" };

  function normalizeText(value, maxLength) {
    return String(value == null ? "" : value)
      .normalize("NFKC")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, maxLength);
  }

  function comparisonKey(value) {
    return normalizeText(value, 1000).toLocaleLowerCase("tr-TR");
  }

  function isAllowedNumber(value, min, max) {
    return Number.isInteger(value) && value >= min && value <= max;
  }

  function weightedScore(optionId, criteria, scores, weightOverride) {
    let total = 0;
    let weightTotal = 0;
    criteria.forEach(function (criterion) {
      const score = Number(scores[optionId] && scores[optionId][criterion.id]);
      const weight = weightOverride && weightOverride[criterion.id] || Number(criterion.weight);
      if (!isAllowedNumber(score, 1, 5) || !isAllowedNumber(weight, 1, 3)) {
        throw new Error("INVALID_SCORE_DATA");
      }
      total += score * weight;
      weightTotal += weight;
    });
    if (!weightTotal) throw new Error("NO_ACTIVE_CRITERIA");
    return total / weightTotal;
  }

  function rankOptions(options, criteria, scores, weightOverride) {
    return options.map(function (option, index) {
      return { id: option.id, name: option.name, originalIndex: index, score: weightedScore(option.id, criteria, scores, weightOverride) };
    }).sort(function (a, b) {
      const difference = b.score - a.score;
      return Math.abs(difference) <= EPSILON ? a.originalIndex - b.originalIndex : difference;
    });
  }

  function proximityFor(ranking) {
    if (ranking.length < 2) return { kind: "single", difference: 0, text: "" };
    const difference = Math.max(0, ranking[0].score - ranking[1].score);
    if (difference <= EPSILON) return { kind: "exact", difference: difference, text: "İlk iki seçenek aynı analitik puanı aldı." };
    if (difference <= PRACTICAL_TIE) return { kind: "practicalTie", difference: difference, text: "İlk iki seçenek analitik olarak neredeyse aynı sonucu verdi." };
    if (difference <= 0.15 + EPSILON) return { kind: "veryClose", difference: difference, text: "İlk iki seçenek birbirine çok yakın. Bu değerlendirme net bir kazanan göstermiyor." };
    if (difference <= 0.40 + EPSILON) return { kind: "close", difference: difference, text: "İlk seçenek önde görünse de aradaki fark sınırlı." };
    return { kind: "clear", difference: difference, text: "İlk seçenek mevcut önceliklerinle daha belirgin biçimde ayrışıyor." };
  }

  function findStrengths(optionId, criteria, scores) {
    const ordered = criteria.map(function (criterion, index) {
      return { id: criterion.id, name: criterion.name, score: Number(scores[optionId][criterion.id]), weight: criterion.weight, index: index };
    }).sort(function (a, b) {
      return b.score - a.score || b.weight - a.weight || a.index - b.index;
    });
    const weakest = ordered.slice().sort(function (a, b) {
      return a.score - b.score || b.weight - a.weight || a.index - b.index;
    })[0];
    return { strongest: ordered.slice(0, 2), weakest: weakest };
  }

  function redlineViolations(options, criteria, scores, redlines) {
    const criterionMap = Object.create(null);
    criteria.forEach(function (criterion) { criterionMap[criterion.id] = criterion; });
    const result = Object.create(null);
    options.forEach(function (option) {
      result[option.id] = redlines.filter(function (redline) {
        return criterionMap[redline.criterionId] && isAllowedNumber(redline.minimum, 3, 5) && Number(scores[option.id][redline.criterionId]) < redline.minimum;
      }).map(function (redline) {
        return { criterionId: redline.criterionId, name: criterionMap[redline.criterionId].name, minimum: redline.minimum, actual: Number(scores[option.id][redline.criterionId]) };
      });
    });
    return result;
  }

  function sensitivityAnalysis(options, criteria, scores, baselineRanking) {
    const baselineTop = baselineRanking[0];
    const influential = [];
    criteria.forEach(function (criterion) {
      [-1, 1].forEach(function (change) {
        const nextWeight = criterion.weight + change;
        if (!isAllowedNumber(nextWeight, 1, 3)) return;
        const override = Object.create(null);
        criteria.forEach(function (item) { override[item.id] = item.weight; });
        override[criterion.id] = nextWeight;
        const scenario = rankOptions(options, criteria, scores, override);
        const scenarioProximity = proximityFor(scenario);
        if (scenario[0].id !== baselineTop.id || scenarioProximity.kind === "exact" || scenarioProximity.kind === "practicalTie") {
          if (influential.indexOf(criterion.name) === -1) influential.push(criterion.name);
        }
      });
    });
    return { sensitive: influential.length > 0, influential: influential };
  }

  function heartInterpretation(ranking, heartScores) {
    const supplied = ranking.filter(function (item) { return isAllowedNumber(Number(heartScores[item.id]), 1, 5); });
    if (!supplied.length) return "İç ses puanı eklemediğin için bu bölüm analitik sıralamadan ayrı bırakıldı.";
    const highestValue = Math.max.apply(null, supplied.map(function (item) { return Number(heartScores[item.id]); }));
    const heartLeaders = supplied.filter(function (item) { return Number(heartScores[item.id]) === highestValue; });
    if (heartLeaders.length > 1) return "En yüksek iç ses puanı birden fazla seçenek arasında eşit; bu ayrışma zorla yorumlanmadı.";
    if (heartLeaders[0].id === ranking[0].id) return "Analitik değerlendirme ile en yüksek iç ses puanın aynı seçeneği öne çıkarıyor.";
    return "Analitik değerlendirmede " + ranking[0].name + " öne çıkıyor; en yüksek iç ses puanın ise " + heartLeaders[0].name + " için daha yüksek.";
  }

  function calculate(input) {
    const options = input.options || [];
    const criteria = (input.criteria || []).filter(function (criterion) { return criterion.active !== false; });
    if (options.length < 2 || options.length > 4 || criteria.length < 3 || criteria.length > 6) throw new Error("INVALID_CONFIGURATION");
    const ranking = rankOptions(options, criteria, input.scores || Object.create(null));
    const proximity = proximityFor(ranking);
    const strengths = Object.create(null);
    options.forEach(function (option) { strengths[option.id] = findStrengths(option.id, criteria, input.scores); });
    const violations = redlineViolations(options, criteria, input.scores, input.redlines || []);
    const sensitivity = sensitivityAnalysis(options, criteria, input.scores, ranking);
    return {
      ranking: ranking,
      proximity: proximity,
      strengths: strengths,
      violations: violations,
      sensitivity: sensitivity,
      heartText: heartInterpretation(ranking, input.heartScores || Object.create(null))
    };
  }

  global.KATOVIA_DECISION_ENGINE = {
    normalizeText: normalizeText,
    comparisonKey: comparisonKey,
    weightedScore: weightedScore,
    rankOptions: rankOptions,
    proximityFor: proximityFor,
    calculate: calculate
  };

  if (typeof document === "undefined") return;

  const presets = Array.isArray(global.KATOVIA_DECISION_PRESETS) ? global.KATOVIA_DECISION_PRESETS : [];
  const root = document.getElementById("appRoot");
  const statusNode = document.getElementById("statusMessage");
  const desktopSteps = document.getElementById("desktopSteps");
  const mobileProgress = document.getElementById("mobileProgress");
  const toolPanel = document.getElementById("toolPanel");
  const reducedMotion = global.matchMedia("(prefers-reduced-motion: reduce)");
  const stepNames = ["Seçenekler", "Ölçütler", "Puanlama", "Sonuç"];
  let optionSequence = 0;
  let customSequence = 0;
  let state;

  function create(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function button(text, className, handler) {
    const node = create("button", className || "button", text);
    node.type = "button";
    if (handler) node.addEventListener("click", handler);
    return node;
  }

  function getPreset(id) {
    return presets.find(function (preset) { return preset.id === id; }) || presets[0];
  }

  function freshCriteria(domainId) {
    const preset = getPreset(domainId);
    return preset.criteria.map(function (criterion) {
      return { id: criterion.id, name: criterion.name, help: criterion.help, active: true, weight: 2, custom: false };
    });
  }

  function freshState() {
    optionSequence = 0;
    customSequence = 0;
    return {
      step: 1,
      highestStep: 1,
      title: "",
      domain: "general",
      options: [newOption(""), newOption("")],
      criteria: freshCriteria("general"),
      scores: Object.create(null),
      heartScores: Object.create(null),
      redlines: [],
      activeOptionId: null,
      advancedOpen: false,
      result: null
    };
  }

  function newOption(name) {
    optionSequence += 1;
    return { id: "option-" + optionSequence, name: name || "" };
  }

  function setStatus(text, type) {
    statusNode.textContent = text || "";
    statusNode.className = "status" + (type ? " " + type : "");
  }

  function clearStatus() { setStatus(""); }

  function scrollToPanel() {
    toolPanel.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    toolPanel.focus({ preventScroll: true });
  }

  function updateProgress() {
    desktopSteps.replaceChildren();
    stepNames.forEach(function (name, index) {
      const stepNumber = index + 1;
      const li = create("li");
      const marker = create("div", "step-marker" + (state.step === stepNumber ? " current" : "") + (state.highestStep > stepNumber ? " done" : ""));
      const number = create("span", "number", state.highestStep > stepNumber ? "✓" : String(stepNumber));
      number.setAttribute("aria-hidden", "true");
      const copy = create("span");
      copy.append(create("strong", "", name), create("small", "", state.step === stepNumber ? "Şu anki adım" : state.highestStep > stepNumber ? "Tamamlandı" : "Henüz açılmadı"));
      marker.append(number, copy);
      if (state.step === stepNumber) marker.setAttribute("aria-current", "step");
      li.append(marker);
      desktopSteps.append(li);
    });
    mobileProgress.replaceChildren(create("strong", "", state.step + " / 4 — " + stepNames[state.step - 1]), create("span", "", state.step === 4 ? " · Değerlendirme tamamlandı" : " · Sonraki adım için alanları tamamla"));
  }

  function sectionHeader(step, title, description) {
    const header = create("header");
    header.append(create("p", "step-kicker", "Adım " + step + " / 4"), create("h2", "", title), create("p", "", description));
    return header;
  }

  function fieldLabel(text, optional) {
    const label = create("label");
    label.append(document.createTextNode(text));
    if (optional) label.append(document.createTextNode(" "), create("span", "optional", "(isteğe bağlı)"));
    return label;
  }

  function navActions(config) {
    const nav = create("div", "nav-actions");
    if (config.back) nav.append(button("← Geri", "button ghost", config.back));
    const right = create("div", "right");
    if (config.reset) right.append(button("Sıfırla", "button ghost", resetEvaluation));
    if (config.next) right.append(button(config.nextLabel || "Devam →", "button primary", config.next));
    nav.append(right);
    return nav;
  }

  function render() {
    root.replaceChildren();
    updateProgress();
    if (state.step === 1) renderStepOne();
    else if (state.step === 2) renderStepTwo();
    else if (state.step === 3) renderStepThree();
    else renderResult();
  }

  function renderStepOne() {
    const section = create("div", "step-section");
    section.append(sectionHeader(1, "Kararını ve seçeneklerini tanımla", "Karar alanını seç, ardından karşılaştırmak istediğin 2–4 seçeneği yaz."));
    const titleField = create("div", "field");
    const titleLabel = fieldLabel("Hangi konuda karar vermeye çalışıyorsun?", true);
    titleLabel.htmlFor = "decisionTitle";
    const titleInput = create("input", "input");
    titleInput.id = "decisionTitle";
    titleInput.type = "text";
    titleInput.maxLength = 120;
    titleInput.placeholder = "Örneğin: Hangi iş teklifini seçmeliyim?";
    titleInput.value = state.title;
    titleInput.addEventListener("input", function () { state.title = titleInput.value.slice(0, 120); counter.textContent = titleInput.value.length + " / 120"; });
    const counter = create("div", "counter", titleInput.value.length + " / 120");
    titleField.append(titleLabel, titleInput, counter);

    const domainField = create("div", "field");
    const domainLabel = fieldLabel("Karar alanı");
    domainLabel.htmlFor = "decisionDomain";
    const domain = create("select", "select");
    domain.id = "decisionDomain";
    presets.forEach(function (preset) {
      const option = create("option", "", preset.name);
      option.value = preset.id;
      option.selected = state.domain === preset.id;
      domain.append(option);
    });
    domain.addEventListener("change", function () {
      const changed = state.domain !== domain.value;
      state.domain = domain.value;
      if (changed) {
        state.criteria = freshCriteria(state.domain);
        state.scores = Object.create(null);
        state.redlines = [];
        state.result = null;
        setStatus("Karar alanı değişti. Ölçütler yenilendi ve önceki puanlar temizlendi.");
      }
    });
    domainField.append(domainLabel, domain);

    const optionField = create("div", "field");
    optionField.append(create("p", "field-label", "Seçeneklerin"));
    const list = create("div", "option-list");
    state.options.forEach(function (option, index) {
      const row = create("div", "option-row");
      const number = create("span", "option-index", String(index + 1));
      number.setAttribute("aria-hidden", "true");
      const input = create("input", "input");
      input.type = "text";
      input.maxLength = 60;
      input.value = option.name;
      input.placeholder = "Seçenek " + (index + 1);
      input.setAttribute("aria-label", (index + 1) + ". seçenek adı");
      input.addEventListener("input", function () { option.name = input.value.slice(0, 60); });
      const remove = button("×", "icon-button", function () {
        if (state.options.length <= 2) { setStatus("En az iki seçenek kalmalı.", "error"); return; }
        state.options = state.options.filter(function (item) { return item.id !== option.id; });
        delete state.scores[option.id];
        delete state.heartScores[option.id];
        render();
      });
      remove.disabled = state.options.length <= 2;
      remove.setAttribute("aria-label", (index + 1) + ". seçeneği kaldır");
      row.append(number, input, remove);
      list.append(row);
    });
    const add = button("+ Seçenek ekle", "add-button", function () {
      if (state.options.length >= 4) { setStatus("En fazla dört seçenek karşılaştırabilirsin.", "error"); return; }
      state.options.push(newOption(""));
      render();
      const inputs = root.querySelectorAll(".option-row input");
      inputs[inputs.length - 1].focus();
    });
    add.disabled = state.options.length >= 4;
    optionField.append(list, add, create("p", "help", "Kararına uygunsa ‘Şimdilik bekle’ seçeneğini de kendin ekleyebilirsin."));
    section.append(titleField, domainField, optionField, navActions({ reset: true, next: goToCriteria }));
    root.append(section);
  }

  function validateStepOne() {
    state.title = normalizeText(state.title, 120);
    const names = state.options.map(function (option) { return normalizeText(option.name, 60); });
    const emptyIndex = names.findIndex(function (name) { return !name; });
    if (emptyIndex !== -1) {
      setStatus((emptyIndex + 1) + ". seçenek boş bırakılamaz.", "error");
      const input = root.querySelectorAll(".option-row input")[emptyIndex];
      if (input) input.focus();
      return false;
    }
    const keys = names.map(comparisonKey);
    const duplicateIndex = keys.findIndex(function (key, index) { return keys.indexOf(key) !== index; });
    if (duplicateIndex !== -1) {
      setStatus("Aynı seçenek birden fazla kez eklenemez. Büyük-küçük harf ve fazla boşluklar aynı kabul edilir.", "error");
      const input = root.querySelectorAll(".option-row input")[duplicateIndex];
      if (input) input.focus();
      return false;
    }
    state.options.forEach(function (option, index) { option.name = names[index]; });
    return true;
  }

  function goToCriteria() {
    if (!validateStepOne()) return;
    clearStatus();
    state.step = 2;
    state.highestStep = Math.max(state.highestStep, 2);
    render();
    scrollToPanel();
  }

  function renderStepTwo() {
    const section = create("div", "step-section");
    section.append(sectionHeader(2, "Ölçütlerini ve önceliklerini belirle", "En az üç ölçütü açık bırak. Her ölçütün senin için ne kadar önemli olduğunu seç."));
    const list = create("div", "criteria-list");
    state.criteria.forEach(function (criterion) {
      const card = create("div", "criterion-card");
      const head = create("div", "criterion-head");
      const toggle = create("input", "criterion-toggle");
      toggle.type = "checkbox";
      toggle.checked = criterion.active;
      toggle.id = "toggle-" + criterion.id;
      const copy = create("div", "criterion-copy");
      const label = create("label", "", criterion.name);
      label.htmlFor = toggle.id;
      copy.append(label, create("p", "", criterion.help || "Bu ölçütün seçeneklerin için ne kadar uygun olduğunu değerlendir."));
      toggle.addEventListener("change", function () {
        const activeCount = state.criteria.filter(function (item) { return item.active; }).length;
        if (!toggle.checked && activeCount <= 3) {
          toggle.checked = true;
          setStatus("Değerlendirme için en az üç aktif ölçüt gerekli.", "error");
          return;
        }
        criterion.active = toggle.checked;
        state.redlines = state.redlines.filter(function (item) { return item.criterionId !== criterion.id; });
        Object.keys(state.scores).forEach(function (optionId) { if (state.scores[optionId]) delete state.scores[optionId][criterion.id]; });
        state.result = null;
        render();
      });
      head.append(toggle, copy);
      card.append(head);
      if (criterion.active) {
        const weightRow = create("div", "weight-row");
        const weightLabel = create("label", "", "Önem seviyesi");
        const select = create("select", "select");
        select.setAttribute("aria-label", criterion.name + " önem seviyesi");
        [1, 2, 3].forEach(function (weight) {
          const option = create("option", "", WEIGHT_LABELS[weight]);
          option.value = String(weight);
          option.selected = criterion.weight === weight;
          select.append(option);
        });
        select.addEventListener("change", function () {
          criterion.weight = Number(select.value);
          state.result = null;
          render();
        });
        weightRow.append(weightLabel, select);
        card.append(weightRow);
      }
      if (criterion.custom) {
        const remove = button("Özel ölçütü kaldır", "button ghost", function () {
          state.criteria = state.criteria.filter(function (item) { return item.id !== criterion.id; });
          Object.keys(state.scores).forEach(function (optionId) { if (state.scores[optionId]) delete state.scores[optionId][criterion.id]; });
          state.redlines = state.redlines.filter(function (item) { return item.criterionId !== criterion.id; });
          render();
        });
        remove.style.marginTop = "12px";
        card.append(remove);
      }
      list.append(card);
    });
    section.append(list);
    if (state.criteria.every(function (criterion) { return !criterion.active || criterion.weight === 3; })) {
      section.append(create("p", "notice", "Bütün ölçütler aynı önemde olduğunda öncelikler sonucu daha az ayrıştırır."));
    }
    section.append(renderCustomCriterion(), navActions({ back: function () { moveToStep(1); }, reset: true, next: goToScoring }));
    root.append(section);
  }

  function renderCustomCriterion() {
    const box = create("div", "custom-box");
    const existing = state.criteria.find(function (criterion) { return criterion.custom; });
    box.append(create("p", "field-label", "Özel ölçüt"));
    if (existing) {
      box.append(create("p", "help", "MVP’de bir özel ölçüt kullanabilirsin. Eklediğin ölçüt yukarıdaki listede yer alıyor."));
      return box;
    }
    const form = create("div", "custom-form");
    const input = create("input", "input");
    input.type = "text";
    input.maxLength = 40;
    input.placeholder = "Örneğin: Destek kalitesi";
    input.setAttribute("aria-label", "Özel ölçüt adı");
    const add = button("Ölçüt ekle", "button secondary", function () {
      const name = normalizeText(input.value, 40);
      if (!name) { setStatus("Özel ölçüt adı boş bırakılamaz.", "error"); input.focus(); return; }
      if (state.criteria.some(function (criterion) { return comparisonKey(criterion.name) === comparisonKey(name); })) {
        setStatus("Bu adla bir ölçüt zaten var.", "error"); input.focus(); return;
      }
      customSequence += 1;
      state.criteria.push({ id: "custom-criterion-" + customSequence, name: name, help: "Bu seçeneğin kendi belirlediğin ölçüte ne kadar uygun olduğunu değerlendir.", active: true, weight: 2, custom: true });
      clearStatus();
      render();
    });
    form.append(input, add);
    box.append(form, create("p", "help", "En fazla 40 karakter; hazır bir ölçütle aynı adı taşıyamaz."));
    return box;
  }

  function goToScoring() {
    const active = state.criteria.filter(function (criterion) { return criterion.active; });
    if (active.length < 3) { setStatus("Devam etmek için en az üç aktif ölçüt gerekli.", "error"); return; }
    clearStatus();
    state.step = 3;
    state.highestStep = Math.max(state.highestStep, 3);
    state.activeOptionId = state.activeOptionId && state.options.some(function (option) { return option.id === state.activeOptionId; }) ? state.activeOptionId : state.options[0].id;
    render();
    scrollToPanel();
  }

  function renderStepThree() {
    const section = create("div", "step-section");
    section.append(sectionHeader(3, "Seçeneklerini değerlendir", "Her seçeneği aktif ölçütlerin tamamında 1–5 arasında puanla. Puanlar başlangıçta bilinçli olarak boştur."));
    const tabs = create("div", "score-tabs");
    tabs.setAttribute("role", "tablist");
    tabs.setAttribute("aria-label", "Puanlanacak seçenek");
    state.options.forEach(function (option) {
      const tab = button(option.name, "score-tab", function () { state.activeOptionId = option.id; render(); });
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(option.id === state.activeOptionId));
      tabs.append(tab);
    });
    section.append(tabs, renderScoreCard());
    const details = create("details", "advanced");
    details.open = state.advancedOpen;
    details.addEventListener("toggle", function () { state.advancedOpen = details.open; });
    details.append(create("summary", "", "İleri değerlendirme (isteğe bağlı)"), renderAdvanced());
    section.append(details, navActions({ back: function () { moveToStep(2); }, reset: true, next: calculateAndShow, nextLabel: "Sonucu Hesapla →" }));
    root.append(section);
  }

  function renderScoreCard() {
    const option = state.options.find(function (item) { return item.id === state.activeOptionId; }) || state.options[0];
    const card = create("div", "score-card");
    card.append(create("h3", "", option.name));
    const activeCriteria = state.criteria.filter(function (criterion) { return criterion.active; });
    activeCriteria.forEach(function (criterion) {
      const group = create("fieldset", "score-group");
      group.append(create("legend", "", criterion.name), create("p", "help", criterion.help));
      const rating = create("div", "rating");
      [1, 2, 3, 4, 5].forEach(function (score) {
        const label = create("label");
        const input = create("input");
        input.type = "radio";
        input.name = "score-" + option.id + "-" + criterion.id;
        input.value = String(score);
        input.checked = Number(state.scores[option.id] && state.scores[option.id][criterion.id]) === score;
        input.addEventListener("change", function () {
          if (!state.scores[option.id]) state.scores[option.id] = Object.create(null);
          state.scores[option.id][criterion.id] = score;
          state.result = null;
        });
        const face = create("span");
        face.append(create("b", "", String(score)), create("small", "", SCORE_LABELS[score]));
        label.append(input, face);
        rating.append(label);
      });
      group.append(rating);
      card.append(group);
    });
    const completion = countScores(option.id, activeCriteria);
    card.append(create("p", "help", completion + " / " + activeCriteria.length + " ölçüt puanlandı."));
    return card;
  }

  function countScores(optionId, criteria) {
    return criteria.filter(function (criterion) { return isAllowedNumber(Number(state.scores[optionId] && state.scores[optionId][criterion.id]), 1, 5); }).length;
  }

  function renderAdvanced() {
    const body = create("div", "advanced-body");
    const grid = create("div", "advanced-grid");
    const redlineBox = create("section");
    redlineBox.append(create("h3", "", "Kırmızı çizgiler"), create("p", "help", "En fazla iki ölçüt için kabul edeceğin minimum puanı belirle. Bu uyarılar ana skoru değiştirmez."));
    const list = create("div", "redline-list");
    const activeCriteria = state.criteria.filter(function (criterion) { return criterion.active; });
    state.redlines.forEach(function (redline, index) {
      const row = create("div", "redline-row");
      const criterionSelect = create("select", "select");
      criterionSelect.setAttribute("aria-label", (index + 1) + ". kırmızı çizgi ölçütü");
      activeCriteria.forEach(function (criterion) {
        const option = create("option", "", criterion.name);
        option.value = criterion.id;
        option.selected = redline.criterionId === criterion.id;
        option.disabled = state.redlines.some(function (item, itemIndex) { return itemIndex !== index && item.criterionId === criterion.id; });
        criterionSelect.append(option);
      });
      criterionSelect.addEventListener("change", function () { redline.criterionId = criterionSelect.value; state.result = null; render(); });
      const minimum = create("select", "select");
      minimum.setAttribute("aria-label", (index + 1) + ". kırmızı çizgi minimum puanı");
      [3, 4, 5].forEach(function (value) {
        const option = create("option", "", "En az " + value);
        option.value = String(value);
        option.selected = redline.minimum === value;
        minimum.append(option);
      });
      minimum.addEventListener("change", function () { redline.minimum = Number(minimum.value); state.result = null; });
      const remove = button("×", "icon-button", function () { state.redlines.splice(index, 1); render(); });
      remove.setAttribute("aria-label", (index + 1) + ". kırmızı çizgiyi kaldır");
      row.append(criterionSelect, minimum, remove);
      list.append(row);
    });
    redlineBox.append(list);
    const available = activeCriteria.filter(function (criterion) { return !state.redlines.some(function (redline) { return redline.criterionId === criterion.id; }); });
    const addRedline = button("+ Kırmızı çizgi ekle", "add-button", function () {
      if (state.redlines.length >= 2 || !available.length) return;
      state.redlines.push({ criterionId: available[0].id, minimum: 3 });
      render();
    });
    addRedline.disabled = state.redlines.length >= 2 || !available.length;
    redlineBox.append(addRedline);

    const heartBox = create("section");
    heartBox.append(create("h3", "", "İçime ne kadar siniyor?"), create("p", "help", "İsteğe bağlıdır; analitik puanı veya sıralamayı değiştirmez."));
    const option = state.options.find(function (item) { return item.id === state.activeOptionId; }) || state.options[0];
    const group = create("fieldset", "score-group");
    group.append(create("legend", "", option.name));
    const rating = create("div", "rating");
    [1, 2, 3, 4, 5].forEach(function (score) {
      const label = create("label");
      const input = create("input");
      input.type = "radio";
      input.name = "heart-" + option.id;
      input.value = String(score);
      input.checked = Number(state.heartScores[option.id]) === score;
      input.addEventListener("change", function () { state.heartScores[option.id] = score; state.result = null; });
      const face = create("span");
      face.append(create("b", "", String(score)), create("small", "", score === 1 ? "Hiç" : score === 5 ? "Çok" : ""));
      label.append(input, face);
      rating.append(label);
    });
    group.append(rating);
    heartBox.append(group);
    grid.append(redlineBox, heartBox);
    body.append(grid);
    return body;
  }

  function validateScores() {
    const activeCriteria = state.criteria.filter(function (criterion) { return criterion.active; });
    for (let optionIndex = 0; optionIndex < state.options.length; optionIndex += 1) {
      const option = state.options[optionIndex];
      for (let criterionIndex = 0; criterionIndex < activeCriteria.length; criterionIndex += 1) {
        const criterion = activeCriteria[criterionIndex];
        if (!isAllowedNumber(Number(state.scores[option.id] && state.scores[option.id][criterion.id]), 1, 5)) {
          state.activeOptionId = option.id;
          render();
          setStatus("“" + option.name + "” seçeneğinde “" + criterion.name + "” ölçütü için puan seçmelisin.", "error");
          const target = root.querySelector('input[name="score-' + option.id + '-' + criterion.id + '"]');
          if (target) target.focus();
          return false;
        }
      }
    }
    return true;
  }

  function calculateAndShow() {
    if (!validateScores()) return;
    try {
      state.result = calculate({ options: state.options, criteria: state.criteria, scores: state.scores, redlines: state.redlines, heartScores: state.heartScores });
    } catch (error) {
      setStatus("Sonuç hesaplanamadı. Puanlarını kontrol edip yeniden deneyebilirsin.", "error");
      return;
    }
    clearStatus();
    state.step = 4;
    state.highestStep = 4;
    render();
    scrollToPanel();
  }

  function renderResult() {
    const result = state.result;
    const section = create("div", "step-section");
    section.append(sectionHeader(4, "Sonucunu incele", "Bu özet yalnızca verdiğin puan ve önceliklerden oluşur; son adımı yine sen atacaksın."));
    if (!result) {
      section.append(create("p", "notice", "Güncel bir sonuç bulunamadı. Değerlerini kontrol etmek için puanlama adımına dön."), navActions({ back: function () { moveToStep(3); } }));
      root.append(section);
      return;
    }
    section.append(renderResultHero(result), renderRanking(result), renderInsights(result), renderTechnical(result));
    const actions = create("div", "nav-actions");
    actions.append(button("← Değerleri Düzenle", "button ghost", function () { moveToStep(3); }));
    const right = create("div", "right");
    right.append(button("Sonucu Kopyala", "button secondary", copyReport), button("Yeni Değerlendirme", "button primary", resetEvaluation), button("Sıfırla", "button ghost", resetEvaluation));
    actions.append(right);
    section.append(actions, create("p", "copy-note", "Kopyalanan rapor karar başlığını ve seçenek adlarını içerebilir."));
    const back = create("a", "button ghost", "Laboratuvara Dön");
    back.href = "../index.html#laboratuvar";
    back.style.marginTop = "12px";
    section.append(back);
    root.append(section);
  }

  function renderResultHero(result) {
    const hero = create("section", "result-hero");
    hero.append(create("p", "result-overline", result.proximity.kind === "exact" || result.proximity.kind === "practicalTie" ? "Dengeli görünen seçenekler" : "En dengeli görünen seçenek"));
    const topNames = result.proximity.kind === "exact" || result.proximity.kind === "practicalTie" ? result.ranking.slice(0, 2).map(function (item) { return item.name; }).join(" ve ") : result.ranking[0].name;
    hero.append(create("h3", "", topNames));
    if (state.title) hero.append(create("p", "result-title", "“" + state.title + "” değerlendirmesinin sonucu"));
    hero.append(create("p", "", result.proximity.text));
    const topViolations = result.violations[result.ranking[0].id];
    if (topViolations.length) {
      const eligible = result.ranking.find(function (item) { return result.violations[item.id].length === 0; });
      let warning = result.ranking[0].name + " puanlamada öne çıkıyor; ancak " + topViolations.length + " kırmızı çizgiyi karşılamıyor.";
      if (eligible) warning += " Kırmızı çizgilerini karşılayan en güçlü alternatif " + eligible.name + ".";
      hero.append(create("p", "result-warning", warning));
    }
    return hero;
  }

  function renderRanking(result) {
    const ranking = create("section", "ranking");
    ranking.setAttribute("aria-label", "Seçenek sıralaması");
    result.ranking.forEach(function (item, index) {
      const card = create("article", "rank-card");
      const top = create("div", "rank-top");
      top.append(create("span", "rank-number", String(index + 1)), create("span", "rank-name", item.name), create("span", "rank-score", item.score.toFixed(1).replace(".", ",") + " / 5"));
      const bar = create("div", "bar");
      bar.setAttribute("aria-hidden", "true");
      const fill = create("span");
      fill.style.width = Math.max(0, Math.min(100, item.score / 5 * 100)) + "%";
      bar.append(fill);
      card.append(top, bar);
      if (result.violations[item.id].length) card.append(create("span", "tag", result.violations[item.id].length + " kırmızı çizgi uyarısı"));
      ranking.append(card);
    });
    return ranking;
  }

  function renderInsights(result) {
    const grid = create("section", "insights");
    const top = result.ranking[0];
    const strength = result.strengths[top.id];
    const why = create("article", "insight");
    why.append(create("h4", "", "Güçlü ve zayıf alanlar"));
    const strongNames = strength.strongest.map(function (item) { return item.name; }).join(" ve ");
    why.append(create("p", "", top.name + " özellikle “" + strongNames + "” alanlarında güçlü görünüyor. En düşük değerlendirmeyi “" + strength.weakest.name + "” ölçütünde aldı."));
    const redline = create("article", "insight");
    redline.append(create("h4", "", "Kırmızı çizgiler"));
    if (!state.redlines.length) redline.append(create("p", "", "Bu değerlendirmede kırmızı çizgi tanımlanmadı."));
    else if (!result.violations[top.id].length) redline.append(create("p", "", top.name + " belirlediğin kırmızı çizgilerin tamamını karşılıyor."));
    else {
      redline.append(create("p", "", top.name + " için minimum seviyenin altında kalan ölçütler:"));
      const list = create("ul");
      result.violations[top.id].forEach(function (item) { list.append(create("li", "", item.name + ": " + item.actual + " (minimum " + item.minimum + ")")); });
      redline.append(list);
    }
    const heart = create("article", "insight");
    heart.append(create("h4", "", "Analitik değerlendirme ve iç ses"), create("p", "", result.heartText));
    const sensitivity = create("article", "insight");
    sensitivity.append(create("h4", "", result.sensitivity.sensitive ? "Hassas sonuç" : "Kararlı sonuç"));
    sensitivity.append(create("p", "", result.sensitivity.sensitive ? "Sonuç bazı öncelik değişikliklerine duyarlı. Özellikle " + result.sensitivity.influential.join(" ve ") + " ölçütlerinin önemi değişirse sıralama değişebilir." : "Küçük önem değişiklikleri ilk sıradaki seçeneği değiştirmedi."));
    sensitivity.append(create("p", "help", "Bu analiz yalnızca verdiğin puanlar ve önem seviyeleri üzerindeki küçük değişiklikleri inceler; gerçek hayattaki sonucu garanti etmez."));
    grid.append(why, redline, heart, sensitivity);
    if (result.proximity.kind !== "clear") {
      const questions = create("article", "insight");
      questions.append(create("h4", "", "Bir adım daha düşünmek istersen"));
      const list = create("ul");
      ["Hangi ölçütte daha fazla bilgiye ihtiyacın var?", "Hangi varsayım değişirse sıralama etkilenebilir?", "Biraz beklemek sana yeni bilgi sağlayabilir mi?"].forEach(function (text) { list.append(create("li", "", text)); });
      questions.append(list);
      grid.append(questions);
    }
    return grid;
  }

  function renderTechnical(result) {
    const details = create("details", "technical");
    details.append(create("summary", "", "Hesaplama nasıl yapıldı?"));
    const body = create("div", "technical-body");
    body.append(create("p", "technical-note", "Ağırlıklı puan = Σ(ölçüt puanı × önem katsayısı) / Σ(önem katsayısı). Düşük = 1, Önemli = 2, Kritik = 3. Kırmızı çizgiler ve iç ses ana skora eklenmez."));
    const table = create("table", "technical-table");
    const thead = create("thead");
    const headRow = create("tr");
    headRow.append(create("th", "", "Ölçüt"), create("th", "", "Önem"));
    state.options.forEach(function (option) { headRow.append(create("th", "", option.name)); });
    thead.append(headRow);
    const tbody = create("tbody");
    state.criteria.filter(function (criterion) { return criterion.active; }).forEach(function (criterion) {
      const row = create("tr");
      row.append(create("td", "", criterion.name), create("td", "", WEIGHT_LABELS[criterion.weight] + " (" + criterion.weight + ")"));
      state.options.forEach(function (option) { row.append(create("td", "", String(state.scores[option.id][criterion.id]))); });
      tbody.append(row);
    });
    table.append(thead, tbody);
    body.append(table, create("p", "technical-note", "Hassasiyet kontrolü, her ölçütün önemini izin verilen 1–3 aralığında tek tek bir kademe değiştirerek sıralamayı yeniden hesaplar."));
    details.append(body);
    return details;
  }

  function reportText() {
    const result = state.result;
    const lines = ["KARAR PUSULASI"];
    if (state.title) lines.push("Karar: " + state.title);
    lines.push("", "Sıralama:");
    result.ranking.forEach(function (item, index) { lines.push((index + 1) + ". " + item.name + " — " + item.score.toFixed(1).replace(".", ",") + " / 5"); });
    const top = result.ranking[0];
    const strength = result.strengths[top.id];
    lines.push("", "Yakınlık: " + result.proximity.text);
    lines.push("Güçlü alanlar: " + strength.strongest.map(function (item) { return item.name; }).join(", "));
    lines.push("En düşük alan: " + strength.weakest.name);
    if (state.redlines.length) {
      lines.push("Kırmızı çizgiler:");
      result.ranking.forEach(function (item) {
        const violations = result.violations[item.id];
        lines.push("- " + item.name + ": " + (violations.length ? violations.map(function (violation) { return violation.name + " (" + violation.actual + "/" + violation.minimum + ")"; }).join(", ") : "İhlal yok"));
      });
    }
    lines.push("İç ses: " + result.heartText);
    lines.push("Hassasiyet: " + (result.sensitivity.sensitive ? "Hassas — " + result.sensitivity.influential.join(", ") : "Kararlı"));
    lines.push("", "Bu sonuç, girdiğin puanlar ve öncelikler üzerinden oluşturulmuş bir değerlendirme özetidir.");
    lines.push("Karar Pusulası profesyonel, hukuki, tıbbi veya finansal danışmanlığın yerine geçmez.");
    return lines.join("\n");
  }

  function legacyCopy(text) {
    const textarea = create("textarea");
    textarea.value = text;
    textarea.readOnly = true;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    textarea.style.pointerEvents = "none";
    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    let copied = false;
    try { copied = Boolean(document.execCommand && document.execCommand("copy")); } catch (error) { copied = false; }
    textarea.remove();
    return copied;
  }

  async function copyReport() {
    if (!state.result) return;
    const text = reportText();
    let copied = false;
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      try { await navigator.clipboard.writeText(text); copied = true; } catch (error) { copied = false; }
    }
    if (!copied) copied = legacyCopy(text);
    setStatus(copied ? "Değerlendirme özeti panoya kopyalandı." : "Rapor otomatik olarak kopyalanamadı. Lütfen yeniden deneyin.", copied ? "success" : "error");
  }

  function moveToStep(step) {
    state.step = step;
    clearStatus();
    render();
    scrollToPanel();
  }

  function resetEvaluation() {
    state = freshState();
    render();
    setStatus("Yeni değerlendirme hazır. Önce seçeneklerini yazabilirsin.", "success");
    scrollToPanel();
    const first = document.getElementById("decisionTitle");
    if (first) first.focus({ preventScroll: true });
  }

  if (!root || !statusNode || presets.length !== 6) {
    if (statusNode) setStatus("Araç şu anda başlatılamadı. Lütfen sayfayı yenileyip yeniden deneyin.", "error");
    return;
  }
  state = freshState();
  render();
}(typeof window !== "undefined" ? window : globalThis));
