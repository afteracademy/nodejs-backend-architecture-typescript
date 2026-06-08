import express from 'express';
import health from './health';
import apikey from '../auth/apikey';
import permission from '../helpers/permission';
import { Permission } from '../database/model/ApiKey';
import signup from './access/signup';
import login from './access/login';
import logout from './access/logout';
import token from './access/token';
import credential from './access/credential';
import blog from './blog';
import blogs from './blogs';
import profile from './profile';

const router = express.Router();

/*---------------------------------------------------------*/
router.use('/health', health);
/*---------------------------------------------------------*/
router.use(apikey);
/*---------------------------------------------------------*/
/*---------------------------------------------------------*/
router.use(permission(Permission.GENERAL));
/*---------------------------------------------------------*/
router.use('/signup', signup);
router.use('/login', login);
router.use('/logout', logout);
router.use('/token', token);
router.use('/credential', credential);
router.use('/profile', profile);
router.use('/blog', blog);
router.use('/blogs', blogs);

export default router;
