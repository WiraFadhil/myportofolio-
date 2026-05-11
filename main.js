const SUPABASE_URL = "https://ptrvxeyyhgvzhxxnpwxs.supabase.co";
const SUPABASE_KEY = "sb_publishable_kLQhHsdVoONTb_AZ1Ep_Uw_0o3Si5Yx";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isAdmin = false;
let allCertificates = [];
let currentCertFilter = null;

window.onscroll = () => {
  const header = document.getElementById("main-header");
  if (window.scrollY > 40) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
};

const toggleMobileMenu = () =>
  document.getElementById("mobile-menu").classList.toggle("hidden");
document.getElementById("mobile-menu-btn").onclick = toggleMobileMenu;

const loginForm = document.getElementById("login-form");
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-pass").value;
  const btn = document.getElementById("login-btn");
  btn.innerText = "AUTHENTICATING...";
  btn.disabled = true;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) {
    showNotification("Access Denied: " + error.message, true);
    btn.innerText = "RETRY";
    btn.disabled = false;
  } else {
    isAdmin = true;
    closeAdminLogin();
    toggleAdmin(true);
    showNotification("Welcome back, Wira!");
    refreshAllData();
  }
};

async function handleLogout() {
  await supabaseClient.auth.signOut();
  isAdmin = false;
  toggleAdmin(false);
  showNotification("Signed out.");
}

async function refreshAllData() {
  fetchProjects();
  fetchExperience();
  fetchCertificates();
  if (isAdmin) fetchMessages();
}

async function fetchProjects() {
  const { data } = await supabaseClient.from("projects").select("*").order("created_at", { ascending: false });
  renderProjects(data || []);
}
async function fetchExperience() {
  const { data } = await supabaseClient.from("experience").select("*").order("created_at", { ascending: false });
  renderExperience(data || []);
}
async function fetchCertificates() {
  const { data } = await supabaseClient.from("certificates").select("*").order("created_at", { ascending: false });
  allCertificates = data || [];
  renderCertificates(allCertificates);
}
async function fetchMessages() {
  const { data } = await supabaseClient.from("messages").select("*").order("created_at", { ascending: false });
  renderMessagesAdmin(data || []);
}

