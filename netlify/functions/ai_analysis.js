// File location: /netlify/functions/ai_analysis.js

exports.handler = async function(event) {
    // We only want to respond to POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        // Get the data (the prompt and model name) sent from the frontend
        const { prompt, model } = JSON.parse(event.body);

        // Get the secret API key from the secure environment variables on Netlify
        const apiKey = process.env.OPENROUTER_API_KEY;

        // Failsafe in case the API key isn't set on the server
        if (!apiKey) {
            throw new Error("API key is not configured on the server.");
        }

        // Securely call the OpenRouter API from the backend
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": model,
                "messages": [{ "role": "user", "content": prompt.trim() }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error.message || `API request failed: ${response.status}`);
        }

        const data = await response.json();

        // Send the AI's successful response back to the user's browser
        return {
            statusCode: 200,
            body: JSON.stringify(data)
        };

    } catch (error) {
        // If anything goes wrong, send back an error message
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
