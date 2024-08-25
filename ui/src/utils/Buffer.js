export const readableStreamToArrayBuffer = async (readableStream) => {
    const reader = readableStream.getReader();
    const chunks = [];
    let totalLength = 0;
    let done = false;
    while (!done) {
        const { value, done: doneReading } = await reader.read();
        if (value) {
            chunks.push(value);
            totalLength += value.length; // Sumujemy długości chunków
        }
        done = doneReading;
    }
    const mergedArray = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
        mergedArray.set(chunk, offset);
        offset += chunk.length;
    }
    return mergedArray.buffer; 
};