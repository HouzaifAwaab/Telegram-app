const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

const SUPABASE_URL = "https://ssnezkzajkxkogieztxb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbmV6a3phamt4a29naWV6dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDY3NjgsImV4cCI6MjEwMDM4Mjc2OH0.XVxtHJDWZAfQ3DplLwPjPgUOVZwYvYfFAAM7PFxqnb8";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// ----------------------------------------------------
// منطق توليد وتثبيت كود المستخدم الفريد (User Code)
// ----------------------------------------------------
const telegramUser = tg && tg.initDataUnsafe ? tg.initDataUnsafe.user : null;
const userId = telegramUser ? telegramUser.id.toString() : (localStorage.getItem('user_id') || 'usr_' + Math.random().toString(36).substring(2, 9));
localStorage.setItem('user_id', userId);

function generateUserUniqueCode() {
    let savedCode = localStorage.getItem('my_user_code');
    if (savedCode) return savedCode;

    let code = "";
    if (telegramUser) {
        const prefix = (telegramUser.first_name || 'US').substring(0, 2).toUpperCase().replace(/[^A-Z]/g, 'TG');
        const idDigits = telegramUser.id.toString().slice(-4);
        code = `${prefix}${idDigits}`;
    } else {
        code = `GS${Math.floor(1000 + Math.random() * 9000)}`;
    }
    localStorage.setItem('my_user_code', code);
    return code;
}

