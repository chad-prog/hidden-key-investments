/**
 * Internationalization (i18n) configuration and utilities
 * Sets up multi-language support for the documentation system
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';

export interface TranslationConfig {
  locale: string;
  label: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_LOCALES: TranslationConfig[] = [
  { locale: 'en', label: 'English', flag: '🇺🇸' },
  { locale: 'es', label: 'Español', flag: '🇪🇸' },
  { locale: 'fr', label: 'Français', flag: '🇫🇷' },
  { locale: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { locale: 'zh', label: '中文', flag: '🇨🇳' },
  { locale: 'ja', label: '日本語', flag: '🇯🇵' },
  { locale: 'ar', label: 'العربية', flag: '🇸🇦', rtl: true },
];

export const DEFAULT_LOCALE = 'en';

/**
 * Translation namespace for documentation portal
 */
export interface DocumentationTranslations {
  portal: {
    title: string;
    searchPlaceholder: string;
    noResults: string;
    loading: string;
    categories: string;
    filterByRole: string;
    allRoles: string;
    totalViews: string;
    documents: string;
    readTime: string;
    updated: string;
    preview: string;
    download: string;
    export: string;
  };
  analytics: {
    title: string;
    totalViews: string;
    documentsTracked: string;
    searches: string;
    avgViewsPerDoc: string;
    popularDocs: string;
    recentSearches: string;
    topCategories: string;
    popularTags: string;
  };
  versionHistory: {
    title: string;
    noHistory: string;
    versions: string;
    viewAll: string;
    additions: string;
    deletions: string;
  };
  common: {
    close: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    back: string;
    next: string;
    loading: string;
    error: string;
    success: string;
  };
}

/**
 * English translations (default)
 */
export const EN_TRANSLATIONS: DocumentationTranslations = {
  portal: {
    title: 'Documentation Portal',
    searchPlaceholder: 'Search documentation...',
    noResults: 'No documents found',
    loading: 'Loading...',
    categories: 'Categories',
    filterByRole: 'Filter by Role',
    allRoles: 'All Roles',
    totalViews: 'Total Views',
    documents: 'Documents',
    readTime: 'Read Time',
    updated: 'Updated',
    preview: 'Preview',
    download: 'Download',
    export: 'Export',
  },
  analytics: {
    title: 'Documentation Analytics',
    totalViews: 'Total Views',
    documentsTracked: 'Documents Tracked',
    searches: 'Searches',
    avgViewsPerDoc: 'Avg. Views/Doc',
    popularDocs: 'Most Popular Documents',
    recentSearches: 'Recent Searches',
    topCategories: 'Top Categories',
    popularTags: 'Popular Tags',
  },
  versionHistory: {
    title: 'Version History',
    noHistory: 'No version history available',
    versions: 'versions',
    viewAll: 'View all',
    additions: 'additions',
    deletions: 'deletions',
  },
  common: {
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },
};

/**
 * Spanish translations
 */
export const ES_TRANSLATIONS: DocumentationTranslations = {
  portal: {
    title: 'Portal de Documentación',
    searchPlaceholder: 'Buscar documentación...',
    noResults: 'No se encontraron documentos',
    loading: 'Cargando...',
    categories: 'Categorías',
    filterByRole: 'Filtrar por Rol',
    allRoles: 'Todos los Roles',
    totalViews: 'Vistas Totales',
    documents: 'Documentos',
    readTime: 'Tiempo de Lectura',
    updated: 'Actualizado',
    preview: 'Vista Previa',
    download: 'Descargar',
    export: 'Exportar',
  },
  analytics: {
    title: 'Análisis de Documentación',
    totalViews: 'Vistas Totales',
    documentsTracked: 'Documentos Rastreados',
    searches: 'Búsquedas',
    avgViewsPerDoc: 'Promedio Vistas/Doc',
    popularDocs: 'Documentos Más Populares',
    recentSearches: 'Búsquedas Recientes',
    topCategories: 'Principales Categorías',
    popularTags: 'Etiquetas Populares',
  },
  versionHistory: {
    title: 'Historial de Versiones',
    noHistory: 'No hay historial de versiones disponible',
    versions: 'versiones',
    viewAll: 'Ver todas',
    additions: 'adiciones',
    deletions: 'eliminaciones',
  },
  common: {
    close: 'Cerrar',
    cancel: 'Cancelar',
    save: 'Guardar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Atrás',
    next: 'Siguiente',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },
};

/**
 * Translation registry
 */
const TRANSLATIONS: Record<string, DocumentationTranslations> = {
  en: EN_TRANSLATIONS,
  es: ES_TRANSLATIONS,
  // Additional languages can be added here
};

/**
 * Get current locale from browser or localStorage
 */
export function getCurrentLocale(): string {
  // Check localStorage first
  const stored = localStorage.getItem('doc-locale');
  if (stored && SUPPORTED_LOCALES.some(l => l.locale === stored)) {
    return stored;
  }

  // Fallback to browser language
  const browserLang = navigator.language.split('-')[0];
  if (SUPPORTED_LOCALES.some(l => l.locale === browserLang)) {
    return browserLang;
  }

  return DEFAULT_LOCALE;
}

/**
 * Set current locale
 */
export function setCurrentLocale(locale: string): void {
  if (SUPPORTED_LOCALES.some(l => l.locale === locale)) {
    localStorage.setItem('doc-locale', locale);
    
    // Update HTML dir attribute for RTL languages
    const config = SUPPORTED_LOCALES.find(l => l.locale === locale);
    if (config?.rtl) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }
}

/**
 * Get translations for current locale
 */
export function getTranslations(locale?: string): DocumentationTranslations {
  const currentLocale = locale || getCurrentLocale();
  return TRANSLATIONS[currentLocale] || EN_TRANSLATIONS;
}

/**
 * Get translation for a specific key
 */
export function t(key: string, locale?: string): string {
  const translations = getTranslations(locale);
  const keys = key.split('.');
  
  let value: any = translations;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
  }
  
  return String(value);
}

/**
 * React hook for i18n
 */
export function useI18n() {
  const [locale, setLocale] = useState<string>(getCurrentLocale());
  const [translations, setTranslations] = useState<DocumentationTranslations>(
    getTranslations(locale)
  );

  useEffect(() => {
    setTranslations(getTranslations(locale));
  }, [locale]);

  const changeLocale = (newLocale: string) => {
    setCurrentLocale(newLocale);
    setLocale(newLocale);
  };

  const translate = (key: string): string => {
    return t(key, locale);
  };

  return {
    locale,
    changeLocale,
    translations,
    t: translate,
    supportedLocales: SUPPORTED_LOCALES,
  };
}

/**
 * Language Selector Component
 */
export function LanguageSelector() {
  const { locale, changeLocale, supportedLocales } = useI18n();
  const currentConfig = supportedLocales.find(l => l.locale === locale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{currentConfig?.flag}</span>
          <span className="hidden md:inline">{currentConfig?.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLocales.map((config) => (
          <DropdownMenuItem
            key={config.locale}
            onClick={() => changeLocale(config.locale)}
            className={locale === config.locale ? 'bg-accent' : ''}
          >
            <span className="mr-2">{config.flag}</span>
            {config.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
