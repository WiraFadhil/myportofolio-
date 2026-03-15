const SUPABASE_URL = "https://ptrvxeyyhgvzhxxnpwxs.supabase.co";
const SUPABASE_KEY = "sb_publishable_kLQhHsdVoONTb_AZ1Ep_Uw_0o3Si5Yx";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isAdmin = false;
let allCertificates = [];
let currentCertFilter = null;

window.onscroll = () => {
  const header = document.getElementById("main-header");
  if (window.scrollY > 40) {
    header.classList.add(
      "glass-nav",
      "py-3",
      "sm:py-4",
      "shadow-xl",
      "shadow-stone-900/5",
    );
    header.classList.remove("py-5", "sm:py-8");
  } else {
    header.classList.remove(
      "glass-nav",
      "py-3",
      "sm:py-4",
      "shadow-xl",
      "shadow-stone-900/5",
    );
    header.classList.add("py-5", "sm:py-8");
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
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
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
  const { data } = await supabaseClient
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  renderProjects(data || []);
}
async function fetchExperience() {
  const { data } = await supabaseClient
    .from("experience")
    .select("*")
    .order("created_at", { ascending: false });
  renderExperience(data || []);
}
async function fetchCertificates() {
  const { data } = await supabaseClient
    .from("certificates")
    .select("*")
    .order("created_at", { ascending: false });
  allCertificates = data || [];
  renderCertificates(allCertificates);
}
async function fetchMessages() {
  const { data } = await supabaseClient
    .from("messages")
    .select("*")
    .order("created_at", { ascending: false });
  renderMessagesAdmin(data || []);
}

function renderProjects(data) {
  const userGrid = document.getElementById("projects-list");
  const adminGrid = document.getElementById("admin-projects-grid");
  if (userGrid)
    userGrid.innerHTML = data.length
      ? ""
      : `<div class="col-span-full text-center text-stone-300 py-16 font-bold flex flex-col items-center gap-4"><i data-lucide="layout" class="w-12 h-12 opacity-20"></i> No projects deployed yet.</div>`;
  if (adminGrid) adminGrid.innerHTML = "";

  data.forEach((p, index) => {
    if (userGrid) {
      const card = document.createElement("div");
      card.className =
        "reveal glass-card rounded-[2.5rem] overflow-hidden group border border-stone-100 shadow-sm flex flex-col h-full";
      card.style.transitionDelay = `${index * 100}ms`;
      card.innerHTML = `
            <a href="${p.link}" target="_blank" class="img-container block overflow-hidden shrink-0 aspect-[16/10]">
                <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-700 lg:group-hover:scale-110" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'" />
            </a>
            <div class="p-6 sm:p-9 flex-grow flex flex-col gap-4">
                <div class="flex flex-wrap gap-2">
                    ${
                      p.tech
                        ? p.tech
                            .split(",")
                            .map(
                              (t) =>
                                `<span class="px-2.5 py-1 bg-stone-50 text-stone-500 text-[8px] sm:text-[9px] font-black uppercase rounded-lg tracking-wider border border-stone-100 shadow-sm">${t.trim()}</span>`,
                            )
                            .join("")
                        : ""
                    }
                </div>
                <div class="space-y-2">
                    <h4 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight leading-tight group-hover:text-orange-500 transition-colors">${p.title}</h4>
                    <p class="text-stone-400 text-xs sm:text-sm font-medium line-clamp-3 leading-relaxed">${p.description}</p>
                </div>
                <a href="${p.link}" target="_blank" class="flex items-center gap-2 text-stone-900 font-black text-[10px] uppercase tracking-widest group/link mt-auto pt-4 transition-all hover:text-orange-500">
                    Launch Project <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1"></i>
                </a>
            </div>`;
      userGrid.appendChild(card);
    }
    if (adminGrid) {
      const aCard = document.createElement("div");
      aCard.className =
        "glass-card p-4 rounded-2xl flex justify-between items-center border border-stone-100 shadow-sm";
      aCard.innerHTML = `
        <div class="flex items-center gap-3 overflow-hidden">
            <img src="${p.image}" class="w-10 h-10 rounded-lg object-cover shrink-0" />
            <h5 class="font-black text-[10px] text-stone-800 uppercase truncate">${p.title}</h5>
        </div>
        <button onclick="window.deleteData('projects', '${p.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all shrink-0"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
      adminGrid.appendChild(aCard);
    }
  });
  lucide.createIcons();
  initReveal();
}

function renderExperience(data) {
  const userList = document.getElementById("experience-list");
  const adminList = document.getElementById("admin-experience-list");
  if (userList)
    userList.innerHTML = data.length
      ? ""
      : `<p class="text-stone-300 font-bold italic py-10 px-8">No footprints found in the timeline yet.</p>`;
  if (adminList) adminList.innerHTML = "";

  data.forEach((exp, index) => {
    if (userList) {
      const card = document.createElement("div");
      card.className =
        "reveal glass-card p-6 sm:p-8 rounded-[2rem] border border-stone-100 flex flex-col gap-4 mb-4 relative z-10 ml-6 sm:ml-8 card-hover";
      card.style.transitionDelay = `${index * 150}ms`;
      card.innerHTML = `
        <div class="absolute -left-[35px] sm:-left-[45px] top-8 sm:top-10 w-5 h-5 sm:w-6 sm:h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg z-20 transition-transform group-hover:scale-125"></div>
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div class="shrink-0 w-12 h-12 bg-white border border-stone-100 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm"><i data-lucide="milestone" class="w-6 h-6"></i></div>
            <div class="space-y-1 flex-grow">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 class="text-lg sm:text-xl font-black text-stone-900 tracking-tight leading-none">${exp.title}</h4>
                    <span class="text-[8px] sm:text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 w-fit">${exp.period}</span>
                </div>
                <p class="text-stone-400 font-black text-[9px] sm:text-[10px] uppercase tracking-widest leading-none">${exp.company}</p>
            </div>
        </div>
        <p class="text-stone-50 text-xs sm:text-sm leading-relaxed font-medium pl-1 opacity-90">${exp.description}</p>`;
      userList.appendChild(card);
    }
    if (adminList) {
      const aItem = document.createElement("div");
      aItem.className =
        "glass-card p-4 sm:p-5 rounded-2xl flex justify-between items-center bg-white shadow-sm mb-4";
      aItem.innerHTML = `<div class="text-[10px] sm:text-xs font-black text-stone-900 uppercase tracking-tight truncate mr-4">${exp.title} | ${exp.company}</div><button onclick="window.deleteData('experience', '${exp.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl shrink-0 transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
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
      document.getElementById("active-issuer").innerText = currentCertFilter;
      const filtered = allCertificates.filter(
        (c) => c.issuer === currentCertFilter,
      );
      filtered.forEach((s, index) => {
        const card = document.createElement("div");
        card.className =
          "reveal glass-card p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-stone-100 flex flex-col gap-6 mb-4 relative overflow-hidden group shadow-sm";
        card.style.transitionDelay = `${index * 100}ms`;
        const isPdf = s.image && s.image.toLowerCase().endsWith(".pdf");
        card.innerHTML = `
                <div class="flex items-start gap-5 sm:gap-6">
                    <div class="shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-white border border-stone-100 rounded-2xl flex items-center justify-center ${isPdf ? "text-rose-500" : "text-emerald-600"} shadow-lg transition-transform group-hover:scale-110">
                        <i data-lucide="${isPdf ? "file-text" : "award"}" class="w-6 h-6 sm:w-8 sm:h-8"></i>
                    </div>
                    <div class="space-y-1 sm:space-y-2 flex-grow">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <h4 class="text-lg sm:text-2xl font-black text-stone-900 tracking-tight leading-none group-hover:text-emerald-600 transition-colors">${s.title}</h4>
                            <span class="text-[8px] sm:text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 w-fit">${s.date}</span>
                        </div>
                        <p class="text-stone-400 font-bold text-[9px] sm:text-[10px] uppercase tracking-widest leading-none">${isPdf ? "DOKUMEN PDF" : "GAMBAR SERTIFIKAT"}</p>
                    </div>
                </div>
                <p class="text-stone-500 text-xs sm:text-base leading-relaxed font-medium px-1 sm:px-2 opacity-90">${s.description || ""}</p>
                <div class="flex gap-4 px-1 sm:px-2">
                    ${
                      s.image
                        ? `
                        <a href="${s.image}" target="_blank" class="flex-grow flex items-center justify-center gap-3 py-4 bg-stone-900 text-white rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-xl hover:bg-emerald-600 transition-all active:scale-95">
                            <i data-lucide="external-link" class="w-3.5 h-3.5 sm:w-4 sm:h-4"></i> Lihat Dokumen
                        </a>
                    `
                        : `<div class="flex-grow py-4 bg-stone-100 text-stone-300 text-center text-[10px] font-black rounded-2xl">FILE TIDAK TERSEDIA</div>`
                    }
                </div>`;
        userList.appendChild(card);
      });
    } else {
      filterInfo.classList.add("hidden");
      const issuers = [...new Set(allCertificates.map((c) => c.issuer))];
      if (issuers.length === 0) {
        userList.innerHTML = `<div class="text-center text-stone-300 py-16 font-bold flex flex-col items-center gap-4"><i data-lucide="award" class="w-12 h-12 opacity-20"></i> No certifications recognized yet.</div>`;
      }
      issuers.forEach((issuer, index) => {
        const issuerCerts = allCertificates.filter((c) => c.issuer === issuer);
        const card = document.createElement("div");
        // Ditambahkan margin horizontal agar stack tidak overflow di mobile
        card.className =
          "reveal folder-stack glass-card p-5 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-stone-100 flex items-center justify-between mb-8 cursor-pointer group shadow-sm active:scale-[0.98] transition-all";
        card.style.transitionDelay = `${index * 100}ms`;
        card.onclick = () => filterByIssuer(issuer);
        card.innerHTML = `
                <div class="flex items-center gap-4 sm:gap-8 overflow-hidden flex-1">
                    <div class="w-12 h-12 sm:w-20 sm:h-20 bg-stone-900 rounded-2xl sm:rounded-[2rem] flex items-center justify-center text-white shrink-0 group-hover:rotate-6 transition-transform">
                        <i data-lucide="folder" class="w-6 h-6 sm:w-10 sm:h-10 text-orange-500"></i>
                    </div>
                    <div class="overflow-hidden">
                        <h4 class="text-lg sm:text-3xl font-black text-stone-900 tracking-tight mb-1 sm:mb-2 truncate pr-2">${issuer}</h4>
                        <div class="flex items-center gap-2">
                             <span class="px-2 sm:px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] sm:text-[10px] font-black uppercase rounded-lg border border-emerald-100">${issuerCerts.length} Dokumen</span>
                        </div>
                    </div>
                </div>
                <div class="w-9 h-9 sm:w-12 sm:h-12 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 shrink-0 group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all shadow-sm">
                    <i data-lucide="arrow-right" class="w-4 h-4 sm:w-5 sm:h-5"></i>
                </div>`;
        userList.appendChild(card);
      });
    }
  }

  if (adminList) {
    adminList.innerHTML = "";
    allCertificates.forEach((s) => {
      const aCard = document.createElement("div");
      aCard.className =
        "glass-card p-4 rounded-2xl flex justify-between items-center bg-white mb-3 shadow-sm border border-stone-50";
      aCard.innerHTML = `<div class="text-[10px] sm:text-[11px] font-black uppercase text-stone-900 truncate mr-2">${s.title.substring(0, 25)}... <span class="text-stone-300">@ ${s.issuer}</span></div><button onclick="window.deleteData('certificates', '${s.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl shrink-0 transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
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
      : `<div class="col-span-full text-center text-stone-300 py-12 italic font-bold">Your inbox is a quiet sanctuary.</div>`;
    data.forEach((m) => {
      const item = document.createElement("div");
      item.className =
        "glass-card p-6 sm:p-8 rounded-[2rem] border-l-[10px] border-orange-500 space-y-4 mb-4 shadow-sm";
      item.innerHTML = `
        <div class="flex justify-between items-start">
            <div class="overflow-hidden">
                <h5 class="font-black text-stone-900 text-lg sm:text-xl truncate leading-tight">${m.name}</h5>
                <p class="text-[10px] sm:text-xs text-stone-400 font-bold truncate tracking-wide">${m.email}</p>
            </div>
            <button onclick="window.deleteData('messages', '${m.id}')" class="text-rose-400 p-2.5 hover:bg-rose-50 rounded-xl transition-all shrink-0"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
        </div>
        <p class="bg-white/50 p-5 rounded-2xl text-stone-600 font-medium italic text-sm sm:text-base leading-relaxed">"${m.message}"</p>`;
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
  let imageUrl =
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop";

  try {
    if (file) {
      const fileName = `projects/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabaseClient.storage
        .from("projects")
        .upload(fileName, file);
      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabaseClient.storage.from("projects").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }
    const { error } = await supabaseClient.from("projects").insert([
      {
        title: document.getElementById("p-title").value,
        tech: document.getElementById("p-tech").value,
        image: imageUrl,
        link: document.getElementById("p-link").value,
        description: document.getElementById("p-desc").value,
      },
    ]);
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
      const { error: uploadError } = await supabaseClient.storage
        .from("projects")
        .upload(fileName, file);
      if (!uploadError) {
        const {
          data: { publicUrl },
        } = supabaseClient.storage.from("projects").getPublicUrl(fileName);
        imageUrl = publicUrl;
      }
    }
    const { error } = await supabaseClient.from("certificates").insert([
      {
        title: document.getElementById("s-title").value,
        issuer: document.getElementById("s-issuer").value,
        date: document.getElementById("s-date").value,
        description: document.getElementById("s-description").value,
        image: imageUrl,
      },
    ]);
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
  const { error } = await supabaseClient.from("experience").insert([
    {
      title: document.getElementById("e-title").value,
      company: document.getElementById("e-company").value,
      period: document.getElementById("e-period").value,
      description: document.getElementById("e-description").value,
    },
  ]);
  if (!error) {
    showNotification("History Saved!");
    e.target.reset();
    toggleModal("exp-modal", false);
    refreshAllData();
  }
};

document.getElementById("contact-form").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient.from("messages").insert([
    {
      name: document.getElementById("c-name").value,
      email: document.getElementById("c-email").value,
      message: document.getElementById("c-message").value,
    },
  ]);
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
  document
    .querySelectorAll(".admin-tab-content")
    .forEach((c) => c.classList.add("hidden"));
  document
    .querySelectorAll(".admin-tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(`admin-tab-${tab}`).classList.remove("hidden");
  const tabBtns = document.querySelectorAll(
    `[onclick*="switchAdminTab('${tab}')"]`,
  );
  tabBtns.forEach((btn) => btn.classList.add("active"));
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
  document.getElementById("notif-icon").className = isError
    ? "text-rose-500"
    : "text-orange-500";
  n.classList.remove("translate-x-[200%]");
  setTimeout(() => n.classList.add("translate-x-[200%]"), 4000);
}

function initReveal() {
  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add("active");
      });
    },
    { threshold: 0.05 },
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
}

window.onload = () => {
  refreshAllData();
  lucide.createIcons();
  initReveal();
};
