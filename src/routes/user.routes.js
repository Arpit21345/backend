import { Router } from 'express';
import{ registerUser,loginUser,logoutUser} from '../controllers/userController.js';
import { upload } from '../middlewares/multer.middleware.js';
import { refreshAccessToken } from '../controllers/userController.js';
const router = Router();

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),
    registerUser
);
router.route("/login").post(loginUser)
//secured routes
router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)


export default router;
