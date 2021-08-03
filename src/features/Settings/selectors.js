import translations from '../../translations';

export const selectLanguage = (state) => state.settings.language;
export const selectMessages = (state) => translations(state.settings.language)
    || {};
