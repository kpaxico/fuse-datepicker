// Cut down from the "fuse-device" package by Maxim Shaydo aka MaxGraey
// https://github.com/MaxGraey/fuse-device

using Uno;
using Uno.UX;
using Uno.Text;
using Uno.Collections;
using Uno.Compiler.ExportTargetInterop;

using Fuse;
using Fuse.Scripting;
using Fuse.Reactive;

[extern(Android) ForeignInclude(Language.Java, "android.app.Activity", "android.provider.Settings",
                               "android.content.*","java.security.*", "java.util.regex.*", "java.util.*",
                               "java.net.*", "java.nio.*", "java.io.*")]

[extern(iOS) ForeignInclude(Language.ObjC, "sys/types.h", "sys/sysctl.h")]

[UXGlobalModule]
public sealed class DeviceLocale : NativeModule {
  static readonly DeviceLocale _instance;
  
  public DeviceLocale() : base() {
    if (_instance != null) return;
    Uno.UX.Resource.SetGlobalKey(_instance = this, "DeviceLocale");

    AddMember(new NativeProperty< string, object >("locale", GetCurrentLocale));
  }


  [Foreign(Language.Java)]
	public static extern(Android) string GetCurrentLocale()
	@{
		Locale loc = java.util.Locale.getDefault();

    final char separator = '-';
    String language = loc.getLanguage();
    String region   = loc.getCountry();
    String variant  = loc.getVariant();

    // special case for Norwegian Nynorsk since "NY" cannot be a variant as per BCP 47
    // this goes before the string matching since "NY" wont pass the variant checks
    if (language.equals("no") && region.equals("NO") && variant.equals("NY")) {
        language = "nn";
        region   = "NO";
        variant  = "";
    }

    if (language.isEmpty() || !language.matches("\\p{Alpha}{2,8}")) {
        language = "und"; // "und" for Undetermined
    } else if (language.equals("iw")) {
        language = "he";  // correct deprecated "Hebrew"
    } else if (language.equals("in")) {
        language = "id";  // correct deprecated "Indonesian"
    } else if (language.equals("ji")) {
        language = "yi";   // correct deprecated "Yiddish"
    }

    // ensure valid country code, if not well formed, it's omitted
    if (!region.matches("\\p{Alpha}{2}|\\p{Digit}{3}")) {
        region = "";
    }

      // variant subtags that begin with a letter must be at least 5 characters long
    if (!variant.matches("\\p{Alnum}{5,8}|\\p{Digit}\\p{Alnum}{3}")) {
        variant = "";
    }

    StringBuilder bcp47Tag = new StringBuilder(language);
    if (!region.isEmpty()) {
        bcp47Tag.append(separator).append(region);
    }

    if (!variant.isEmpty()) {
        bcp47Tag.append(separator).append(variant);
    }

    return bcp47Tag.toString();
	@}

	[Foreign(Language.ObjC)]
	private static extern(iOS) string GetCurrentLocale()
	@{
		NSString* language = NSLocale.preferredLanguages[0];

    if (language.length <= 2) {
      NSLocale* locale        = NSLocale.currentLocale;
      NSString* localeId      = locale.localeIdentifier;
      NSRange underscoreIndex = [localeId rangeOfString: @"_" options: NSBackwardsSearch];
      NSRange atSignIndex     = [localeId rangeOfString: @"@"];

      if (underscoreIndex.location != NSNotFound) {
        if (atSignIndex.length == 0)
          language = [NSString stringWithFormat: @"%@%@", language, [localeId substringFromIndex: underscoreIndex.location]];
        else {
          NSRange localeRange = NSMakeRange(underscoreIndex.location, atSignIndex.location - underscoreIndex.location);
          language = [NSString stringWithFormat: @"%@%@", language, [localeId substringWithRange: localeRange]];
        }
      }
    }

    return [language stringByReplacingOccurrencesOfString: @"_" withString: @"-"];
	@}

  // Preview's implementations
  public static extern(!Mobile) string GetCurrentLocale() {
    return "tr-TR";
  }
}