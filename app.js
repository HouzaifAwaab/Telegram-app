// تهيئة تطبيق تليجرام المصغر
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
}

// بيانات Supabase
const SUPABASE_URL = "https://ssnezkzajkxkogieztxb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbmV6a3phamt4a29naWV6dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDY3NjgsImV4cCI6MjEwMDM4Mjc2OH0.XVxtHJDWZAfQ3DplLwPjPgUOVZwYvYfFAAM7PFxqnb8";

const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;

document.addEventListener("DOMContentLoaded", async () => {
    setupNavigation();
    await loadCategories();
    await loadNeighborhoods();
    await loadAds(); // جلب الإعلانات فور فتح التطبيق

    // زر البحث
    document.getElementById('search-btn').addEventListener('click', loadAds);

    // زر نشر الإعلان
    document.getElementById('save-ad-btn').addEventListener('click', saveAd);
});

// التنقل بين الأقسام
function setupNavigation() {
    const btnSearch = document.getElementById('nav-search');
    const btnAdd = document.getElementById('nav-add');
    const secSearch = document.getElementById('search-section');
    const secAdd = document.getElementById('add-section');

    btnSearch.addEventListener('click', () => {
        btnSearch.classList.add('active');
        btnAdd.classList.remove('active');
        secSearch.classList.remove('hidden');
        secAdd.classList.add('hidden');
    });

    btnAdd.addEventListener('click', () => {
        btnAdd.classList.add('active');
        btnSearch.classList.remove('active');
        secAdd.classList.remove('hidden');
        secSearch.classList.add('hidden');
    });
}

// 1. جلب القطاعات
async function loadCategories() {
    const select = document.getElementById('category-select');
    try {
        const { data } = await supabaseClient.from('job_categories').select('*');
        if (data) {
            select.innerHTML = '<option value="">-- كل القطاعات --</option>';
            data.forEach(item => select.innerHTML += `<option value="${item.id}">${item.name}</option>`);
        }
    } catch (e) { console.error(e); }
}

// 2. جلب الأحياء
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
                select.innerHTML += opt;
                addSelect.innerHTML += opt;
            });
        }
    } catch (e) { console.error(e); }
}

// 3. عرض الإعلانات
async function loadAds() {
    const resultsContainer = document.getElementById('results');
    resultsContainer.innerHTML = '<p class="placeholder-text">جاري تحميل البيانات...</p>';

    const categoryId = document.getElementById('category-select').value;
    const zoneName = document.getElementById('zone-select').value;

    let query = supabaseClient.from('job_ads').select('*').order('created_at', { ascending: false });

    if (categoryId) query = query.eq('category_id', categoryId);
    if (zoneName) query = query.eq('zone', zoneName);

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
        resultsContainer.innerHTML = '<p class="placeholder-text">لا توجد إعلانات مطابقة للبحث حالياً.</p>';
        return;
    }

    resultsContainer.innerHTML = '';
    data.forEach(ad => {
        resultsContainer.innerHTML += `
            <div class="ad-card">
                <h4>${ad.title}</h4>
                <span class="zone-badge">📍 ${ad.zone}</span>
                <p>${ad.details || 'لا توجد تفاصيل إضافية'}</p>
                <a href="https://wa.me/249${ad.phone.replace(/^0/, '')}" target="_blank" class="contact-btn">💬 تواصل عبر الواتساب (${ad.phone})</a>
            </div>
        `;
    });
}

// 4. حفظ إعلان جديد
async function saveAd() {
    const title = document.getElementById('tech-title').value;
    const zone = document.getElementById('add-zone-select').value;
    const phone = document.getElementById('tech-phone').value;
    const details = document.getElementById('tech-details').value;

    if (!title || !zone || !phone) {
        alert("الرجاء ملء الأرقام والأسماء المطلوبة!");
        return;
    }

    const { error } = await supabaseClient.from('job_ads').insert([{
        title, zone, phone, details
    }]);

    if (!error) {
        alert("تم نشر إعلانك بنجاح!");
        document.getElementById('nav-search').click();
        await loadAds();
    } else {
        alert("حدث خطأ أثناء النشر، حاول مرة أخرى.");
    }
}