const userCode = generateUserUniqueCode();
const publisherName = telegramUser ? `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim() : "زائر المنصة";

// المهن والتصنيفات
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
        label: "صيانة السيارات والمركبات",
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

// الهيكلة الجغرافية الكاملة
const zonesTree = {
    east: {
        label: "القطاع الشرقي",
        subSectors: {
            "القطاع الشرقي ( أ )": ["سلبونا (أبو حشيش)", "الثورة", "هدل", "حي الخليج", "ديم النور", "ديم مايو"],
            "القطاع الشرقي ( ب )": ["سلالاب", "شقر", "الإسكان", "الوحده", "الإسكندريه", "أم القرى", "ولع"]
        }
    },
    central: {
        label: "القطاع الأوسط",
        subSectors: {
            "القطاع الأوسط": ["حي الإغريق", "حي العظمه", "ديم مدينه", "حي سكة حديد", "ديم طردونا", "ديم عرب"]
        }
    },
    south: {
        label: "القطاع الجنوبي",
        subSectors: {
            "القطاع الجنوبي الأول": ["حي الشاطئ", "ديم سواكن", "ديم جابر", "حي الجناين", "دار السلام"],
            "القطاع الجنوبي الثاني": ["ترانسيت", "كوريا", "دارالنعيم", "المرغنية", "فلب", "الرياض"],
            "القطاع الجنوبي الثالث (المطار 1 - 18)": generateAirportSquares(1, 18),
            "القطاع الجنوبي الرابع (المطار 18 - 36)": generateAirportSquares(18, 36)
        }
    }
};

function generateAirportSquares(start, end) {
    let arr = [];
    for (let i = start; i <= end; i++) { arr.push(`حي المطار (مربع ${i})`); }
    return arr;
}

let activeSearchIntent = 'all';
let activeAddIntent = 'offer';

document.addEventListener("DOMContentLoaded", async () => {
    setupNavigation();
    setupIntentTabs();

    initCategoryOptions('category-select');
    initCategoryOptions('add-category-select');

    bindCascadingDropdowns('category-select', 'sub-type-group', 'sub-type-select', 'detail-group', 'detail-select');
    bindCascadingDropdowns('add-category-select', 'add-sub-type-group', 'add-sub-type-select', 'add-detail-group', 'add-detail-select');
    
    initZoneDropdowns('main-zone-select', 'sub-zone-group', 'sub-zone-select', 'neighborhood-group', 'neighborhood-select', 'block-num-group');
    initZoneDropdowns('add-main-zone-select', 'add-sub-zone-group', 'add-sub-zone-select', 'add-neighborhood-group', 'add-neighborhood-select', 'add-block-num-group');

    setupPromos();

    document.getElementById('live-search-input').addEventListener('input', loadAds);
    document.getElementById('search-btn').addEventListener('click', loadAds);
    document.getElementById('save-ad-btn').addEventListener('click', saveAd);

    await loadAds();
});

function initCategoryOptions(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = '<option value="">-- اختر المهنة --</option>';
    Object.keys(optionsData).forEach(key => {
        select.innerHTML += `<option value="${key}">${optionsData[key].label}</option>`;
    });
}

function initZoneDropdowns(mainId, subGroupId, subSelectId, neighGroupId, neighSelectId, blockGroupId) {
    const mainSelect = document.getElementById(mainId);
    const subGroup = document.getElementById(subGroupId);
    const subSelect = document.getElementById(subSelectId);
    const neighGroup = document.getElementById(neighGroupId);
    const neighSelect = document.getElementById(neighSelectId);
    const blockGroup = document.getElementById(blockGroupId);

    mainSelect.innerHTML = '<option value="">-- اختر القطاع --</option>';
    Object.keys(zonesTree).forEach(key => {
        mainSelect.innerHTML += `<option value="${key}">${zonesTree[key].label}</option>`;
    });

    mainSelect.addEventListener('change', (e) => {
        const zoneKey = e.target.value;
        if (zoneKey && zonesTree[zoneKey]) {
            subSelect.innerHTML = '<option value="">-- اختر التقسيم الفرعي --</option>';
            Object.keys(zonesTree[zoneKey].subSectors).forEach(sub => {
                subSelect.innerHTML += `<option value="${sub}">${sub}</option>`;
            });
            subGroup.classList.remove('hidden');
        } else { subGroup.classList.add('hidden'); }
        neighGroup.classList.add('hidden');
        if (blockGroup) blockGroup.classList.add('hidden');
    });

    subSelect.addEventListener('change', (e) => {
        const zoneKey = mainSelect.value;
        const subKey = e.target.value;
        if (zoneKey && subKey && zonesTree[zoneKey].subSectors[subKey]) {
            neighSelect.innerHTML = '<option value="">-- اختر الحي --</option>';
            zonesTree[zoneKey].subSectors[subKey].forEach(item => {
                neighSelect.innerHTML += `<option value="${item}">${item}</option>`;
            });
            neighGroup.classList.remove('hidden');
        } else { neighGroup.classList.add('hidden'); }
        if (blockGroup) blockGroup.classList.add('hidden');
    });

    neighSelect.addEventListener('change', (e) => {
        const selectedVal = e.target.value;
        if (blockGroup) {
            if (selectedVal && !selectedVal.includes("حي المطار")) {
                blockGroup.classList.remove('hidden');
            } else { blockGroup.classList.add('hidden'); }
        }
    });
}

function setupNavigation() {
    const btnSearch = document.getElementById('nav-search');
    const btnAdd = document.getElementById('nav-add');
    const btnProfile = document.getElementById('nav-profile');
    
    const secSearch = document.getElementById('search-section');
    const secAdd = document.getElementById('add-section');
    const secProfile = document.getElementById('profile-section');
    const resultsContainer = document.getElementById('results');

    btnSearch.addEventListener('click', () => {
        setActiveTab(btnSearch, [btnAdd, btnProfile]);
        secSearch.classList.remove('hidden'); resultsContainer.classList.remove('hidden');
        secAdd.classList.add('hidden'); secProfile.classList.add('hidden');
    });

    btnAdd.addEventListener('click', () => {
        setActiveTab(btnAdd, [btnSearch, btnProfile]);
        secAdd.classList.remove('hidden');
        secSearch.classList.add('hidden'); secProfile.classList.add('hidden'); resultsContainer.classList.add('hidden');
    });

    btnProfile.addEventListener('click', async () => {
        setActiveTab(btnProfile, [btnSearch, btnAdd]);
        secProfile.classList.remove('hidden');
        secSearch.classList.add('hidden'); secAdd.classList.add('hidden'); resultsContainer.classList.add('hidden');
        
        renderTelegramUserProfile();
        await loadMyAds();
    });
}

function setActiveTab(active, inactives) {
    active.classList.add('active');
    inactives.forEach(i => i.classList.remove('active'));
}

function setupIntentTabs() {
    const filterAll = document.getElementById('filter-all');
    const filterOffers = document.getElementById('filter-offers');
    const filterRequests = document.getElementById('filter-requests');

    if (filterAll) {
        filterAll.addEventListener('click', () => setFilterIntent('all', filterAll, [filterOffers, filterRequests]));
        filterOffers.addEventListener('click', () => setFilterIntent('offer', filterOffers, [filterAll, filterRequests]));
        filterRequests.addEventListener('click', () => setFilterIntent('request', filterRequests, [filterAll, filterOffers]));
    }

    const tabOffer = document.getElementById('tab-add-offer');
    const tabRequest = document.getElementById('tab-add-request');
    const offerFields = document.getElementById('offer-specific-fields');
    const requestFields = document.getElementById('request-specific-fields');

    if (tabOffer) {
        tabOffer.addEventListener('click', () => {
            activeAddIntent = 'offer';
            tabOffer.classList.add('active'); tabRequest.classList.remove('active');
            offerFields.classList.remove('hidden'); requestFields.classList.add('hidden');
        });

        tabRequest.addEventListener('click', () => {
            activeAddIntent = 'request';
            tabRequest.classList.add('active'); tabOffer.classList.remove('active');
            requestFields.classList.remove('hidden'); offerFields.classList.add('hidden');
        });
    }
}

function setFilterIntent(intent, activeBtn, inactiveBtns) {
    activeSearchIntent = intent;
    activeBtn.classList.add('active');
    inactiveBtns.forEach(b => b.classList.remove('active'));
    loadAds();
}

function setupPromos() {
    const urgentCheck = document.getElementById('urgent-ad-check');
    const urgentPayBox = document.getElementById('urgent-payment-info');
    const userAdCount = parseInt(localStorage.getItem('posted_ads_count') || '0');

    if (urgentCheck) {
        urgentCheck.addEventListener('change', (e) => {
            if (e.target.checked && userAdCount > 0) {
                urgentPayBox.classList.remove('hidden');
            } else { urgentPayBox.classList.add('hidden'); }
        });
    }

    const vipCheck = document.getElementById('vip-ad-check');
    const vipPayBox = document.getElementById('vip-payment-info');
    const waBtn = document.getElementById('whatsapp-receipt-btn');

    if (vipCheck) {
        vipCheck.addEventListener('change', (e) => {
            if (e.target.checked) {
                vipPayBox.classList.remove('hidden');
                const title = document.getElementById('tech-title').value;
                waBtn.href = `https://wa.me/249907627406?text=${encodeURIComponent("مرحباً حذيفة، قمت بتحويل مبلغ الإعلان المميز للإعلان: " + title)}`;
            } else { vipPayBox.classList.add('hidden'); }
        });
    }
}

