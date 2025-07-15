export async function POST(req) {
  try {
    const { messages } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "Complete the flow of the conversation by answering the latest question/statement stated by the user, while keeping the other messages as context to craft your response. You must reply in the following format: A string of length maximum 1-2 sentences" },
          ...messages,
        ],
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return Response.json({ answer: `OpenAI API error: ${response.status} - ${errorText}` }, { status: 500 });
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "No response. Try again in a bit.";

    return Response.json({ answer });
  } catch (error) {
    console.error('Server error:', error);
    return Response.json({ answer: `Server error: ${error.message}` }, { status: 500 });
  }
}
