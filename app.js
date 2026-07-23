const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) { tg.ready(); tg.expand(); }

const SUPABASE_URL = "https://ssnezkzajkxkogieztxb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbmV6a3phamt4a29naWV6dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDY3NjgsImV4cCI6MjEwMDM4Mjc2OH0.XVxtHJDWZAfQ3DplLwPjPgUOVZwYvYfFAAM7PFxqnb8";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

// كود الآدمن الخاص بك على تليجرام
const MY_ADMIN_TELEGRAM_ID = "7061131366";
let isAdminLoggedIn = false;


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

// الهيكلة الجغرافية
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
let vipOnlyFilter = false;

document.addEventListener("DOMContentLoaded", async () => {
    checkAndShowPromoBanner();
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

    updateGozlaneeUI();
    await loadAds();
});

function checkAndShowPromoBanner() {
    const lastShown = localStorage.getItem('last_promo_shown_time');
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

    if (!lastShown || (now - parseInt(lastShown)) > threeDaysMs) {
        document.getElementById('gozlanee-promo-banner').classList.remove('hidden');
        localStorage.setItem('last_promo_shown_time', now.toString());
    }
}

function closePromoBanner() {
    document.getElementById('gozlanee-promo-banner').classList.add('hidden');
}

// ----------------------------------------------------
// التنقل بين الأقسام المحدث (يشمل الإدارة)
// ----------------------------------------------------
function setupNavigation() {
    const btnSearch = document.getElementById('nav-search');
    const btnVip = document.getElementById('nav-vip');
    const btnAdd = document.getElementById('nav-add');
    const btnGozlanee = document.getElementById('nav-gozlanee');
    const btnProfile = document.getElementById('nav-profile');
    const btnAdmin = document.getElementById('nav-admin');
    
    const secSearch = document.getElementById('search-section');
    const secAdd = document.getElementById('add-section');
    const secGozlanee = document.getElementById('gozlanee-section');
    const secPortfolio = document.getElementById('portfolio-section');
    const secProfile = document.getElementById('profile-section');
    const secAdmin = document.getElementById('admin-section');
    const resultsContainer = document.getElementById('results');

    function hideAllSections() {
        secSearch.classList.add('hidden');
        secAdd.classList.add('hidden');
        secGozlanee.classList.add('hidden');
        secPortfolio.classList.add('hidden');
        secProfile.classList.add('hidden');
        secAdmin.classList.add('hidden');
        resultsContainer.classList.add('hidden');
    }

    btnSearch.addEventListener('click', () => {
        vipOnlyFilter = false;
        setActiveTab(btnSearch, [btnVip, btnAdd, btnGozlanee, btnProfile, btnAdmin]);
        hideAllSections();
        secSearch.classList.remove('hidden'); 
        resultsContainer.classList.remove('hidden');
        loadAds();
    });

    btnVip.addEventListener('click', () => {
        vipOnlyFilter = true;
        setActiveTab(btnVip, [btnSearch, btnAdd, btnGozlanee, btnProfile, btnAdmin]);
        hideAllSections();
        secSearch.classList.remove('hidden'); 
        resultsContainer.classList.remove('hidden');
        loadAds();
    });

    btnAdd.addEventListener('click', () => {
        setActiveTab(btnAdd, [btnSearch, btnVip, btnGozlanee, btnProfile, btnAdmin]);
        hideAllSections();
        secAdd.classList.remove('hidden');
    });

    btnGozlanee.addEventListener('click', () => {
        switchToGozlaneeSection();
    });

    btnProfile.addEventListener('click', async () => {
        setActiveTab(btnProfile, [btnSearch, btnVip, btnAdd, btnGozlanee, btnAdmin]);
        hideAllSections();
        secProfile.classList.remove('hidden');
        renderTelegramUserProfile();
        await loadMyAds();
    });

    btnAdmin.addEventListener('click', () => {
        setActiveTab(btnAdmin, [btnSearch, btnVip, btnAdd, btnGozlanee, btnProfile]);
        hideAllSections();
        secAdmin.classList.remove('hidden');
    });
}

