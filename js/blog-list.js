(function () {
  var BLOG_TABLE = "coach_blog_posts";

  document.addEventListener("DOMContentLoaded", function () {
    initializeBlogList();
  });

  function initializeBlogList() {
    if (!window.supabase || !window.supabase.createClient) {
      return;
    }

    var container = document.querySelector("[data-blog-list-dynamic]");
    if (!container) {
      return;
    }

    var url = window.NOMADIC_SUPABASE_URL;
    var key = window.NOMADIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      return;
    }

    var client = window.supabase.createClient(url, key);

    client
      .from(BLOG_TABLE)
      .select("id,title,slug,excerpt,category,cover_image_url,published_at")
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(24)
      .then(function (result) {
        if (result.error || !result.data || !result.data.length) {
          container.innerHTML = "";
          return;
        }

        container.innerHTML = result.data.map(renderPostCard).join("");
      })
      .catch(function () {
        container.innerHTML = "";
      });
  }

  function renderPostCard(post) {
    var href = "blog-post.html?slug=" + encodeURIComponent(post.slug || "");
    var cover = post.cover_image_url || "img/nomadicPerformanceLogo.png";
    var alt = post.title || "Blog post";
    var category = post.category || "Blog";
    var dateLabel = formatDate(post.published_at);
    var excerpt = post.excerpt || "Read the full article for details.";

    return (
      '<article class="card">' +
      '<img src="' + escapeAttribute(cover) + '" alt="' + escapeAttribute(alt) + '" class="card-cover" />' +
      '<div class="card-body">' +
      '<p class="card-meta">' + escapeHtml(category) + ' &bull; ' + escapeHtml(dateLabel) + '</p>' +
      '<h3>' + escapeHtml(post.title || "Untitled") + '</h3>' +
      '<p>' + escapeHtml(excerpt) + '</p>' +
      '<a class="btn" href="' + escapeAttribute(href) + '">Read more &rarr;</a>' +
      '</div>' +
      '</article>'
    );
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
      year: "numeric"
    });
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
