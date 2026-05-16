/**
 * Budget Monopage - Module d'initialisation et utilitaires
 * Cœur de l'application chargé en premier
 */

const BudgetApp = (function() {
    'use strict';

    // État global de l'application
    let state = {
        currentView: 'dashboard',
        currentMonth: null,
        initialized: false
    };

    // ========================================================================
    // LOCALSTORAGE UTILS
    // ========================================================================

    /**
     * Récupère un élément du localStorage et le parse en JSON
     * @param {string} key - Clé de l'élément
     * @returns {*} Données parsées ou null
     */
    function getItem(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error(`Erreur lors de la lecture de ${key}:`, e);
            return null;
        }
    }

    /**
     * Stocke un élément dans le localStorage après sérialisation JSON
     * @param {string} key - Clé de l'élément
     * @param {*} data - Données à stocker
     */
    function setItem(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (e) {
            console.error(`Erreur lors de l'écriture de ${key}:`, e);
        }
    }

    /**
     * Génère la clé du mois en cours au format bm_mois_YYYY-MM
     * @returns {string} Clé du mois courant
     */
    function getCurrentMonthKey() {
        return 'bm_mois_' + new Date().toISOString().slice(0, 7);
    }

    /**
     * Génère un identifiant unique
     * @returns {string} ID unique
     */
    function generateId() {
        return String(Date.now()) + Math.random().toString(36).slice(2, 7);
    }

    // ========================================================================
    // INITIALISATION
    // ========================================================================

    /**
     * Initialise l'application
     * Vérifie/crée les structures nécessaires dans localStorage
     */
    function initApp() {
        // Vérifier si bm_settings existe, sinon créer structure vide
        let settings = getItem('bm_settings');
        if (!settings) {
            settings = {
                revenus: [],
                charges: [],
                budget_ideal: []
            };
            setItem('bm_settings', settings);
        }

        // Vérifier/créer le mois en cours
        const monthKey = getCurrentMonthKey();
        let currentMonth = getItem(monthKey);
        if (!currentMonth) {
            currentMonth = {
                id: generateId(),
                periode: monthKey.replace('bm_mois_', ''),
                expenses: [],
                created: new Date().toISOString()
            };
            setItem(monthKey, currentMonth);
        }

        state.currentMonth = currentMonth;
        state.initialized = true;

        // Lancer le rendu de la vue active (dashboard par défaut)
        showView('dashboard');

        console.log('BudgetApp initialisé avec succès');
    }

    // ========================================================================
    // CALCULS GLOBAUX
    // ========================================================================

    /**
     * Calcule le total des revenus dans bm_settings
     * @returns {number} Total des revenus
     */
    function getTotalRevenus() {
        const settings = getItem('bm_settings');
        if (!settings || !settings.revenus) return 0;
        
        return settings.revenus.reduce((total, revenu) => {
            return total + (parseFloat(revenu.montant) || 0);
        }, 0);
    }

    /**
     * Calcule le total des charges fixes dans bm_settings
     * @returns {number} Total des charges
     */
    function getTotalCharges() {
        const settings = getItem('bm_settings');
        if (!settings || !settings.charges) return 0;
        
        return settings.charges.reduce((total, charge) => {
            return total + (parseFloat(charge.montant) || 0);
        }, 0);
    }

    /**
     * Calcule le total des dépenses pour une période donnée
     * @param {string} periode - Période au format YYYY-MM
     * @returns {number} Total des dépenses
     */
    function getTotalDepenses(periode) {
        const monthKey = 'bm_mois_' + periode;
        const monthData = getItem(monthKey);
        if (!monthData || !monthData.expenses) return 0;
        
        return monthData.expenses.reduce((total, depense) => {
            return total + (parseFloat(depense.amount) || 0);
        }, 0);
    }

    /**
     * Calcule le solde pour une période donnée
     * @param {string} periode - Période au format YYYY-MM
     * @returns {number} Solde (revenus - charges - dépenses)
     */
    function getSolde(periode) {
        const revenus = getTotalRevenus();
        const charges = getTotalCharges();
        const depenses = getTotalDepenses(periode);
        
        return revenus - charges - depenses;
    }

    /**
     * Agrège les dépenses par catégorie pour une période
     * @param {string} periode - Période au format YYYY-MM
     * @returns {Object} Objet {categorie: total}
     */
    function getDepensesParCategorie(periode) {
        const monthKey = 'bm_mois_' + periode;
        const monthData = getItem(monthKey);
        if (!monthData || !monthData.expenses) return {};
        
        const parCategorie = {};
        
        monthData.expenses.forEach(depense => {
            const categorie = depense.category || 'Autre';
            const montant = parseFloat(depense.amount) || 0;
            
            if (!parCategorie[categorie]) {
                parCategorie[categorie] = 0;
            }
            parCategorie[categorie] += montant;
        });
        
        return parCategorie;
    }

    // ========================================================================
    // NAVIGATION
    // ========================================================================

    /**
     * Affiche la vue demandée et masque les autres
     * @param {string} viewId - Identifiant de la vue à afficher
     */
    function showView(viewId) {
        // Masquer toutes les sections (les sections ont id="vue-xxx")
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active');
        });

        // Afficher la section demandée (par id ou par data-view)
        let targetSection = document.getElementById('vue-' + viewId);
        if (!targetSection) {
            targetSection = document.getElementById(viewId);
        }
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active');
        }

        // Mettre à jour l'état actif de la navigation
        document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.view === viewId) {
                link.classList.add('active');
            }
        });

        // Mettre à jour l'état global
        state.currentView = viewId;

        // Déclencher un événement personnalisé
        window.dispatchEvent(new CustomEvent('viewChanged', { 
            detail: { viewId: viewId } 
        }));
    }

    /**
     * Configure les écouteurs d'événements pour la navigation
     */
    function setupNavigationListeners() {
        document.addEventListener('click', function(e) {
            const navLink = e.target.closest('.nav-link');
            if (navLink && navLink.dataset.view) {
                e.preventDefault();
                showView(navLink.dataset.view);
            }
        });
    }

    // ========================================================================
    // FORMATAGE
    // ========================================================================

    /**
     * Formate un montant en euros (format français)
     * @param {number} montant - Montant à formater
     * @returns {string} Montant formaté ex: "1 234,56 €"
     */
    function formatEuro(montant) {
        const value = parseFloat(montant) || 0;
        return value.toLocaleString('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) + ' €';
    }

    /**
     * Formate une date en format lisible
     * @param {string} dateStr - Date au format ISO ou autre
     * @returns {string} Date formatée ex: "lun. 12 juin 2025"
     */
    function formatDate(dateStr) {
        if (!dateStr) return '';
        
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    // ========================================================================
    // MISE À JOUR HEADER
    // ========================================================================

    /**
     * Met à jour l'en-tête avec le mois en cours et le solde
     */
    function updateHeader() {
        const monthKey = getCurrentMonthKey();
        const period = monthKey.replace('bm_mois_', '');
        
        // Format du mois (ex: "Juin 2025")
        const [year, month] = period.split('-');
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                           'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const monthLabel = `${monthNames[parseInt(month) - 1]} ${year}`;
        
        // Calcul du solde
        const solde = getSolde(period);
        
        // Mise à jour du DOM
        const monthEl = document.getElementById('header-month');
        const balanceEl = document.getElementById('header-balance');
        
        if (monthEl) monthEl.textContent = monthLabel;
        if (balanceEl) {
            balanceEl.textContent = formatEuro(solde);
            balanceEl.style.color = solde >= 0 ? 'var(--accent-color)' : 'var(--danger-color)';
        }
    }

    // ========================================================================
    // API PUBLIQUE
    // ========================================================================

    // Configuration automatique des listeners au chargement
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupNavigationListeners);
    } else {
        setupNavigationListeners();
    }

    // Exposition de l'API publique
    return {
        // Initialisation
        initApp: initApp,
        
        // LocalStorage utils
        getItem: getItem,
        setItem: setItem,
        getCurrentMonthKey: getCurrentMonthKey,
        generateId: generateId,
        
        // Calculs globaux
        getTotalRevenus: getTotalRevenus,
        getTotalCharges: getTotalCharges,
        getTotalDepenses: getTotalDepenses,
        getSolde: getSolde,
        getDepensesParCategorie: getDepensesParCategorie,
        
        // Navigation
        showView: showView,
        
        // Header
        updateHeader: updateHeader,
        
        // Formatage
        formatEuro: formatEuro,
        formatDate: formatDate,
        
        // État
        getState: function() { return { ...state }; }
    };

})();

// Export pour utilisation dans d'autres modules (si module ES6)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BudgetApp;
}
