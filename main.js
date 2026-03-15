const SUPABASE_URL = "https://ptrvxeyyhgvzhxxnpwxs.supabase.co";
const SUPABASE_KEY = "sb_publishable_kLQhHsdVoONTb_AZ1Ep_Uw_0o3Si5Yx";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isAdmin = false;

window.onscroll = () => {
  const header = document.getElementById("main-header");
  if (window.scrollY > 40) {
    header.classList.add("glass-nav", "py-4");
    header.classList.remove("py-8");
  } else {
    header.classList.remove("glass-nav", "py-4");
    header.classList.add("py-8");
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
  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    showNotification("Access Denied: " + error.message, true);
    btn.innerText = "RETRY LOGIN";
  } else {
    isAdmin = true;
    closeAdminLogin();
    toggleAdmin(true);
    showNotification("Supabase Connected, Welcome Wira!");
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
  renderCertificates(data || []);
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
      : `<p class="col-span-full text-center text-stone-300 py-20 font-bold text-lg">No visions deployed yet.</p>`;
  if (adminGrid) adminGrid.innerHTML = "";

  data.forEach((p, index) => {
    if (userGrid) {
      const card = document.createElement("div");
      card.className =
        "reveal card-hover glass-card rounded-[2.5rem] overflow-hidden group border border-stone-100 shadow-sm mb-4";
      card.style.transitionDelay = `${index * 100}ms`;

      const linkAttr = p.link
        ? `href="${p.link}" target="_blank" rel="noopener noreferrer"`
        : 'href="javascript:void(0)"';

      card.innerHTML = `
                    <div class="flex flex-col h-full">
                        <a ${linkAttr} class="img-container block group-hover:opacity-90 transition-opacity">
                            <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'" />
                            <div class="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span class="bg-white text-stone-900 px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest translate-y-4 group-hover:translate-y-0 transition-transform">View Demo</span>
                            </div>
                        </a>
                        <div class="p-9 flex-grow flex flex-col gap-5">
                            <div class="flex flex-wrap gap-2.5">
                                ${
                                  p.tech
                                    ? p.tech
                                        .split(",")
                                        .map(
                                          (t) =>
                                            `<span class="px-3 py-1 bg-stone-50 text-stone-500 text-[9px] font-black uppercase rounded-lg tracking-[0.2em] border border-stone-100">${t.trim()}</span>`,
                                        )
                                        .join("")
                                    : ""
                                }
                            </div>
                            <div class="space-y-3 flex-grow">
                                <a ${linkAttr} class="block">
                                    <h4 class="text-2xl font-black text-stone-900 tracking-tight leading-tight group-hover:text-orange-500 transition-colors">${p.title}</h4>
                                </a>
                                <p class="text-stone-400 text-sm leading-relaxed font-medium line-clamp-3">${p.description || ""}</p>
                            </div>
                            <a ${linkAttr} class="flex items-center gap-2 text-stone-900 font-black text-[10px] uppercase tracking-widest group/link mt-2">
                                Launch Project 
                                <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1"></i>
                            </a>
                        </div>
                    </div>`;
      userGrid.appendChild(card);
    }
    if (adminGrid) {
      const aCard = document.createElement("div");
      aCard.className =
        "glass-card p-5 rounded-2xl flex justify-between items-center border border-stone-100 shadow-sm mb-4";
      aCard.innerHTML = `
                    <div class="flex items-center gap-4">
                        <img src="${p.image}" class="w-12 h-12 rounded-xl object-cover" />
                        <div>
                            <h5 class="font-black text-[11px] text-stone-800 uppercase tracking-tight line-clamp-1">${p.title}</h5>
                            ${p.link ? `<span class="text-[9px] text-blue-500 font-bold underline truncate block max-w-[120px]">${p.link}</span>` : '<span class="text-[9px] text-stone-300 font-bold">No link</span>'}
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="window.deleteData('projects', '${p.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>`;
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
      : `<p class="text-stone-300 font-bold italic py-10">Waiting for first footprint...</p>`;
  if (adminList) adminList.innerHTML = "";

  data.forEach((exp, index) => {
    if (userList) {
      const card = document.createElement("div");
      card.className =
        "reveal glass-card p-8 rounded-[2.5rem] border border-stone-100 flex flex-col gap-4 card-hover mb-4";
      card.style.transitionDelay = `${index * 150}ms`;
      card.innerHTML = `<div class="flex items-start gap-6"><div class="shrink-0 w-14 h-14 bg-white border border-stone-100 rounded-2xl flex items-center justify-center text-blue-500 shadow-lg shadow-blue-500/5"><i data-lucide="milestone" class="w-6 h-6"></i></div><div class="space-y-2 flex-grow"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><h4 class="text-2xl font-black text-stone-900 tracking-tight leading-none">${exp.title}</h4><span class="text-[10px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full border border-blue-100 inline-block w-fit">${exp.period}</span></div><p class="text-stone-400 font-black text-xs uppercase tracking-widest leading-none">${exp.company}</p></div></div><p class="text-stone-500 text-base leading-relaxed font-medium pl-2">${exp.description || "No description"}</p>`;
      userList.appendChild(card);
    }
    if (adminList) {
      const aItem = document.createElement("div");
      aItem.className =
        "glass-card p-5 rounded-2xl flex justify-between items-center bg-white shadow-sm mb-4";
      aItem.innerHTML = `<div class="text-xs font-black text-stone-900 uppercase tracking-tight">${exp.title} <span class="text-stone-300 mx-2">|</span> ${exp.company}</div><button onclick="window.deleteData('experience', '${exp.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
      adminList.appendChild(aItem);
    }
  });
  lucide.createIcons();
  initReveal();
}

function renderCertificates(data) {
  const userList = document.getElementById("certificates-list");
  const adminList = document.getElementById("admin-certificates-list");
  if (userList)
    userList.innerHTML = data.length
      ? ""
      : `<p class="text-stone-300 font-bold italic py-10">Recognition pending.</p>`;
  if (adminList) adminList.innerHTML = "";

  data.forEach((s, index) => {
    if (userList) {
      const card = document.createElement("div");
      card.className =
        "reveal glass-card p-8 rounded-[2.5rem] border border-stone-100 flex flex-col gap-4 card-hover mb-4";
      card.style.transitionDelay = `${index * 100}ms`;
      card.innerHTML = `<div class="flex items-start gap-6"><div class="shrink-0 w-14 h-14 bg-white border border-stone-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-lg shadow-emerald-500/5"><i data-lucide="award" class="w-6 h-6"></i></div><div class="space-y-2 flex-grow"><div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"><h4 class="text-2xl font-black text-stone-900 tracking-tight leading-none">${s.title}</h4><span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 inline-block w-fit">${s.date}</span></div><p class="text-stone-400 font-black text-xs uppercase tracking-widest leading-none">${s.issuer}</p></div></div><p class="text-stone-500 text-base leading-relaxed font-medium pl-2">${s.description || "No description"}</p>`;
      userList.appendChild(card);
    }
    if (adminList) {
      const aCard = document.createElement("div");
      aCard.className =
        "glass-card p-5 rounded-2xl flex justify-between items-center bg-white shadow-sm mb-4";
      aCard.innerHTML = `<div class="text-[11px] font-black uppercase text-stone-900">${s.title.substring(0, 30)}...</div><button onclick="window.deleteData('certificates', '${s.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
      adminList.appendChild(aCard);
    }
  });
  lucide.createIcons();
  initReveal();
}

function renderMessagesAdmin(data) {
  const list = document.getElementById("admin-messages-list");
  if (list) {
    list.innerHTML = data.length
      ? ""
      : `<p class="text-stone-300 font-bold text-xs p-6 italic">Inbox empty.</p>`;
    data.forEach((m) => {
      const item = document.createElement("div");
      item.className =
        "glass-card p-8 rounded-[2.5rem] border-l-[10px] border-orange-500 space-y-4 mb-4";
      item.innerHTML = `<div class="flex justify-between items-start"><div><h5 class="font-black text-stone-900 text-lg">${m.name}</h5><p class="text-xs text-stone-400 font-bold">${m.email}</p></div><button onclick="window.deleteData('messages', '${m.id}')" class="text-rose-400 p-2.5 hover:bg-rose-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-5 h-5"></i></button></div><p class="bg-white/50 p-6 rounded-2xl text-stone-600 font-medium italic text-sm">"${m.message}"</p>`;
      list.appendChild(item);
    });
  }
  lucide.createIcons();
}

window.deleteData = async (table, id) => {
  if (!confirm("Hapus data ini selamanya dari " + table + "?")) return;
  try {
    const { error } = await supabaseClient.from(table).delete().eq("id", id);
    if (error) throw error;
    showNotification("Data Removed!");
    refreshAllData();
  } catch (err) {
    console.error("Delete Fail:", err);
    showNotification("Error: " + err.message, true);
  }
};

// NEW: Upload Logic for Projects
document.getElementById("project-form").onsubmit = async (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById("p-submit-btn");
  submitBtn.innerText = "UPLOADING...";
  submitBtn.disabled = true;

  const fileInput = document.getElementById("p-file");
  const file = fileInput.files[0];
  let imageUrl =
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop"; // Default

  try {
    if (file) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabaseClient.storage
        .from("projects")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("projects").getPublicUrl(filePath);

      imageUrl = publicUrl;
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

    if (error) throw error;

    showNotification("Vision Deployed Successfully!");
    e.target.reset();
    toggleModal("project-modal", false);
    refreshAllData();
  } catch (err) {
    console.error("Project Save Error:", err);
    showNotification("Save Failed: " + err.message, true);
  } finally {
    submitBtn.innerText = "Save Project";
    submitBtn.disabled = false;
  }
};

document.getElementById("exp-form").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient
    .from("experience")
    .insert([
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
document.getElementById("cert-form").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient
    .from("certificates")
    .insert([
      {
        title: document.getElementById("s-title").value,
        issuer: document.getElementById("s-issuer").value,
        date: document.getElementById("s-date").value,
        description: document.getElementById("s-description").value,
      },
    ]);
  if (!error) {
    showNotification("Award Saved!");
    e.target.reset();
    toggleModal("cert-modal", false);
    refreshAllData();
  }
};
document.getElementById("contact-form").onsubmit = async (e) => {
  e.preventDefault();
  const { error } = await supabaseClient
    .from("messages")
    .insert([
      {
        name: document.getElementById("c-name").value,
        email: document.getElementById("c-email").value,
        message: document.getElementById("c-message").value,
      },
    ]);
  if (!error) {
    showNotification("Vision Sent!");
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
  document.getElementById(`btn-tab-${tab}`).classList.add("active");
  lucide.createIcons();
};
window.toggleModal = (id, show) => {
  document.getElementById(id).classList.toggle("hidden", !show);
  document.getElementById(id).classList.toggle("flex", show);
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
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
}

window.onload = () => {
  refreshAllData();
  lucide.createIcons();
  initReveal();
};
