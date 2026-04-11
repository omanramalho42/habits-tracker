"use server";

import OpenAI from "openai";
import { cloudinary } from "@/lib/cloudinary";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ DEFINIÇÃO PRECISA DA TEMÁTICA LAB HABIT
const BRAND_STYLE = `
Style: Minimalist Cyberpunk App Icon
Core Colors: ONLY Neon Orange (#ff5a3d) and Deep Purple/Black tones.
Effects: Soft neon glow, translucent cyberpunk glass texture, subtle gradients for depth, 3D rendered style.
Composition: Single, centered object. No text. Dark background. High contrast. Premium quality mobile app icon.
`;

export async function generateEmojiAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const file = formData.get("attachment") as File | null;
    const generateAI = formData.get("generateAI") === "true"; // Controlado pelo Front-end

    console.log(`--- Gerando Emoji [${name}] ---`);

    // ======================================
    // 📎 CASO 1: APENAS UPLOAD (SEM IA)
    // ======================================
    // Se a flag estiver falsa, fazemos o upload direto da referência
    if (!generateAI && file && file.size > 0) {
      console.log("Ação: Upload Direto (Sem IA)");
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const uploadRes = await cloudinary.uploader.upload(
        `data:${file.type};base64,${base64}`,
        { folder: "lab-habit-emojis" }
      );

      return { success: true, url: uploadRes.secure_url, source: "upload" };
    }

    // ======================================
    // 🤖 CASO 2: GERAR COM IA
    // ======================================
    let visionContext = "";

    // 🧠 SE TEM IMAGEM → ANALISA A FORMA, NÃO A COR ORIGINAL
    if (file && file.size > 0) {
      console.log("Analisando referência visual...");
      if (file.type === "image/svg+xml") {
        const svgText = await file.text();
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: `Analise este código SVG e descreva apenas a forma principal para criar um ícone moderno: ${svgText.slice(0, 2000)}`,
            },
          ],
        });
        visionContext = response.choices[0].message.content || "";
      } else {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Descreva a forma principal deste objeto para criar um ícone moderno e simples. Ignore as cores originais." },
                { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } },
              ],
            },
          ],
        });
        visionContext = response.choices[0].message.content || "";
      }
    }

    // Gerar com DALL-E 3 focando na Marca
    console.log("Chamando DALL-E 3 para geração de imagem...");
    
    // Prompt focado em identidade de marca e essência do objeto
    const prompt = `Premium 3D glossy emoji icon of ${name}. 
    Based on this concept: ${visionContext || name}. 
    ${BRAND_STYLE}`; // Injeta o estilo cyberpunk/neon aqui-

    const aiImage = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
      // b64_json é lento e pesado, vamos usar URL e Cloudinary baixa
    });

    // Acessando com segurança
    const imageUrl = aiImage.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("A IA não conseguiu gerar a imagem. Tente um nome diferente.");
    }

    console.log("Upload para Cloudinary...");
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: "lab-habit-emojis",
    });

    console.log("--- Sucesso na Geração IA ---");
    return {
      success: true,
      url: uploadRes.secure_url,
      source: "ai",
    };

  } catch (error: any) {
    console.error("Erro completo na geração:", error);
    return { success: false, error: error.message };
  }
}