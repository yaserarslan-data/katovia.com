(function () {
  "use strict";

  // DOM referansları
  const form = document.getElementById("qr-form");
  const typeButtons = Array.from(document.querySelectorAll("[data-qr-type]"));
  const typePanels = Array.from(document.querySelectorAll("[data-qr-panel]"));
  const linkUrl = document.getElementById("link-url");
  const plainText = document.getElementById("plain-text");
  const textCounter = document.getElementById("text-counter");
  const wifiSsid = document.getElementById("wifi-ssid");
  const wifiSecurity = document.getElementById("wifi-security");
  const wifiPassword = document.getElementById("wifi-password");
  const wifiHidden = document.getElementById("wifi-hidden");
  const passwordToggle = document.getElementById("password-toggle");
  const countryCode = document.getElementById("country-code");
  const phoneNumber = document.getElementById("phone-number");
  const whatsappMessage = document.getElementById("whatsapp-message");
  const qrSize = document.getElementById("qr-size");
  const foregroundColor = document.getElementById("foreground-color");
  const backgroundColor = document.getElementById("background-color");
  const foregroundValue = document.getElementById("foreground-value");
  const backgroundValue = document.getElementById("background-value");
  const generateButton = document.getElementById("generate-button");
  const downloadButton = document.getElementById("download-button");
  const clearButton = document.getElementById("clear-button");
  const previewPanel = document.getElementById("preview-panel");
  const previewType = document.getElementById("preview-type");
  const emptyState = document.getElementById("empty-state");
  const qrResult = document.getElementById("qr-result");
  const qrSurface = document.getElementById("qr-surface");
  const qrSummary = document.getElementById("qr-summary");
  const statusMessage = document.getElementById("status-message");

  // Durum
  const MAX_PAYLOAD_BYTES = 1200;
  const DEFAULTS = Object.freeze({
    type: "link",
    size: "320",
    foreground: "#111827",
    background: "#ffffff",
    countryCode: "+90",
    wifiSecurity: "WPA"
  });
  const TYPE_LABELS = Object.freeze({
    link: "Bağlantı",
    text: "Düz Metin",
    wifi: "Wi-Fi",
    whatsapp: "WhatsApp"
  });
  const DOWNLOAD_NAMES = Object.freeze({
    link: "katovia-baglanti-qr.png",
    text: "katovia-metin-qr.png",
    wifi: "katovia-wifi-qr.png",
    whatsapp: "katovia-whatsapp-qr.png"
  });
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeType = DEFAULTS.type;
  let currentCanvas = null;
  let currentPngDataUrl = "";

  function requiredDomIsReady() {
    return Boolean(
      form && typeButtons.length === 4 && typePanels.length === 4 &&
      linkUrl && plainText && textCounter && wifiSsid && wifiSecurity &&
      wifiPassword && wifiHidden && passwordToggle && countryCode &&
      phoneNumber && whatsappMessage && qrSize && foregroundColor &&
      backgroundColor && foregroundValue && backgroundValue && generateButton &&
      downloadButton && clearButton && previewPanel && previewType && emptyState &&
      qrResult && qrSurface && qrSummary && statusMessage
    );
  }

  function setStatus(message, kind) {
    statusMessage.textContent = message || "";
    statusMessage.className = "status" + (kind ? " " + kind : "");
  }

  function byteLength(value) {
    if (typeof TextEncoder !== "function") {
      throw new Error("TextEncoder unavailable");
    }
    return new TextEncoder().encode(value).length;
  }

  function shorten(value, maxLength) {
    const clean = String(value).replace(/\s+/g, " ").trim();
    return clean.length > maxLength ? clean.slice(0, maxLength - 1) + "…" : clean;
  }

  function clearValidation() {
    form.querySelectorAll("[aria-invalid]").forEach(function (field) {
      field.removeAttribute("aria-invalid");
    });
    form.querySelectorAll(".field-error").forEach(function (error) {
      error.textContent = "";
      error.hidden = true;
    });
  }

  function showFieldError(field, errorId, message) {
    const error = document.getElementById(errorId);
    field.setAttribute("aria-invalid", "true");
    if (error) {
      error.textContent = message;
      error.hidden = false;
    }
    setStatus(message, "error");
    field.focus();
    return null;
  }

  function showColorError(message) {
    const error = document.getElementById("color-error");
    foregroundColor.setAttribute("aria-invalid", "true");
    backgroundColor.setAttribute("aria-invalid", "true");
    error.textContent = message;
    error.hidden = false;
    setStatus(message, "error");
    foregroundColor.focus();
    return null;
  }

  function clearGenerated() {
    currentCanvas = null;
    currentPngDataUrl = "";
    downloadButton.disabled = true;
    qrSurface.replaceChildren();
    qrSurface.setAttribute("aria-label", "Oluşturulan QR kod");
    qrSummary.textContent = "";
    qrResult.hidden = true;
    emptyState.hidden = false;
  }

  function invalidateGenerated() {
    const hadResult = Boolean(currentCanvas);
    clearGenerated();
    if (hadResult) {
      setStatus("Bilgiler değişti. Güncel bir QR kod oluşturun.");
    }
  }

  // Tür değiştirme
  function setType(nextType, announce) {
    if (!Object.prototype.hasOwnProperty.call(TYPE_LABELS, nextType)) return;
    activeType = nextType;
    typeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.qrType === activeType));
    });
    typePanels.forEach(function (panel) {
      panel.hidden = panel.dataset.qrPanel !== activeType;
    });
    previewType.textContent = TYPE_LABELS[activeType];
    clearValidation();
    clearGenerated();
    setStatus(announce ? TYPE_LABELS[activeType] + " alanları hazır." : "");
  }

  // URL payload
  function buildLinkPayload() {
    const value = linkUrl.value.trim();
    if (!value) {
      return showFieldError(linkUrl, "link-error", "İnternet adresini yazın.");
    }
    if (!/^https?:\/\//i.test(value)) {
      const message = /^[a-z][a-z\d+.-]*:/i.test(value)
        ? "Yalnız http:// veya https:// ile başlayan bağlantılar kullanılabilir."
        : "Adres http:// veya https:// ile başlamalıdır.";
      return showFieldError(linkUrl, "link-error", message);
    }

    let parsed;
    try {
      parsed = new URL(value);
    } catch (error) {
      return showFieldError(linkUrl, "link-error", "Geçerli bir internet adresi yazın.");
    }
    if ((parsed.protocol !== "http:" && parsed.protocol !== "https:") || !parsed.hostname) {
      return showFieldError(linkUrl, "link-error", "Yalnız geçerli http veya https bağlantıları kullanılabilir.");
    }
    if (byteLength(value) > MAX_PAYLOAD_BYTES) {
      return showFieldError(linkUrl, "link-error", "Bağlantı QR kod için çok uzun. Daha kısa bir adres deneyin.");
    }
    return {
      payload: value,
      summary: "Bağlantı • " + parsed.hostname,
      accessibleSummary: parsed.hostname + " alan adına giden bağlantı QR kodu"
    };
  }

  // Metin payload
  function updateTextCounter() {
    const value = plainText.value;
    let bytes = 0;
    try {
      bytes = byteLength(value);
    } catch (error) {
      textCounter.textContent = value.length + " karakter • byte ölçümü desteklenmiyor";
      textCounter.classList.add("limit");
      return;
    }
    textCounter.textContent = value.length + " karakter • " + bytes + " / " + MAX_PAYLOAD_BYTES + " bayt";
    textCounter.classList.toggle("limit", bytes > MAX_PAYLOAD_BYTES);
  }

  function buildTextPayload() {
    const value = plainText.value.trim();
    if (!value) {
      return showFieldError(plainText, "text-error", "QR kod için bir metin yazın.");
    }
    let bytes;
    try {
      bytes = byteLength(value);
    } catch (error) {
      return showFieldError(plainText, "text-error", "Bu tarayıcı metin uzunluğunu güvenli biçimde ölçemiyor.");
    }
    if (bytes > MAX_PAYLOAD_BYTES) {
      return showFieldError(plainText, "text-error", "Metin 1200 UTF-8 bayt sınırını aşıyor. Metni kısaltın.");
    }
    return {
      payload: value,
      summary: "Düz metin • " + value.length + " karakter • " + bytes + " bayt",
      accessibleSummary: value.length + " karakterlik düz metin QR kodu"
    };
  }

  // Wi-Fi payload
  function escapeWifiValue(value) {
    return String(value).replace(/([\\;,:\"])/g, "\\$1");
  }

  function updateWifiSecurity() {
    const isOpen = wifiSecurity.value === "nopass";
    if (isOpen) wifiPassword.value = "";
    wifiPassword.disabled = isOpen;
    passwordToggle.disabled = isOpen;
    if (isOpen) {
      wifiPassword.type = "password";
      passwordToggle.textContent = "Göster";
      passwordToggle.setAttribute("aria-pressed", "false");
    }
  }

  function buildWifiPayload() {
    const ssid = wifiSsid.value;
    const security = wifiSecurity.value;
    const password = wifiPassword.value;
    if (!ssid.trim()) {
      return showFieldError(wifiSsid, "wifi-ssid-error", "Wi-Fi ağ adını yazın.");
    }
    if (!new Set(["WPA", "WEP", "nopass"]).has(security)) {
      wifiSecurity.setAttribute("aria-invalid", "true");
      setStatus("Geçerli bir Wi-Fi güvenlik türü seçin.", "error");
      wifiSecurity.focus();
      return null;
    }
    if (security !== "nopass" && password.length === 0) {
      return showFieldError(wifiPassword, "wifi-password-error", "Bu güvenlik türü için Wi-Fi parolasını yazın.");
    }

    const payload = "WIFI:T:" + security +
      ";S:" + escapeWifiValue(ssid) +
      ";P:" + (security === "nopass" ? "" : escapeWifiValue(password)) +
      ";H:" + String(wifiHidden.checked) + ";;";
    if (byteLength(payload) > MAX_PAYLOAD_BYTES) {
      return showFieldError(wifiSsid, "wifi-ssid-error", "Wi-Fi bilgileri QR kod kapasitesi için çok uzun.");
    }

    const securityLabel = security === "WPA" ? "WPA/WPA2" : security === "WEP" ? "WEP" : "Şifresiz";
    return {
      payload: payload,
      summary: "Wi-Fi • " + shorten(ssid, 45) + " • " + securityLabel + (wifiHidden.checked ? " • Gizli ağ" : ""),
      accessibleSummary: shorten(ssid, 45) + " adlı ağ için " + securityLabel + " Wi-Fi QR kodu"
    };
  }

  // WhatsApp payload
  function digitsOnly(value) {
    return String(value).replace(/\D/g, "");
  }

  function buildWhatsappPayload() {
    const rawCountry = countryCode.value.trim();
    const rawPhone = phoneNumber.value.trim();
    const countryDigits = digitsOnly(rawCountry);
    if (!countryDigits || countryDigits.length > 3 || countryDigits.charAt(0) === "0") {
      return showFieldError(countryCode, "country-error", "Geçerli bir ülke kodu yazın. Örnek: +90.");
    }
    if (!rawPhone) {
      return showFieldError(phoneNumber, "phone-error", "Telefon numarasını yazın.");
    }

    let phoneDigits = digitsOnly(rawPhone);
    if (rawPhone.indexOf("00") === 0) phoneDigits = phoneDigits.slice(2);
    if (phoneDigits.indexOf(countryDigits) === 0 && phoneDigits.length >= 9) {
      phoneDigits = phoneDigits.slice(countryDigits.length);
    }
    phoneDigits = phoneDigits.replace(/^0+/, "");

    const internationalNumber = countryDigits + phoneDigits;
    if (phoneDigits.length < 6 || internationalNumber.length < 8 || internationalNumber.length > 15) {
      return showFieldError(phoneNumber, "phone-error", "Geçerli ve yeterli uzunlukta bir telefon numarası yazın.");
    }

    const message = whatsappMessage.value.trim();
    const payload = "https://wa.me/" + internationalNumber + (message ? "?text=" + encodeURIComponent(message) : "");
    if (byteLength(payload) > MAX_PAYLOAD_BYTES) {
      return showFieldError(whatsappMessage, "whatsapp-message-error", "Hazır mesaj QR kod için çok uzun. Mesajı kısaltın.");
    }
    const maskedNumber = "+" + countryDigits + " ••••" + phoneDigits.slice(-4);
    return {
      payload: payload,
      summary: "WhatsApp • " + maskedNumber + (message ? " • Hazır mesaj eklendi" : ""),
      accessibleSummary: maskedNumber + " ile biten WhatsApp hedefi için QR kod"
    };
  }

  function buildPayload() {
    if (activeType === "link") return buildLinkPayload();
    if (activeType === "text") return buildTextPayload();
    if (activeType === "wifi") return buildWifiPayload();
    if (activeType === "whatsapp") return buildWhatsappPayload();
    return null;
  }

  // Renk ve kontrast
  function normalizeHex(value) {
    const clean = String(value).trim();
    return /^#[0-9a-f]{6}$/i.test(clean) ? clean.toUpperCase() : null;
  }

  function colorLuminance(hex) {
    const channels = [1, 3, 5].map(function (index) {
      const channel = parseInt(hex.slice(index, index + 2), 16) / 255;
      return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrastRatio(first, second) {
    const firstLuminance = colorLuminance(first);
    const secondLuminance = colorLuminance(second);
    return (Math.max(firstLuminance, secondLuminance) + 0.05) /
      (Math.min(firstLuminance, secondLuminance) + 0.05);
  }

  function readAppearance() {
    const foreground = normalizeHex(foregroundColor.value);
    const background = normalizeHex(backgroundColor.value);
    const size = Number(qrSize.value);
    if (!foreground || !background) {
      return showColorError("Geçerli ön plan ve arka plan renkleri seçin.");
    }
    if (foreground === background) {
      return showColorError("Ön plan ve arka plan renkleri aynı olamaz.");
    }
    if (colorLuminance(foreground) >= colorLuminance(background)) {
      return showColorError("QR ön planı arka plandan daha koyu olmalıdır.");
    }
    if (contrastRatio(foreground, background) < 4.5) {
      return showColorError("Renk kontrastı QR kod için yetersiz. Daha koyu bir ön plan veya daha açık bir arka plan seçin.");
    }
    if (![256, 320, 512].includes(size)) {
      setStatus("Geçerli bir PNG boyutu seçin.", "error");
      qrSize.focus();
      return null;
    }
    return { foreground: foreground, background: background, size: size };
  }

  function updateColorLabels() {
    foregroundValue.textContent = String(foregroundColor.value).toUpperCase();
    backgroundValue.textContent = String(backgroundColor.value).toUpperCase();
  }

  // QR üretimi
  function generateQr(event) {
    event.preventDefault();
    clearValidation();
    clearGenerated();

    let content;
    try {
      content = buildPayload();
    } catch (error) {
      setStatus("Bilgiler güvenli biçimde işlenemedi. Alanları kontrol edip yeniden deneyin.", "error");
      return;
    }
    if (!content) return;

    const appearance = readAppearance();
    if (!appearance) return;
    if (typeof window.kjua !== "function") {
      setStatus("QR bileşeni yüklenemedi. Sayfayı yenileyip tekrar deneyin.", "error");
      return;
    }

    try {
      const canvas = window.kjua({
        render: "canvas",
        text: content.payload,
        size: appearance.size,
        ecLevel: "M",
        quiet: 4,
        fill: appearance.foreground,
        back: appearance.background
      });
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("Canvas unavailable");
      }
      const pngDataUrl = canvas.toDataURL("image/png");
      if (pngDataUrl.indexOf("data:image/png") !== 0) {
        throw new Error("PNG unavailable");
      }

      canvas.setAttribute("aria-hidden", "true");
      qrSurface.replaceChildren(canvas);
      qrSurface.setAttribute("aria-label", content.accessibleSummary);
      qrSummary.textContent = content.summary;
      currentCanvas = canvas;
      currentPngDataUrl = pngDataUrl;
      emptyState.hidden = true;
      qrResult.hidden = false;
      downloadButton.disabled = false;
      setStatus("QR kod hazır. PNG olarak indirebilirsiniz.", "success");

      if (window.matchMedia("(max-width: 820px)").matches) {
        previewPanel.scrollIntoView({
          behavior: prefersReducedMotion.matches ? "auto" : "smooth",
          block: "start"
        });
      }
    } catch (error) {
      clearGenerated();
      setStatus("Bu bilgilerle QR kod oluşturulamadı. İçeriği kısaltıp yeniden deneyin.", "error");
    }
  }

  // PNG indirme
  function openPngFallback(dataUrl) {
    const opened = window.open(dataUrl, "_blank");
    if (opened) {
      opened.opener = null;
      setStatus("PNG yeni sekmede açıldı. Görseli basılı tutarak veya tarayıcı menüsünden kaydedebilirsiniz.");
      return;
    }
    setStatus("PNG otomatik açılamadı. Önizlemedeki görseli basılı tutarak kaydetmeyi deneyin.", "error");
  }

  function downloadPng() {
    if (!currentCanvas || !currentPngDataUrl) {
      downloadButton.disabled = true;
      setStatus("Önce güncel bir QR kod oluşturun.", "error");
      return;
    }

    try {
      currentPngDataUrl = currentCanvas.toDataURL("image/png");
      if (currentPngDataUrl.indexOf("data:image/png") !== 0) {
        throw new Error("PNG unavailable");
      }
      const link = document.createElement("a");
      if (!("download" in link)) {
        openPngFallback(currentPngDataUrl);
        return;
      }
      link.href = currentPngDataUrl;
      link.download = DOWNLOAD_NAMES[activeType];
      document.body.appendChild(link);
      link.click();
      link.remove();
      setStatus("PNG indirme işlemi başlatıldı.", "success");
    } catch (error) {
      setStatus("PNG hazırlanamadı. QR kodu yeniden oluşturup tekrar deneyin.", "error");
    }
  }

  // Temizleme
  function resetTool() {
    form.reset();
    wifiSecurity.value = DEFAULTS.wifiSecurity;
    countryCode.value = DEFAULTS.countryCode;
    qrSize.value = DEFAULTS.size;
    foregroundColor.value = DEFAULTS.foreground;
    backgroundColor.value = DEFAULTS.background;
    wifiPassword.type = "password";
    passwordToggle.textContent = "Göster";
    passwordToggle.setAttribute("aria-pressed", "false");
    updateWifiSecurity();
    updateTextCounter();
    updateColorLabels();
    clearValidation();
    setType(DEFAULTS.type, false);
    setStatus("");
    linkUrl.focus();
  }

  function togglePasswordVisibility() {
    if (wifiPassword.disabled) return;
    const shouldShow = wifiPassword.type === "password";
    wifiPassword.type = shouldShow ? "text" : "password";
    passwordToggle.textContent = shouldShow ? "Gizle" : "Göster";
    passwordToggle.setAttribute("aria-pressed", String(shouldShow));
    wifiPassword.focus();
  }

  function handleFormInput(event) {
    clearValidation();
    if (event.target === plainText) updateTextCounter();
    if (event.target === foregroundColor || event.target === backgroundColor) updateColorLabels();
    invalidateGenerated();
  }

  function handleFormChange(event) {
    if (event.target === wifiSecurity) updateWifiSecurity();
    if (event.target === foregroundColor || event.target === backgroundColor) updateColorLabels();
    clearValidation();
    invalidateGenerated();
  }

  if (!requiredDomIsReady()) return;

  typeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setType(button.dataset.qrType, true);
    });
  });
  form.addEventListener("submit", generateQr);
  form.addEventListener("input", handleFormInput);
  form.addEventListener("change", handleFormChange);
  passwordToggle.addEventListener("click", togglePasswordVisibility);
  downloadButton.addEventListener("click", downloadPng);
  clearButton.addEventListener("click", resetTool);

  updateWifiSecurity();
  updateTextCounter();
  updateColorLabels();
  setType(DEFAULTS.type, false);
}());
