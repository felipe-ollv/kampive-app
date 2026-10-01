// Backport of Expo's Device Hub support for SDK 54.
// Upstream: https://github.com/expo/expo/pull/46757
// Remove when upgrading to an Expo CLI that supports Device Hub natively.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

const expoRequire = createRequire(require.resolve('expo/package.json'));
const cliRoot = path.dirname(expoRequire.resolve('@expo/cli/package.json'));
const version = JSON.parse(fs.readFileSync(path.join(cliRoot, 'package.json'), 'utf8')).version;
if (version !== '54.0.27') {
  throw new Error(`Device Hub compatibility patch requires review for Expo CLI ${version}.`);
}
const marker = '// kampive-device-hub-compat-v1';
const patches = [
  ['start/doctor/apple/SimulatorAppPrerequisite.js', [
    ['return await getSimulatorAppIdViaAppleScriptAsync() ?? await getSimulatorAppIdFromBundleAsync();',
      `const simulatorId = await getSimulatorAppIdViaAppleScriptAsync() ?? await getSimulatorAppIdFromBundleAsync();
    if (simulatorId) return simulatorId;
    try {
        return (await (0, _osascript().execAsync)('id of app "DeviceHub"')).trim();
    } catch { return null; }`],
    ["result !== 'com.apple.iphonesimulator' &&", "result !== 'com.apple.dt.Devices' && result !== 'com.apple.iphonesimulator' &&"],
  ]],
  ['start/platforms/ios/ensureSimulatorAppRunning.js', [
    ['count processes whose name is "Simulator"', 'count processes whose name is "Simulator" or name is "DeviceHub"'],
    ["await (0, _spawnasync().default)('open', args);", `try {
        await (0, _spawnasync().default)('open', args);
    } catch {
        await (0, _spawnasync().default)('open', ['-a', 'DeviceHub']);
    }`],
  ]],
  ['start/platforms/ios/AppleDeviceManager.js', [
    ['await _osascript().execAsync(`tell application "Simulator" to activate`);',
      'try { await _osascript().execAsync(`tell application "Simulator" to activate`); } catch { await _osascript().execAsync(`tell application "DeviceHub" to activate`); }'],
  ]],
];

// Validate all replacement targets before changing any file. Re-running is safe.
const changes = patches.map(([relative, replacements]) => {
  const file = path.join(cliRoot, 'build/src', relative);
  let source = fs.readFileSync(file, 'utf8');
  if (source.includes(marker)) return null;
  for (const [before, after] of replacements) {
    if (source.split(before).length !== 2) {
      throw new Error(`Unexpected Expo CLI source in ${relative}; patch not applied.`);
    }
    source = source.replace(before, after);
  }
  return { file, source: `${marker}\n${source}` };
});
for (const change of changes) {
  if (change) fs.writeFileSync(change.file, change.source);
}
console.log('Expo SDK 54: Device Hub compatibility ready.');
