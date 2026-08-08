(function (global) {
  "use strict";

  var url = "https://neppacfsixrjzpkvcgxy.supabase.co";
  var publishableKey = "sb_publishable_YSgMffoDWwjYnjBrYYKTLQ_08Y5BLrz";

  function headers() {
    return {
      apikey: publishableKey,
      Authorization: "Bearer " + publishableKey,
      Accept: "application/json"
    };
  }

  async function request(path, query) {
    var endpoint = new URL(path, url.replace(/\/$/, "") + "/");
    Object.keys(query || {}).forEach(function (key) {
      endpoint.searchParams.set(key, String(query[key]));
    });
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 4000);
    try {
      var response = await fetch(endpoint, {
        headers: headers(),
        signal: controller.signal
      });
      if (!response.ok) throw new Error("Supabase request failed: " + response.status);
      return response.json();
    } finally {
      clearTimeout(timer);
    }
  }

  async function connect() {
    try {
      await request("auth/v1/settings");
      document.documentElement.dataset.supabase = "connected";
      global.dispatchEvent(new CustomEvent("feiyun:supabase-status", {
        detail: { connected: true, projectUrl: url, access: "publishable/RLS" }
      }));
      return true;
    } catch (error) {
      document.documentElement.dataset.supabase = "offline";
      global.dispatchEvent(new CustomEvent("feiyun:supabase-status", {
        detail: { connected: false, error: error.message }
      }));
      return false;
    }
  }

  global.FeiyunSupabase = Object.freeze({
    url: url,
    publishableKey: publishableKey,
    connect: connect,
    select: function (table, query) {
      if (!/^[a-z][a-z0-9_]*$/.test(table)) {
        return Promise.reject(new Error("Invalid Supabase table name."));
      }
      return request("rest/v1/" + table, query || {});
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", connect, { once: true });
  } else {
    connect();
  }
})(window);
