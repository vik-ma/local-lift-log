type LocaleMap = {
  label: string;
  code: string;
};

export const LocaleList = (): LocaleMap[] => {
  // Locales supported for I18nProvider
  // Values taken from
  // https://github.com/adobe/react-spectrum/blob/8ed86d85f885b8a113fb51b000747839853ec6da/.storybook/constants.js#L72

  const localeMapList: LocaleMap[] = [
    { label: "Arabic (United Arab Emirates)", code: "ar-AE" },
    { label: "Bulgarian (Bulgaria)", code: "bg-BG" },
    { label: "Chinese (Simplified)", code: "zh-CN" },
    { label: "Chinese (Traditional)", code: "zh-TW" },
    { label: "Croatian (Croatia)", code: "hr-HR" },
    { label: "Czech (Czech Republic)", code: "cs-CZ" },
    { label: "Danish (Denmark)", code: "da-DK" },
    { label: "Dutch (Netherlands)", code: "nl-NL" },
    { label: "English (Great Britain)", code: "en-GB" },
    { label: "English (United States)", code: "en-US" },
    { label: "Estonian (Estonia)", code: "et-EE" },
    { label: "Finnish (Finland)", code: "fi-FI" },
    { label: "French (Canada)", code: "fr-CA" },
    { label: "French (France)", code: "fr-FR" },
    { label: "German (Germany)", code: "de-DE" },
    { label: "Greek (Greece)", code: "el-GR" },
    { label: "Hebrew (Israel)", code: "he-IL" },
    { label: "Hungarian (Hungary)", code: "hu-HU" },
    { label: "Italian (Italy)", code: "it-IT" },
    { label: "Japanese (Japan)", code: "ja-JP" },
    { label: "Korean (Korea)", code: "ko-KR" },
    { label: "Latvian (Latvia)", code: "lv-LV" },
    { label: "Lithuanian (Lithuania)", code: "lt-LT" },
    { label: "Norwegian (Norway)", code: "nb-no" },
    { label: "Polish (Poland)", code: "pl-PL" },
    { label: "Portuguese (Brazil)", code: "pt-BR" },
    { label: "Romanian (Romania)", code: "ro-RO" },
    { label: "Russian (Russia)", code: "ru-RU" },
    { label: "Serbian (Serbia)", code: "sr-SP" },
    { label: "Slovakian (Slovakia)", code: "sk-SK" },
    { label: "Slovenian (Slovenia)", code: "sl-SI" },
    { label: "Spanish (Spain)", code: "es-ES" },
    { label: "Swedish (Sweden)", code: "sv-SE" },
    { label: "Turkish (Turkey)", code: "tr-TR" },
    { label: "Ukrainian (Ukraine)", code: "uk-UA" },
  ];

  Object.freeze(localeMapList);

  return localeMapList;
};
