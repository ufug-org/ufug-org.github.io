// 1. تحديد لغة الصفحة الحالية (يتم قراءتها من وسم html في صفحة index.html)
const currentLang = document.documentElement.lang || 'ar';

// 2. دالة استخراج البيانات باللغة المناسبة مع حماية التوافقية الرجعية
function getLocalizedData(item) {
    // إذا كان العنصر يحتوي على مفتاح اللغة الحالي (مثلاً ar أو en)
    if (item[currentLang] && typeof item[currentLang] === 'object') {
        return item[currentLang];
    }
    // العودة للغة العربية كخيار افتراضي لحماية الموقع من الفراغ
    if (item['ar'] && typeof item['ar'] === 'object') {
        return item['ar'];
    }
    // العودة للغة الإنجليزية إن لم توجد العربية
    if (item['en'] && typeof item['en'] === 'object') {
        return item['en'];
    }
    // التوافقية الرجعية: إذا كان الملف بالنظام القديم (بدون مفاتيح لغات)، أرجع العنصر كما هو
    return item; 
}

// 3. دالة إظهار وإخفاء النافذة المنبثقة (Modal)
function toggleModal(modalID) {
    const modal = document.getElementById(modalID);
    const body = document.body;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        setTimeout(() => { 
            modal.classList.remove('opacity-0'); 
            modal.firstElementChild.classList.remove('scale-95'); 
        }, 10);
        body.classList.add('modal-active');
    } else {
        modal.classList.add('opacity-0');
        modal.firstElementChild.classList.add('scale-95');
        setTimeout(() => { modal.classList.add('hidden'); }, 300);
        body.classList.remove('modal-active');
    }
}

// 4. دالة جلب البيانات الأساسية من الملفين المنفصلين
async function fetchAllData() {
    const projectsContainer = document.getElementById('projects-container');
    const projectsLoading = document.getElementById('projects-loading');
    
    const newsContainer = document.getElementById('news-container');
    const newsLoading = document.getElementById('news-loading');
    
    // لكسر الكاش وضمان جلب أحدث بيانات
    const cacheBuster = new Date().getTime();

    // أولاً: جلب المشاريع
    try {
        const projectsResponse = await fetch(`https://ufug.org/projects.json?nocache=${cacheBuster}`);
        projectsLoading.style.display = 'none';

        if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            if (projectsData.projects && Array.isArray(projectsData.projects) && projectsData.projects.length > 0) {
                renderProjects(projectsData.projects, projectsContainer);
            } else {
                projectsContainer.innerHTML = '<div class="col-span-full text-center text-gray-500 py-10 font-bold">لم يتم العثور على مشاريع.</div>';
            }
        } else {
            projectsContainer.innerHTML = '<div class="col-span-full text-center text-red-500 py-10 font-bold">تعذر تحميل المشاريع حالياً.</div>';
        }
    } catch (error) {
        projectsLoading.style.display = 'none';
        projectsContainer.innerHTML = '<div class="col-span-full text-center text-red-500 py-10 font-bold">حدث خطأ في الاتصال أثناء جلب المشاريع.</div>';
        console.error("Projects Fetch Error:", error);
    }

    // ثانياً: جلب الأخبار
    try {
        const newsResponse = await fetch(`https://ufug.org/news.json?nocache=${cacheBuster}`);
        newsLoading.style.display = 'none';

        if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            if (newsData.news && Array.isArray(newsData.news) && newsData.news.length > 0) {
                renderNews(newsData.news, newsContainer);
            } else {
                newsContainer.innerHTML = '<div class="text-gray-500 py-6 text-sm">لا توجد أخبار حالياً.</div>';
            }
        } else {
            newsContainer.innerHTML = '<div class="text-red-500 py-6 text-sm">تعذر تحميل الأخبار حالياً.</div>';
        }
    } catch (error) {
        newsLoading.style.display = 'none';
        newsContainer.innerHTML = '<div class="text-red-500 py-6 text-sm">حدث خطأ في الاتصال أثناء جلب الأخبار.</div>';
        console.error("News Fetch Error:", error);
    }
}