function copyAccountNum() {
    navigator.clipboard.writeText("4633063");
    alert("تم نسخ رقم الحساب (4633063) بنجاح!");
}

function copyPhoneNum(phone) {
    navigator.clipboard.writeText(phone);
    alert(`تم نسخ رقم الهاتف (${phone}) بنجاح!`);
}

function copyAdCode(code) {
    navigator.clipboard.writeText(`#${code}`);
    alert(`تم نسخ كود الإعلان (#${code}) بنجاح!`);
}

function bindCascadingDropdowns(catId, subGroupId, subSelectId, detailGroupId, detailSelectId) {
    const catSelect = document.getElementById(catId);
    const subGroup = document.getElementById(subGroupId);
    const subSelect = document.getElementById(subSelectId);
    const detailGroup = document.getElementById(detailGroupId);
    const detailSelect = document.getElementById(detailSelectId);

    catSelect.addEventListener('change', (e) => {
        const catKey = e.target.value;
        if (catKey && optionsData[catKey]) {
            subSelect.innerHTML = '<option value="">-- اختر التخصص --</option>';
            Object.keys(optionsData[catKey].options).forEach(type => {
                subSelect.innerHTML += `<option value="${type}">${type}</option>`;
            });
            subGroup.classList.remove('hidden');
        } else { subGroup.classList.add('hidden'); }
        detailGroup.classList.add('hidden');
    });

    subSelect.addEventListener('change', (e) => {
        const catKey = catSelect.value;
        const typeKey = e.target.value;
        if (catKey && typeKey && optionsData[catKey].options[typeKey]) {
            detailSelect.innerHTML = '<option value="">-- اختر التحديد --</option>';
            optionsData[catKey].options[typeKey].forEach(item => {
                detailSelect.innerHTML += `<option value="${item}">${item}</option>`;
            });
            detailGroup.classList.remove('hidden');
        } else { detailGroup.classList.add('hidden'); }
    });
}

