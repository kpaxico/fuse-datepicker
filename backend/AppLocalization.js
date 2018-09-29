var Observable = require('FuseJS/Observable');
var Bundle = require('FuseJS/Bundle');

var DeviceLocale = require('DeviceLocale');
var Utils = require('backend/JsUtils.js');

var defaultLangId = 'tr-TR';
var currLocaleObj = Observable({});
var currLocale = Observable();

var isEmpty = function(v, allowBlank) {
  return ((typeof v) === 'undefined') || v === null || ((Array.isArray(v) && !v.length)) || (!allowBlank ? (v === '' || v === '{}') : false);
};

function getLocaleObj(langId, langCode, langName, localeId, fileName, isRtl) {
  return {
    langId: langId,
    langCode: langCode,
    langName: langName,
    localeId: localeId,
    fileName: fileName,
    isRtl: isRtl
  }
}

var locales = [
  getLocaleObj('tr-TR', 'tr', 'Türkçe', 'tr_TR', 'tr_TR.json', false),
  getLocaleObj('en-US', 'en', 'English', 'en_US', 'en_US.json', false)
];

function setLanguage(locale) {
  if (locale !== currLocaleObj.value.langId || isEmpty(currLocale.value)) {
    currLocaleObj.value = locales.find(item => { return item.langId === locale});
    if (isEmpty(currLocaleObj.value))
      currLocaleObj.value = locales.find(item => { return item.langId === defaultLangId });

    currLocale.value = JSON.parse(Bundle.readSync('assets/locales/' + currLocaleObj.value.fileName));

    Utils.setMomentLocale(currLocaleObj.value.langCode);
  }
}

setLanguage(DeviceLocale.locale);

module.exports = {
  locales,
  currLocaleObj,
  currLocale,
  setLanguage
};