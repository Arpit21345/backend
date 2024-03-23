import { Router } from 'express';
import registerUser from '../controllers/userController.js';
import { upload } from '../middlewares/multer.middleware.js';
const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avtar",
            maxCount: 1
        },
        {
            name:"cover image",
            maxCount:1

        }

    ]),
    registerUser);

export default router;
