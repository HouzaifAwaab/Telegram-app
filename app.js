// تهيئة تطبيق تليجرام المصغر
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
    tg.ready();
    tg.expand();
}

// بيانات المشروع في Supabase
const SUPABASE_URL = "https://ssnezkzajkxkogieztxb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzbmV6a3phamt4a29naWV6dHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQ4MDY3NjgsImV4cCI6MjEwMDM4Mjc2OH0.XVxtHJDWZAfQ3DplLwPjPgUOVZwYvYfFAAM7PFxqnb8";

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
    const select = document.getElementById('category-select');
    try {
        const { data, error } = await supabase.from('job_categories').select('*');
        if (error || !data || data.length === 0) {
            select.innerHTML = '<option>لا توجد قطاعات مفعّلة</option>';
            console.error("Supabase Error:", error);
            return;
        }
        select.innerHTML = '<option value="">-- اختر القطاع --</option>';
        data.forEach(item => {
            select.innerHTML += `<option value="${item.id}">${item.name}</option>`;
        });
    } catch (err) {
        select.innerHTML = '<option>حدث خطأ في الاتصال</option>';
    }
}

// 2. تحميل المهن بناءً على القطاع
async function loadJobs(categoryId) {
    const select = document.getElementById('job-select');
    select.disabled = false;
    select.innerHTML = '<option value="">جاري التحميل...</option>';

    const { data, error } = await supabase.from('jobs').select('*').eq('category_id', categoryId);
    if (error || !data || data.length === 0) {
        select.innerHTML = '<option>لا توجد مهن في هذا القطاع</option>';
        return;
    }
    select.innerHTML = '<option value="">-- اختر المهنة --</option>';
    data.forEach(item => {
        select.innerHTML += `<option value="${item.id}">${item.title}</option>`;
    });
}

// 3. تحميل الأحياء
async function loadNeighborhoods() {
    const select = document.getElementById('zone-select');
    try {
        const { data, error } = await supabase.from('neighborhoods').select('*');
        if (error || !data || data.length === 0) {
            select.innerHTML = '<option>لا توجد أحياء مفعّلة</option>';
            console.error("Supabase Error:", error);
            return;
        }
        select.innerHTML = '<option value="">-- اختر الحي --</option>';
        data.forEach(item => {
            select.innerHTML += `<option value="${item.id}">${item.name} (${item.zone})</option>`;
        });
    } catch (err) {
        select.innerHTML = '<option>حدث خطأ في الاتصال</option>';
    }
               }
