const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

const SUPABASE_URL = "https://ssnezkzajkxkogieztxb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbmV6a3phamt4a29naWV6dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDY3NjgsImV4cCI6MjEwMDM4Mjc2OH0.XVxtHJDWZAfQ3DplLwPjPgUOVZwYvYfFAAM7PFxqnb8";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// الشجرة الكاملة لكل المهن والتصنيفات في بورتسودان
const optionsData = {
    trans: {
        label: "النقل والتوصيل",
        options: {
            "سواقة (توريدة)": ["ركشة", "أمجاد", "تكتوك", "حافلة", "بوكس / نقل بضائع"],
            "شراء / بيع مركبة": ["ركشة", "أمجاد", "تكتوك", "سيارة ملاكي", "حافلة"],
            "توصيل طلبات ومشاوير": ["دراجة نارية (موتر)", "سيارة خاصة", "تكتوك نقل"]
        }
    },
    maintenance: {
        label: "الصيانة والمهن اليدوية",
        options: {
            "كهرباء وطاقة": ["كهرباء منازل وتأسيس", "تركيب وصيانة طاقة شمسية", "صيانة مولدات", "لف موتورات"],
            "سباكة ومياه": ["تأسيس وصيانة سباكة", "تركيب خزانات ومضخات (دينمو)", "تسليك مجاري وصرف صحي"],
            "تبريد وتكييف": ["صيانة مكيفات اسبليت", "صيانة مكيفات شباك/ماء", "صيانة ثلاجات وديب فريزر"],
            "بناء وتشطيبات": ["بناء وجالوص/طوب", "نقاشة وطلاء", "بلطاط / سيراميك", "نجارة وعمل أبواب/أثاث", "حدادة وألوميتال"]
        }
    },
    auto: {
        label: "صيانة السيارات المركبات",
        options: {
            "ميكانيكا وسروجة": ["ميكانيكي بنزين", "ميكانيكي ديزل", "سروجة وتنجيد", "سمكرة وبوية"],
            "كهرباء وغسيل": ["كهربائي سيارات", "فحص كمبيوتر", "غسيل وتلميع"]
        }
    },
    tech: {
        label: "التقنية والإلكترونيات",
        options: {
            "صيانة أجهزة": ["صيانة موابيلات وهواتف", "صيانة لابتوب وكمبيوتر", "صيانة شاشات ورسيفرات"],
            "شبكات وبرمجيات": ["تركيب كاميرات مراقبة", "شبكات وواي فاي", "برمجة وتصميم"]
        }
    },
    services: {
        label: "خدمات عامة وتدريس",
        options: {
            "تعليم وتدريس": ["معلم دروس خصوصية", "تحفيظ قرآن", "لغات وترجمة"],
            "مناسبات وخياطة": ["خياطة وتطريز", "طبخ ووجبات منزلية", "تصوير ومونتاج"]
        }
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    setupNavigation();
    initCategoryOptions('category-select');
    initCategoryOptions('add-category-select');

    bindCascadingDropdowns('category-select', 'sub-type-group', 'sub-type-select', 'detail-group', 'detail-select');
    bindCascadingDropdowns('add-category-select', 'add-sub-type-group', 'add-sub-type-select', 'add-detail-group', 'add-detail-select');
    
    await loadNeighborhoods();
    await loadAds();

    document.getElementById('search-btn').addEventListener('click', loadAds);
    document.getElementById('save-ad-btn').addEventListener('click', saveAd);
});

// تعبئة القطاعات الرئيسية تلقائياً
function initCategoryOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">-- اختر القطاع --</option>';
    Object.keys(optionsData).forEach(key => {
        select.innerHTML += `<option value="${key}">${optionsData[key].label}</option>`;
    });
}

function setupNavigation() {
    const btnSearch = document.getElementById('nav-search');
    const btnAdd = document.getElementById('nav-add');
    const secSearch = document.getElementById('search-section');
    const secAdd = document.getElementById('add-section');

    btnSearch.addEventListener('click', () => {
        btnSearch.classList.add('active'); btnAdd.classList.remove('active');
        secSearch.classList.remove('hidden'); secAdd.classList.add('hidden');
    });

    btnAdd.addEventListener('click', () => {
        btnAdd.classList.add('active'); btnSearch.classList.remove('active');
        secAdd.classList.remove('hidden'); secSearch.classList.add('hidden');
    });
}

