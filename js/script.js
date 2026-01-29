// Хранение выбранных услуг
const selectedServices = new Set();

// Данные услуг
let servicesData = {};

/**
 * Загрузка данных из JSON
 */
async function loadData() {
    try {
        const response = await fetch('data.json');
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
    }
}

/**
 * Рендеринг списка услуг
 */
function renderServices(services) {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) return;
    
    servicesList.innerHTML = services.map(service => `
        <div class="service-item" data-type="${service.id}" onclick="toggleService(this)">
            <h4>${service.name}</h4>
            <p>${service.description}</p>
        </div>
    `).join('');
}

/**
 * Переключение выбора услуги
 */
function toggleService(element) {
    const type = element.getAttribute('data-type');
    
    if (element.classList.contains('active')) {
        // Снять выбор
        element.classList.remove('active');
        selectedServices.delete(type);
    } else {
        // Добавить выбор
        element.classList.add('active');
        selectedServices.add(type);
    }
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
    
    // Инициализировать бургер-меню
    initBurgerMenu();
    
    console.log('Сайт загружен и готов к работе');
});