// 5. دالة رسم المشاريع بشكل احترافي
function renderProjects(projects, container) {
    projects.forEach(proj => {
        // قراءة النصوص بناءً على اللغة (من المتغيرات)
        const locData = getLocalizedData(proj);
        
        const pTitle = locData.title || 'بدون عنوان';
        const pDesc = locData.description || '';
        const pStatus = locData.status || '';
        const pTagsArray = locData.tags || [];

        // قراءة الثوابت (من الجذر الأساسي للعنصر)
        const imgSrc = proj.image ? `Photos/${proj.image}` : 'https://via.placeholder.com/80?text=أفق';
        const pLink = proj.link || '';

        // تلوين الحالة
        let statusColor = pStatus === 'قريباً' || pStatus.toLowerCase() === 'coming soon' ? 'bg-amber-100 text-amber-700' : 
                          pStatus === 'نسخة تجريبية' || pStatus.toLowerCase() === 'beta' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800';
        
        // بناء الكلمات المفتاحية
        let tagsHtml = '';
        if(Array.isArray(pTagsArray) && pTagsArray.length > 0) {
            tagsHtml = '<div class="mt-4 flex flex-wrap gap-2">' + pTagsArray.map(tag => `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded border border-gray-200">${tag}</span>`).join('') + '</div>';
        }

        container.innerHTML += `
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div>
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-3 w-full">
                            <img src="${imgSrc}" alt="${pTitle}" onerror="this.src='https://via.placeholder.com/80?text=أفق'" class="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100 flex-shrink-0">
                            <div class="flex-grow">
                                <h4 class="text-lg font-bold text-gray-800 mb-1 leading-tight group-hover:text-emerald-600 transition">${pTitle}</h4>
                                ${pStatus ? `<span class="inline-block text-[10px] font-bold ${statusColor} px-2 py-0.5 rounded-full">${pStatus}</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed mb-4">${pDesc}</p>
                </div>
                <div>
                    ${tagsHtml}
                    ${pLink ? `<a href="${pLink}" target="_blank" class="mt-5 block text-center bg-gray-50 hover:bg-emerald-600 hover:text-white text-gray-700 font-bold py-2 rounded-lg transition border border-gray-200 hover:border-transparent text-sm">عرض التفاصيل &larr;</a>` : ''}
                </div>
            </div>
        `;
    });
}

// 6. دالة رسم الأخبار بخط زمني
function renderNews(news, container) {
    news.forEach((item) => {
        // قراءة النصوص بناءً على اللغة
        const locData = getLocalizedData(item);
        
        const nTitle = locData.title || 'بدون عنوان';
        const nDesc = locData.description || '';
        
        // قراءة الثوابت
        const nDate = item.date || '';
        const nImage = item.image || '';
        const nLink = item.link || '';

        let imgSrcHtml = nImage ? `<img src="Photos/${nImage}" onerror="this.style.display='none'" class="mt-4 rounded-lg border border-gray-100 max-h-48 object-cover shadow-sm w-full">` : '';
        let linkHtml = nLink && nLink !== "#" ? `<a href="${nLink}" target="_blank" class="text-indigo-600 font-bold text-sm hover:underline mt-3 inline-block">التفاصيل &larr;</a>` : '';
        
        container.innerHTML += `
            <div class="relative pl-6 sm:pl-0 sm:pr-8 group">
                <div class="absolute top-1.5 -right-[5px] w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white group-hover:bg-indigo-500 group-hover:scale-150 transition-all z-10"></div>
                
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition">
                    ${nDate ? `<span class="text-xs font-bold text-indigo-500 mb-2 block">${nDate}</span>` : ''}
                    <h4 class="text-lg font-bold text-gray-800 mb-2">${nTitle}</h4>
                    <p class="text-gray-600 text-sm leading-relaxed">${nDesc}</p>
                    ${imgSrcHtml}
                    ${linkHtml}
                </div>
            </div>
        `;
    });
}

// 7. تشغيل الجلب فور تحميل الصفحة
window.onload = fetchAllData;