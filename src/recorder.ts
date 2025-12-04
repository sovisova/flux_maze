// src/recorder.ts
// Screen recording module using MediaRecorder + getDisplayMedia
// This is a side-effect module that hooks into the existing download button

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: BlobPart[] = [];
let recordingStarted = false;
let initialized = false;
let captureStream: MediaStream | null = null;

async function startScreenRecording(): Promise<void> {
  if (recordingStarted) return;
  recordingStarted = true;

  try {
    // Request screen capture permission
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: false,
    });

    captureStream = stream;

    // Check for supported mime types
    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
      ? "video/webm;codecs=vp9"
      : MediaRecorder.isTypeSupported("video/webm")
        ? "video/webm"
        : "video/mp4";

    mediaRecorder = new MediaRecorder(stream, { mimeType });

    recordedChunks = [];

    mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data && event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `session-recording-${ts}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Stop all tracks so screen capture ends cleanly
      if (captureStream) {
        captureStream.getTracks().forEach((t) => t.stop());
        captureStream = null;
      }

      recordedChunks = [];
      mediaRecorder = null;
      recordingStarted = false;
    };

    // Handle user stopping the capture via browser UI
    stream.getVideoTracks()[0].onended = () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };

    mediaRecorder.start();
    console.log("[Recorder] Started screen recording");
  } catch (err) {
    console.error("[Recorder] Failed to start screen capture", err);
    recordingStarted = false;
  }
}

function stopScreenRecording(): void {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    console.log("[Recorder] Stopping screen recording");
    mediaRecorder.stop();
  }
}

function hookDownloadButton(retries = 10): void {
  // Existing button has title="Download session recording"
  const btn = document.querySelector<HTMLButtonElement>(
    'button[title="Download session recording"]'
  );

  if (!btn) {
    // Retry a few times in case the React tree isn't ready yet
    if (retries > 0) {
      setTimeout(() => hookDownloadButton(retries - 1), 500);
    } else {
      console.warn("[Recorder] Could not find download button after retries");
    }
    return;
  }

  // Important: do NOT break existing click logic.
  // We only add another listener to stop screen recording.
  btn.addEventListener("click", () => {
    stopScreenRecording();
  });

  console.log("[Recorder] Hooked download button for stop");
}

function initRecorder(): void {
  if (initialized) return;
  initialized = true;

  // Kick off recording shortly after load so user can accept the prompt
  setTimeout(() => {
    void startScreenRecording();
  }, 500);

  hookDownloadButton();
}

// Initialize on window load
if (typeof window !== "undefined") {
  if (document.readyState === "complete") {
    initRecorder();
  } else {
    window.addEventListener("load", () => {
      initRecorder();
    });
  }
}

