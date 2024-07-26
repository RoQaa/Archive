const express=require('express');
const router = express.Router();
const authController=require(`${__dirname}/../controllers/authController`)
const userController=require(`${__dirname}/../controllers/userController`)

router.post('/login', authController.login);


// Protect all routes after this middleware
router.use(authController.protect)
router.get('/logout',authController.logOut)

//Just Admin routes
router.use(authController.restrictTo('admin'));
router.patch('/updateUser/:id',userController.updateUserByAdmin)
router.delete('/deleteUser/:id',userController.deleteUser)
router.post('/createAccount',userController.creataAccount)
router.patch('/resetPassword',authController.resetPassword)









module.exports=router;

