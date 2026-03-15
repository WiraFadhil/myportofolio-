const SUPABASE_URL = "https://ptrvxeyyhgvzhxxnpwxs.supabase.co";
const SUPABASE_KEY = "sb_publishable_kLQhHsdVoONTb_AZ1Ep_Uw_0o3Si5Yx";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let isAdmin = false;
let allCertificates = [];
let currentCertFilter = null;

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
    btn.innerText = "RETRY";
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
      : `<p class="col-span-full text-center text-stone-300 py-20 font-bold">No visions deployed yet.</p>`;
  if (adminGrid) adminGrid.innerHTML = "";

  data.forEach((p, index) => {
    if (userGrid) {
      const card = document.createElement("div");
      card.className =
        "reveal card-hover glass-card rounded-[2.5rem] overflow-hidden group border border-stone-100 shadow-sm mb-4";
      card.style.transitionDelay = `${index * 100}ms`;
      card.innerHTML = `
        <div class="flex flex-col h-full">
            <a href="${p.link}" target="_blank" class="img-container block overflow-hidden">
                <img src="${p.image}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onerror="this.src='https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop'" />
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
                <div class="space-y-3">
                    <h4 class="text-2xl font-black text-stone-900 tracking-tight leading-tight">${p.title}</h4>
                    <p class="text-stone-400 text-sm font-medium line-clamp-3">${p.description}</p>
                </div>
                <a href="${p.link}" target="_blank" class="flex items-center gap-2 text-stone-900 font-black text-[10px] uppercase tracking-widest group/link mt-auto pt-4">
                    Launch Project <i data-lucide="arrow-right" class="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1"></i>
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
            <h5 class="font-black text-[11px] text-stone-800 uppercase line-clamp-1">${p.title}</h5>
        </div>
        <button onclick="window.deleteData('projects', '${p.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
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
        "reveal glass-card p-7 rounded-[2rem] border border-stone-100 flex flex-col gap-4 card-hover mb-4 relative z-10 ml-8";
      card.style.transitionDelay = `${index * 150}ms`;
      card.innerHTML = `
        <div class="absolute -left-[44px] top-8 w-6 h-6 bg-white border-4 border-blue-500 rounded-full shadow-lg z-20"></div>
        <div class="flex items-start gap-6">
            <div class="shrink-0 w-12 h-12 bg-white border border-stone-100 rounded-xl flex items-center justify-center text-blue-500 shadow-sm"><i data-lucide="milestone" class="w-5 h-5"></i></div>
            <div class="space-y-1 flex-grow">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 class="text-xl font-black text-stone-900 tracking-tight leading-none">${exp.title}</h4>
                    <span class="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100 w-fit">${exp.period}</span>
                </div>
                <p class="text-stone-400 font-black text-[10px] uppercase tracking-widest leading-none">${exp.company}</p>
            </div>
        </div>
        <p class="text-stone-500 text-sm leading-relaxed font-medium pl-1 opacity-80">${exp.description}</p>`;
      userList.appendChild(card);
    }
    if (adminList) {
      const aItem = document.createElement("div");
      aItem.className =
        "glass-card p-5 rounded-2xl flex justify-between items-center bg-white shadow-sm mb-4";
      aItem.innerHTML = `<div class="text-xs font-black text-stone-900 uppercase tracking-tight">${exp.title} | ${exp.company}</div><button onclick="window.deleteData('experience', '${exp.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
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
          "reveal glass-card p-8 rounded-[2.5rem] border border-stone-100 flex flex-col gap-6 card-hover mb-4 relative overflow-hidden group";
        card.style.transitionDelay = `${index * 100}ms`;

        const isPdf = s.image && s.image.toLowerCase().endsWith(".pdf");

        card.innerHTML = `
                <div class="flex items-start gap-6">
                    <div class="shrink-0 w-16 h-16 bg-white border border-stone-100 rounded-2xl flex items-center justify-center ${isPdf ? "text-rose-500" : "text-emerald-600"} shadow-lg transition-transform group-hover:scale-110">
                        <i data-lucide="${isPdf ? "file-text" : "award"}" class="w-8 h-8"></i>
                    </div>
                    <div class="space-y-2 flex-grow">
                        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h4 class="text-2xl font-black text-stone-900 tracking-tight leading-none group-hover:text-emerald-600 transition-colors">${s.title}</h4>
                            <span class="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-4 py-1.5 rounded-full border border-emerald-100 inline-block w-fit">${s.date}</span>
                        </div>
                        <p class="text-stone-400 font-bold text-xs uppercase tracking-widest leading-none">${isPdf ? "PDF DOCUMENT" : "CERTIFICATE IMAGE"}</p>
                    </div>
                </div>
                <p class="text-stone-500 text-base leading-relaxed font-medium px-2">${s.description || "Tidak ada deskripsi tambahan."}</p>
                
                <div class="flex gap-4 px-2">
                    ${
                      s.image
                        ? `
                        <a href="${s.image}" target="_blank" class="flex-grow flex items-center justify-center gap-3 py-4 bg-stone-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl active:scale-95">
                            <i data-lucide="external-link" class="w-4 h-4"></i> Lihat Dokumen Asli
                        </a>
                    `
                        : `
                        <div class="flex-grow py-4 bg-stone-100 text-stone-400 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center">
                            File Tidak Tersedia
                        </div>
                    `
                    }
                </div>
              `;
        userList.appendChild(card);
      });
    } else {
      filterInfo.classList.add("hidden");
      const issuers = [...new Set(allCertificates.map((c) => c.issuer))];

      if (issuers.length === 0) {
        userList.innerHTML = `<p class="text-stone-300 font-bold italic py-10">Belum ada pengakuan yang terdaftar.</p>`;
      }

      issuers.forEach((issuer, index) => {
        const issuerCerts = allCertificates.filter((c) => c.issuer === issuer);
        const card = document.createElement("div");
        card.className =
          "reveal folder-stack glass-card p-10 rounded-[2.5rem] border border-stone-100 flex items-center justify-between card-hover mb-8 cursor-pointer group";
        card.style.transitionDelay = `${index * 100}ms`;
        card.onclick = () => filterByIssuer(issuer);

        card.innerHTML = `
                <div class="flex items-center gap-8">
                    <div class="w-20 h-20 bg-stone-900 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-transform group-hover:rotate-6">
                        <i data-lucide="folder" class="w-10 h-10 text-orange-500"></i>
                    </div>
                    <div>
                        <h4 class="text-3xl font-black text-stone-900 tracking-tight mb-2">${issuer}</h4>
                        <div class="flex items-center gap-2">
                             <span class="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">
                                ${issuerCerts.length} Dokumen Tersedia
                             </span>
                        </div>
                    </div>
                </div>
                <div class="w-12 h-12 rounded-full border border-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm">
                    <i data-lucide="arrow-right" class="w-5 h-5"></i>
                </div>
              `;
        userList.appendChild(card);
      });
    }
  }

  if (adminList) {
    adminList.innerHTML = "";
    allCertificates.forEach((s) => {
      const aCard = document.createElement("div");
      aCard.className =
        "glass-card p-5 rounded-2xl flex justify-between items-center bg-white shadow-sm mb-4";
      aCard.innerHTML = `<div class="text-[11px] font-black uppercase text-stone-900">${s.title.substring(0, 30)}... <span class="text-stone-300">@ ${s.issuer}</span></div><button onclick="window.deleteData('certificates', '${s.id}')" class="p-2.5 text-rose-400 hover:bg-rose-50 rounded-xl transition-all"><i data-lucide="trash-2" class="w-4 h-4"></i></button>`;
      adminList.appendChild(aCard);
    });
  }

  lucide.createIcons();
  initReveal();
}