function switchToGozlaneeSection() {
    const allBtns = document.querySelectorAll('.nav-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    document.getElementById('nav-gozlanee').classList.add('active');

    document.getElementById('search-section').classList.add('hidden');
    document.getElementById('add-section').classList.add('hidden');
    document.getElementById('portfolio-section').classList.add('hidden');
    document.getElementById('profile-section').classList.add('hidden');
    document.getElementById('admin-section').classList.add('hidden');
    document.getElementById('results').classList.add('hidden');
    
    document.getElementById('gozlanee-section').classList.remove('hidden');
    updateGozlaneeUI();
}

function switchToPortfolioSection() {
    document.getElementById('profile-section').classList.add('hidden');
    document.getElementById('portfolio-section').classList.remove('hidden');
    loadPortfolio();
}

function setActiveTab(active, inactives) {
    active.classList.add('active');
    inactives.forEach(i => i.classList.remove('active'));
}

// ----------------------------------------------------
// منطق لوحة الإدارة (Admin Logic)
// ----------------------------------------------------
function verifyAdminPassword() {
    // فحص هل المستخدم الحالي هو أنت عبر تليجرام
    if (telegramUser && telegramUser.id.toString() === MY_ADMIN_TELEGRAM_ID) {
        isAdminLoggedIn = true;
        document.getElementById('admin-login-view').classList.add('hidden');
        document.getElementById('admin-dashboard-view').classList.remove('hidden');
        alert("أهلاً بك يا حذيفة، تم التحقق من هويتك ودخول لوحة الإدارة بنجاح!");
        adminLoadAllAds();
    } else {
        alert("عفواً! هذه اللوحة مخصصة لإدارة المنصة فقط.");
    }
}

    if (passInput === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        document.getElementById('admin-login-view').classList.add('hidden');
        document.getElementById('admin-dashboard-view').classList.remove('hidden');
        alert("أهلاً بك يا حذيفة، تم تسجيل الدخول بنجاح!");
        adminLoadAllAds();
    } else {
        alert("كلمة السر غير صحيحة! لا يمكنك دخول لوحة الإدارة.");
    }
}

async function adminManageWallet(action) {
    if (!isAdminLoggedIn) {
        alert("عفواً، يتطلب تسجيل الدخول كـ أدمن أولاً!");
        return;
    }

    const targetCode = document.getElementById('admin-target-user-code').value.trim();
    const amount = parseFloat(document.getElementById('admin-wallet-amount').value);
    const note = document.getElementById('admin-wallet-note').value.trim();

    if (!targetCode || isNaN(amount) || amount <= 0) {
        alert("يرجى التأكد من إدخال كود المستخدم والمبلغ بشكل صحيح!");
        return;
    }

    // إذا كان كود المستهدف هو نفس المستخدم الحالي (حساب الأدمن) يتم تحديث المحفظة المحلية
    if (targetCode === userCode) {
        let avail = parseFloat(localStorage.getItem('gz_bal_available') || '0.00');
        let frozen = parseFloat(localStorage.getItem('gz_bal_frozen') || '0.00');

        if (action === 'add') {
            avail += amount;
            addGozlaneeStatement('topup', amount, `تغذية إدارية (${note || 'شحن'})`, 'ADMIN');
        } else if (action === 'freeze') {
            if (avail < amount) { alert("الرصيد المتاح غير كافٍ للتجميد!"); return; }
            avail -= amount;
            frozen += amount;
            addGozlaneeStatement('frozen', amount, `تجميد إداري (${note || 'تجميد'})`, 'ADMIN');
        } else if (action === 'unfreeze') {
            if (frozen < amount) { alert("المبلغ المجمد أقل من المطلوب فكه!"); return; }
            frozen -= amount;
            avail += amount;
            addGozlaneeStatement('topup', amount, `فك تجميد إداري (${note || 'فك تجميد'})`, 'ADMIN');
        } else if (action === 'deduct') {
            if (avail < amount) { alert("الرصيد المتاح أقل من المبلغ المراد خصمه!"); return; }
            avail -= amount;
            addGozlaneeStatement('trans', amount, `خصم إداري (${note || 'خصم'})`, 'ADMIN');
        }

        localStorage.setItem('gz_bal_available', avail.toString());
        localStorage.setItem('gz_bal_frozen', frozen.toString());
        updateGozlaneeUI();
    }

    // حفظ / تحديث بيانات المحفظة في Supabase جدول user_wallets (إن وجد)
    try {
        const { data: currentWallet } = await supabaseClient
            .from('user_wallets')
            .select('*')
            .eq('user_code', targetCode)
            .maybeSingle();

        let currentAvail = currentWallet ? (currentWallet.available_balance || 0) : 0;
        let currentFrozen = currentWallet ? (currentWallet.frozen_balance || 0) : 0;

        if (action === 'add') currentAvail += amount;
        else if (action === 'freeze') { currentAvail -= amount; currentFrozen += amount; }
        else if (action === 'unfreeze') { currentFrozen -= amount; currentAvail += amount; }
        else if (action === 'deduct') currentAvail -= amount;

        await supabaseClient.from('user_wallets').upsert({
            user_code: targetCode,
            available_balance: currentAvail,
            frozen_balance: currentFrozen,
            updated_at: new Date()
        }, { onConflict: 'user_code' });

    } catch (e) {
        console.log("Supabase wallet table sync note:", e);
    }

    let actionText = action === 'add' ? 'تغذية' : action === 'freeze' ? 'تجميد' : action === 'unfreeze' ? 'فك تجميد' : 'خصم';
    alert(`تم تنفيذ عملية (${actionText}) بمبلغ ${amount} ج.س للمستخدم [${targetCode}] بنجاح!`);

    document.getElementById('admin-wallet-amount').value = '';
    document.getElementById('admin-wallet-note').value = '';
}

