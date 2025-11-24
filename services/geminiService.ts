import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AiParsedResult, TransactionType, Category } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

// Schema for structured output
const transactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    amount: { type: Type.NUMBER, description: "交易金额，数字类型。" },
    category: { type: Type.STRING, description: "分类必须是以下之一: 餐饮, 交通, 购物, 居住, 娱乐, 医疗, 薪资, 其他。" },
    type: { type: Type.STRING, description: "EXPENSE (支出) 或 INCOME (收入)。" },
    note: { type: Type.STRING, description: "简短的中文备注。" },
    date: { type: Type.STRING, description: "YYYY-MM-DD 格式，如果没有具体日期则为空。" }
  },
  required: ["amount", "category", "type", "note"],
};

export const parseTextTransaction = async (text: string): Promise<AiParsedResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `你是一个专业的中文记账助手。请分析这段文本: "${text}"。
      1. 提取金额（默认为人民币 CNY）。
      2. 匹配最合适的分类（必须是：餐饮, 交通, 购物, 居住, 娱乐, 医疗, 薪资, 其他）。
      3. 生成简短的中文备注。
      4. 判断是支出(EXPENSE)还是收入(INCOME)。
      返回 JSON 格式。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return validateParsedResult(result);
  } catch (error) {
    console.error("Gemini Text Parse Error:", error);
    return null;
  }
};

export const parseReceiptImage = async (base64Image: string): Promise<AiParsedResult | null> => {
  try {
    // Remove header if present (e.g., data:image/jpeg;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "请分析这张小票图片。提取总金额，判断消费类别（餐饮, 交通, 购物等），并提取商户名称作为备注。如果是购物小票通常是支出。请返回 JSON。"
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: transactionSchema,
      },
    });

    const result = JSON.parse(response.text || "{}");
    return validateParsedResult(result);
  } catch (error) {
    console.error("Gemini Image Parse Error:", error);
    return null;
  }
};

export const getFinancialAdvice = async (transactions: any[]): Promise<string> => {
  try {
    // Summarize transactions to save tokens
    const summary = JSON.stringify(transactions.slice(0, 50).map(t => ({
      a: t.amount,
      c: t.category,
      t: t.type,
      d: t.date
    })));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `作为一个专业的私人理财顾问，请根据用户的近期账单数据（JSON数组）提供 3 条简短、犀利且温暖的中文理财建议。
      关注点：消费结构、异常大额支出、储蓄潜力。
      语气：专业、贴心、鼓励。
      不要使用 Markdown 格式，直接分段输出纯文本。
      数据: ${summary}`,
    });

    return response.text || "暂时无法生成建议。";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "系统繁忙，AI 正在休息，请稍后再试。";
  }
}

// Helper to ensure type safety from AI response
const validateParsedResult = (data: any): AiParsedResult => {
  return {
    amount: typeof data.amount === 'number' ? data.amount : 0,
    category: data.category || '其他',
    type: data.type === 'INCOME' ? TransactionType.INCOME : TransactionType.EXPENSE,
    note: data.note || '智能识别账单',
    date: data.date || new Date().toISOString().split('T')[0]
  };
};