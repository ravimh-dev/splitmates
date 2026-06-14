import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import {
  startTransaction,
  commitTransaction,
  rollbackTransaction,
} from "../../db";
import { createUser, findUserByEmail } from "./auth.model";
import { registerSchema, loginSchema } from "./auth.validation";
import { generateResponseJSON } from "../../shared/utils/response";

export const registerController = async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(
        generateResponseJSON(400, "Validation Error", parsed.error.format()),
      );

  const { name, email, password } = parsed.data;
  const tx = await startTransaction();
  const client = tx.client;
  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      await rollbackTransaction(client);
      return res
        .status(409)
        .json(generateResponseJSON(409, "User already exists"));
    }
    const hash = await bcrypt.hash(password, 10);
    const user = await createUser(client, name, email, hash);
    await commitTransaction(client);
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" },
    );
    return res
      .status(201)
      .json(generateResponseJSON(201, "Registered", { user, token }));
  } catch (err: any) {
    await rollbackTransaction(client);
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};

export const loginController = async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return res
      .status(400)
      .json(
        generateResponseJSON(400, "Validation Error", parsed.error.format()),
      );
  const { email, password } = parsed.data;
  try {
    const user = await findUserByEmail(email);
    if (!user)
      return res
        .status(401)
        .json(generateResponseJSON(401, "Invalid credentials"));
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok)
      return res
        .status(401)
        .json(generateResponseJSON(401, "Invalid credentials"));
    const token = jwt.sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1h" },
    );
    return res.json(generateResponseJSON(200, "Logged in", { token }));
  } catch (err: any) {
    return res
      .status(500)
      .json(generateResponseJSON(500, err.message || "Internal Error"));
  }
};
