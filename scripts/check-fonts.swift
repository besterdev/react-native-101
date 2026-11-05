import Foundation
import CoreText
// Run from the project root: swift scripts/check-fonts.swift
let root = FileManager.default.currentDirectoryPath + "/assets/fonts"
let weights = ["Regular", "Medium", "SemiBold", "Display", "Bold"]
var failures = 0
var names = Set<String>()
for weight in weights {
  let url = URL(fileURLWithPath: "\(root)/Inter-\(weight).ttf")
  var error: Unmanaged<CFError>?
  let registered = CTFontManagerRegisterFontsForURL(url as CFURL, .process, &error)
  let descriptors = CTFontManagerCreateFontDescriptorsFromURL(url as CFURL) as? [CTFontDescriptor] ?? []
  guard let descriptor = descriptors.first else { print("FAIL \(weight): no descriptor"); failures += 1; continue }
  let font = CTFontCreateWithFontDescriptor(descriptor, 33, nil)
  let name = CTFontCopyPostScriptName(font) as String
  let family = CTFontCopyFamilyName(font) as String
  let traits = CTFontCopyTraits(font) as NSDictionary
  let nativeWeight = traits[kCTFontWeightTrait] ?? "missing"
  let unique = names.insert(name).inserted
  let expected = "RecurInter-\(weight)"
  let matchesAlias = name == expected
  let resolved = CTFontCreateWithName(expected as CFString, 33, nil)
  let resolvedName = CTFontCopyPostScriptName(resolved) as String
  let resolvesCorrectly = resolvedName == expected
  let expectedWeights: [String: Double] = ["Regular": 0, "Medium": 0.2, "SemiBold": 0.3, "Display": 0.35, "Bold": 0.4]
  let resolvedTraits = CTFontCopyTraits(resolved) as NSDictionary
  let resolvedWeight = (resolvedTraits[kCTFontWeightTrait] as? NSNumber)?.doubleValue ?? -1
  let correctWeight = abs(resolvedWeight - expectedWeights[weight]!) < 0.01
  let passed = registered && unique && matchesAlias && resolvesCorrectly && correctWeight
  print("\(passed ? "PASS" : "FAIL") \(weight): PostScript=\(name), family=\(family), fileWeight=\(nativeWeight), resolvedWeight=\(resolvedWeight), error=\(String(describing: error?.takeRetainedValue()))")
  if !passed { failures += 1 }
}
exit(failures == 0 ? 0 : 1)
