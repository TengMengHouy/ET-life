const fs = require('fs');
let code = fs.readFileSync('app/page.tsx', 'utf8');

// Add dark-theme class
code = code.replace('<main className="relative">', '<main className="relative dark-theme">');

// Remove emojis
code = code.replace(/🔒 /g, '');
code = code.replace(/⚡ /g, '');

// Replace specific color codes/classes with purple variants
code = code.replace(/text-blue-\d+/g, 'text-purple-400');
code = code.replace(/text-cyan-\d+/g, 'text-purple-300');
code = code.replace(/text-green-\d+/g, 'text-purple-200');
code = code.replace(/text-amber-\d+/g, 'text-purple-200');

code = code.replace(/bg-blue-\d+\/\d+/g, 'bg-purple-500/20');
code = code.replace(/bg-cyan-\d+\/\d+/g, 'bg-purple-500/20');
code = code.replace(/bg-green-\d+\/\d+/g, 'bg-purple-500/20');
code = code.replace(/bg-amber-\d+\/\d+/g, 'bg-purple-500/20');

code = code.replace(/border-blue-\d+\/\d+/g, 'border-purple-500/30');
code = code.replace(/border-cyan-\d+\/\d+/g, 'border-purple-500/30');
code = code.replace(/border-green-\d+\/\d+/g, 'border-purple-500/30');
code = code.replace(/border-amber-\d+\/\d+/g, 'border-purple-500/30');

// Replace glow classes
code = code.replace(/glow-blue/g, 'glow-purple');
code = code.replace(/glow-cyan/g, 'glow-purple');
code = code.replace(/glow-green/g, 'glow-purple');

// Replace explicit hex colors in styles (blue, cyan, green)
code = code.replace(/#3b82f6/gi, '#a855f7'); // blue-500 -> purple-500
code = code.replace(/#06b6d4/gi, '#c084fc'); // cyan-500 -> purple-400
code = code.replace(/#10b981/gi, '#a855f7'); // green-500 -> purple-500
code = code.replace(/#f59e0b/gi, '#a855f7'); // amber-500 -> purple-500

// Update particle color to purple
code = code.replace(/rgba\(139, 92, 246/g, 'rgba(168, 85, 247');

// Replace Shield pulse with purple pulse
code = code.replace(/rgba\(16, 185, 129/g, 'rgba(168, 85, 247');

fs.writeFileSync('app/page.tsx', code);
console.log('Update complete');
