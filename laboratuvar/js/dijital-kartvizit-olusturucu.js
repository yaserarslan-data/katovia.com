(function () {
  "use strict";

  // DOM referansları
  const form = document.getElementById("card-form");
  const inputs = {
    fullName: document.getElementById("full-name"),
    jobTitle: document.getElementById("job-title"),
    company: document.getElementById("company"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
    website: document.getElementById("website"),
    instagram: document.getElementById("instagram"),
    linkedin: document.getElementById("linkedin"),
    github: document.getElementById("github"),
    description: document.getElementById("description")
  };
  const themeButtons = Array.from(document.querySelectorAll(".theme-button[data-theme]"));
  const businessCard = document.getElementById("business-card");
  const previewMonogram = document.getElementById("preview-monogram");
  const previewName = document.getElementById("preview-name");
  const previewTitleText = document.getElementById("preview-title-text");
  const previewCompanyWrap = document.getElementById("preview-company-wrap");
  const previewCompany = document.getElementById("preview-company");
  const previewDescription = document.getElementById("preview-description");
  const previewFields = {
    phone: document.getElementById("preview-phone"),
    email: document.getElementById("preview-email"),
    website: document.getElementById("preview-website"),
    instagram: document.getElementById("preview-instagram"),
    linkedin: document.getElementById("preview-linkedin"),
    github: document.getElementById("preview-github")
  };
  const cardQrShell = document.getElementById("card-qr-shell");
  const cardQrCanvas = document.getElementById("card-qr-canvas");
  const cardQrPlaceholder = document.getElementById("card-qr-placeholder");
  const qrPreview = document.getElementById("qr-preview");
  const qrEmpty = document.getElementById("qr-empty");
  const qrSummary = document.getElementById("qr-summary");
  const descriptionCounter = document.getElementById("description-counter");
  const generateButton = document.getElementById("generate-button");
  const cardDownloadButton = document.getElementById("card-download-button");
  const qrDownloadButton = document.getElementById("qr-download-button");
  const vcardDownloadButton = document.getElementById("vcard-download-button");
  const clearButton = document.getElementById("clear-button");
  const statusMessage = document.getElementById("status-message");

  // Uygulama durumu ve tema tanımları
  const DEFAULT_THEME = "night";
  const CARD_WIDTH = 1050;
  const CARD_HEIGHT = 600;
  const QR_SIZE = 512;
  const THEMES = Object.freeze({
    night: {
      background: "#07142d",
      backgroundTwo: "#171747",
      accent: "#49bfff",
      accentTwo: "#8559ed",
      text: "#f4f7ff",
      muted: "#afbdd4",
      subtle: "rgba(255,255,255,.12)"
    },
    clean: {
      background: "#ffffff",
      backgroundTwo: "#e9f1f8",
      accent: "#2472b5",
      accentTwo: "#536fd5",
      text: "#122039",
      muted: "#52647d",
      subtle: "rgba(18,32,57,.10)"
    },
    purple: {
      background: "#211848",
      backgroundTwo: "#285f9d",
      accent: "#9f87ff",
      accentTwo: "#4bc3ff",
      text: "#ffffff",
      muted: "#d1ccec",
      subtle: "rgba(255,255,255,.13)"
    }
  });
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeTheme = DEFAULT_THEME;
  let currentQrCanvas = null;
  let currentCardCanvas = null;
  let currentVCard = "";
  let currentSlug = "kartvizit";

  function domIsReady() {
    return Boolean(
      form && Object.values(inputs).every(Boolean) && themeButtons.length === 3 &&
      businessCard && previewMonogram && previewName && previewTitleText &&
      previewCompanyWrap && previewCompany && previewDescription &&
      Object.values(previewFields).every(Boolean) && cardQrShell && cardQrCanvas &&
      cardQrPlaceholder && qrPreview && qrEmpty && qrSummary && descriptionCounter &&
      generateButton && cardDownloadButton && qrDownloadButton &&
      vcardDownloadButton && clearButton && statusMessage
    );
  }

  // Durum ve hata yönetimi
  function setStatus(message, type) {
    statusMessage.textContent = message || "";
    statusMessage.className = "status" + (type ? " " + type : "");
  }

  function clearErrors() {
    form.querySelectorAll("[aria-invalid]").forEach(function (field) {
      field.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".field-error").forEach(function (error) {
      error.textContent = "";
      error.hidden = true;
    });
  }

  function showError(field, errorId, message) {
    const error = document.getElementById(errorId);
    field.setAttribute("aria-invalid", "true");
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
    setStatus(message, "error");
    field.focus();
    return false;
  }

  function setDownloadsEnabled(enabled) {
    cardDownloadButton.disabled = !enabled;
    qrDownloadButton.disabled = !enabled;
    vcardDownloadButton.disabled = !enabled;
  }

  function clearQrPreviews() {
    currentQrCanvas = null;
    const oldCanvas = qrPreview.querySelector("canvas");
    if (oldCanvas) oldCanvas.remove();
    qrEmpty.hidden = false;
    cardQrShell.hidden = true;
    cardQrPlaceholder.hidden = false;
    const context = cardQrCanvas.getContext("2d");
    if (context) context.clearRect(0, 0, cardQrCanvas.width, cardQrCanvas.height);
    qrSummary.textContent = "Kartviziti oluşturduğunuzda vCard 3.0 QR kodu burada görünür.";
  }

  function invalidateOutput(announce) {
    const hadOutput = Boolean(currentCardCanvas || currentQrCanvas || currentVCard);
    currentCardCanvas = null;
    currentVCard = "";
    setDownloadsEnabled(false);
    clearQrPreviews();
    if (announce && hadOutput) {
      setStatus("Bilgiler değişti. İndirmeden önce kartviziti yeniden oluşturun.");
    }
  }

  // Form değerlerini okuma ve güvenli normalizasyon
  function singleLine(value) {
    return String(value || "")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
      .replace(/[\r\n]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function readValues() {
    return {
      fullName: singleLine(inputs.fullName.value),
      jobTitle: singleLine(inputs.jobTitle.value),
      company: singleLine(inputs.company.value),
      phone: singleLine(inputs.phone.value),
      email: singleLine(inputs.email.value),
      website: singleLine(inputs.website.value),
      instagram: singleLine(inputs.instagram.value),
      linkedin: singleLine(inputs.linkedin.value),
      github: singleLine(inputs.github.value),
      description: singleLine(inputs.description.value)
    };
  }

  // Doğrulama
  function hasSafeHttpUrl(value) {
    if (!/^https?:\/\//i.test(value)) return false;
    try {
      const url = new URL(value);
      return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
    } catch (error) {
      return false;
    }
  }

  function socialValueIsSafe(value) {
    if (!value) return true;
    if (/^[a-z][a-z\d+.-]*:/i.test(value)) return hasSafeHttpUrl(value);
    return true;
  }

  function validate(values) {
    clearErrors();
    if (!values.fullName) {
      return showError(inputs.fullName, "full-name-error", "Kartvizit oluşturmak için ad soyad yazın.");
    }
    if (values.phone) {
      const digits = values.phone.replace(/\D/g, "");
      if (digits.length < 6) {
        return showError(inputs.phone, "phone-error", "Geçerli ve yeterli uzunlukta bir telefon numarası yazın.");
      }
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      return showError(inputs.email, "email-error", "Geçerli bir e-posta adresi yazın.");
    }
    if (values.website && !hasSafeHttpUrl(values.website)) {
      return showError(inputs.website, "website-error", "İnternet sitesi http:// veya https:// ile başlayan geçerli bir adres olmalıdır.");
    }
    for (const key of ["instagram", "linkedin", "github"]) {
      if (!socialValueIsSafe(values[key])) {
        return showError(inputs[key], key + "-error", "Tam bağlantı kullanıyorsanız yalnız http:// veya https:// adresi yazın.");
      }
    }
    return true;
  }

  // Monogram üretimi
  function createMonogram(name) {
    const words = singleLine(name).split(" ").filter(Boolean);
    if (!words.length) return "K";
    const letters = words.length === 1
      ? words[0].charAt(0)
      : words[0].charAt(0) + words[words.length - 1].charAt(0);
    return letters.toLocaleUpperCase("tr-TR");
  }

  // Canlı kartvizit önizlemesi
  function setPreviewField(element, prefix, value) {
    element.hidden = !value;
    element.textContent = value ? prefix + value : "";
  }

  function updateLivePreview() {
    const values = readValues();
    const hasRole = Boolean(values.jobTitle || values.company);
    const roleLine = previewTitleText.parentElement;
    previewMonogram.textContent = createMonogram(values.fullName);
    previewName.textContent = values.fullName || "Ad Soyad";
    previewTitleText.textContent = values.jobTitle;
    previewCompany.textContent = values.company;
    previewCompanyWrap.hidden = !values.company;
    roleLine.hidden = !hasRole;
    setPreviewField(previewFields.phone, "Tel · ", values.phone);
    setPreviewField(previewFields.email, "E-posta · ", values.email);
    setPreviewField(previewFields.website, "Web · ", values.website);
    setPreviewField(previewFields.instagram, "Instagram · ", values.instagram);
    setPreviewField(previewFields.linkedin, "LinkedIn · ", values.linkedin);
    setPreviewField(previewFields.github, "GitHub · ", values.github);
    previewDescription.hidden = !values.description;
    previewDescription.textContent = values.description;
    businessCard.setAttribute(
      "aria-label",
      values.fullName
        ? values.fullName + " için " + (values.jobTitle || values.company || "dijital") + " kartvizit önizlemesi"
        : "Boş dijital kartvizit önizlemesi"
    );
    descriptionCounter.textContent = inputs.description.value.length + " / 180";
  }

  function setTheme(theme) {
    if (!Object.prototype.hasOwnProperty.call(THEMES, theme)) return;
    activeTheme = theme;
    businessCard.dataset.theme = activeTheme;
    themeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.theme === activeTheme));
    });
    updateLivePreview();
    invalidateOutput(true);
  }

  // vCard kaçış ve payload üretimi
  function escapeVCard(value) {
    return String(value || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r\n|\r|\n/g, "\\n")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,");
  }

  function buildVCard(values) {
    const lines = ["BEGIN:VCARD", "VERSION:3.0", "FN:" + escapeVCard(values.fullName)];
    if (values.company) lines.push("ORG:" + escapeVCard(values.company));
    if (values.jobTitle) lines.push("TITLE:" + escapeVCard(values.jobTitle));
    if (values.phone) lines.push("TEL;TYPE=CELL:" + escapeVCard(values.phone));
    if (values.email) lines.push("EMAIL:" + escapeVCard(values.email));
    if (values.website) lines.push("URL:" + escapeVCard(values.website));

    const notes = [];
    if (values.description) notes.push(values.description);
    if (values.instagram) notes.push("Instagram: " + values.instagram);
    if (values.linkedin) notes.push("LinkedIn: " + values.linkedin);
    if (values.github) notes.push("GitHub: " + values.github);
    if (notes.length) lines.push("NOTE:" + escapeVCard(notes.join("\n")));
    lines.push("END:VCARD");
    return lines.join("\r\n") + "\r\n";
  }

  // QR üretimi
  function createQrCanvas(vcard) {
    if (typeof window.kjua !== "function") {
      throw new Error("QR component unavailable");
    }
    const canvas = window.kjua({
      render: "canvas",
      text: vcard,
      size: QR_SIZE,
      ecLevel: "M",
      quiet: 4,
      fill: "#111827",
      back: "#ffffff"
    });
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error("QR canvas unavailable");
    }
    const png = canvas.toDataURL("image/png");
    if (png.indexOf("data:image/png") !== 0) {
      throw new Error("QR PNG unavailable");
    }
    return canvas;
  }

  function showQr(canvas, values) {
    canvas.setAttribute("aria-hidden", "true");
    qrEmpty.hidden = true;
    qrPreview.replaceChildren(qrEmpty, canvas);
    const context = cardQrCanvas.getContext("2d");
    context.clearRect(0, 0, cardQrCanvas.width, cardQrCanvas.height);
    context.drawImage(canvas, 0, 0, cardQrCanvas.width, cardQrCanvas.height);
    cardQrShell.hidden = false;
    cardQrPlaceholder.hidden = true;
    qrSummary.textContent = values.fullName + " için vCard 3.0 iletişim QR kodu hazır.";
    qrPreview.setAttribute("aria-label", values.fullName + " için vCard iletişim QR kodu");
  }

  // Kart canvas render işlemi
  function roundedRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath();
    context.moveTo(x + r, y);
    context.arcTo(x + width, y, x + width, y + height, r);
    context.arcTo(x + width, y + height, x, y + height, r);
    context.arcTo(x, y + height, x, y, r);
    context.arcTo(x, y, x + width, y, r);
    context.closePath();
  }

  function fitText(context, text, maxWidth, initialSize, minimumSize, weight) {
    let size = initialSize;
    while (size > minimumSize) {
      context.font = weight + " " + size + "px system-ui, sans-serif";
      if (context.measureText(text).width <= maxWidth) break;
      size -= 2;
    }
    return size;
  }

  function clippedText(context, text, maxWidth) {
    if (context.measureText(text).width <= maxWidth) return text;
    let result = text;
    while (result.length > 1 && context.measureText(result + "…").width > maxWidth) {
      result = result.slice(0, -1);
    }
    return result + "…";
  }

  function wrapText(context, text, maxWidth, maxLines) {
    const words = text.split(" ").filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach(function (word) {
      const candidate = line ? line + " " + word : word;
      if (context.measureText(candidate).width <= maxWidth || !line) {
        line = candidate;
      } else if (lines.length < maxLines - 1) {
        lines.push(line);
        line = word;
      } else {
        line = clippedText(context, candidate, maxWidth);
      }
    });
    if (line && lines.length < maxLines) lines.push(line);
    return lines.slice(0, maxLines);
  }

  function renderCardToCanvas(values, themeKey, qrCanvas) {
    const theme = THEMES[themeKey];
    const canvas = document.createElement("canvas");
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;
    const context = canvas.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    gradient.addColorStop(0, theme.background);
    gradient.addColorStop(1, theme.backgroundTwo);
    context.fillStyle = gradient;
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const glow = context.createRadialGradient(930, 70, 10, 930, 70, 330);
    glow.addColorStop(0, theme.accentTwo + "77");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    context.fillStyle = theme.accent;
    roundedRect(context, 58, 55, 116, 116, 28);
    context.fill();
    const monogramSize = createMonogram(values.fullName).length > 1 ? 47 : 55;
    context.fillStyle = "#ffffff";
    context.font = "900 " + monogramSize + "px system-ui, sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(createMonogram(values.fullName), 116, 113);
    context.textAlign = "left";
    context.textBaseline = "alphabetic";

    const leftX = 202;
    const leftWidth = 525;
    const nameSize = fitText(context, values.fullName, leftWidth, 52, 34, "850");
    context.fillStyle = theme.text;
    context.font = "850 " + nameSize + "px system-ui, sans-serif";
    context.fillText(clippedText(context, values.fullName, leftWidth), leftX, 111);

    const roleParts = [values.jobTitle, values.company].filter(Boolean);
    if (roleParts.length) {
      context.fillStyle = theme.muted;
      context.font = "650 23px system-ui, sans-serif";
      context.fillText(clippedText(context, roleParts.join(" · "), leftWidth), leftX, 151);
    }

    const contacts = [];
    if (values.phone) contacts.push("Tel · " + values.phone);
    if (values.email) contacts.push("E-posta · " + values.email);
    if (values.website) contacts.push("Web · " + values.website);
    if (values.instagram) contacts.push("Instagram · " + values.instagram);
    if (values.linkedin) contacts.push("LinkedIn · " + values.linkedin);
    if (values.github) contacts.push("GitHub · " + values.github);
    context.font = "600 18px system-ui, sans-serif";
    context.fillStyle = theme.text;
    contacts.slice(0, 6).forEach(function (contact, index) {
      const column = index % 2;
      const row = Math.floor(index / 2);
      const x = 60 + column * 342;
      const y = 242 + row * 50;
      context.globalAlpha = .88;
      context.fillText(clippedText(context, contact, 308), x, y);
    });
    context.globalAlpha = 1;

    if (values.description) {
      context.font = "500 19px system-ui, sans-serif";
      context.fillStyle = theme.muted;
      const lines = wrapText(context, values.description, 650, 3);
      lines.forEach(function (line, index) {
        context.fillText(line, 60, 445 + index * 30);
      });
    }

    const qrX = 777;
    const qrY = 121;
    const qrOuter = 226;
    context.fillStyle = "#ffffff";
    roundedRect(context, qrX - 14, qrY - 14, qrOuter + 28, qrOuter + 28, 22);
    context.fill();
    context.drawImage(qrCanvas, qrX, qrY, qrOuter, qrOuter);
    context.fillStyle = theme.text;
    context.font = "750 16px system-ui, sans-serif";
    context.textAlign = "center";
    context.fillText("İletişim bilgilerini kaydet", qrX + qrOuter / 2, qrY + qrOuter + 48);
    context.textAlign = "left";

    return canvas;
  }

  // Dosya adı slug üretimi ve indirmeler
  function slugify(value) {
    const turkishMap = { "ç": "c", "Ç": "c", "ğ": "g", "Ğ": "g", "ı": "i", "I": "i", "İ": "i", "ö": "o", "Ö": "o", "ş": "s", "Ş": "s", "ü": "u", "Ü": "u" };
    const mapped = String(value || "").replace(/[çÇğĞıIİöÖşŞüÜ]/g, function (letter) {
      return turkishMap[letter];
    });
    return mapped
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "kartvizit";
  }

  function downloadDataUrl(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // Üretim
  function generateCard(event) {
    event.preventDefault();
    const values = readValues();
    if (!validate(values)) {
      invalidateOutput(false);
      return;
    }

    try {
      const vcard = buildVCard(values);
      const qrCanvas = createQrCanvas(vcard);
      const cardCanvas = renderCardToCanvas(values, activeTheme, qrCanvas);
      const cardPng = cardCanvas.toDataURL("image/png");
      if (cardCanvas.width !== CARD_WIDTH || cardCanvas.height !== CARD_HEIGHT || cardPng.indexOf("data:image/png") !== 0) {
        throw new Error("Card PNG unavailable");
      }
      currentVCard = vcard;
      currentQrCanvas = qrCanvas;
      currentCardCanvas = cardCanvas;
      currentSlug = slugify(values.fullName);
      showQr(qrCanvas, values);
      setDownloadsEnabled(true);
      clearErrors();
      setStatus("Kartvizit, iletişim QR kodu ve vCard dosyası hazır.", "success");

      if (window.matchMedia("(max-width: 900px)").matches) {
        businessCard.scrollIntoView({
          behavior: prefersReducedMotion.matches ? "auto" : "smooth",
          block: "center"
        });
      }
    } catch (error) {
      invalidateOutput(false);
      setStatus("Bu bilgilerle kartvizit oluşturulamadı. Alanları kısaltıp yeniden deneyin.", "error");
    }
  }

  // PNG ve VCF indirme
  function downloadCardPng() {
    if (!currentCardCanvas) {
      setDownloadsEnabled(false);
      setStatus("Önce güncel kartviziti oluşturun.", "error");
      return;
    }
    try {
      downloadDataUrl(currentCardCanvas.toDataURL("image/png"), "katovia-dijital-kartvizit-" + currentSlug + ".png");
      setStatus("Kartvizit PNG indirme işlemi başlatıldı.", "success");
    } catch (error) {
      setStatus("Kartvizit PNG hazırlanamadı. Yeniden oluşturup tekrar deneyin.", "error");
    }
  }

  function downloadQrPng() {
    if (!currentQrCanvas) {
      setDownloadsEnabled(false);
      setStatus("Önce güncel iletişim QR kodunu oluşturun.", "error");
      return;
    }
    try {
      downloadDataUrl(currentQrCanvas.toDataURL("image/png"), "katovia-kartvizit-qr-" + currentSlug + ".png");
      setStatus("QR kodu PNG indirme işlemi başlatıldı.", "success");
    } catch (error) {
      setStatus("QR kodu PNG hazırlanamadı. Yeniden oluşturup tekrar deneyin.", "error");
    }
  }

  function downloadVCard() {
    if (!currentVCard) {
      setDownloadsEnabled(false);
      setStatus("Önce güncel vCard dosyasını oluşturun.", "error");
      return;
    }
    try {
      const blob = new Blob(["\uFEFF" + currentVCard], { type: "text/vcard;charset=utf-8" });
      downloadBlob(blob, currentSlug + ".vcf");
      setStatus("vCard indirme işlemi başlatıldı.", "success");
    } catch (error) {
      setStatus("vCard dosyası hazırlanamadı. Yeniden oluşturup tekrar deneyin.", "error");
    }
  }

  // Form değişiklikleri ve temizleme
  function handleInput() {
    clearErrors();
    updateLivePreview();
    invalidateOutput(true);
  }

  function resetTool() {
    form.reset();
    activeTheme = DEFAULT_THEME;
    themeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.theme === DEFAULT_THEME));
    });
    businessCard.dataset.theme = DEFAULT_THEME;
    clearErrors();
    invalidateOutput(false);
    updateLivePreview();
    setStatus("");
    inputs.fullName.focus();
  }

  if (!domIsReady()) return;

  form.addEventListener("submit", generateCard);
  form.addEventListener("input", handleInput);
  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setTheme(button.dataset.theme);
    });
  });
  cardDownloadButton.addEventListener("click", downloadCardPng);
  qrDownloadButton.addEventListener("click", downloadQrPng);
  vcardDownloadButton.addEventListener("click", downloadVCard);
  clearButton.addEventListener("click", resetTool);

  setDownloadsEnabled(false);
  clearQrPreviews();
  updateLivePreview();
}());