async function adminLoadAllAds() {
    const container = document.getElementById('admin-ads-list');
    container.innerHTML = '<p class="placeholder-text">جاري جلب جميع إعلانات النظام...</p>';

    const { data, error } = await supabaseClient.from('job_ads').select('*').order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        container.innerHTML = '<p class="placeholder-text">لا توجد إعلانات بالنظام حالياً.</p>';
        return;
    }

    container.innerHTML = '';
    data.forEach(ad => {
        container.innerHTML += `
            <div class="admin-ad-item">
                <div class="admin-ad-info">
                    <strong>${ad.title}</strong>
                    <span>الناشر: ${ad.publisher_name || 'زائر'} | الكود: ${ad.user_code || 'بدون'}</span>
                    <small>المنطقة: ${ad.zone} | كود الإعلان: #${ad.ad_code || '---'}</small>
                </div>
                <div class="admin-ad-btns">
                    <button onclick="adminToggleVip('${ad.id}', ${!ad.is_vip})" class="btn-admin-action ${ad.is_vip ? 'btn-warn' : 'btn-vip'}">
                        ${ad.is_vip ? 'إلغاء VIP' : 'ترقية VIP'}
                    </button>
                    <button onclick="adminDeleteAd('${ad.id}')" class="btn-danger">🗑️ حذف</button>
                </div>
            </div>
        `;
    });
}

async function adminToggleVip(adId, newVipStatus) {
    await supabaseClient.from('job_ads').update({ is_vip: newVipStatus }).eq('id', adId);
    alert(newVipStatus ? "تمت ترقية الإعلان إلى VIP بنجاح!" : "تم إلغاء تثبيت VIP من الإعلان.");
    await adminLoadAllAds();
    await loadAds();
}

async function adminDeleteAd(adId) {
    if (confirm("هل أنت متأكد كـ إداري من حذف هذا الإعلان نهائياً؟")) {
        await supabaseClient.from('job_ads').delete().eq('id', adId);
        alert("تم حذف الإعلان بواسطة الإدارة.");
        await adminLoadAllAds();
        await loadAds();
    }
}

// ----------------------------------------------------
// دوال الهيكلة والربط للقوائم المنسدلة
// ----------------------------------------------------
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

