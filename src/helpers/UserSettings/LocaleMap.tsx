export const LocaleMap = (): Map<string, string> => {
  // Locales supported for I18nProvider
  // Values taken from
  // https://github.com/adobe/react-spectrum/blob/8ed86d85f885b8a113fb51b000747839853ec6da/.storybook/constants.js#L72

  const localeMap = new Map<string, string>();

  localeMap.set("Arabic (United Arab Emirates)", "ar-AE");
  localeMap.set("Bulgarian (Bulgaria)", "bg-BG");
  localeMap.set("Chinese (Simplified)", "zh-CN");
  localeMap.set("Chinese (Traditional)", "zh-TW");
  localeMap.set("Croatian (Croatia)", "hr-HR");
  localeMap.set("Czech (Czech Republic)", "cs-CZ");
  localeMap.set("Danish (Denmark)", "da-DK");
  localeMap.set("Dutch (Netherlands)", "nl-NL");
  localeMap.set("English (Great Britain)", "en-GB");
  localeMap.set("English (United States)", "en-US");
  localeMap.set("Estonian (Estonia)", "et-EE");
  localeMap.set("Finnish (Finland)", "fi-FI");
  localeMap.set("French (Canada)", "fr-CA");
  localeMap.set("French (France)", "fr-FR");
  localeMap.set("German (Germany)", "de-DE");
  localeMap.set("Greek (Greece)", "el-GR");
  localeMap.set("Hebrew (Israel)", "he-IL");
  localeMap.set("Hungarian (Hungary)", "hu-HU");
  localeMap.set("Italian (Italy)", "it-IT");
  localeMap.set("Japanese (Japan)", "ja-JP");
  localeMap.set("Korean (Korea)", "ko-KR");
  localeMap.set("Latvian (Latvia)", "lv-LV");
  localeMap.set("Lithuanian (Lithuania)", "lt-LT");
  localeMap.set("Norwegian (Norway)", "nb-no");
  localeMap.set("Polish (Poland)", "pl-PL");
  localeMap.set("Portuguese (Brazil)", "pt-BR");
  localeMap.set("Romanian (Romania)", "ro-RO");
  localeMap.set("Russian (Russia)", "ru-RU");
  localeMap.set("Serbian (Serbia)", "sr-SP");
  localeMap.set("Slovakian (Slovakia)", "sk-SK");
  localeMap.set("Slovenian (Slovenia)", "sl-SI");
  localeMap.set("Spanish (Spain)", "es-ES");
  localeMap.set("Swedish (Sweden)", "sv-SE");
  localeMap.set("Turkish (Turkey)", "tr-TR");
  localeMap.set("Ukrainian (Ukraine)", "uk-UA");

  return localeMap;
};
