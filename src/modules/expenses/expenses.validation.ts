import { z } from "zod";

export const splitSchema = z.object({
  user_id: z.string().uuid(),
  amount: z.number().int().nonnegative().optional(),
  percentage: z.number().nonnegative().optional(),
  shares: z.number().int().nonnegative().optional(),
});

export const createExpenseSchema = z
  .object({
    group_id: z.string().uuid(),
    paid_by: z.string().uuid(),
    title: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().int().nonnegative(),
    currency: z.string().optional(),
    split_type: z.enum(["EQUAL", "EXACT", "PERCENTAGE", "SHARE"]),
    splits: z.array(splitSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const total = data.amount;
    const type = data.split_type;
    const splits = data.splits;

    if (type === "EXACT") {
      const sum = splits.reduce((s, it) => s + (it.amount ?? 0), 0);
      if (sum !== total) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Sum of split amounts (${sum}) must equal total amount (${total})`,
        });
      }
    }

    if (type === "PERCENTAGE") {
      const sumPerc = splits.reduce((s, it) => s + (it.percentage ?? 0), 0);
      if (sumPerc !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Sum of percentages (${sumPerc}) must equal 100`,
        });
      }
      // Additionally, ensure no amount is provided for percentage splits
      for (const it of splits) {
        if (it.amount !== undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Do not provide absolute amounts for PERCENTAGE split`,
          });
        }
      }
    }

    if (type === "SHARE") {
      const sumShares = splits.reduce((s, it) => s + (it.shares ?? 0), 0);
      if (sumShares <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Sum of shares must be greater than 0`,
        });
      }
    }
  });
