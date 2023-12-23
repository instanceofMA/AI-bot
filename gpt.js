async function sendToGPT(category, text) {
    const prompt = `You are a support personnel who knows everything about ${category}. You will not reply as an AI, you will not say anything that even hints that yuo are an AI language model. Now answer this: ${text}`;
}

module.exports = {
    sendToGPT
};