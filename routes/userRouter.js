const express=require('express');
const router = express.Router();
const authController=require(`./../controllers/authController`)
const userController=require(`./../controllers/userController`)

router.post('/login', authController.login);

// Protect all routes after this middleware
router.use(authController.protect)
    router.get('/logout',authController.logOut)
    router.get('/myProfile',userController.getMyProfile)

//Just Admin routes
router.use(authController.restrictTo('admin'));
    router.get('/getAllUsers',userController.getUsersByAdmin)
   // router.get('/search',userController.search)
    router.post('/createUser',userController.creataAccount)
    router.patch('/updateUser/:id',userController.updateUserByAdmin)
    router.patch('/resetPassword/:id',authController.resetPassword)
    router.delete('/deleteUser/:id',userController.deleteUserByAdmin)



module.exports=router;