// ----------------------------------------------------
// تحميل الإعلانات المطور مع دعم البحث بالأكواد
// ----------------------------------------------------
async function loadAds() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="placeholder-text">جاري جلب الإعلانات...</p>';

    const liveQuery = document.getElementById('live-search-input').value.trim().toLowerCase();
    const neighborhood = document.getElementById('neighborhood-select').value;
    const blockNum = document.getElementById('block-num-input').value;
    const subType = document.getElementById('sub-type-select').value;
    const detail = document.getElementById('detail-select').value;

    let query = supabaseClient.from('job_ads').select('*').order('created_at', { ascending: false });
    const { data, error } = await query;

    if (error || !data || data.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-text">لا توجد إعلانات متاحة حالياً.</p>';
        return;
    }

    let filtered = data;

    if (activeSearchIntent !== 'all') {
        filtered = filtered.filter(a => a.ad_type === activeSearchIntent);
    }

    if (neighborhood) filtered = filtered.filter(a => a.zone && a.zone.includes(neighborhood));
    if (blockNum) filtered = filtered.filter(a => a.zone && a.zone.includes(blockNum));
    if (subType) filtered = filtered.filter(a => a.details && a.details.includes(subType));
    if (detail) filtered = filtered.filter(a => a.details && a.details.includes(detail));

    // دعم البحث الذكي بالأكواد النصية والرقمية (#1001 أو كود المستخدم)
    if (liveQuery) {
        const cleanQuery = liveQuery.replace('#', '');
        filtered = filtered.filter(a => 
            (a.ad_code && a.ad_code.toString() === cleanQuery) ||
            (a.user_code && a.user_code.toLowerCase().includes(cleanQuery)) ||
            (a.publisher_name && a.publisher_name.toLowerCase().includes(cleanQuery)) ||
            (a.title && a.title.toLowerCase().includes(liveQuery)) || 
            (a.zone && a.zone.toLowerCase().includes(liveQuery)) || 
            (a.details && a.details.toLowerCase().includes(liveQuery))
        );
    }

    filtered.sort((a, b) => (b.is_vip ? 2 : b.is_urgent ? 1 : 0) - (a.is_vip ? 2 : a.is_urgent ? 1 : 0));

    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-text">لا توجد إعلانات مطابقة لخيارات البحث.</p>';
        return;
    }

    resultsContainer.innerHTML = '';
    filtered.forEach(ad => {
        const typeBadge = ad.ad_type === 'offer' ? '<span class="badge offer-badge">🛠️ تقديم خدمة</span>' : '<span class="badge request-badge">🙋‍♂️ طلب خدمة</span>';
        const vipBadge = ad.is_vip ? '<span class="badge vip-badge">⭐ مُميّز ومُثبّت</span>' : '';
        const urgentBadge = ad.is_urgent ? '<span class="badge urgent-badge">🚨 عاجل جداً</span>' : '';
        
        const displayAdCode = ad.ad_code ? `#${ad.ad_code}` : '#---';
        const displayUserCode = ad.user_code || 'N/A';
        const displayPublisher = ad.publisher_name || 'ناشر زائر';

        resultsContainer.innerHTML += `
            <div class="ad-card ${ad.is_vip ? 'vip-card' : ''} ${ad.is_urgent ? 'urgent-card' : ''}">
                <div class="card-header">
                    <h4>${ad.title}</h4>
                    <span class="ad-code-badge">${displayAdCode}</span>
                </div>
                <div class="publisher-info">
                    👤 الناشر: <strong>${displayPublisher}</strong> <span class="user-code-tag">[كود: ${displayUserCode}]</span>
                </div>
                <div class="badges">${typeBadge} ${vipBadge} ${urgentBadge}</div>
                <span class="location-badge">📍 ${ad.zone}</span>
                <p class="ad-text">${ad.details || 'لا توجد تفاصيل إضافية'}</p>
                <div class="card-actions">
                    <a href="https://wa.me/249${ad.phone.replace(/^0/, '')}" target="_blank" class="contact-btn">💬 واتساب</a>
                    <button onclick="copyPhoneNum('${ad.phone}')" class="btn-secondary">📞 نسخ الرقم</button>
                    ${ad.ad_code ? `<button onclick="copyAdCode('${ad.ad_code}')" class="btn-secondary">📋 نسخ كود الإعلان</button>` : ''}
                </div>
            </div>
        `;
    });
}

