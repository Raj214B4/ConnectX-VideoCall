import { Router } from "express";
import { addToHistory, getUserHistory, login, register, deleteHistory } from "../controllers/user.js";

const router = Router();

router.route("/login").post(login);

router.route("/register").post(register);

router.route("/add_activity").post(addToHistory);
router.route("/get_all_activity").get(getUserHistory);
router.route("/delete_activity").delete(deleteHistory);

export default router;