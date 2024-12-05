
/**
 * Waits for the obako plugin to be ready.
 */
export async function obakoReady() {
    // Waits for CustomJS to be ready
    // Currently doesn't seem to work
    // if (customJS) {
    //     while (!customJS?.state?._ready) {
    //         await new Promise((resolve) => setTimeout(resolve, 50));
    //     }
    // }
}