// ----------------------------------------------------
// حفظ الإعلان مع ربطه بكود وتاريخ المستخدم الثابت
// ----------------------------------------------------
async function saveAd() {
    const title = document.getElementById('tech-title').value;
    const neighborhood = document.getElementById('add-neighborhood-select').value;
    const blockNum = document.getElementById('add-block-num-input').value;
    const phone = document.getElementById('tech-phone').value;
    const subType = document.getElementById('add-sub-type-select').value;
    const detail = document.getElementById('add-detail-select').value;
    const rawDetails = document.getElementById('tech-details').value;

    const isUrgent = document.getElementById('urgent-ad-check').checked;
    const isVIP = document.getElementById('vip-ad-check').checked;

    if (!title || !neighborhood || !phone) {
        alert("الرجاء إدخال الاسم، الحي، ورقم الهاتف!");
        return;
    }

    let fullZone = neighborhood;
    if (blockNum && !neighborhood.includes("حي المطار")) {
        fullZone += ` - مربع ${blockNum}`;
    }

    let extraText = activeAddIntent === 'offer' ? 
        `\n[خبرة: ${document.getElementById('offer-experience').value || 'غير محدد'}] | [الأيام: ${document.getElementById('offer-work-days').value || 'غير محدد'}]` : 
        `\n[الميزانية: ${document.getElementById('request-budget').value || 'حسب الاتفاق'}]`;

    const fullDetails = `[التصنيف: ${subType || ''} - ${detail || ''}]${extraText}\n${rawDetails}`;

    const { error } = await supabaseClient.from('job_ads').insert([{
        title, 
        zone: fullZone, 
        phone, 
        details: fullDetails,
        ad_type: activeAddIntent, 
        is_vip: isVIP, 
        is_urgent: isUrgent, 
        user_id: userId,
        user_code: userCode,
        publisher_name: publisherName
    }]);

    if (!error) {
        let count = parseInt(localStorage.getItem('posted_ads_count') || '0');
        localStorage.setItem('posted_ads_count', (count + 1).toString());
        alert("تم نشر إعلانك بنجاح وسيتولد له كود تلقائياً!");
        document.getElementById('nav-search').click();
        await loadAds();
    } else { alert("حدث خطأ أثناء النشر، حاول مرة أخرى."); }
}

async function loadMyAds() {
    const container = document.getElementById('my-ads-list');
    container.innerHTML = '<p class="placeholder-text">جاري تحميل إعلاناتك...</p>';

    const { data } = await supabaseClient.from('job_ads').select('*').eq('user_id', userId).order('created_at', { ascending: false });

    if (!data || data.length === 0) {
        container.innerHTML = '<p class="placeholder-text">لم تقم بنشر أي إعلانات بعد.</p>';
        return;
    }

    container.innerHTML = '';
    data.forEach(ad => {
        container.innerHTML += `
            <div class="ad-card" style="background: #242f3d; color: #fff; border-right-color: #64b5f6;">
                <div class="card-header">
                    <h4 style="color: #64b5f6;">${ad.title}</h4>
                    <span class="ad-code-badge">#${ad.ad_code || '---'}</span>
                </div>
                <span class="location-badge" style="background: #17212b; color: #ccc;">📍 ${ad.zone}</span>
                <p style="color: #ddd;">${ad.details}</p>
                <button onclick="deleteAd('${ad.id}')" class="btn-danger" style="margin-top: 8px;">🗑️ حذف الإعلان</button>
            </div>
        `;
    });
}

async function deleteAd(adId) {
    if (confirm("هل أنت تأكد من رغبتك في حذف هذا الإعلان؟")) {
        await supabaseClient.from('job_ads').delete().eq('id', adId);
        await loadMyAds();
    }
}

// ----------------------------------------------------
// عرض بيانات الملف الشخصي والكود الثابت للمستخدم
// ----------------------------------------------------
function renderTelegramUserProfile() {
    const avatarImg = document.getElementById('user-avatar');
    const fullNameElem = document.getElementById('profile-full-name');
    const usernameElem = document.getElementById('profile-username');
    const userIdElem = document.getElementById('profile-user-id');
    const userCodeElem = document.getElementById('profile-user-code');

    userCodeElem.innerText = userCode;

    if (telegramUser) {
        const fullName = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim() || 'مستخدم تليجرام';
        fullNameElem.innerText = fullName;
        usernameElem.innerText = telegramUser.username ? `@${telegramUser.username}` : 'غير محدد';
        userIdElem.innerText = telegramUser.id.toString();

        if (telegramUser.photo_url) {
            avatarImg.src = telegramUser.photo_url;
        } else {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2b5278&color=fff`;
        }
    } else {
        fullNameElem.innerText = "مستخدم زائر";
        usernameElem.innerText = "@Guest";
        userIdElem.innerText = userId;
        avatarImg.src = "https://via.placeholder.com/100?text=Guest";
    }
}

function openVerificationInfo() {
    alert("لطلب شارة التوثيق الزرقاء 🔵، يرجى التواصل مع إدارة المنصة وتحويل الإثباتات اللازمة.");
}

function refreshProfileData() {
    renderTelegramUserProfile();
    loadMyAds();
}