// ----------------------------------------------------
// تحميل الإعلانات
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

    if (vipOnlyFilter) {
        filtered = filtered.filter(a => a.is_vip);
    }

    if (activeSearchIntent !== 'all') {
        filtered = filtered.filter(a => a.ad_type === activeSearchIntent);
    }

    if (neighborhood) filtered = filtered.filter(a => a.zone && a.zone.includes(neighborhood));
    if (blockNum) filtered = filtered.filter(a => a.zone && a.zone.includes(blockNum));
    if (subType) filtered = filtered.filter(a => a.details && a.details.includes(subType));
    if (detail) filtered = filtered.filter(a => a.details && a.details.includes(detail));

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

    filtered.sort((a, b) => {
        const scoreA = (a.is_vip ? 100 : 0) + (a.accepts_gozlanee ? 50 : 0) + (a.is_urgent ? 20 : 0);
        const scoreB = (b.is_vip ? 100 : 0) + (b.accepts_gozlanee ? 50 : 0) + (b.is_urgent ? 20 : 0);
        return scoreB - scoreA;
    });

    if (filtered.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-text">لا توجد إعلانات مطابقة لخيارات البحث.</p>';
        return;
    }

    resultsContainer.innerHTML = '';
    filtered.forEach(ad => {
        const typeBadge = ad.ad_type === 'offer' ? '<span class="badge offer-badge">🛠️ تقديم خدمة</span>' : '<span class="badge request-badge">🙋‍♂️ طلب خدمة</span>';
        const vipBadge = ad.is_vip ? '<span class="badge vip-badge">⭐ مُميّز ومُثبّت</span>' : '';
        const urgentBadge = ad.is_urgent ? '<span class="badge urgent-badge">🚨 عاجل جداً</span>' : '';
        const gozlaneeBadge = ad.accepts_gozlanee ? '<span class="badge gozlanee-badge">💳 يقبل الدفع عبر جُذلاني</span>' : '';

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
                <div class="badges">${typeBadge} ${vipBadge} ${urgentBadge} ${gozlaneeBadge}</div>
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
// حفظ وإرسال الإعلان
// ----------------------------------------------------
async function saveAd() {
    const title = document.getElementById('tech-title').value;
    const neighborhood = document.getElementById('add-neighborhood-select').value;
    const blockNum = document.getElementById('add-block-num-input').value;
    const phone = document.getElementById('tech-phone').value;
    const subType = document.getElementById('add-sub-type-select').value;
    const detail = document.getElementById('add-detail-select').value;
    const rawDetails = document.getElementById('tech-details').value;

    const acceptsGozlanee = document.getElementById('accept-gozlanee-check').checked;
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
        accepts_gozlanee: acceptsGozlanee,
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

// ----------------------------------------------------
// نظام إدارة محفظة "جُذلاني"
// ----------------------------------------------------
function updateGozlaneeUI() {
    const available = parseFloat(localStorage.getItem('gz_bal_available') || '0.00');
    const frozen = parseFloat(localStorage.getItem('gz_bal_frozen') || '0.00');

    document.getElementById('gz-available-bal').innerText = `${available.toFixed(2)} ج.س`;
    document.getElementById('gz-frozen-bal').innerText = `${frozen.toFixed(2)} ج.س`;
    document.getElementById('gz-deposit-code-ref').innerText = userCode;

    renderGozlaneeStatement();
}

function toggleGozlaneeSubTab(tabName) {
    document.getElementById('gz-topup-form').classList.add('hidden');
    document.getElementById('gz-pay-form').classList.add('hidden');
    document.getElementById('gz-transfer-form').classList.add('hidden');

    if (tabName === 'topup') document.getElementById('gz-topup-form').classList.remove('hidden');
    if (tabName === 'pay') document.getElementById('gz-pay-form').classList.remove('hidden');
    if (tabName === 'transfer') document.getElementById('gz-transfer-form').classList.remove('hidden');
}

function addGozlaneeStatement(type, amount, title, ref = "") {
    let statement = JSON.parse(localStorage.getItem('gz_statements') || '[]');
    statement.unshift({
        id: 'TX' + Math.floor(Math.random()*89999 + 10000),
        type, 
        amount, 
        title, 
        ref,
        date: new Date().toLocaleTimeString('ar-SD', {hour: '2-digit', minute:'2-digit'})
    });
    localStorage.setItem('gz_statements', JSON.stringify(statement));
    renderGozlaneeStatement();
}

function renderGozlaneeStatement() {
    const container = document.getElementById('gz-statement-list');
    let statement = JSON.parse(localStorage.getItem('gz_statements') || '[]');

    if (statement.length === 0) {
        container.innerHTML = '<p class="placeholder-text">لا توجد عمليات مسجلة حديثاً.</p>';
        return;
    }

    container.innerHTML = '';
    statement.forEach(st => {
        let typeClass = st.type === 'topup' ? 'st-type-topup' : st.type === 'frozen' ? 'st-type-frozen' : 'st-type-trans';
        let icon = st.type === 'topup' ? '🟢' : st.type === 'frozen' ? '🔒' : '🔴';
        
        container.innerHTML += `
            <div class="st-item ${typeClass}">
                <div>
                    <div>${icon} <strong>${st.title}</strong></div>
                    <span style="font-size: 10px; color: #a0aec0;">${st.date} | ${st.ref ? 'مرجع: ' + st.ref : ''}</span>
                </div>
                <div style="font-weight: bold; color: ${st.type==='topup'?'#2ecc71':'#e74c3c'}">
                    ${st.type==='topup'?'+':'-'}${st.amount} ج.س
                </div>
            </div>
        `;
    });
}

function submitBankakDeposit() {
    const amount = parseFloat(document.getElementById('gz-topup-amount').value);
    const ref = document.getElementById('gz-topup-ref').value;

    if (!amount || amount <= 0 || !ref) {
        alert("الرجاء أدخل قيمة المبلغ ورقم عملية الإشعار بشكل صحيح!");
        return;
    }

    const waText = encodeURIComponent(`طلب تغذية جُذلاني 💳\nالكود: ${userCode}\nالمبلغ: ${amount} جنيه\nرقم العملية: ${ref}`);
    window.open(`https://wa.me/249907627406?text=${waText}`, '_blank');

    addGozlaneeStatement('topup', amount, "طلب تغذية قيد المراجعة الإدارية", ref);
    alert("تم إرسال الإشعار للإدارة، سيتم توثيق الرصيد في محفظتك فور التأكيد!");
    document.getElementById('gz-topup-amount').value = '';
    document.getElementById('gz-topup-ref').value = '';
}

function processEscrowFreeze() {
    const providerCode = document.getElementById('gz-provider-code').value.trim();
    const amount = parseFloat(document.getElementById('gz-escrow-amount').value);
    const desc = document.getElementById('gz-escrow-desc').value.trim();

    let available = parseFloat(localStorage.getItem('gz_bal_available') || '0.00');

    if (!providerCode || !amount || amount <= 0) {
        alert("يرجى التأكد من كود الفني والمبلغ المطلوب تجميده!");
        return;
    }

    if (available < amount) {
        alert("رصيدك المتاح في جُذلاني غير كافٍ. قم بتغذية المحفظة أولاً!");
        return;
    }

    let frozen = parseFloat(localStorage.getItem('gz_bal_frozen') || '0.00');
    localStorage.setItem('gz_bal_available', (available - amount).toString());
    localStorage.setItem('gz_bal_frozen', (frozen + amount).toString());

    addGozlaneeStatement('frozen', amount, `تجميد لخدمة الفني (${providerCode})`, desc);
    updateGozlaneeUI();

    alert(`تم تجميد مبلغ (${amount} جنيه) بنجاح وإمهال الفني 60 دقيقة للموافقة وتنفيذ الخدمة!`);

    setTimeout(() => {
        let currentFrozen = parseFloat(localStorage.getItem('gz_bal_frozen') || '0.00');
        if (currentFrozen >= amount) {
            let currentAvail = parseFloat(localStorage.getItem('gz_bal_available') || '0.00');
            localStorage.setItem('gz_bal_frozen', (currentFrozen - amount).toString());
            localStorage.setItem('gz_bal_available', (currentAvail + amount).toString());
            addGozlaneeStatement('topup', amount, `فك تجميد آلي (انقضاء المهلة 60د)`, providerCode);
            updateGozlaneeUI();
        }
    }, 60 * 60 * 1000);
}

function processDirectTransfer() {
    const targetCode = document.getElementById('gz-target-code').value.trim();
    const amount = parseFloat(document.getElementById('gz-transfer-amount').value);

    let available = parseFloat(localStorage.getItem('gz_bal_available') || '0.00');

    if (!targetCode || !amount || amount <= 0) {
        alert("يرجى إدخال كود المستلم والمبلغ بصورة صحيحة!");
        return;
    }

    if (available < amount) {
        alert("رصيدك المتاح لا يكفي لإجراء هذا التحويل المباشر!");
        return;
    }

    localStorage.setItem('gz_bal_available', (available - amount).toString());
    addGozlaneeStatement('trans', amount, `تحويل مباشر للمستخدم (${targetCode})`);
    updateGozlaneeUI();

    alert(`تم تحويل مبلغ (${amount} جنيه) بنجاح للحساب كود (${targetCode})!`);
}

// ----------------------------------------------------
// معرض الأعمال
// ----------------------------------------------------
function loadPortfolio() {
    const grid = document.getElementById('portfolio-grid');
    let items = JSON.parse(localStorage.getItem('pf_items') || '[]');

    if (items.length === 0) {
        grid.innerHTML = '<p class="placeholder-text">لم تقم بإضافة أعمال بالمعرض بعد.</p>';
        return;
    }

    grid.innerHTML = '';
    items.forEach(item => {
        grid.innerHTML += `
            <div class="pf-item">
                <div class="pf-title">${item.title}</div>
                <div class="pf-images-comparison">
                    <div class="pf-img-box">
                        <img src="${item.before}" alt="قبل">
                        <div class="pf-img-lbl">🔴 قبل الصيانة</div>
                    </div>
                    <div class="pf-img-box">
                        <img src="${item.after}" alt="بعد">
                        <div class="pf-img-lbl">🟢 بعد التسليم</div>
                    </div>
                </div>
            </div>
        `;
    });
}

function addPortfolioItem() {
    const title = document.getElementById('pf-title').value;
    const before = document.getElementById('pf-before-img').value || 'https://via.placeholder.com/150?text=Before';
    const after = document.getElementById('pf-after-img').value || 'https://via.placeholder.com/150?text=After';

    if (!title) {
        alert("يرجى إدخال عنوان للعمل!");
        return;
    }

    let items = JSON.parse(localStorage.getItem('pf_items') || '[]');
    items.unshift({ title, before, after });
    localStorage.setItem('pf_items', JSON.stringify(items));

    alert("تمت إضافة سابقة العمل بمعرضك بنجاح!");
    document.getElementById('pf-title').value = '';
    loadPortfolio();
}

// ----------------------------------------------------
// بيانات الملف الشخصي
// ----------------------------------------------------
function renderTelegramUserProfile() {
    const avatarImg = document.getElementById('user-avatar');
    const fullNameElem = document.getElementById('profile-full-name');
    const userCodeElem = document.getElementById('profile-user-code');

    userCodeElem.innerText = userCode;

    document.getElementById('profile-whatsapp').value = localStorage.getItem('social_whatsapp') || '';
    document.getElementById('profile-facebook').value = localStorage.getItem('social_facebook') || '';
    document.getElementById('profile-tiktok').value = localStorage.getItem('social_tiktok') || '';

    if (telegramUser) {
        const fullName = `${telegramUser.first_name || ''} ${telegramUser.last_name || ''}`.trim() || 'مستخدم تليجرام';
        fullNameElem.innerText = fullName;

        if (telegramUser.photo_url) {
            avatarImg.src = telegramUser.photo_url;
        } else {
            avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=2b5278&color=fff`;
        }
    } else {
        fullNameElem.innerText = "مستخدم زائر";
        avatarImg.src = "https://via.placeholder.com/100?text=Guest";
    }
}

function saveSocialLinks() {
    localStorage.setItem('social_whatsapp', document.getElementById('profile-whatsapp').value);
    localStorage.setItem('social_facebook', document.getElementById('profile-facebook').value);
    localStorage.setItem('social_tiktok', document.getElementById('profile-tiktok').value);
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

function openVerificationInfo() {
    alert("لطلب شارة التوثيق الزرقاء 🔵، يرجى التواصل مع إدارة المنصة وتحويل الإثباتات اللازمة.");
}
