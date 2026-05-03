"use strict";

(function () {
  const STORAGE_KEY = "dashboard-knowledge-v1";
  const saveContentBtn = document.getElementById("saveContentBtn");
  const resetContentBtn = document.getElementById("resetContentBtn");
  const titleEl = document.getElementById("contentViewTitle");
  const statusEl = document.getElementById("contentViewStatus");
  const previewEl = document.getElementById("protocolContentPreview");
  const textarea = document.getElementById("protocolContentEditor");

  if (!saveContentBtn || !resetContentBtn || !titleEl || !statusEl || !previewEl || !textarea) return;

  const params = new URLSearchParams(location.search);
  const topicId = params.get("topicId") || "";
  let originalContent = "<p>Coming soon.</p>";
  let editorApi = null;

  function uid(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function readStore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.categories)) return { categories: [] };
      return {
        categories: parsed.categories
          .filter((cat) => cat && typeof cat === "object")
          .map((cat) => ({
            id: String(cat.id || uid("cat")),
            name: String(cat.name || "").trim(),
            slug: String(cat.slug || slugify(cat.name)).trim(),
            topics: Array.isArray(cat.topics)
              ? cat.topics
                  .filter((topic) => topic && typeof topic === "object")
                  .map((topic) => ({
                    ...topic,
                    id: String(topic.id || uid("topic")),
                    title: String(topic.title || "").trim(),
                    content: String(topic.content || "<p>Coming soon.</p>"),
                  }))
              : [],
          })),
      };
    } catch {
      return { categories: [] };
    }
  }

  function writeStore(store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...store, updatedAt: Date.now() }));
  }

  function findTopicContext(store, id) {
    for (const category of store.categories) {
      const topic = category.topics.find((item) => item.id === id);
      if (topic) return { category, topic };
    }
    return null;
  }

  function setNotFoundState() {
    titleEl.textContent = "Protocol Content";
    statusEl.textContent = "Protocol not found";
    previewEl.innerHTML = "<p class='text-muted mb-0'>Protocol not found.</p>";
    saveContentBtn.disabled = true;
    resetContentBtn.disabled = true;
  }

  function renderPreview(html) {
    previewEl.innerHTML = html || "<p>Coming soon.</p>";
  }

  function setEditorFallback(html) {
    textarea.value = html || "";
    textarea.style.display = "block";
    textarea.classList.add("form-control");
    textarea.style.minHeight = "430px";
    editorApi = {
      getContent() {
        return textarea.value;
      },
      setContent(content) {
        textarea.value = content || "";
      },
    };
    textarea.addEventListener("input", () => {
      renderPreview(editorApi.getContent());
    });
  }

  function initEditorWithFallback(initialHtml) {
    if (!window.tinymce || typeof window.tinymce.init !== "function") {
      setEditorFallback(initialHtml);
      saveContentBtn.disabled = false;
      resetContentBtn.disabled = false;
      return Promise.resolve();
    }

    saveContentBtn.disabled = true;
    resetContentBtn.disabled = true;

    return window.tinymce
      .init({
        selector: "#protocolContentEditor",
        license_key: "gpl",
        height: 420,
        menubar: "file edit view insert format tools table help",
        plugins: "lists link image table code autoresize",
        promotion: false,
        branding: false,
        statusbar: false,
        toolbar:
          "undo redo | blocks | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image table | removeformat code",
        content_style:
          "body{font-family:DM Sans,system-ui,sans-serif;font-size:14px;line-height:1.6;background:#08203c;color:#e9f1ff;padding:14px;}",
        setup(ed) {
          ed.on("init", () => {
            ed.setContent(initialHtml);
            renderPreview(initialHtml);
          });
          ed.on("change input undo redo", () => {
            renderPreview(ed.getContent());
          });
        },
      })
      .then((editors) => {
        let ed = Array.isArray(editors) && editors.length ? editors[0] : null;
        if (!ed && window.tinymce) {
          ed = window.tinymce.get("protocolContentEditor");
        }
        if (!ed) {
          setEditorFallback(initialHtml);
        } else {
          editorApi = {
            getContent() {
              return ed.getContent();
            },
            setContent(content) {
              ed.setContent(content || "");
            },
          };
        }
        saveContentBtn.disabled = false;
        resetContentBtn.disabled = false;
      })
      .catch(() => {
        setEditorFallback(initialHtml);
        saveContentBtn.disabled = false;
        resetContentBtn.disabled = false;
      });
  }

  if (!topicId) {
    setNotFoundState();
    setEditorFallback("<p>Protocol not found.</p>");
    return;
  }

  const store = readStore();
  const ctx = findTopicContext(store, topicId);
  if (!ctx) {
    setNotFoundState();
    setEditorFallback("<p>Protocol not found.</p>");
    return;
  }

  titleEl.textContent = "Content View: " + (ctx.topic.title || "Untitled");
  statusEl.textContent = (ctx.category.name || "General") + " / " + (ctx.topic.subcategory || "No subcategory");
  originalContent = ctx.topic.content || "<p>Coming soon.</p>";
  renderPreview(originalContent);

  initEditorWithFallback(originalContent);

  saveContentBtn.addEventListener("click", () => {
    if (!topicId) return;
    const inst = window.tinymce && window.tinymce.get("protocolContentEditor");
    if (inst && typeof inst.save === "function") {
      inst.save();
    }
    let html = "";
    if (inst) {
      html = String(inst.getContent() || "").trim();
    } else if (editorApi) {
      html = String(editorApi.getContent() || "").trim();
    } else {
      return;
    }
    if (!html) html = "<p>Coming soon.</p>";
    const store = readStore();
    const ctx = findTopicContext(store, topicId);
    if (!ctx) return;
    ctx.topic.content = html;
    writeStore(store);
    originalContent = html;
    window.location.href = "knowledge.html";
  });

  resetContentBtn.addEventListener("click", () => {
    const inst = window.tinymce && window.tinymce.get("protocolContentEditor");
    const next = originalContent || "<p>Coming soon.</p>";
    if (inst) {
      inst.setContent(next);
      renderPreview(inst.getContent());
    } else if (editorApi) {
      editorApi.setContent(next);
      renderPreview(editorApi.getContent());
    }
  });
})();
