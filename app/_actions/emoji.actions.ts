"use server";

import OpenAI from "openai";
import { cloudinary } from "@/lib/cloudinary";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmojiAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const file = formData.get("attachment") as File | null;
    const generateAI = formData.get("generateAI") === "true";

    console.log("--- DEBUG START ---");
    console.log("Nome:", name);
    console.log("Arquivo recebido:", file?.name || "Nenhum", "Tipo:", file?.type || "N/A");

    // 1. Validação: Se não for IA, o arquivo é obrigatório. Se for IA, precisamos de nome ou arquivo.
    if (!generateAI && (!file || file.size === 0)) {
      throw new Error("Para upload direto, você precisa selecionar um arquivo.");
    }

    if (generateAI && !name && (!file || file.size === 0)) {
      throw new Error("Forneça pelo menos um nome ou uma imagem para a IA.");
    }

    // 2. Processamento do arquivo (se ele existir)
    let visionContext = name;
    let base64 = "";

    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64 = buffer.toString("base64");

      // 🔥 UPLOAD DIRETO (Sem IA)
      if (!generateAI) {
        const uploadRes = await cloudinary.uploader.upload(
          `data:${file.type};base64,${base64}`,
          { folder: "lab-habit-emojis" }
        );
        return { success: true, url: uploadRes.secure_url, source: "original" };
      }

      // ✨ IA + VISÃO (Analisando a referência)
      if (file.type === "image/svg+xml") {
        const svgText = buffer.toString("utf-8");
        const vision = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "user", content: `Descreva brevemente este ícone SVG para recriá-lo em 3D: ${svgText.slice(0, 1000)}` }
          ],
        });
        visionContext = vision.choices[0].message.content || name;
      } else {
        const vision = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: `Descreva o objeto principal deste anexo para um ícone 3D moderno chamado "${name}".` },
                { type: "image_url", image_url: { url: `data:${file.type};base64,${base64}` } },
              ],
            },
          ],
        });
        visionContext = vision.choices[0].message.content || name;
      }
    }

    // 3. Geração da Imagem com DALL-E 3
    console.log("Contexto para DALL-E:", visionContext);

    // Estilo visual Lab Habit: Neon Orange + Cyberpunk Glass
    const prompt = `Premium 3D glossy emoji icon of ${visionContext}. 
    Style: Minimalist Cyberpunk, Core Colors: Neon Orange (#ff5a3d) and Deep Charcoal, 
    Translucent glass textures, soft neon glow, high-end 3D render, centered, high contrast, dark background.`;

    const aiImage = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      size: "1024x1024",
      quality: "standard",
    });

    // ✅ CORREÇÃO DO ERRO TS(18048): Optional chaining e fallback
    const imageUrl = aiImage.data?.[0]?.url;

    if (!imageUrl) {
      throw new Error("A OpenAI gerou a imagem, mas não retornou o link.");
    }

    // 4. Upload da URL da OpenAI para o seu Cloudinary
    const uploadRes = await cloudinary.uploader.upload(imageUrl, {
      folder: "lab-habit-emojis",
    });

    return {
      success: true,
      url: uploadRes.secure_url,
      source: "ai",
    };

  } catch (error: any) {
    console.error("--- DEBUG ERROR ---", error.message);
    return { success: false, error: error.message };
  }
}