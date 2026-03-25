
import { GoogleGenAI } from "@google/genai";
import { Transaction, GroundingLink } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialAdvice = async (transactions: Transaction[]) => {
  const summary = transactions.reduce((acc, curr) => {
    if (curr.type === 'income') acc.income += curr.amount;
    else acc.expense += curr.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const recentTransactions = transactions.slice(-5).map(t => `${t.type}: ${t.amount} (${t.category})`).join(', ');

  const prompt = `Bertindaklah sebagai peri bunga lucu yang pandai mengatur uang. Berikan 3 tips singkat dan ceria untuk anak-anak berdasarkan pengeluaran ini:
  Total Pemasukan: Rp${summary.income}
  Total Pengeluaran: Rp${summary.expense}
  Transaksi terakhir: ${recentTransactions}
  Gunakan bahasa Indonesia yang ramah anak, lucu, dan gunakan banyak emoji bunga dan bintang.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.8,
      }
    });
    return response.text || "Wah, sepertinya peri bunga sedang istirahat. Teruslah menabung ya! 🌸✨";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Ups! Kebun sedang hujan, tips belum bisa muncul. Tapi ingat, menabung itu hebat! 🌈";
  }
};

export const searchResources = async (query: string): Promise<{ text: string, links: GroundingLink[] }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Cari 3-5 link website terpercaya dan terbaru dalam bahasa Indonesia tentang: ${query}. Berikan ringkasan pendek yang lucu tentang apa yang ditemukan.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const links: GroundingLink[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web && chunk.web.uri && chunk.web.title) {
        links.push({
          title: chunk.web.title,
          uri: chunk.web.uri
        });
      }
    });

    return {
      text: response.text || "Ini beberapa link menarik untukmu! 🌸",
      links: links
    };
  } catch (error) {
    console.error("Search Error:", error);
    return { text: "Ups, pencarian sedang macet. Coba lagi nanti ya! 🍯", links: [] };
  }
};