function renderProjects(data) {
  const userGrid = document.getElementById("projects-list");
  const adminGrid = document.getElementById("admin-projects-grid");

  if (userGrid) {
    userGrid.innerHTML = data.length
      ? ""
      : `<div class="col-span-full text-center py-16 flex flex-col items-center gap-4">
           <i data-lucide="layout" class="w-10 h-10 opacity-10 text-white"></i>
           <p class="font-mono text-[11px] uppercase tracking-widest text-white/20">No projects deployed yet.</p>
         </div>`;
  }
  if (adminGrid) adminGrid.innerHTML = "";

  data.forEach((p, index) => {
    if (userGrid) {
      const card = document.createElement("div");
      card.className = "project-card reveal";
      card.style.transitionDelay = `${index * 100}ms`;
      card.innerHTML = `
        <a href="${p.link}" target="_blank" class="img-wrap block">
          <img src="${p.image}" alt="${p.title}"
            onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'" />
        </a>
        <div class="card-body">
          <div class="flex flex-wrap gap-2">
            ${p.tech ? p.tech.split(",").map(t => `<span class="tech-tag">${t.trim()}</span>`).join("") : ""}
          </div>
          <div>
            <h4 class="project-title">${p.title}</h4>
            <p class="project-desc mt-2">${p.description}</p>
          </div>
          <a href="${p.link}" target="_blank" class="project-link">
            Launch Project
            <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </a>
        </div>`;
      userGrid.appendChild(card);
    }

    if (adminGrid) {
      const aCard = document.createElement("div");
      aCard.className = "admin-card";
      aCard.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden">
          <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover shrink-0 border border-white/10"
            onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=100'" />
          <h5 class="font-mono text-[10px] text-white/70 uppercase tracking-wider truncate">${p.title}</h5>
        </div>
        <button onclick="window.deleteData('projects', '${p.id}')" class="p-2 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all shrink-0">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>`;
      adminGrid.appendChild(aCard);
    }
  });

  lucide.createIcons();
  initReveal();
}

function renderExperience(data) {
  const userList = document.getElementById("experience-list");
  const adminList = document.getElementById("admin-experience-list");

  if (userList) {
    userList.innerHTML = data.length
      ? ""
      : `<p class="font-mono text-[11px] uppercase tracking-widest text-white/20 py-10">No timeline entries yet.</p>`;
  }
  if (adminList) adminList.innerHTML = "";

  data.forEach((exp, index) => {
    if (userList) {
      const card = document.createElement("div");
      card.className = "exp-card reveal";
      card.style.transitionDelay = `${index * 150}ms`;
      card.innerHTML = `
        <div class="exp-dot"></div>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 class="font-display text-lg font-bold text-white leading-tight">${exp.title}</h4>
            <p class="font-mono text-[10px] uppercase tracking-widest text-blue-400/70 mt-1">${exp.company}</p>
          </div>
          <span class="font-mono text-[9px] uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full w-fit shrink-0">${exp.period}</span>
        </div>
        <p class="text-white/40 text-sm leading-relaxed">${exp.description}</p>`;
      userList.appendChild(card);
    }

    if (adminList) {
      const aItem = document.createElement("div");
      aItem.className = "admin-card";
      aItem.innerHTML = `
        <div class="font-mono text-[10px] uppercase tracking-tight text-white/60 truncate mr-4">${exp.title} <span class="text-white/25">|</span> ${exp.company}</div>
        <button onclick="window.deleteData('experience', '${exp.id}')" class="p-2 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl shrink-0 transition-all">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>`;
      adminList.appendChild(aItem);
    }
  });

  lucide.createIcons();
  initReveal();
}

function renderCertificates(data) {
  const userList = document.getElementById("certificates-list");
  const adminList = document.getElementById("admin-certificates-list");
  const filterInfo = document.getElementById("certs-filter-info");

  if (userList) {
    userList.innerHTML = "";

    if (currentCertFilter) {
      filterInfo.classList.remove("hidden");
      filterInfo.classList.add("flex");
      document.getElementById("active-issuer").innerText = currentCertFilter;
      const filtered = allCertificates.filter(c => c.issuer === currentCertFilter);

      filtered.forEach((s, index) => {
        const card = document.createElement("div");
        card.className = "cert-detail-card reveal";
        card.style.transitionDelay = `${index * 100}ms`;
        const isPdf = s.image && s.image.toLowerCase().endsWith(".pdf");
        card.innerHTML = `
          <div class="flex items-start gap-5 mb-4">
            <div class="w-12 h-12 ${isPdf ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'} rounded-xl flex items-center justify-center shrink-0">
              <i data-lucide="${isPdf ? 'file-text' : 'award'}" class="w-6 h-6"></i>
            </div>
            <div class="flex-grow">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 class="font-display text-lg font-bold text-white leading-tight">${s.title}</h4>
                <span class="font-mono text-[9px] uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit">${s.date}</span>
              </div>
              <p class="font-mono text-[9px] uppercase tracking-widest text-white/25 mt-1">${isPdf ? 'PDF Document' : 'Certificate Image'}</p>
            </div>
          </div>
          <p class="text-white/40 text-sm leading-relaxed mb-5">${s.description || ""}</p>
          ${s.image
            ? `<a href="${s.image}" target="_blank" class="flex items-center justify-center gap-2 py-3.5 bg-white/5 hover:bg-[#e8ff47] hover:text-black text-white/60 rounded-xl font-mono text-[10px] uppercase tracking-widest transition-all border border-white/08">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Lihat Dokumen
               </a>`
            : `<div class="py-3.5 text-center font-mono text-[10px] uppercase tracking-widest text-white/20 bg-white/3 rounded-xl border border-white/05">File tidak tersedia</div>`
          }`;
        userList.appendChild(card);
      });

    } else {
      filterInfo.classList.add("hidden");
      filterInfo.classList.remove("flex");
      const issuers = [...new Set(allCertificates.map(c => c.issuer))];

      if (issuers.length === 0) {
        userList.innerHTML = `<div class="text-center py-16 flex flex-col items-center gap-4">
          <i data-lucide="award" class="w-10 h-10 opacity-10 text-white"></i>
          <p class="font-mono text-[11px] uppercase tracking-widest text-white/20">No certifications yet.</p>
        </div>`;
      }

      issuers.forEach((issuer, index) => {
        const issuerCerts = allCertificates.filter(c => c.issuer === issuer);
        const card = document.createElement("div");
        card.className = "cert-folder reveal";
        card.style.transitionDelay = `${index * 100}ms`;
        card.onclick = () => filterByIssuer(issuer);
        card.innerHTML = `
          <div class="flex items-center gap-5 overflow-hidden flex-1">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-white/5 rounded-2xl flex items-center justify-center text-[#e8ff47] shrink-0 transition-transform group-hover:rotate-6">
              <i data-lucide="folder" class="w-6 h-6"></i>
            </div>
            <div class="overflow-hidden">
              <h4 class="font-display text-xl font-bold text-white truncate pr-4">${issuer}</h4>
              <span class="font-mono text-[9px] uppercase tracking-widest text-emerald-400/60 mt-1 block">${issuerCerts.length} dokumen</span>
            </div>
          </div>
          <div class="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/30 shrink-0 transition-all group-hover:bg-[#e8ff47] group-hover:text-black group-hover:border-[#e8ff47]">
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </div>`;
        userList.appendChild(card);
      });
    }
  }

  if (adminList) {
    adminList.innerHTML = "";
    allCertificates.forEach(s => {
      const aCard = document.createElement("div");
      aCard.className = "admin-card";
      aCard.innerHTML = `
        <div class="font-mono text-[10px] uppercase text-white/60 truncate mr-2">
          ${s.title.substring(0, 22)}...
          <span class="text-white/25">@ ${s.issuer}</span>
        </div>
        <button onclick="window.deleteData('certificates', '${s.id}')" class="p-2 text-rose-500/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl shrink-0 transition-all">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>`;
      adminList.appendChild(aCard);
    });
  }

  lucide.createIcons();
  initReveal();
}

function filterByIssuer(issuer) {
  currentCertFilter = issuer;
  renderCertificates(allCertificates);
  document.getElementById("certs-title").scrollIntoView({ behavior: "smooth" });
}

function clearCertFilter() {
  currentCertFilter = null;
  renderCertificates(allCertificates);
  document.getElementById("certs-title").scrollIntoView({ behavior: "smooth" });
}

function renderMessagesAdmin(data) {
  const list = document.getElementById("admin-messages-list");
  if (list) {
    list.innerHTML = data.length
      ? ""
      : `<div class="col-span-full text-center py-12 font-mono text-[11px] uppercase tracking-widest text-white/20">Inbox is empty.</div>`;
    data.forEach(m => {
      const item = document.createElement("div");
      item.className = "bg-[#111] border border-white/07 border-l-4 border-l-[#e8ff47] rounded-2xl p-6 space-y-4";
      item.innerHTML = `
        <div class="flex justify-between items-start">
          <div class="overflow-hidden">
            <h5 class="font-display font-bold text-white text-lg truncate leading-tight">${m.name}</h5>
            <p class="font-mono text-[10px] text-white/30 truncate mt-1">${m.email}</p>
          </div>
          <button onclick="window.deleteData('messages', '${m.id}')" class="text-rose-500/50 p-2 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all shrink-0">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
        <p class="bg-white/03 border border-white/05 p-4 rounded-xl text-white/50 text-sm leading-relaxed italic">"${m.message}"</p>`;
      list.appendChild(item);
    });
  }
  lucide.createIcons();
}

window.deleteData = async (table, id) => {
  if (!confirm("Hapus data selamanya?")) return;
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if (!error) {
    showNotification("Removed successfully!");
    refreshAllData();
  } else {
    showNotification("Error: " + error.message, true);
  }
};

document.getElementById("project-form").onsubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("p-submit-btn");
  btn.innerText = "UPLOADING...";
  btn.disabled = true;
  const file = document.getElementById("p-file").files[0];
  let imageUrl = "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";
  try {
    if (file) {
      const fileName = `projects/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from("projects").upload(fileName, file);
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient.storage.from("projects").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }
    const { error } = await supabaseClient.from("projects").insert([{
      title: document.getElementById("p-title").value,
      tech: document.getElementById("p-tech").value,
      image: imageUrl,
      link: document.getElementById("p-link").value,
      description: document.getElementById("p-desc").value,
    }]);
    if (!error) {
      showNotification("Project Deployed!");
      e.target.reset();
      toggleModal("project-modal", false);
      refreshAllData();
    }
  } finally {
    btn.innerText = "Save Project";
    btn.disabled = false;
  }
};

document.getElementById("cert-form").onsubmit = async (e) => {
  e.preventDefault();
  const btn = document.getElementById("s-submit-btn");
  btn.innerText = "SAVING...";
  btn.disabled = true;
  const file = document.getElementById("s-file").files[0];
  let imageUrl = null;
  try {
    if (file) {
      const fileName = `certs/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabaseClient.storage.from("projects").upload(fileName, file);
      if (!uploadError) {
        const { data: { publicUrl } } = supabaseClient.storage.from("projects").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }
    const { error } = await supabaseClient.from("certificates").insert([{
      title: document.getElementById("s-title").value,
      issuer: document.getElementById("s-issuer").value,
      date: document.getElementById("s-date").value,
      description: document.getElementById("s-description").value,
      image: imageUrl,
    }]);
    if (!error) {
      showNotification("Recognition Saved!");
      e.target.reset();
      toggleModal("cert-modal", false);
      refreshAllData();
    }
  } finally {
    btn.innerText = "Save Award";
    btn.disabled = false;
  }
};

document.getElementById("exp-form").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient.from("experience").insert([{
    title: document.getElementById("e-title").value,
    company: document.getElementById("e-company").value,
    period: document.getElementById("e-period").value,
    description: document.getElementById("e-description").value,
  }]);
  if (!error) {
    showNotification("History Saved!");
    e.target.reset();
    toggleModal("exp-modal", false);
    refreshAllData();
  }
};

document.getElementById("contact-form").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient.from("messages").insert([{
    name: document.getElementById("c-name").value,
    email: document.getElementById("c-email").value,
    message: document.getElementById("c-message").value,
  }]);
  if (!error) {
    showNotification("Vision Sent Successfully!");
    e.target.reset();
  }
};

window.openAdminLogin = () =>
  document.getElementById("admin-login-overlay").classList.add("active");
window.closeAdminLogin = () =>
  document.getElementById("admin-login-overlay").classList.remove("active");
window.toggleAdmin = (show) => {
  document.getElementById("user-view").style.display = show ? "none" : "block";
  document.getElementById("admin-view").classList.toggle("active", show);
  window.scrollTo(0, 0);
  lucide.createIcons();
};
window.switchAdminTab = (tab) => {
  document.querySelectorAll(".admin-tab-content").forEach(c => c.classList.add("hidden"));
  document.querySelectorAll(".admin-tab-btn").forEach(b => b.classList.remove("active"));
  document.getElementById(`admin-tab-${tab}`).classList.remove("hidden");
  document.querySelectorAll(`[onclick*="switchAdminTab('${tab}')"]`).forEach(btn => btn.classList.add("active"));
  lucide.createIcons();
};
window.toggleModal = (id, show) => {
  const el = document.getElementById(id);
  el.classList.toggle("hidden", !show);
  el.classList.toggle("flex", show);
};

function showNotification(text, isError = false) {
  const n = document.getElementById("notif-bar");
  document.getElementById("notif-msg").innerText = text;
  document.getElementById("notif-icon").className = isError ? "text-rose-400" : "text-[#e8ff47]";
  n.classList.remove("translate-x-[200%]");
  setTimeout(() => n.classList.add("translate-x-[200%]"), 4000);
}

function initReveal() {
  const obs = new IntersectionObserver(
    entries => entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("active"); }),
    { threshold: 0.05 }
  );
  document.querySelectorAll(".reveal").forEach(el => obs.observe(el));
}

window.onload = () => {
  refreshAllData();
  lucide.createIcons();
  initReveal();
};