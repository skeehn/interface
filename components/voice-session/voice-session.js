/**
 * skeehn — Voice Session Component
 * Realtime voice session with waveform, transcript, and state indicators.
 */
class SkVoiceSession extends HTMLElement {
  static get observedAttributes() {
    return ["data-status", "data-timezone", "data-city"];
  }

  connectedCallback() {
    this._initClock();
    this._initWaveform();
    this._bindControls();
  }

  disconnectedCallback() {
    if (this._clockTimer) clearInterval(this._clockTimer);
    if (this._waveformTimer) clearInterval(this._waveformTimer);
  }

  attributeChangedCallback(name, _old, value) {
    if (name === "data-status") this._onStatusChange(value);
    if (name === "data-timezone") this._initClock();
  }

  _initClock() {
    const clock = this.querySelector(".sk-voice-session__clock");
    if (!clock) return;
    const tz = this.dataset.timezone || "UTC";
    const city = this.dataset.city || tz;

    const update = () => {
      const now = new Date();
      const time = now.toLocaleTimeString("en-US", {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      clock.textContent = `${city} ${time}`;
    };

    update();
    this._clockTimer = setInterval(update, 1000);
  }

  _initWaveform() {
    const waveform = this.querySelector(".sk-voice-session__waveform");
    if (!waveform) return;

    const bars = waveform.querySelectorAll(".sk-voice-session__waveform-bar");
    const status = this.dataset.status || "idle";

    const animate = () => {
      const isActive = status === "listening" || status === "speaking";
      bars.forEach((bar) => {
        const h = isActive ? Math.random() * 100 : 10;
        bar.style.height = `${h}%`;
      });
    };

    this._waveformTimer = setInterval(animate, 120);
  }

  _onStatusChange(status) {
    if (this._waveformTimer) clearInterval(this._waveformTimer);
    this._initWaveform();
    this.dispatchEvent(new CustomEvent("voice:statuschange", { detail: { status }, bubbles: true }));
  }

  _bindControls() {
    const mute = this.querySelector("[data-action='mute']");
    if (mute) {
      mute.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("voice:mute", { bubbles: true }));
      });
    }

    const end = this.querySelector("[data-action='end']");
    if (end) {
      end.addEventListener("click", () => {
        this.dataset.status = "handoff";
        this.dispatchEvent(new CustomEvent("voice:end", { bubbles: true }));
      });
    }
  }
}

if (typeof customElements !== "undefined" && !customElements.get("sk-voice-session")) {
  customElements.define("sk-voice-session", SkVoiceSession);
}

// Auto-init for data-attribute pattern
if (typeof document !== "undefined") {
  document.querySelectorAll(".sk-voice-session[data-timezone]").forEach((el) => {
    if (!el._skInit) {
      el._skInit = true;
      const instance = Object.create(SkVoiceSession.prototype);
      instance.connectedCallback = SkVoiceSession.prototype.connectedCallback.bind(el);
    }
  });
}
