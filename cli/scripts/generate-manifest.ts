/**
 * Generate oclif manifest for production builds.
 * This script is called by `npm run build`.
 */
import {execSync} from "node:child_process";

try {
	execSync("npx oclif manifest", {
		stdio: "inherit",
		cwd: import.meta.dirname ?? ".",
	});
	console.log("✓ oclif manifest generated");
} catch {
	console.warn("⚠ oclif manifest generation skipped (oclif CLI not available)");
}
