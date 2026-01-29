// Хранение выбранных услуг
const selectedServices = new Set();

// Данные услуг
let servicesData = {};

// Маппинг типов услуг к ID анимаций
const serviceAnimations = {
    'plumbing': 'plumbing-animation',
    'electrical': 'electrical-animation',
    'flooring': 'flooring-animation',
    'painting': 'painting-animation',
    'walls': 'walls-animation',
    'windows': 'windows-animation'
};

// Описания для визуализаций
const visualizationDescriptions = {
    'plumbing': 'Монтаж водопроводных и канализационных систем с использованием современных материалов',
    'electrical': 'Прокладка электропроводки и установка электрооборудования согласно нормам безопасности',
    'flooring': 'Профессиональная укладка напольных покрытий с выравниванием основания',
    'painting': 'Качественная окраска поверхностей с предварительной подготовкой',
    'walls': 'Выравнивание и отделка стен под финишное покрытие',
    'windows': 'Установка современных оконных и дверных конструкций с гарантией герметичности'
};

/**
 * Загрузка данных из JSON
 */
async function loadData() {
    try {
        // Пробуем разные пути к data.json
        let response;
        const paths = ['./data.json', '../data.json', 'data.json'];
        
        for (const path of paths) {
            try {
                response = await fetch(path);
                if (response.ok) break;
            } catch (e) {
                continue;
            }
        }
        
        if (!response || !response.ok) {
            throw new Error('Не удалось найти data.json');
        }
        
        const data = await response.json();
        
        // Преобразуем массив услуг в объект для быстрого доступа
        data.services.forEach(service => {
            servicesData[service.id] = service;
        });
        
        // Рендерим список услуг
        renderServices(data.services);
        
        return data;
    } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        
        // Фоллбэк - используем встроенные данные
        useFallbackData();
    }
}

/**
 * Использовать встроенные данные если JSON не загрузился
 */
function useFallbackData() {
    // Встроенные данные как запасной вариант
    const fallbackData = {
        services: [
            {
                id: "plumbing",
                name: "Сантехнические работы",
                description: "Замена труб, установка сантехники, водоснабжение и канализация",
                price: 15000,
                days: 5
            },
            {
                id: "electrical",
                name: "Электромонтажные работы",
                description: "Прокладка электропроводки, установка розеток и выключателей",
                price: 12000,
                days: 7
            },
            {
                id: "flooring",
                name: "Напольные покрытия",
                description: "Укладка ламината, паркета, плитки и других покрытий",
                price: 20000,
                days: 10
            },
            {
                id: "painting",
                name: "Малярные работы",
                description: "Покраска стен и потолков, декоративная отделка",
                price: 8000,
                days: 3
            },
            {
                id: "walls",
                name: "Отделка стен",
                description: "Штукатурка, шпаклевка, поклейка обоев",
                price: 10000,
                days: 5
            },
            {
                id: "windows",
                name: "Установка окон и дверей",
                description: "Монтаж окон, дверей и фурнитуры",
                price: 25000,
                days: 8
            }
        ]
    };
    
    // Преобразуем массив услуг в объект
    fallbackData.services.forEach(service => {
        servicesData[service.id] = service;
    });
    
    // Рендерим список услуг
    renderServices(fallbackData.services);
    
    console.log('Используются встроенные данные. Для изменения цен и сроков отредактируйте data.json');
}

/**
 * Рендеринг списка услуг
 */
function renderServices(services) {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    
    servicesList.innerHTML = services.map(service => `
        <div class="service-item" data-type="${service.id}" onclick="toggleService(this, '${service.id}')">
            <h4>${service.name}</h4>
            <p>${service.description}</p>
            <div class="price-info">
                <div>
                    <span style="font-size: 0.85rem; opacity: 0.8;">Стоимость</span>
                    <strong>${formatPrice(service.price)}</strong>
                </div>
                <div>
                    <span style="font-size: 0.85rem; opacity: 0.8;">Срок</span>
                    <strong>${formatDays(service.days)}</strong>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Форматирование цены
 */
function formatPrice(price) {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(price);
}

/**
 * Форматирование дней
 */
function formatDays(days) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;
    
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return `${days} дней`;
    }
    
    if (lastDigit === 1) {
        return `${days} день`;
    }
    
    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${days} дня`;
    }
    
    return `${days} дней`;
}

