const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

// Configuration
const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;
const STEP_MS = 500;
const SETTLE_DELAY_MS = 150;

/**
 * Main function to extract geometry snapshots from an rrweb recording.
 */
async function main() {
  // Get input file from CLI arguments
  const inputPath = process.argv[2];

  if (!inputPath) {
    console.error("Usage: node extract_geometry.cjs <path-to-session.json>");
    process.exit(1);
  }

  // Resolve to absolute path
  const absoluteInputPath = path.resolve(inputPath);

  if (!fs.existsSync(absoluteInputPath)) {
    console.error(`File not found: ${absoluteInputPath}`);
    process.exit(1);
  }

  // Load and parse the JSON file
  console.log(`Loading session from: ${absoluteInputPath}`);
  const fileContent = fs.readFileSync(absoluteInputPath, "utf-8");
  let parsed;

  try {
    parsed = JSON.parse(fileContent);
  } catch (err) {
    console.error(`Failed to parse JSON: ${err.message}`);
    process.exit(1);
  }

  // Handle both { sessionId, startedAt, events } and plain array formats
  let sessionId;
  let events;

  if (Array.isArray(parsed)) {
    // Plain array of events
    sessionId = "unknown-session";
    events = parsed;
  } else if (parsed && Array.isArray(parsed.events)) {
    // Standard session format
    sessionId = parsed.sessionId || "unknown-session";
    events = parsed.events;
  } else {
    console.error("Invalid session format. Expected { sessionId, startedAt, events } or an array of events.");
    process.exit(1);
  }

  if (events.length === 0) {
    console.error("No events found in the session.");
    process.exit(1);
  }

  console.log(`Session ID: ${sessionId}`);
  console.log(`Total events: ${events.length}`);

  // Filter for route custom events (type === 5, data.tag === "route")
  // rrweb event types: 5 = Custom
  const routeEvents = events.filter(
    (e) => e.type === 5 && e.data && e.data.tag === "route"
  );

  console.log(`Route events found: ${routeEvents.length}`);

  // Get timestamp range
  const timestamps = events.map((e) => e.timestamp).filter((t) => typeof t === "number");
  const firstTimestamp = Math.min(...timestamps);
  const lastTimestamp = Math.max(...timestamps);

  console.log(`Recording duration: ${lastTimestamp - firstTimestamp}ms`);

  // Build path to replay.html
  const replayHtmlPath = path.join(__dirname, "replay.html");

  if (!fs.existsSync(replayHtmlPath)) {
    console.error(`replay.html not found at: ${replayHtmlPath}`);
    process.exit(1);
  }

  const replayUrl = `file://${replayHtmlPath}`;

  // Launch Puppeteer
  console.log("Launching Puppeteer...");
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      `--window-size=${VIEWPORT_WIDTH},${VIEWPORT_HEIGHT}`,
      "--no-sandbox",
      "--disable-setuid-sandbox",
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });

  // Navigate to replay.html
  console.log(`Opening: ${replayUrl}`);
  await page.goto(replayUrl, { waitUntil: "domcontentloaded" });

  // Wait for initReplay to be available
  await page.waitForFunction(() => typeof window.initReplay === "function", {
    timeout: 10000,
  });

  console.log("Initializing replay with events...");

  // Call initReplay with events
  await page.evaluate((eventsData) => {
    window.initReplay(eventsData);
  }, events);

  // Wait a bit for player to initialize
  await sleep(500);

  // Collect snapshots
  const snapshots = [];

  console.log(`Extracting geometry snapshots (step: ${STEP_MS}ms)...`);

  // Iterate from first to last timestamp in steps
  for (let t = firstTimestamp; t <= lastTimestamp; t += STEP_MS) {
    const offsetMs = t - firstTimestamp;

    // Seek to this time
    await page.evaluate((offset) => {
      window.seekTo(offset);
    }, offsetMs);

    // Wait for DOM to settle
    await sleep(SETTLE_DELAY_MS);

    // Get geometry snapshot
    const elements = await page.evaluate(() => {
      return window.getGeometrySnapshot();
    });

    // Find the latest route event with timestamp <= t
    const activeRouteEvent = findLatestRouteEvent(routeEvents, t);
    const route = activeRouteEvent
      ? {
          pathname: activeRouteEvent.data.payload.pathname,
          search: activeRouteEvent.data.payload.search,
          hash: activeRouteEvent.data.payload.hash,
        }
      : null;

    snapshots.push({
      timestamp: t,
      offsetMs,
      route,
      elements,
    });

    // Progress indicator
    const progress = Math.round(((t - firstTimestamp) / (lastTimestamp - firstTimestamp)) * 100);
    process.stdout.write(`\rProgress: ${progress}%`);
  }

  console.log("\nExtraction complete!");

  // Close browser
  await browser.close();

  // Build output
  const output = {
    sessionId,
    originalRecording: path.basename(absoluteInputPath),
    snapshots,
  };

  // Write output file
  const inputDir = path.dirname(absoluteInputPath);
  const inputBasename = path.basename(absoluteInputPath, ".json");
  const outputPath = path.join(inputDir, `${inputBasename}.geometry.json`);

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

  console.log(`Output written to: ${outputPath}`);
  console.log(`Total snapshots: ${snapshots.length}`);
}

/**
 * Find the latest route event with timestamp <= t.
 * @param {Array} routeEvents - Array of route custom events
 * @param {number} t - Target timestamp
 * @returns {Object|null} The latest matching route event or null
 */
function findLatestRouteEvent(routeEvents, t) {
  let latest = null;

  for (const event of routeEvents) {
    if (event.timestamp <= t) {
      if (!latest || event.timestamp > latest.timestamp) {
        latest = event;
      }
    }
  }

  return latest;
}

/**
 * Sleep for a given number of milliseconds.
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>}
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Run main
main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

