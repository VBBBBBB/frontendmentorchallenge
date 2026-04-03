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
    // Render Icons
    lucide.createIcons();
}

function render() {
    // Filter logic
    const filtered = extensions.filter(ext => {
        const matchesFilter = currentFilter === 'all' || ext.status === currentFilter;
        const matchesSearch = ext.name.toLowerCase().includes(currentSearch) || 
                              ext.description.toLowerCase().includes(currentSearch);
        return matchesFilter && matchesSearch;
    });

    // Render logic
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
            
            const powerClass = ext.status === 'active' ? '' : 'power-active';
            const statusCapitalized = ext.status.charAt(0).toUpperCase() + ext.status.slice(1);
            
            card.innerHTML = `
                <div class="ext-card-header">
                    <div class="ext-icon">
                        <i data-lucide="${ext.icon}"></i>
                    </div>
                    <div class="ext-title">
                        <h2>${ext.name}</h2>
                        <span>${ext.version} • ${ext.author}</span>
                    </div>
                </div>
                <p class="ext-desc">${ext.description}</p>
                <div class="ext-footer">
                    <div class="status-badge status-${ext.status}">
                        <div class="status-indicator"></div>
                        ${statusCapitalized}
                    </div>
                    <div class="card-actions">
                        <button type="button" class="icon-btn" onclick="toggleExt('${ext.id}')" title="${ext.status === 'active' ? 'Disable' : 'Enable'} extension" aria-label="${ext.status === 'active' ? 'Disable' : 'Enable'} ${ext.name}">
                            <i data-lucide="power" class="${powerClass}" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="icon-btn delete" onclick="openDeleteModal('${ext.id}')" title="Remove extension" aria-label="Remove ${ext.name}">
                            <i data-lucide="trash-2" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            `;
            li.appendChild(card);
            extensionGrid.appendChild(li);
        });
        
        // Re-initialize dynamic icons inserted into DOM
        lucide.createIcons();
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
        
        // Update theme icon
        const iconElement = document.getElementById('themeIcon');
        iconElement.setAttribute('data-lucide', newTheme === 'dark' ? 'sun' : 'moon');
        lucide.createIcons();
    });

    cancelBtn.addEventListener('click', closeDeleteModal);
    confirmBtn.addEventListener('click', confirmDelete);
}

// Global functions for inline onclick handlers
window.toggleExt = function(id) {
    extensions = extensions.map(ext => {
        if (ext.id === id) {
            return { ...ext, status: ext.status === 'active' ? 'inactive' : 'active' };
        }
        return ext;
    });
    render();
};

let lastFocusedElement = null;

window.openDeleteModal = function(id) {
    const ext = extensions.find(e => e.id === id);
    if (ext) {
        lastFocusedElement = document.activeElement;
        itemToDeleteId = id;
        modalExtName.textContent = ext.name;
        deleteModal.classList.remove('hidden');
        cancelBtn.focus();
    }
};

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
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('themeIcon').setAttribute('data-lucide', 'sun');
    }
}

// Start app
document.addEventListener('DOMContentLoaded', init);