/**
 * Переключение выбора услуги
 */
function toggleService(element, serviceId) {
    const type = element.getAttribute('data-type');
    
    if (element.classList.contains('active')) {
        // Снять выбор
        element.classList.remove('active');
        selectedServices.delete(type);
        hideVisualization(type);
    } else {
        // Добавить выбор
        element.classList.add('active');
        selectedServices.add(type);
        showVisualization(type);
    }
    
    // Обновить смету
    updateEstimate();
    
    // Добавить тактильный эффект
    element.style.transform = 'scale(0.98)';
    setTimeout(() => {
        element.style.transform = '';
    }, 150);
}

/**
 * Показать визуализацию услуги
 */
function showVisualization(serviceId) {
    // Скрыть все визуализации
    const allVisuals = document.querySelectorAll('.service-visual');
    allVisuals.forEach(visual => {
        visual.style.display = 'none';
    });
    
    // Показать нужную визуализацию
    const animationId = serviceAnimations[serviceId];
    if (animationId) {
        const visual = document.getElementById(animationId);
        if (visual) {
            visual.style.display = 'block';
            
            // Перезапустить анимации
            restartAnimations(visual);
        }
    }
    
    // Обновить информационную панель
    updateInfoPanel(serviceId);
}

/**
 * Скрыть визуализацию услуги
 */
function hideVisualization(serviceId) {
    // Если нет выбранных услуг, показать дефолтное сообщение
    if (selectedServices.size === 0) {
        const allVisuals = document.querySelectorAll('.service-visual');
        allVisuals.forEach(visual => {
            visual.style.display = 'none';
        });
        
        const infoPanel = document.getElementById('current-service-info');
        if (infoPanel) {
            infoPanel.innerHTML = '<p>Выберите услугу, чтобы увидеть визуализацию работ</p>';
            infoPanel.classList.remove('active');
        }
    } else {
        // Показать визуализацию последней выбранной услуги
        const lastService = Array.from(selectedServices).pop();
        showVisualization(lastService);
    }
}

/**
 * Перезапустить анимации
 */
function restartAnimations(container) {
    const animations = container.querySelectorAll('[class*="animate"], [class*="drop"], [class*="spark"], [class*="plank"], [class*="stroke"], [class*="texture"], [class*="install"], [class*="brush"], [class*="trowel"], [class*="tool"]');
    
    animations.forEach(elem => {
        // Клонируем элемент для перезапуска анимации
        const clone = elem.cloneNode(true);
        elem.parentNode.replaceChild(clone, elem);
    });
}

/**
 * Обновить информационную панель
 */
function updateInfoPanel(serviceId) {
    const infoPanel = document.getElementById('current-service-info');
    if (!infoPanel) return;
    
    const service = servicesData[serviceId];
    const description = visualizationDescriptions[serviceId];
    
    if (service && description) {
        infoPanel.innerHTML = `
            <p><strong>${service.name}</strong></p>
            <p style="margin-top: 0.5rem; font-size: 0.95rem;">${description}</p>
        `;
        infoPanel.classList.add('active');
    }
}

/**
 * Обновить смету
 */
