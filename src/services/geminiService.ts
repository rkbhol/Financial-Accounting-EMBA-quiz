import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty, Chapter } from "../types";

const SAMPLE_TEST_CONTEXT = `
OCR of Sample Test:
Question 1: Multiple Answer - Which statements are correct? (Cash flows, Equity, Balance sheet, Income statement).
Question 2: Numeric - Calculate Total Assets after stock issuance, loan, inventory purchase, and credit sale.
Question 3: Multiple Choice - Calculate Net Income for Year 2 based on Balance Sheet changes (Assets, Liabilities, Equity).
Question 4: Numeric - Calculate Net Income from a list of accounts (Cash, AR, Supplies, Equipment, Land, Sales, Dividends, Rent, Utilities, Salaries, Misc, RE, Share Capital, AP).
Question 5: Multiple Choice - Which statement reports cash from primary operations? (Statement of cash flow).
Question 6: Multiple Choice - When does net cash flow equal net income? (Rarely).
Question 7: Matching - Asset/Liability/Equity classification (Unearned revenue, Notes Payable, Prepaid rent, Accounts payable, Retained Earnings, Trademarks).
Question 8: Multiple Choice - Calculate net cash from investing activities given operating, financing, and total cash flow.
Question 9: Multiple Choice - Cause of change in SE (Profitable during the year).
Question 10: Multiple Choice - Journal entry for advance payment (Debit Cash, Credit Unearned Revenue).
Question 11: Multiple Choice - Calculate revenue for the month (Cash sales + Sales on account).
Question 12: Multiple Choice - What does not result in revenue? (Sold shares of stock).
Question 13: Multiple Choice - Calculate assets given liabilities, RE, and common stock.
Question 14: True/False - Assets reported at market value? (False).
Question 15: Numeric - Calculate COGS given purchases and inventory T-account.
Question 16: Multiple Answer - Identify temporary accounts (Depreciation expense, Revenues, Wages expense, COGS).
Question 17: Multiple Choice - Revenue recognition for membership fees (Ratably over the period).
Question 18: Multiple Choice - Update supplies account (Increase Supplies expense, decrease Supplies).
Question 19: Multiple Answer - Not reported on balance sheet? (Dividends).
Question 20: Multiple Choice - Effect of wage accrual (Increase liabilities, decrease equity).
Question 21: Multiple Choice - Journal entry for partial payment on invoice (Debit Cash, Credit AR).
Question 22: Matching - Financial statement effects (Repay loan: Dec L, Dec A; Prepay insurance: Dec A, Inc A; Receive prepayment: Inc A, Inc L; Pay wages: Dec A, Dec E).
Question 23: Multiple Choice - Matching principle (Cost of goods expensed in same period as revenue).
Question 24: Multiple Choice - Business event for Dr Inventory, Cr Cash (Purchase inventory for cash).
Question 25: True/False - Accrual accounting recognizes revenue only when cash received? (False).

Additional Chapter 3 Context (Measuring Performance: Cash Flow and Net Income):
- Statement of Cash Flows: Reports cash inflows and outflows from Operating, Investing, and Financing activities.
- Operating Activities: Cash flows related to net income (e.g., cash from customers, cash paid to suppliers/employees).
- Investing Activities: Cash flows related to non-current assets (e.g., buying/selling equipment, land, investments).
- Financing Activities: Cash flows related to non-current liabilities and equity (e.g., issuing stock, paying dividends, borrowing/repaying loans).
- Indirect Method (Cash Flow from Operations): Starts with Net Income and adjusts for non-cash items (Depreciation) and changes in working capital (Current Assets and Current Liabilities).
- Indirect Method Adjustments: Add back Depreciation; Add decrease in Current Assets; Subtract increase in Current Assets; Add increase in Current Liabilities; Subtract decrease in Current Liabilities.
`;

