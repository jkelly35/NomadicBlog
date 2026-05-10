(function () {
  var BLOG_TABLE = "coach_blog_posts";

  document.addEventListener("DOMContentLoaded", function () {
    initializeBlogPost();
  });

  function initializeBlogPost() {
    if (!window.supabase || !window.supabase.createClient) {
      renderError("Could not load blog post.");
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      renderError("Blog configuration is incomplete.");
      return;
    }

    var slug = getQueryParam("slug");
    if (!slug) {
      renderError("No blog post selected.");
      return;
    }

    var client = window.supabase.createClient(url, key);

    client
      .from(BLOG_TABLE)
      .select("title,slug,excerpt,category,cover_image_url,content_html,published_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle()
      .then(function (result) {
        if (result.error || !result.data) {
          renderError("This post is unavailable.");
          return;
        }

        renderPost(result.data);
      })
      .catch(function () {
        renderError("Could not load blog post.");
      });
  }

  function renderPost(post) {
    var titleEl = document.querySelector("[data-blogpost-title]");
    var metaEl = document.querySelector("[data-blogpost-meta]");
    var coverEl = document.querySelector("[data-blogpost-cover]");
    var contentEl = document.querySelector("[data-blogpost-content]");

    if (titleEl) {
      titleEl.textContent = post.title || "Blog Post";
    }

    if (metaEl) {
      var category = post.category || "Blog";
      var dateLabel = formatDate(post.published_at);
      metaEl.textContent = category + " • " + dateLabel;
    }

    if (coverEl && post.cover_image_url) {
      coverEl.src = post.cover_image_url;
      coverEl.alt = post.title || "Blog cover";
      coverEl.style.display = "block";
    }

    if (contentEl) {
      contentEl.innerHTML = post.content_html || "";
    }

    document.title = (post.title || "Blog Post") + " - Nomadic Performance";
  }

  function renderError(message) {
    var titleEl = document.querySelector("[data-blogpost-title]");
    var metaEl = document.querySelector("[data-blogpost-meta]");
    var contentEl = document.querySelector("[data-blogpost-content]");

    if (titleEl) {
      titleEl.textContent = "Blog Post";
    }

    if (metaEl) {
      metaEl.textContent = "";
    }

    if (contentEl) {
      contentEl.innerHTML = "<p>" + escapeHtml(message) + "</p>";
    }
  }

  function formatDate(value) {
    if (!value) {
      return "Recent";
    }

    var date = new Date(value);
    if (isNaN(date.getTime())) {
      return "Recent";
    }

    return date.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search || "");
    return params.get(name);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }
})();
