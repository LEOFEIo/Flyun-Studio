(function () {
  'use strict';

  const store = window.FlyunStudioStore;
  if (!store) return;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const state = {
    projects: [],
    profile: store.readProfile(),
    currentView: 'overview',
    editingId: null,
    query: '',
    session: null,
    toastTimer: null
  };

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function toast(message, type = 'success') {
    const node = $('#toast');
    node.textContent = message;
    node.classList.toggle('is-error', type === 'error');
    node.classList.add('is-visible');
    clearTimeout(state.toastTimer);
    state.toastTimer = setTimeout(() => node.classList.remove('is-visible'), 2800);
  }

  function accessCode() {
    return localStorage.getItem(store.KEYS.access) || 'flyun2026';
  }

  function unlock() {
    sessionStorage.setItem('flyun:admin:unlocked', '1');
    $('#loginScreen').hidden = true;
    $('#adminApp').hidden = false;
    loadAll();
  }

  function setupLogin() {
    if (sessionStorage.getItem('flyun:admin:unlocked') === '1') {
      unlock();
      return;
    }
    $('#loginForm').addEventListener('submit', (event) => {
      event.preventDefault();
      const input = $('#accessCode');
      if (input.value === accessCode()) {
        $('#loginError').textContent = '';
        unlock();
      } else {
        $('#loginError').textContent = '访问口令不正确。';
        input.select();
      }
    });
  }

  function setView(view) {
    state.currentView = view;
    $$('.nav-button').forEach((button) => button.classList.toggle('is-active', button.dataset.view === view));
    $$('.view').forEach((panel) => panel.classList.toggle('is-active', panel.id === `view-${view}`));
    $('#mobileTitle').textContent = $(`.nav-button[data-view="${view}"] span:last-child`)?.textContent || 'Studio';
    $('.sidebar').classList.remove('is-open');
    if (view === 'overview') renderOverview();
    if (view === 'projects') renderProjects();
    if (view === 'profile') renderProfileForm();
    if (view === 'cloud') renderCloud();
  }

  function setupNavigation() {
    $$('.nav-button').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));
    $('#mobileMenuButton').addEventListener('click', () => $('.sidebar').classList.toggle('is-open'));
    $('#showAllProjects').addEventListener('click', () => setView('projects'));
    $('#logoutButton').addEventListener('click', () => {
      sessionStorage.removeItem('flyun:admin:unlocked');
      location.reload();
    });
  }

  function renderOverview() {
    const published = state.projects.filter((item) => item.status === 'published').length;
    const drafts = state.projects.filter((item) => item.status === 'draft').length;
    const featured = state.projects.filter((item) => item.meta?.featured).length;
    $('#statProjects').textContent = String(state.projects.length).padStart(2, '0');
    $('#statPublished').textContent = String(published).padStart(2, '0');
    $('#statDrafts').textContent = String(drafts).padStart(2, '0');
    $('#statFeatured').textContent = String(featured).padStart(2, '0');

    const recent = [...state.projects].sort((a, b) => b.position - a.position).slice(0, 5);
    $('#recentProjects').innerHTML = recent.length ? recent.map((project) => `
      <div class="activity-item">
        <strong>${escapeHtml(project.title_zh)}</strong>
        <span>${escapeHtml(project.category)} · ${escapeHtml(project.year)} · ${project.status === 'published' ? '已发布' : '草稿'}</span>
      </div>`).join('') : '<div class="empty-list">暂无作品</div>';
  }

  function filteredProjects() {
    const query = state.query.trim().toLowerCase();
    if (!query) return state.projects;
    return state.projects.filter((project) => `${project.title_zh} ${project.title_en} ${project.category} ${project.year}`.toLowerCase().includes(query));
  }

  function renderProjects() {
    const list = $('#projectList');
    const projects = filteredProjects();
    list.innerHTML = projects.length ? projects.map((project) => {
      const cover = project.cover ? `style="background-image:url('${escapeHtml(project.cover)}')"` : '';
      return `
        <article class="project-row" data-id="${escapeHtml(project.id)}">
          <div class="project-thumb" ${cover}></div>
          <div class="project-info"><strong>${escapeHtml(project.title_zh)}</strong><p>${escapeHtml(project.subtitle_zh)}</p></div>
          <div class="project-category">${escapeHtml(project.category)}<br>${escapeHtml(project.year)}</div>
          <span class="status-badge ${project.status === 'published' ? 'is-published' : ''}">${project.status === 'published' ? 'PUBLISHED' : 'DRAFT'}</span>
          <div class="project-actions">
            <button class="button button--small button--ghost" type="button" data-move="up" title="上移">↑</button>
            <button class="button button--small button--ghost" type="button" data-move="down" title="下移">↓</button>
            <button class="button button--small" type="button" data-edit>编辑</button>
            <button class="button button--small button--danger" type="button" data-delete>删除</button>
          </div>
        </article>`;
    }).join('') : '<div class="empty-list">没有匹配的作品</div>';

    $$('[data-edit]', list).forEach((button) => button.addEventListener('click', () => openEditor(button.closest('[data-id]').dataset.id)));
    $$('[data-delete]', list).forEach((button) => button.addEventListener('click', () => deleteProject(button.closest('[data-id]').dataset.id)));
    $$('[data-move]', list).forEach((button) => button.addEventListener('click', () => moveProject(button.closest('[data-id]').dataset.id, button.dataset.move)));
  }

  function emptyProject() {
    return store.normalizeProject({
      id: '',
      title_zh: '',
      title_en: '',
      subtitle_zh: '',
      subtitle_en: '',
      category: 'AI Product',
      year: new Date().getFullYear(),
      cover: '',
      link: '#',
      status: 'draft',
      position: state.projects.length,
      meta: { featured: false, role: '', tools: [], accent: 'lime', index: String(state.projects.length + 1).padStart(2, '0') }
    }, state.projects.length);
  }

  function setForm(project) {
    const form = $('#projectForm');
    form.reset();
    $('#projectId').value = project.id || '';
    $('#titleZh').value = project.title_zh || '';
    $('#titleEn').value = project.title_en || '';
    $('#subtitleZh').value = project.subtitle_zh || '';
    $('#subtitleEn').value = project.subtitle_en || '';
    $('#category').value = project.category || '';
    $('#year').value = project.year || '';
    $('#cover').value = project.cover || '';
    $('#projectLink').value = project.link || '';
    $('#role').value = project.meta?.role || '';
    $('#tools').value = Array.isArray(project.meta?.tools) ? project.meta.tools.join(', ') : '';
    $('#accent').value = project.meta?.accent || 'lime';
    $('#projectIndex').value = project.meta?.index || '';
    $('#status').value = project.status || 'draft';
    $('#featured').checked = Boolean(project.meta?.featured);
    $('#editorTitle').textContent = state.editingId ? '编辑作品' : '新建作品';
  }

  function openEditor(id = null) {
    state.editingId = id;
    const project = id ? state.projects.find((item) => item.id === id) : emptyProject();
    setForm(project || emptyProject());
    $('#projectEditor').showModal();
  }

  function closeEditor() {
    $('#projectEditor').close();
    state.editingId = null;
  }

  function formProject() {
    const titleZh = $('#titleZh').value.trim();
    const titleEn = $('#titleEn').value.trim() || titleZh;
    if (!titleZh) throw new Error('请填写中文项目名称。');
    const existing = state.editingId ? state.projects.find((item) => item.id === state.editingId) : null;
    return store.normalizeProject({
      id: existing?.id || store.slugify(titleEn || titleZh),
      title_zh: titleZh,
      title_en: titleEn,
      subtitle_zh: $('#subtitleZh').value.trim(),
      subtitle_en: $('#subtitleEn').value.trim() || $('#subtitleZh').value.trim(),
      category: $('#category').value.trim() || 'Selected Work',
      year: $('#year').value.trim() || String(new Date().getFullYear()),
      cover: $('#cover').value.trim(),
      link: $('#projectLink').value.trim() || '#',
      position: existing?.position ?? state.projects.length,
      status: $('#status').value,
      meta: {
        ...(existing?.meta || {}),
        role: $('#role').value.trim(),
        tools: $('#tools').value.split(',').map((item) => item.trim()).filter(Boolean),
        accent: $('#accent').value,
        index: $('#projectIndex').value.trim() || String((existing?.position ?? state.projects.length) + 1).padStart(2, '0'),
        featured: $('#featured').checked
      }
    });
  }

  async function saveProject(event) {
    event.preventDefault();
    try {
      const project = formProject();
      await store.saveProject(project, { cloud: true });
      state.projects = store.readProjects();
      closeEditor();
      renderProjects();
      renderOverview();
      toast(state.session ? '作品已保存并同步到云端。' : '作品已保存到本地；登录云端后可同步。');
    } catch (error) {
      toast(error.message || '保存失败。', 'error');
    }
  }

  async function deleteProject(id) {
    const project = state.projects.find((item) => item.id === id);
    if (!project || !confirm(`确定删除「${project.title_zh}」吗？此操作会同时尝试删除云端数据。`)) return;
    try {
      await store.removeProject(id, { cloud: true });
      state.projects = store.readProjects();
      renderProjects();
      renderOverview();
      toast('作品已删除。');
    } catch (error) {
      toast(error.message || '删除失败。', 'error');
    }
  }

  async function moveProject(id, direction) {
    const projects = [...state.projects].sort((a, b) => a.position - b.position);
    const index = projects.findIndex((item) => item.id === id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= projects.length) return;
    [projects[index], projects[target]] = [projects[target], projects[index]];
    projects.forEach((item, position) => {
      item.position = position;
      item.meta = { ...item.meta, index: String(position + 1).padStart(2, '0') };
    });
    try {
      state.projects = await store.replaceProjects(projects, { cloud: true });
      renderProjects();
      renderOverview();
      toast('作品顺序已更新。');
    } catch (error) {
      toast(error.message || '排序失败。', 'error');
    }
  }

  function setupProjectTools() {
    $('#newProjectButton').addEventListener('click', () => openEditor());
    $('#projectToolbarNew').addEventListener('click', () => openEditor());
    $('#quickNewProject').addEventListener('click', () => { setView('projects'); openEditor(); });
    $('#projectEditorClose').addEventListener('click', closeEditor);
    $('#cancelProject').addEventListener('click', closeEditor);
    $('#projectForm').addEventListener('submit', saveProject);
    $('#projectSearch').addEventListener('input', (event) => {
      state.query = event.target.value;
      renderProjects();
    });
    $('#coverFile').addEventListener('change', (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 1.8 * 1024 * 1024) {
        toast('图片过大，请压缩到 1.8MB 以下或使用图片 URL。', 'error');
        event.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        $('#cover').value = String(reader.result || '');
        toast('图片已写入本地表单。');
      };
      reader.readAsDataURL(file);
    });
  }

  function renderProfileForm() {
    const profile = state.profile;
    Object.entries({
      profileNameZh: profile.nameZh,
      profileNameEn: profile.nameEn,
      profileRoleZh: profile.roleZh,
      profileRoleEn: profile.roleEn,
      profileIntroZh: profile.introZh,
      profileIntroEn: profile.introEn,
      profileLocation: profile.location,
      profileEmail: profile.email,
      profileAvailabilityZh: profile.availabilityZh,
      profileAvailabilityEn: profile.availabilityEn,
      profileResume: profile.resumeUrl,
      profileGithub: profile.githubUrl
    }).forEach(([id, value]) => { $(`#${id}`).value = value || ''; });
  }

  async function saveProfile(event) {
    event.preventDefault();
    const profile = {
      nameZh: $('#profileNameZh').value.trim(),
      nameEn: $('#profileNameEn').value.trim(),
      roleZh: $('#profileRoleZh').value.trim(),
      roleEn: $('#profileRoleEn').value.trim(),
      introZh: $('#profileIntroZh').value.trim(),
      introEn: $('#profileIntroEn').value.trim(),
      location: $('#profileLocation').value.trim(),
      email: $('#profileEmail').value.trim(),
      availabilityZh: $('#profileAvailabilityZh').value.trim(),
      availabilityEn: $('#profileAvailabilityEn').value.trim(),
      resumeUrl: $('#profileResume').value.trim(),
      githubUrl: $('#profileGithub').value.trim()
    };
    try {
      state.profile = await store.saveProfile(profile, { cloud: true });
      toast(state.session ? '个人信息已保存并同步。' : '个人信息已保存到本地。');
    } catch (error) {
      toast(error.message || '保存失败。', 'error');
    }
  }

  function setupProfile() {
    $('#profileForm').addEventListener('submit', saveProfile);
    $('#quickProfile').addEventListener('click', () => setView('profile'));
  }

  async function renderCloud() {
    state.session = await store.getSession();
    const online = Boolean(state.session);
    $('#cloudStatus').classList.toggle('is-online', online);
    $('#cloudStatusText').textContent = online ? 'SYNC · CLOUD' : 'LOCAL · ONLY';
    $('#cloudIdentity').textContent = online ? state.session.user.email : '未登录 Supabase';
    $('#cloudLoginForm').hidden = online;
    $('#cloudSignedIn').hidden = !online;
  }

  async function cloudLogin(event) {
    event.preventDefault();
    const message = $('#cloudMessage');
    message.className = 'cloud-message';
    message.textContent = '正在连接…';
    try {
      state.session = await store.signIn($('#cloudEmail').value.trim(), $('#cloudPassword').value);
      message.classList.add('is-success');
      message.textContent = '云端登录成功。';
      await renderCloud();
      await pullCloud();
    } catch (error) {
      message.classList.add('is-error');
      message.textContent = error.message || '登录失败。';
    }
  }

  async function cloudLogout() {
    try {
      await store.signOut();
      state.session = null;
      await renderCloud();
      toast('已退出云端账号。');
    } catch (error) {
      toast(error.message || '退出失败。', 'error');
    }
  }

  async function pullCloud() {
    const message = $('#cloudMessage');
    try {
      const [projects, profile] = await Promise.all([
        store.pullProjects({ includeDraft: true }),
        store.pullProfile()
      ]);
      state.projects = projects.length ? projects : store.readProjects();
      state.profile = profile;
      renderProjects();
      renderOverview();
      renderProfileForm();
      message.className = 'cloud-message is-success';
      message.textContent = '已从云端拉取最新作品与个人信息。';
      toast('云端内容已拉取。');
    } catch (error) {
      message.className = 'cloud-message is-error';
      message.textContent = error.message || '云端拉取失败。';
    }
  }

  async function pushCloud() {
    const message = $('#cloudMessage');
    if (!state.session) return toast('请先登录 Supabase。', 'error');
    try {
      await store.replaceProjects(state.projects, { cloud: true });
      await store.saveProfile(state.profile, { cloud: true });
      message.className = 'cloud-message is-success';
      message.textContent = '本地作品与个人信息已推送到云端。';
      toast('已推送到云端。');
    } catch (error) {
      message.className = 'cloud-message is-error';
      message.textContent = error.message || '云端推送失败。';
    }
  }

  function setupCloud() {
    $('#cloudLoginForm').addEventListener('submit', cloudLogin);
    $('#cloudLogout').addEventListener('click', cloudLogout);
    $('#pullCloud').addEventListener('click', pullCloud);
    $('#pushCloud').addEventListener('click', pushCloud);
    $('#quickCloud').addEventListener('click', () => setView('cloud'));
  }

  function downloadJson() {
    const blob = new Blob([JSON.stringify(store.exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `flyun-studio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast('JSON 备份已导出。');
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        store.importData(JSON.parse(String(reader.result || '{}')));
        state.projects = store.readProjects();
        state.profile = store.readProfile();
        renderProjects();
        renderOverview();
        renderProfileForm();
        toast('备份已导入。');
      } catch (error) {
        toast(error.message || '导入失败。', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }

  function saveAccessCode(event) {
    event.preventDefault();
    const first = $('#newAccessCode').value;
    const second = $('#confirmAccessCode').value;
    if (first.length < 8) return toast('访问口令至少需要 8 位。', 'error');
    if (first !== second) return toast('两次输入的访问口令不一致。', 'error');
    localStorage.setItem(store.KEYS.access, first);
    $('#newAccessCode').value = '';
    $('#confirmAccessCode').value = '';
    toast('本机后台访问口令已更新。');
  }

  function resetLocalData() {
    if (!confirm('确定恢复默认作品和个人信息吗？该操作只重置当前浏览器的本地数据。')) return;
    store.replaceProjects(store.defaults.projects, { cloud: false });
    store.saveProfile(store.defaults.profile, { cloud: false });
    state.projects = store.readProjects();
    state.profile = store.readProfile();
    renderProjects();
    renderOverview();
    renderProfileForm();
    toast('本地数据已恢复默认。');
  }

  function setupSettings() {
    $('#exportData').addEventListener('click', downloadJson);
    $('#importData').addEventListener('change', importJson);
    $('#accessForm').addEventListener('submit', saveAccessCode);
    $('#resetLocal').addEventListener('click', resetLocalData);
  }

  async function loadAll() {
    state.projects = store.readProjects();
    state.profile = store.readProfile();
    renderOverview();
    renderProjects();
    renderProfileForm();
    await renderCloud();
    if (state.session) {
      try {
        const cloud = await store.pullProjects({ includeDraft: true });
        if (cloud.length) state.projects = cloud;
        state.profile = await store.pullProfile();
        renderOverview();
        renderProjects();
        renderProfileForm();
      } catch (error) {
        console.info('Cloud refresh skipped:', error.message);
      }
    }
  }

  function init() {
    setupLogin();
    setupNavigation();
    setupProjectTools();
    setupProfile();
    setupCloud();
    setupSettings();
    $('#refreshButton').addEventListener('click', loadAll);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