export async function generateAccountingQuestions(
  difficulty: Difficulty = 'Medium', 
  count: number = 25,
  selectedChapters: Chapter[] = ['Chapter 1', 'Chapter 2', 'Chapter 3', 'Appendix D']
): Promise<Question[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  const chaptersText = selectedChapters.join(", ");
  
  const prompt = `
    You are an expert Financial Accounting Professor. 
    Your task is to generate ${count} unique, ${difficulty}-difficulty multiple-choice questions for a quiz.
    The questions must be based ONLY on the following chapters of 'Financial Accounting for Executives and MBA, 6e' by Simco, Comprix, Wallace: ${chaptersText}.
    
    CRITICAL: You MUST generate questions for EVERY selected chapter.
    
    Full Chapter/Appendix Reference (for context):
    - Chapter 1: The Economic Environment of Accounting Information (Financial Statements).
    - Chapter 2: From Business Events to Financial Statements (Accounting Cycle, Journal Entries).
    - Chapter 3: Measuring Performance: Cash Flow and Net Income (Operating, Investing, Financing activities; Indirect Method).
    - Chapter 4: Using Financial Statements for Investing and Credit Decisions.
    - Chapter 5: Operating Cycle, Revenue Recognition, and Receivable Valuation.
    - Chapter 6: Operating Expenses, Inventory Valuation, and Accounts Payable.
    - Chapter 7: Long-Lived Fixed Assets, Intangible Assets, and Natural Resources.
    - Chapter 8: Investing in Other Entities.
    - Chapter 9: Debt Financing: Bonds, Notes, and Leases.
    - Chapter 10: Commitments and Contingent Liabilities, Deferred Tax Liabilities, and Retirement Obligations.
    - Chapter 11: Equity Financing and Shareholders’ Equity.
    - Chapter 12: Using Accounting Information in Equity Valuation.
    - Appendix A: The Time Value of Money.
    - Appendix B: Financial Statement Ratios and Metrics.
    - Appendix C: IFRS Illustrated: LVMH Moët Hennessey-Louis Vuitton.
    - Appendix D: Accounting Mechanics: T-Accounts and Journal Entries.
    - Appendix E: Working Capital Management.
    - Appendix F: Data Analytics and Visualizations.
    
    Difficulty Context:
    - Easy: Focus on basic definitions, simple A=L+E classifications, and straightforward journal entries.
    - Medium: Mix of conceptual understanding and multi-step calculations (like calculating net income from a list of accounts).
    - Hard: Complex scenarios, subtle accounting principle applications, and tricky multi-part calculations requiring deep integration of concepts.
    - Mixed: A balanced distribution of Easy, Medium, and Hard questions.
    
    Use the following sample test context to understand the style, terminology, and depth required:
    ${SAMPLE_TEST_CONTEXT}
    
    Requirements:
    1. Generate exactly ${count} questions.
    2. Distribute the questions fairly across the selected chapters: ${chaptersText}. If only one chapter is selected, all questions must be from that chapter.
    3. Each question must have 4 options.
    4. Provide the correct answer index (0-3).
    5. Provide a detailed pedagogical explanation for each question. The explanation should clarify why the correct answer is right and why the other options are incorrect or represent common accounting misconceptions.
    6. Cover topics like: Financial Statement elements (A=L+E), Journal Entries, Accrual vs Cash basis, Revenue Recognition, Matching Principle, Temporary vs Permanent accounts, Cash Flow classifications (Operating, Investing, Financing), and the Indirect Method for cash flows.
    7. Ensure a mix of conceptual and calculation-based questions.
    
    Return the data as a JSON array of objects matching this structure:
    {
      "id": string (unique),
      "text": string,
      "options": string[],
      "correctIndex": number,
      "explanation": string,
      "chapter": string (MUST be one of: "Chapter 1", "Chapter 2", "Chapter 3", or "Appendix D")
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating questions:", error);
    throw error;
  }
}
