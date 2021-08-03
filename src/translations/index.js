import en from './en';
import fr from './fr';
import LANGUAGE from './types';

export default (language) => {
  switch (language) {
    case LANGUAGE.EN:
      return en;
    case LANGUAGE.FR:
      return fr;
    default:
      return en;
  }
};
