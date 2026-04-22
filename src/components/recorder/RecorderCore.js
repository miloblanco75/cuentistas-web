/**
 * RecorderCore.js - V3 Release Candidate
 * Encapsulates MediaRecorder logic for Phase 11.
 * Hardened for production with fallback audio mixing and double-protected stoppers.
 */

export class RecorderCore {
    constructor(options = {}) {
        this.mediaRecorder = null;
        this.stream = null;
        this.chunks = [];
        this.onStopCallback = options.onStop || null;
        this.onDataCallback = options.onData || null;
        this.onStartCallback = options.onStart || null;
        this.onErrorCallback = options.onError || null;
        this.stopped = false;
        this.onStopFired = false;
        
        this.mimeType = 'video/webm;codecs=vp9';
        if (typeof window !== 'undefined' && !MediaRecorder.isTypeSupported(this.mimeType)) {
            this.mimeType = 'video/webm';
        }
    }

    async start(mode = 'narrator') {
        try {
            this.chunks = [];
            this.stopped = false;
            this.onStopFired = false;

            let finalStream;

            if (mode === 'camera') {
                const constraints = { 
                    video: { 
                        width: { ideal: 720 }, 
                        height: { ideal: 1280 }, 
                        frameRate: { ideal: 30 },
                        facingMode: "user" 
                    }, 
                    audio: true 
                };
                finalStream = await navigator.mediaDevices.getUserMedia(constraints);
            } else {
                // V3 RC: Order of execution is critical
                // 1. Request Screen
                let screenStream;
                try {
                    screenStream = await navigator.mediaDevices.getDisplayMedia({ 
                        video: {
                            displaySurface: "browser",
                            logicalSurface: true
                        }, 
                        audio: false 
                    });
                } catch (e) {
                    throw new Error("SCREEN_PERMISSION_DENIED");
                }

                // 2. Request Mic (Optional Fallback)
                let micStream = null;
                try {
                    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (e) {
                    console.warn("⚠️ Micrófono denegado, continuando solo con video.");
                }

                // 3. Combine Tracks
                const tracks = [
                    ...screenStream.getVideoTracks(),
                    ...(micStream ? micStream.getAudioTracks() : [])
                ];
                finalStream = new MediaStream(tracks);
            }

            this.stream = finalStream;

            this.mediaRecorder = new MediaRecorder(this.stream, {
                mimeType: this.mimeType
            });

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                    if (this.onDataCallback) this.onDataCallback(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                if (this.onStopFired) return;
                this.onStopFired = true;
                this.finalizeRecording();
            };

            this.mediaRecorder.start();
            if (this.onStartCallback) this.onStartCallback();

            // Handle manual stop from browser (e.g. "Stop Sharing")
            this.stream.getTracks().forEach(track => {
                track.onended = () => {
                    if (!this.stopped) this.stop();
                };
            });

        } catch (err) {
            console.error("❌ RecorderCore Error:", err);
            if (this.onErrorCallback) this.onErrorCallback(err);
            throw err;
        }
    }

    stop() {
        if (this.stopped) return;
        this.stopped = true;

        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            try {
                this.mediaRecorder.stop();
            } catch (e) {
                console.error("⚠️ Error calling mediaRecorder.stop():", e);
                this.finalizeRecording();
            }
        } else {
            this.finalizeRecording();
        }

        // V3 RC: 500ms Fallback for browser hangs
        setTimeout(() => {
            if (!this.onStopFired) {
                console.warn("⚠️ MediaRecorder.onstop timeout - Forcing finalization.");
                this.finalizeRecording();
            }
        }, 500);
    }

    finalizeRecording() {
        this.onStopFired = true;
        const blob = new Blob(this.chunks, { type: 'video/webm' });
        
        // V3 RC: Discard blobs < 1KB
        if (blob.size < 1024) {
            console.error("❌ Video corrupto o vacío (menor a 1KB)");
            if (this.onErrorCallback) this.onErrorCallback(new Error("EMPTY_VIDEO"));
        } else if (this.onStopCallback) {
            this.onStopCallback(blob);
        }
        
        this.cleanup();
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                try {
                    track.stop();
                } catch (e) {}
            });
            this.stream = null;
        }
        this.mediaRecorder = null;
    }

    getBlob() {
        return new Blob(this.chunks, { type: 'video/webm' });
    }
}
