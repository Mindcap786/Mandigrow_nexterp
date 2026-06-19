/**
 * amount-in-words.ts
 * Converts a numeric rupee amount into words in any of the 8 supported Indian languages.
 * Uses Indian numbering: ones → tens → hundreds → thousands → lakhs → crores.
 * No external API — fully static arrays, always works offline.
 */

import type { LangCode } from './fonts';

// ── Number word arrays per language ─────────────────────────────────────────

const ONES: Record<LangCode, string[]> = {
  te: ['', 'ఒకటి', 'రెండు', 'మూడు', 'నాలుగు', 'ఐదు', 'ఆరు', 'ఏడు', 'ఎనిమిది', 'తొమ్మిది',
       'పది', 'పదకొండు', 'పన్నెండు', 'పదమూడు', 'పదనాలుగు', 'పదిహేను', 'పదహారు', 'పదిహేడు', 'పదిహేనమిది', 'పంతొమ్మిది'],
  hi: ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ',
       'दस', 'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'],
  ta: ['', 'ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து', 'ஆறு', 'ஏழு', 'எட்டு', 'ஒன்பது',
       'பத்து', 'பதினொன்று', 'பன்னிரண்டு', 'பதின்மூன்று', 'பதினான்கு', 'பதினைந்து', 'பதினாறு', 'பதினேழு', 'பதினெட்டு', 'பத்தொன்பது'],
  kn: ['', 'ಒಂದು', 'ಎರಡು', 'ಮೂರು', 'ನಾಲ್ಕು', 'ಐದು', 'ಆರು', 'ಏಳು', 'ಎಂಟು', 'ಒಂಬತ್ತು',
       'ಹತ್ತು', 'ಹನ್ನೊಂದು', 'ಹನ್ನೆರಡು', 'ಹದಿಮೂರು', 'ಹದಿನಾಲ್ಕು', 'ಹದಿನೈದು', 'ಹದಿನಾರು', 'ಹದಿನೇಳು', 'ಹದಿನೆಂಟು', 'ಹತ್ತೊಂಬತ್ತು'],
  ml: ['', 'ഒന്ന്', 'രണ്ട്', 'മൂന്ന്', 'നാല്', 'അഞ്ച്', 'ആറ്', 'ഏഴ്', 'എട്ട്', 'ഒമ്പത്',
       'പത്ത്', 'പതിനൊന്ന്', 'പന്ത്രണ്ട്', 'പതിമൂന്ന്', 'പതിനാല്', 'പതിനഞ്ച്', 'പതിനാറ്', 'പതിനേഴ്', 'പതിനെട്ട്', 'പത്തൊമ്പത്'],
  bn: ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
       'দশ', 'এগারো', 'বারো', 'তেরো', 'চোদ্দো', 'পনেরো', 'ষোল', 'সতেরো', 'আঠারো', 'উনিশ'],
  gu: ['', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ',
       'દસ', 'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ'],
  ur: ['', 'ایک', 'دو', 'تین', 'چار', 'پانچ', 'چھ', 'سات', 'آٹھ', 'نو',
       'دس', 'گیارہ', 'بارہ', 'تیرہ', 'چودہ', 'پندرہ', 'سولہ', 'سترہ', 'اٹھارہ', 'انیس'],
};

