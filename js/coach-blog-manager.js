(function () {
  var ADMIN_EMAIL = "joe@nomadicperformance.com";
  var BLOG_TABLE = "coach_blog_posts";

  var state = {
    client: null,
    user: null,
    posts: []
  };

  document.addEventListener("DOMContentLoaded", function () {
    initialize();
  });

  function initialize() {
    if (!window.supabase || !window.supabase.createClient) {
      showGuardError("Supabase client failed to load.");
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
        redirectHome();
        return;
      }

      state.user = session.user;
      if (state.user.email !== ADMIN_EMAIL) {
        showGuardError("You do not have permission to access Blog Manager.");
        setTimeout(redirectHome, 1800);
        return;
      }

      showEditor();
      bindEvents();
      loadPosts();
      setDefaultPublishedDate();
    });

    state.client.auth.onAuthStateChange(function (_event, session) {
      if (!session) {
        redirectHome();
      }
    });
  }

  function bindEvents() {
    var form = document.querySelector("[data-blogmgr-form]");
    if (form) {
      form.addEventListener("submit", onSavePost);
    }

    var resetBtn = document.querySelector("[data-blogmgr-reset]");
    if (resetBtn) {
      resetBtn.addEventListener("click", resetForm);
    }

    var titleInput = document.querySelector("[data-blogmgr-title]");
    if (titleInput) {
      titleInput.addEventListener("input", function () {
        var slugInput = document.querySelector("[data-blogmgr-slug]");
        if (!slugInput) {
          return;
        }

        if (!slugInput.dataset.touched || slugInput.dataset.touched === "0") {
          slugInput.value = slugify(titleInput.value || "");
        }
      });
    }

    var slugInput = document.querySelector("[data-blogmgr-slug]");
    if (slugInput) {
      slugInput.dataset.touched = "0";
      slugInput.addEventListener("input", function () {
        slugInput.dataset.touched = "1";
      });
    }

    var tableBody = document.querySelector("[data-blogmgr-table-body]");
    if (tableBody) {
      tableBody.addEventListener("click", function (event) {
        var editBtn = event.target.closest("[data-blogmgr-edit]");
        if (editBtn) {
          onEditPost(editBtn.getAttribute("data-blogmgr-edit"));
          return;
        }

        var deleteBtn = event.target.closest("[data-blogmgr-delete]");
        if (deleteBtn) {
          onDeletePost(deleteBtn.getAttribute("data-blogmgr-delete"));
        }
      });
    }
  }

  function loadPosts() {
    state.client
      .from(BLOG_TABLE)
      .select("id,title,slug,excerpt,category,cover_image_url,content_html,published_at,is_published,created_at")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        state.posts = result.data || [];
        renderPostsTable();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to load posts.", "error");
      });
  }

  function onSavePost(event) {
    event.preventDefault();

    var id = getValue("[data-blogmgr-id]");
    var title = getValue("[data-blogmgr-title]");
    var slug = slugify(getValue("[data-blogmgr-slug]"));
    var excerpt = getValue("[data-blogmgr-excerpt]");
    var category = getValue("[data-blogmgr-category]");
    var cover = getValue("[data-blogmgr-cover]");
    var contentHtml = getValue("[data-blogmgr-content-html]");
    var publishedAt = getValue("[data-blogmgr-published-at]");
    var isPublished = !!getChecked("[data-blogmgr-is-published]");

    if (!title || !slug || !excerpt || !contentHtml) {
      setStatus("Title, slug, excerpt, and content are required.", "error");
      return;
    }

    var payload = {
      title: title,
      slug: slug,
      excerpt: excerpt,
      category: category || null,
      cover_image_url: cover || null,
      content_html: contentHtml,
      published_at: publishedAt ? new Date(publishedAt).toISOString() : new Date().toISOString(),
      is_published: isPublished,
      created_by: state.user ? state.user.id : null
    };

    if (id) {
      state.client
        .from(BLOG_TABLE)
        .update(payload)
        .eq("id", id)
        .then(function (result) {
          if (result.error) {
            setStatus(result.error.message, "error");
            return;
          }

          setStatus("Post updated.", "success");
          resetForm();
          loadPosts();
        })
        .catch(function (error) {
          setStatus(error && error.message ? error.message : "Failed to update post.", "error");
        });
      return;
    }

    state.client
      .from(BLOG_TABLE)
      .insert([payload])
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Post created and added to blog.", "success");
        resetForm();
        loadPosts();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to create post.", "error");
      });
  }

  function onEditPost(postId) {
    var post = state.posts.find(function (item) {
      return item.id === postId;
    });

    if (!post) {
      setStatus("Post not found.", "error");
      return;
    }

    setValue("[data-blogmgr-id]", post.id || "");
    setValue("[data-blogmgr-title]", post.title || "");
    setValue("[data-blogmgr-slug]", post.slug || "");
    setValue("[data-blogmgr-category]", post.category || "");
    setValue("[data-blogmgr-cover]", post.cover_image_url || "");
    setValue("[data-blogmgr-excerpt]", post.excerpt || "");
    setValue("[data-blogmgr-content-html]", post.content_html || "");
    setValue("[data-blogmgr-published-at]", toLocalDateInput(post.published_at));
    setChecked("[data-blogmgr-is-published]", !!post.is_published);

    var slugInput = document.querySelector("[data-blogmgr-slug]");
    if (slugInput) {
      slugInput.dataset.touched = "1";
    }

    var formTitle = document.querySelector("[data-blogmgr-form-title]");
    if (formTitle) {
      formTitle.textContent = "Edit Post";
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onDeletePost(postId) {
    var post = state.posts.find(function (item) {
      return item.id === postId;
    });

    if (!post) {
      setStatus("Post not found.", "error");
      return;
    }

    var confirmed = window.confirm("Delete post '" + (post.title || "Untitled") + "'? This cannot be undone.");
    if (!confirmed) {
      return;
    }

    state.client
      .from(BLOG_TABLE)
      .delete()
      .eq("id", postId)
      .then(function (result) {
        if (result.error) {
          setStatus(result.error.message, "error");
          return;
        }

        setStatus("Post deleted.", "success");
        if (getValue("[data-blogmgr-id]") === postId) {
          resetForm();
        }
        loadPosts();
      })
      .catch(function (error) {
        setStatus(error && error.message ? error.message : "Failed to delete post.", "error");
      });
  }

  function renderPostsTable() {
    var tableBody = document.querySelector("[data-blogmgr-table-body]");
    if (!tableBody) {
      return;
    }

    if (!state.posts.length) {
      tableBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:1.4rem;">No posts yet.</td></tr>';
      return;
    }

    tableBody.innerHTML = state.posts
      .map(function (post) {
        var status = post.is_published ? "Published" : "Draft";
        var dateLabel = formatDate(post.published_at);

        return (
          "<tr>" +
          "<td>" + escapeHtml(post.title || "Untitled") + "</td>" +
          "<td>" + escapeHtml(status) + "</td>" +
          "<td>" + escapeHtml(dateLabel) + "</td>" +
          '<td><button type="button" class="btn admin-btn-small" data-blogmgr-edit="' + escapeAttribute(post.id) + '">Edit</button> ' +
          '<button type="button" class="btn admin-btn-delete" data-blogmgr-delete="' + escapeAttribute(post.id) + '">Delete</button></td>' +
          "</tr>"
        );
      })
      .join("");
  }

  function resetForm() {
    setValue("[data-blogmgr-id]", "");
    setValue("[data-blogmgr-title]", "");
    setValue("[data-blogmgr-slug]", "");
    setValue("[data-blogmgr-category]", "");
    setValue("[data-blogmgr-cover]", "");
    setValue("[data-blogmgr-excerpt]", "");
    setValue("[data-blogmgr-content-html]", "");
    setChecked("[data-blogmgr-is-published]", true);
    setDefaultPublishedDate();

    var slugInput = document.querySelector("[data-blogmgr-slug]");
    if (slugInput) {
      slugInput.dataset.touched = "0";
    }

    var formTitle = document.querySelector("[data-blogmgr-form-title]");
    if (formTitle) {
      formTitle.textContent = "Create New Post";
    }
  }

  function setDefaultPublishedDate() {
    var input = document.querySelector("[data-blogmgr-published-at]");
    if (!input || input.value) {
      return;
    }

    var now = new Date();
    var local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    input.value = local;
  }

  function showGuardError(message) {
    var guard = document.querySelector("[data-blogmgr-guard]");
    if (guard) {
      guard.innerHTML = '<p class="admin-loading">' + escapeHtml(message) + "</p>";
    }
  }

  function showEditor() {
    var guard = document.querySelector("[data-blogmgr-guard]");
    var content = document.querySelector("[data-blogmgr-content]");
    if (guard) {
      guard.hidden = true;
    }
    if (content) {
      content.hidden = false;
    }
  }

  function setStatus(message, variant) {
    var el = document.querySelector("[data-blogmgr-status]");
    if (!el) {
      return;
    }

    el.textContent = message || "";
    el.classList.remove("is-error", "is-success", "is-info");

    if (variant === "error") {
      el.classList.add("is-error");
    } else if (variant === "success") {
      el.classList.add("is-success");
    } else {
      el.classList.add("is-info");
    }
  }

  function redirectHome() {
    window.location.href = "index.html";
  }

  function getValue(selector) {
    var el = document.querySelector(selector);
    return el ? String(el.value || "").trim() : "";
  }

  function setValue(selector, value) {
    var el = document.querySelector(selector);
    if (el) {
      el.value = value || "";
    }
  }

  function getChecked(selector) {
    var el = document.querySelector(selector);
    return !!(el && el.checked);
  }

  function setChecked(selector, checked) {
    var el = document.querySelector(selector);
    if (el) {
      el.checked = !!checked;
    }
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    var date = new Date(value);
    if (isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function toLocalDateInput(value) {
    if (!value) {
      return "";
    }

    var date = new Date(value);
    if (isNaN(date.getTime())) {
      return "";
    }

    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "");
  }
})();
