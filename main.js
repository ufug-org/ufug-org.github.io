// دالة إظهار وإخفاء النافذة المنبثقة
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

// دالة جلب البيانات الأساسية
async function fetchAllData() {
    const projectsContainer = document.getElementById('projects-container');
    const projectsLoading = document.getElementById('projects-loading');
    
    const newsContainer = document.getElementById('news-container');
    const newsLoading = document.getElementById('news-loading');
    
    const cacheBuster = new Date().getTime();

    // 1. جلب المشاريع
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

    // 2. جلب الأخبار
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

// دالة رسم المشاريع
function renderProjects(projects, container) {
    projects.forEach(proj => {
        let statusColor = proj.status === 'قريباً' ? 'bg-amber-100 text-amber-700' : 
                          proj.status === 'نسخة تجريبية' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800';
        
        let tagsHtml = '';
        if(proj.tags && Array.isArray(proj.tags)) {
            tagsHtml = '<div class="mt-4 flex flex-wrap gap-2">' + proj.tags.map(tag => `<span class="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded border border-gray-200">${tag}</span>`).join('') + '</div>';
        }

        let imgSrc = proj.image ? `Photos/${proj.image}` : 'https://via.placeholder.com/80?text=أفق';

        container.innerHTML += `
            <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
                <div class="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div>
                    <div class="flex items-start justify-between mb-4">
                        <div class="flex items-center gap-3 w-full">
                            <img src="${imgSrc}" alt="${proj.title}" onerror="this.src='https://via.placeholder.com/80?text=أفق'" class="w-12 h-12 rounded-lg object-cover shadow-sm border border-gray-100 flex-shrink-0">
                            <div class="flex-grow">
                                <h4 class="text-lg font-bold text-gray-800 mb-1 leading-tight group-hover:text-emerald-600 transition">${proj.title}</h4>
                                <span class="inline-block text-[10px] font-bold ${statusColor} px-2 py-0.5 rounded-full">${proj.status}</span>
                            </div>
                        </div>
                    </div>
                    <p class="text-gray-600 text-sm leading-relaxed mb-4">${proj.description}</p>
                </div>
                <div>
                    ${tagsHtml}
                    ${proj.link ? `<a href="${proj.link}" target="_blank" class="mt-5 block text-center bg-gray-50 hover:bg-emerald-600 hover:text-white text-gray-700 font-bold py-2 rounded-lg transition border border-gray-200 hover:border-transparent text-sm">عرض المشروع &larr;</a>` : ''}
                </div>
            </div>
        `;
    });
}

// دالة رسم الأخبار (تصميم الشريط الزمني)
function renderNews(news, container) {
    news.forEach((item) => {
        let imgSrcHtml = item.image ? `<img src="Photos/${item.image}" onerror="this.style.display='none'" class="mt-4 rounded-lg border border-gray-100 max-h-48 object-cover shadow-sm">` : '';
        let linkHtml = item.link ? `<a href="${item.link}" target="_blank" class="text-indigo-600 font-bold text-sm hover:underline mt-3 inline-block">التفاصيل &larr;</a>` : '';
        
        container.innerHTML += `
            <div class="relative pl-6 sm:pl-0 sm:pr-8 group">
                <!-- النقطة على الخط الزمني -->
                <div class="absolute top-1.5 -right-[5px] w-2.5 h-2.5 bg-gray-300 rounded-full border-2 border-white group-hover:bg-indigo-500 group-hover:scale-150 transition-all z-10"></div>
                
                <div class="bg-gray-50 p-5 rounded-xl border border-gray-100 hover:border-indigo-100 hover:shadow-sm transition">
                    <span class="text-xs font-bold text-indigo-500 mb-2 block">${item.date}</span>
                    <h4 class="text-lg font-bold text-gray-800 mb-2">${item.title}</h4>
                    <p class="text-gray-600 text-sm leading-relaxed">${item.description}</p>
                    ${imgSrcHtml}
                    ${linkHtml}
                </div>
            </div>
        `;
    });
}

// تشغيل دالة الجلب عند تحميل الصفحة
window.onload = fetchAllData;