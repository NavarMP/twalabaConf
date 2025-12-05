import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const apiKey = "AIzaSyAIz-5AZB_wHynJ8cKNATEdI46AxAQOAI0";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "You are the AI Assistant for the SKSSF Twalaba Conference 2025. This conference is held at CBMS Islamic Academy, Vilayil-Parappur, Malappuram, Kerala. \n\nKey Information:\n- Event: SKSSF Twalaba Conference 2025\n- Organizer: SKSSF (Samastha Kerala Sunni Students Federation)\n- Venue: CBMS Islamic Academy\n- Location: Vilayil-Parappur, Malappuram\n- Purpose: A major gathering of Islamic students and scholars.\n\nYour goal is to answer questions about the conference, guests, schedule, and location politely and concisely. If you don't know an answer, suggest checking the official schedule or contacting the organizers. Be helpful, welcoming, and respectful of Islamic values.",
});

export async function POST(req: Request) {
    try {
        const { message, history } = await req.json();

        const chat = model.startChat({
            history: history || [],
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ reply: text });
    } catch (error) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}
