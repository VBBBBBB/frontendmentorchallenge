// Ensure linters know about the global lucide object from CDN
const lucide = window.lucide;

// Mock Data setup directly in JS to avoid CORS fetching issues locally
let extensions = [
    {
        id: "ext-1",
        name: "AdBlocker Pro",
        description: "Block all ads maliciously tracked by third-party cookies.",
        icon: "shield",
        author: "Privacy First",
        version: "v3.2.1",
        status: "active"
    },
    {
        id: "ext-2",
        name: "Grammar Checker",
        description: "Ensure your text is clear, mistake-free, and impactful.",
        icon: "edit-2",
        author: "Textify Ltd",
        version: "v1.9.4",
        status: "active"
    },
    {
        id: "ext-3",
        name: "Password Vault",
        description: "Securely store your passwords across all your devices.",
        icon: "key",
        author: "Vault Systems",
        version: "v5.0.2",
        status: "inactive"
    },
    {
        id: "ext-4",
        name: "Dark Mode Everywhere",
        description: "Apply dark mode to any website out there seamlessly.",
        icon: "moon",
        author: "Night Owls",
        version: "v2.1.0",
        status: "active"
    }
];

// State variables
let currentFilter = 'all';
let currentSearch = '';
let itemToDeleteId = null;
let lastFocusedElement = null;

// DOM Elements
const extensionGrid = document.getElementById('extensionGrid');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const themeToggle = document.getElementById('themeToggle');
const deleteModal = document.getElementById('deleteModal');
const modalExtName = document.getElementById('modalExtName');
const cancelBtn = document.getElementById('cancelBtn');
const confirmBtn = document.getElementById('confirmBtn');

// Initialize
function init() {
    loadTheme();
    render();
    setupEventListeners();
}

function createElement(tag, className = '', textContent = '') {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (textContent) el.textContent = textContent;
    return el;
}

function render() {
    const filtered = extensions.filter(ext => {
        const matchesFilter = currentFilter === 'all' || ext.status === currentFilter;
        const matchesSearch = ext.name.toLowerCase().includes(currentSearch) || 
                              ext.description.toLowerCase().includes(currentSearch);
        return matchesFilter && matchesSearch;
    });

    extensionGrid.innerHTML = '';
    
    if (filtered.length === 0) {
        extensionGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        extensionGrid.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        filtered.forEach(ext => {
            const li = document.createElement('li');
            const card = document.createElement('article');
            card.className = 'ext-card';
            
            // Header
            const header = createElement('div', 'ext-card-header');
            const iconWrap = createElement('div', 'ext-icon');
            const iconSvg = createElement('i');
            iconSvg.setAttribute('data-lucide', ext.icon);
            iconWrap.appendChild(iconSvg);
            
            const titleWrap = createElement('div', 'ext-title');
            const titleH2 = createElement('h2', '', ext.name);
            const titleSpan = createElement('span', '', `${ext.version} \u2022 ${ext.author}`);
            titleWrap.appendChild(titleH2);
            titleWrap.appendChild(titleSpan);
            
            header.appendChild(iconWrap);
            header.appendChild(titleWrap);
            
            // Desc
            const desc = createElement('p', 'ext-desc', ext.description);
            
            // Footer
            const footer = createElement('div', 'ext-footer');
            
            const statusCapitalized = ext.status.charAt(0).toUpperCase() + ext.status.slice(1);
            const statusBadge = createElement('div', `status-badge status-${ext.status}`);
            const statusInd = createElement('div', 'status-indicator');
            statusBadge.appendChild(statusInd);
            statusBadge.appendChild(document.createTextNode(statusCapitalized));
            
            const actionsWrap = createElement('div', 'card-actions');
            
            // Toggle Button
            const toggleBtn = createElement('button', 'icon-btn');
            toggleBtn.setAttribute('type', 'button');
            toggleBtn.setAttribute('title', `${ext.status === 'active' ? 'Disable' : 'Enable'} extension`);
            toggleBtn.setAttribute('aria-label', `${ext.status === 'active' ? 'Disable' : 'Enable'} ${ext.name}`);
            toggleBtn.addEventListener('click', () => toggleExt(ext.id));
            
            const pwrIcon = createElement('i');
            pwrIcon.setAttribute('data-lucide', 'power');
            pwrIcon.setAttribute('aria-hidden', 'true');
            if (ext.status !== 'active') {
                pwrIcon.className = 'power-active';
            }
            toggleBtn.appendChild(pwrIcon);
            
            // Delete Button
            const delBtn = createElement('button', 'icon-btn delete');
            delBtn.setAttribute('type', 'button');
            delBtn.setAttribute('title', 'Remove extension');
            delBtn.setAttribute('aria-label', `Remove ${ext.name}`);
            delBtn.addEventListener('click', () => openDeleteModal(ext.id));
            
            const trashIcon = createElement('i');
            trashIcon.setAttribute('data-lucide', 'trash-2');
            trashIcon.setAttribute('aria-hidden', 'true');
            delBtn.appendChild(trashIcon);
            
            actionsWrap.appendChild(toggleBtn);
            actionsWrap.appendChild(delBtn);
            
            footer.appendChild(statusBadge);
            footer.appendChild(actionsWrap);
            
            card.appendChild(header);
            card.appendChild(desc);
            card.appendChild(footer);
            
            li.appendChild(card);
            extensionGrid.appendChild(li);
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Event Listeners
function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        render();
    });

    filterSelect.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        render();
    });

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const iconElement = document.getElementById('themeIcon');
        iconElement.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
        if (typeof lucide !== 'undefined') lucide.createIcons();
    });

    cancelBtn.addEventListener('click', closeDeleteModal);
    confirmBtn.addEventListener('click', confirmDelete);
}

// Logic Functions
function toggleExt(id) {
    extensions = extensions.map(ext => {
        if (ext.id === id) {
            return { ...ext, status: ext.status === 'active' ? 'inactive' : 'active' };
        }
        return ext;
    });
    render();
}

function openDeleteModal(id) {
    const ext = extensions.find(e => e.id === id);
    if (ext) {
        lastFocusedElement = document.activeElement;
        itemToDeleteId = id;
        modalExtName.textContent = ext.name;
        deleteModal.classList.remove('hidden');
        cancelBtn.focus();
    }
}

function closeDeleteModal() {
    deleteModal.classList.add('hidden');
    itemToDeleteId = null;
    if (lastFocusedElement) {
        lastFocusedElement.focus();
    }
}

function confirmDelete() {
    if (itemToDeleteId) {
        extensions = extensions.filter(ext => ext.id !== itemToDeleteId);
        closeDeleteModal();
        render();
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('themeIcon').setAttribute('data-lucide', savedTheme === 'dark' ? 'sun' : 'moon');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeIcon').setAttribute('data-lucide', 'sun');
    }
}

document.addEventListener('DOMContentLoaded', init);
