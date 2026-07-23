// تهيئة تطبيق تليجرام المصغر
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand(); // توسيع الشاشة
}

// ⚠️ استبدل البيانات دي برابطك ومفتاحك من إعدادات Supabase (API Settings)
const SUPABASE_URL = "https://your-project-id.supabase.co";
const SUPABASE_KEY = "your-anon-key";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    await loadNeighborhoods();

    // التفاعل عند تغيير القطاع
    document.getElementById('category-select').addEventListener('change', async (e) => {
        const categoryId = e.target.value;
        if (categoryId) {
            await loadJobs(categoryId);
        } else {
            const jobSelect = document.getElementById('job-select');
            jobSelect.innerHTML = '<option value="">اختر القطاع أولاً</option>';
            jobSelect.disabled = true;
        }
    });
});

// 1. تحميل القطاعات
async function loadCategories() {
    const { data, error } = await supabase.from('job_categories').select('*');
    const select = document.getElementById('category-select');
    if (error || !data) {
        select.innerHTML = '<option>خطأ في التحميل</option>';
        return;
    }
    select.innerHTML = '<option value="">-- اختر القطاع --</option>';
    data.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
    });
}

// 2. تحميل المهن بناءً على القطاع
async function loadJobs(categoryId) {
    const select = document.getElementById('job-select');
    select.disabled = false;
    select.innerHTML = '<option value="">جاري التحميل...</option>';

    const { data, error } = await supabase.from('jobs').select('*').eq('category_id', categoryId);
    if (error || !data) {
        select.innerHTML = '<option>خطأ في التحميل</option>';
        return;
    }
    select.innerHTML = '<option value="">-- اختر المهنة --</option>';
    data.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.title}</option>`;
    });
}

// 3. تحميل الأحياء
async function loadNeighborhoods() {
    const { data, error } = await supabase.from('neighborhoods').select('*');
    const select = document.getElementById('zone-select');
    if (error || !data) {
        select.innerHTML = '<option>خطأ في التحميل</option>';
        return;
    }
    select.innerHTML = '<option value="">-- اختر الحي --</option>';
    data.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.name} (${item.zone})</option>`;
    });
}
