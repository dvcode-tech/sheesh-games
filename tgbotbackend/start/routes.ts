import { Router } from 'express';
import ApisController from 'App/Controllers/Http/ApisController';
import isAuth from 'App/Middleware/Auth';
import RockPaperScissorController from 'App/Controllers/Http/RockPaperScissorController';
const Route = Router();
/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
// Route.post('/upload', isAuth, ApisController.testupload);
/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route.post('/bot/login', ApisController.tgbot_login);
Route.post('/bot/verify', ApisController.tgbot_verify);
Route.get('/bot/referrals', ApisController.referrals);

Route.post('/bot/play', RockPaperScissorController.play);

Route.post('/bot/rps/play', RockPaperScissorController.play);
Route.get('/bot/rps/leaderboard', RockPaperScissorController.leaderboard);
Route.get('/bot/rps/playhistory', RockPaperScissorController.play_history);

export { Route as routes };
