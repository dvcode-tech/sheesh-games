import { Response, Request } from 'express';
import * as crypto from 'crypto';
import { User } from 'Database/entities/user';
import { ic, Principal } from 'azle';
import { Referral } from 'Database/entities/referral';
import { PlayHistory } from 'Database/entities/playhistory';

const telegramBotToken = '6591061458:AAGt37yxXhtNX7BYITlayEfhkj0-FUIyr_0';
const secret = crypto.createHmac('sha256', 'WebAppData').update(telegramBotToken).digest();

const PICKS = ["Rock", "Paper", "Scissors"];

function validatePick(playerPick: number) {
    if (playerPick !== 0 && playerPick !== 1 && playerPick !== 2) {
      return false
    }
    return true
}  

export default class RockPaperScissorController {
    static async play(request: Request, response: Response) {
        const { telegram_user_id, hashFromClient, pick } = request.body;
        const findUser = await User.findOne({
          where: { telegram_user_id: telegram_user_id, auth_hash: hashFromClient }
        });
  
        if (!findUser) {
          response.status(401);
          return response.json({
            status: 0,
            message: 'Invalid user!',
          });
        }
  
        const currentDate = Date.now()
        
        if(findUser.next_play_at > currentDate){ 
          response.status(401);
          return response.json({
            status: 0,
            message: `Come back later!`,
            data: {
              next_play_at: findUser.next_play_at,
              remaining_play_count: findUser.remaining_play_count,
            },
          });
        }
  
        if(currentDate > findUser.next_play_at && findUser.remaining_play_count <= 0){
          if(findUser.next_play_at <= 0){
            findUser.remaining_play_count = 15;
          }else{
            findUser.remaining_play_count = 10;
          }
          await findUser.save();
        }
  
        if(findUser.remaining_play_count <= 0){
          response.status(401);
          return response.json({
            status: 0,
            message: `Come back later!`,
            data: {
              next_play_at: findUser.next_play_at,
              remaining_play_count: findUser.remaining_play_count,
            },
          });
        }
  
        const playerPick = Number(pick)
  
        if(!validatePick(playerPick)){
          response.status(401);
          return response.json({
            status: 0,
            message: `Invalid pick!`,
          });
        }
  
        const cpuPick = Math.floor(Math.random() * 3);
  
        let playerWon = false
        let cpuWon = false
  
        if (PICKS[playerPick] != PICKS[cpuPick]) {
          if (PICKS[playerPick] == "Rock") {
            if (PICKS[cpuPick] == "Scissors") {
              playerWon = true
            }
            if (PICKS[cpuPick] == "Paper") {
              cpuWon = true
            }
          }
          if (PICKS[playerPick] == "Paper") {
            if (PICKS[cpuPick] == "Scissors") {
              cpuWon = true
            }
            if (PICKS[cpuPick] == "Rock") {
              playerWon = true
            }
          }
          if (PICKS[playerPick] == "Scissors") {
            if (PICKS[cpuPick] == "Paper") {
              playerWon = true
            }
            if (PICKS[cpuPick] == "Rock") {
              cpuWon = true
            }
          }
  
          findUser.remaining_play_count = findUser.remaining_play_count - 1;
          await findUser.save();
        }
  
        findUser.updated_at = currentDate;
  
        if(playerWon){
          findUser.wins = findUser.wins + 1;
        }
  
        if(cpuWon){
          findUser.losses = findUser.losses + 1;
        }
  
        const playHistory = new PlayHistory()
        playHistory.cpuPick = cpuPick
        playHistory.playerPick = playerPick
        playHistory.user = findUser
        playHistory.created_at = currentDate
        playHistory.updated_at = currentDate
        await playHistory.save()
  
        if(findUser.remaining_play_count <= 0){
          // findUser.next_play_at = currentDate + 1000 * 60 * 60 * 10
          findUser.next_play_at = currentDate + 1000 * 60 * 1
        }else{
          // findUser.next_play_at = currentDate + 1000 * 60 * 1
        }
  
        findUser.updated_at = currentDate;
        await findUser.save()
  
        return response.json({
          status: 1,
          message: 'Play success!',
          data: {
            next_play_at: findUser.next_play_at,
            remaining_play_count: findUser.remaining_play_count,
            cpuPick,
            playerPick,
            playerWon,
            cpuWon,
          },
        });
      }
  
    static async leaderboard(request: Request, response: Response) {
      const getLeaderboard = await User.find({
        select: {
          id: true,
          username: true,
          wins: true,
          losses: true
        },
        order: {
          wins: 'DESC',
          losses: 'ASC'
        }
      })
  
      return response.json({
        status: 1,
        data: getLeaderboard
      });
    }
  
    static async play_history(request: Request, response: Response) {
      const currentPage = parseInt(request.query.page as string, 10) || 1;
      const pageSize = parseInt(request.query.page_size as string, 10) || 10;
  
      const telegram_user_id = request.query.telegram_user_id as string
      const hashFromClient = request.query.hashFromClient as string
  
      if(Number(pageSize) > 100){
        response.status(400);
        return response.json({
          status: 0,
          message: 'Page size must be less than 100!'
        });
      }
  
      const skip = (currentPage - 1) * pageSize;
  
      const findUser = await User.findOne({ where: { telegram_user_id: telegram_user_id, auth_hash: hashFromClient } })
      if(!findUser){
        return response.json({
          status: 0,
          message: 'User not found!'
        });
      }
  
      const playHistories = await PlayHistory.find({
        where: { user: findUser },
        order: {
          id: 'DESC',
        },
        take: pageSize,
        skip
      })
  
      const count = await PlayHistory.count({ where: { user: findUser } })
  
      return response.json({
        status: 1,
        data: {
          playHistories,
          count
        }
      });
    }
}