function filterByIssuer(issuer) {
  currentCertFilter = issuer;
  renderCertificates(allCertificates);
  document.getElementById("experience").scrollIntoView({ behavior: "smooth" });
}

function clearCertFilter() {
  currentCertFilter = null;
  renderCertificates(allCertificates);
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
      item.innerHTML = `
        <div class="flex justify-between items-start">
            <div><h5 class="font-black text-stone-900 text-lg">${m.name}</h5><p class="text-xs text-stone-400 font-bold">${m.email}</p></div>
            <button onclick="window.deleteData('messages', '${m.id}')" class="text-rose-400 p-2.5 rounded-xl"><i data-lucide="trash-2" class="w-5 h-5"></i></button>
        </div>
        <p class="bg-white/50 p-6 rounded-2xl text-stone-600 font-medium italic text-sm">"${m.message}"</p>`;
      list.appendChild(item);
    });
  }
  lucide.createIcons();
}

window.deleteData = async (table, id) => {
  if (!confirm("Hapus data selamanya?")) return;
  const { error } = await supabaseClient.from(table).delete().eq("id", id);
  if (!error) {
    showNotification("Data Berhasil Dihapus!");
    refreshAllData();
  } else {
    showNotification("Gagal Menghapus: " + error.message, true);
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
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("projects").getPublicUrl(fileName);
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

    showNotification("Project Berhasil Disimpan!");
    e.target.reset();
    toggleModal("project-modal", false);
    refreshAllData();
  } catch (err) {
    showNotification("Error Proyek: " + err.message, true);
    console.error(err);
  } finally {
    btn.innerText = "Save";
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
      const { data: uploadData, error: uploadError } =
        await supabaseClient.storage.from("projects").upload(fileName, file);

      if (uploadError) {
        throw new Error("Storage Error: " + uploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabaseClient.storage.from("projects").getPublicUrl(fileName);
      imageUrl = publicUrl;
    }

    const payload = {
      title: document.getElementById("s-title").value,
      issuer: document.getElementById("s-issuer").value,
      date: document.getElementById("s-date").value,
      description: document.getElementById("s-description").value,
    };

    if (imageUrl) payload.image = imageUrl;

    const { error: dbError } = await supabaseClient
      .from("certificates")
      .insert([payload]);

    if (dbError) {
      if (dbError.message.includes("image")) {
        throw new Error(
          "PENTING: Tambahkan kolom 'image' (tipe: text) ke tabel 'certificates' di dashboard Supabase kamu.",
        );
      }
      throw new Error("Database Error: " + dbError.message);
    }

    showNotification("Sertifikat Berhasil Disimpan!");
    e.target.reset();
    toggleModal("cert-modal", false);
    refreshAllData();
  } catch (err) {
    console.error("CERT_SAVE_ERROR:", err);
    showNotification(err.message, true);
  } finally {
    btn.innerText = "Save";
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
    showNotification("Riwayat Berhasil Disimpan!");
    e.target.reset();
    toggleModal("exp-modal", false);
    refreshAllData();
  } else {
    showNotification("DB Error: " + error.message, true);
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
    showNotification("Pesan Terkirim!");
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