// تفعيل ربط القوائم المتداخلة لكل المهن
function bindCascadingDropdowns(catId, subGroupId, subSelectId, detailGroupId, detailSelectId) {
    const catSelect = document.getElementById(catId);
    const subGroup = document.getElementById(subGroupId);
    const subSelect = document.getElementById(subSelectId);
    const detailGroup = document.getElementById(detailGroupId);
    const detailSelect = document.getElementById(detailSelectId);

    catSelect.addEventListener('change', (e) => {
        const catKey = e.target.value;
        if (catKey && optionsData[catKey]) {
            subSelect.innerHTML = '<option value="">-- اختر التخصص / الخدمة --</option>';
            Object.keys(optionsData[catKey].options).forEach(type => {
                subSelect.innerHTML += `<option value="${type}">${type}</option>`;
            });
            subGroup.classList.remove('hidden');
        } else {
            subGroup.classList.add('hidden');
        }
        detailGroup.classList.add('hidden');
    });

    subSelect.addEventListener('change', (e) => {
        const catKey = catSelect.value;
        const typeKey = e.target.value;
        if (catKey && typeKey && optionsData[catKey].options[typeKey]) {
            detailSelect.innerHTML = '<option value="">-- اختر تحديد المهارة / المركبة --</option>';
            optionsData[catKey].options[typeKey].forEach(item => {
                detailSelect.innerHTML += `<option value="${item}">${item}</option>`;
            });
            detailGroup.classList.remove('hidden');
        } else {
            detailGroup.classList.add('hidden');
        }
    });
}

async function loadNeighborhoods() {
    const select = document.getElementById('zone-select');
    const addSelect = document.getElementById('add-zone-select');
    try {
        const { data } = await supabaseClient.from('neighborhoods').select('*');
        if (data) {
            select.innerHTML = '<option value="">-- كل الأحياء --</option>';
            addSelect.innerHTML = '<option value="">-- اختر الحي --</option>';
            data.forEach(item => {
                const opt = `<option value="${item.name} (${item.zone})">${item.name} (${item.zone})</option>`;
                select.innerHTML += opt; addSelect.innerHTML += opt;
            });
        }
    } catch (e) { console.error(e); }
}

async function loadAds() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="placeholder-text">جاري جلب الإعلانات...</p>';

    const zoneName = document.getElementById('zone-select').value;
    const subType = document.getElementById('sub-type-select').value;
    const detail = document.getElementById('detail-select').value;

    let query = supabaseClient.from('job_ads').select('*').order('created_at', { ascending: false });
    if (zoneName) query = query.eq('zone', zoneName);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-text">لا توجد إعلانات متاحة حالياً وفقاً للخيارات.</p>';
        return;
    }

    let filtered = data;
    if (subType) filtered = filtered.filter(a => a.details && a.details.includes(subType));
    if (detail) filtered = filtered.filter(a => a.details && a.details.includes(detail));

    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-text">لا توجد إعلانات مطابقة لهذه المهن بالتحديد.</p>';
        return;
    }

    resultsContainer.innerHTML = '';
    filtered.forEach(ad => {
        resultsContainer.innerHTML += `
            <div class="ad-card">
                <h4>${ad.title}</h4>
                <span class="badge">📍 ${ad.zone}</span>
                <p>${ad.details || 'لا توجد تفاصيل إضافية'}</p>
                <a href="https://wa.me/249${ad.phone.replace(/^0/, '')}" target="_blank" class="contact-btn">💬 تواصل عبر الواتساب (${ad.phone})</a>
            </div>
        `;
    });
}

async function saveAd() {
    const title = document.getElementById('tech-title').value;
    const zone = document.getElementById('add-zone-select').value;
    const phone = document.getElementById('tech-phone').value;
    const subType = document.getElementById('add-sub-type-select').value;
    const detail = document.getElementById('add-detail-select').value;
    const rawDetails = document.getElementById('tech-details').value;

    if (!title || !zone || !phone) {
        alert("الرجاء إدخال الاسم/عنوان الإعلان، الحي، ورقم الهاتف!");
        return;
    }

    const fullDetails = `[التصنيف: ${subType || ''} - ${detail || ''}]\n${rawDetails}`;

    const { error } = await supabaseClient.from('job_ads').insert([{
        title, zone, phone, details: fullDetails
    }]);

    if (!error) {
        alert("تم نشر إعلانك بنجاح!");
        document.getElementById('nav-search').click();
        await loadAds();
    } else {
        alert("حدث خطأ أثناء النشر، حاول مرة أخرى.");
    }
}