function updateEstimate() {
    const count = selectedServices.size;
    let totalPrice = 0;
    let totalDays = 0;
    
    // Подсчитать общую стоимость и максимальный срок
    selectedServices.forEach(serviceId => {
        const service = servicesData[serviceId];
        if (service) {
            totalPrice += service.price;
            totalDays = Math.max(totalDays, service.days);
        }
    });
    
    // Обновить счетчики
    const selectedCountElem = document.getElementById('selectedCount');
    const totalPriceElem = document.getElementById('totalPrice');
    const totalDaysElem = document.getElementById('totalDays');
    
    if (selectedCountElem) selectedCountElem.textContent = count;
    if (totalPriceElem) totalPriceElem.textContent = count > 0 ? formatPrice(totalPrice) : '0 ₽';
    if (totalDaysElem) totalDaysElem.textContent = count > 0 ? formatDays(totalDays) : '0 дней';
    
    // Обновить список выбранных услуг
    updateSelectedServicesList();
    
    // Обновить состояние кнопки
    const requestBtn = document.getElementById('request-btn');
    if (requestBtn) {
        requestBtn.disabled = count === 0;
        
        if (count > 0) {
            requestBtn.classList.add('active-estimate');
        } else {
            requestBtn.classList.remove('active-estimate');
        }
    }
    
    // Анимация обновления
    animateEstimateUpdate();
}

/**
 * Обновить список выбранных услуг в смете
 */
function updateSelectedServicesList() {
    const listContainer = document.getElementById('selected-services-list');
    if (!listContainer) return;
    
    if (selectedServices.size === 0) {
        listContainer.innerHTML = `
            <p style="text-align: center; color: #999; font-size: 0.9rem; padding: 1rem;">
                Услуги не выбраны
            </p>
        `;
        return;
    }
    
    const servicesList = Array.from(selectedServices).map(serviceId => {
        const service = servicesData[serviceId];
        if (!service) return '';
        
        return `
            <div class="selected-service-item">
                <div class="service-name">${service.name}</div>
                <div class="service-details">
                    <span>${formatPrice(service.price)}</span>
                    <span>${formatDays(service.days)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    listContainer.innerHTML = servicesList;
}

/**
 * Анимация обновления сметы
 */
function animateEstimateUpdate() {
    const estimateRows = document.querySelectorAll('.estimate-row');
    
    estimateRows.forEach((row, index) => {
        row.style.animation = 'none';
        setTimeout(() => {
            row.style.animation = 'pulse 0.5s ease';
        }, index * 100);
    });
}

/**
 * Обработчик нажатия на кнопку "Оставить заявку"
 */
function handleRequestClick() {
    if (selectedServices.size === 0) return;
    
    // Собрать информацию о выбранных услугах
    const selectedServicesList = Array.from(selectedServices).map(id => {
        const service = servicesData[id];
        return service ? service.name : '';
    }).filter(Boolean);
    
    // Здесь можно добавить логику отправки заявки
    alert(`Спасибо за интерес!\n\nВыбранные услуги:\n${selectedServicesList.join('\n')}\n\nМы свяжемся с вами в ближайшее время.`);
}

/**
 * Инициализация бургер-меню
 */
function initBurgerMenu() {
    const burger = document.querySelector('.burger-menu');
    const nav = document.querySelector('nav ul');
    const navLinks = document.querySelectorAll('nav ul a');
    
    if (!burger || !nav) return;
    
    // Клик по бургеру
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
    
    // Клик по ссылкам - закрываем меню
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Клик вне меню - закрываем
    document.addEventListener('click', (e) => {
        if (!burger.contains(e.target) && !nav.contains(e.target)) {
            if (nav.classList.contains('active')) {
                burger.classList.remove('active');
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}

/**
 * Инициализация при загрузке страницы
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Загрузить данные из JSON
    await loadData();
    
    // Добавить обработчик на кнопку заявки
    const requestBtn = document.getElementById('request-btn');
    if (requestBtn) {
        requestBtn.addEventListener('click', handleRequestClick);
    }
    
    // Инициализировать бургер-меню
    initBurgerMenu();
    
    console.log('Страница услуг загружена и готова к работе');
});