const TENS: Record<LangCode, string[]> = {
  te: ['', '', 'ఇరవై', 'ముప్పై', 'నలభై', 'యాభై', 'అరవై', 'డెబ్భై', 'ఎనభై', 'తొంభై'],
  hi: ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'],
  ta: ['', '', 'இருபது', 'முப்பது', 'நாற்பது', 'ஐம்பது', 'அறுபது', 'எழுபது', 'எண்பது', 'தொண்ணூறு'],
  kn: ['', '', 'ಇಪ್ಪತ್ತು', 'ಮೂವತ್ತು', 'ನಲವತ್ತು', 'ಐವತ್ತು', 'ಅರವತ್ತು', 'ಎಪ್ಪತ್ತು', 'ಎಂಬತ್ತು', 'ತೊಂಬತ್ತು'],
  ml: ['', '', 'ഇരുപത്', 'മുപ്പത്', 'നാൽപ്പത്', 'അമ്പത്', 'അറുപത്', 'എഴുപത്', 'എൺപത്', 'തൊണ്ണൂറ്'],
  bn: ['', '', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'],
  gu: ['', '', 'વીસ', 'ત્રીસ', 'ચાળીસ', 'પચાસ', 'સાઠ', 'સિત્તેર', 'એંસી', 'નેવું'],
  ur: ['', '', 'بیس', 'تیس', 'چالیس', 'پچاس', 'ساٹھ', 'ستر', 'اسی', 'نوے'],
};

const HUNDREDS: Record<LangCode, string> = {
  te: 'వందలు', hi: 'सौ', ta: 'நூறு', kn: 'ನೂರು', ml: 'നൂറ്', bn: 'শত', gu: 'સો', ur: 'سو',
};
const THOUSANDS: Record<LangCode, string> = {
  te: 'వేల', hi: 'हज़ार', ta: 'ஆயிரம்', kn: 'ಸಾವಿರ', ml: 'ആയിരം', bn: 'হাজার', gu: 'હજાર', ur: 'ہزار',
};
const LAKHS: Record<LangCode, string> = {
  te: 'లక్షల', hi: 'लाख', ta: 'லட்சம்', kn: 'ಲಕ್ಷ', ml: 'ലക്ഷം', bn: 'লক্ষ', gu: 'લાખ', ur: 'لاکھ',
};
const CRORES: Record<LangCode, string> = {
  te: 'కోట్ల', hi: 'करोड़', ta: 'கோடி', kn: 'ಕೋಟಿ', ml: 'കോടി', bn: 'কোটি', gu: 'કરોડ', ur: 'کروڑ',
};
const RUPEES_PREFIX: Record<LangCode, string> = {
  te: 'రూపాయలు', hi: 'रुपये', ta: 'ரூபாய்', kn: 'ರೂಪಾಯಿ', ml: 'രൂപ', bn: 'টাকা', gu: 'રૂપિયા', ur: 'روپے',
};
const AND_WORD: Record<LangCode, string> = {
  te: 'మరియు', hi: 'और', ta: 'மற்றும்', kn: 'ಮತ್ತು', ml: 'ഒപ്പം', bn: 'এবং', gu: 'અને', ur: 'اور',
};
const PAISE_WORD: Record<LangCode, string> = {
  te: 'పైసలు', hi: 'पैसे', ta: 'பைசா', kn: 'ಪೈಸೆ', ml: 'പൈസ', bn: 'পয়সা', gu: 'પૈસા', ur: 'پیسے',
};
const ONLY_WORD: Record<LangCode, string> = {
  te: 'మాత్రమే', hi: 'मात्र', ta: 'மட்டும்', kn: 'ಮಾತ್ರ', ml: 'മാത്രം', bn: 'মাত্র', gu: 'માત્ર', ur: 'صرف',
};

// ── Core conversion function ─────────────────────────────────────────────────

function belowHundred(n: number, lang: LangCode): string {
  if (n === 0) return '';
  if (n < 20) return ONES[lang][n];
  const ten = TENS[lang][Math.floor(n / 10)];
  const one = n % 10 !== 0 ? ' ' + ONES[lang][n % 10] : '';
  return ten + one;
}

function convertChunk(n: number, lang: LangCode): string {
  if (n === 0) return '';
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(ONES[lang][Math.floor(n / 100)] + ' ' + HUNDREDS[lang]);
    n = n % 100;
  }
  if (n > 0) parts.push(belowHundred(n, lang));
  return parts.join(' ');
}

/**
 * Convert an integer rupee amount to words in the specified language.
 * Uses Indian grouping: crores → lakhs → thousands → hundreds → ones.
 */
function rupeesToWords(amount: number, lang: LangCode): string {
  if (amount === 0) return RUPEES_PREFIX[lang] + ' ' + ONES[lang][0] + ' ' + ONLY_WORD[lang];

  const parts: string[] = [];

  if (amount >= 10000000) {
    const crore = Math.floor(amount / 10000000);
    parts.push(convertChunk(crore, lang) + ' ' + CRORES[lang]);
    amount = amount % 10000000;
  }
  if (amount >= 100000) {
    const lakh = Math.floor(amount / 100000);
    parts.push(convertChunk(lakh, lang) + ' ' + LAKHS[lang]);
    amount = amount % 100000;
  }
  if (amount >= 1000) {
    const thou = Math.floor(amount / 1000);
    parts.push(convertChunk(thou, lang) + ' ' + THOUSANDS[lang]);
    amount = amount % 1000;
  }
  if (amount > 0) {
    parts.push(convertChunk(amount, lang));
  }

  return parts.join(' ');
}

/**
 * Main export: convert a rupee amount (with paise) to a full in-words string.
 * Example: amountInWords(22260.50, 'te')
 * → "రూపాయలు ఇరవై రెండు వేల రెండు వందలు అరవై మరియు యాభై పైసలు మాత్రమే"
 */
export function amountInWords(amount: number, lang: LangCode): string {
  if (!amount || isNaN(amount)) return '';

  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);

  const rupeeWords = rupeesToWords(rupees, lang);
  const prefix = RUPEES_PREFIX[lang];

  if (paise === 0) {
    return `${prefix} ${rupeeWords} ${ONLY_WORD[lang]}`;
  }

  const paiseWords = belowHundred(paise, lang);
  return `${prefix} ${rupeeWords} ${AND_WORD[lang]} ${paiseWords} ${PAISE_WORD[lang]} ${ONLY_WORD[lang]}`;
}
