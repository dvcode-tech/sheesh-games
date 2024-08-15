import { Response, Request } from 'express';
import * as crypto from 'crypto';
import { User } from 'Database/entities/user';
import { ic, Principal } from 'azle';
import { Referral } from 'Database/entities/referral';
import { PlayHistory } from 'Database/entities/playhistory';

const telegramBotToken = '6591061458:AAGt37yxXhtNX7BYITlayEfhkj0-FUIyr_0';
const secret = crypto.createHmac('sha256', 'WebAppData').update(telegramBotToken).digest();

const PICKS = ["Rock", "Paper", "Scissors"];

// Function to extract the numerical part from the referral code
function getReferralNumber(code: string): string | null {
  const match = code.match(/\d+/);
  return match ? parseInt(match[0], 10).toString() : null;
}

export default class ApisController {
  static async tgbot_login(request: Request, response: Response) {
    const { initData, startParam } = request.body;
    let dataCheckString = '';
    let hashFromClient = '';

    // URL-decode the string
    let decodedData = decodeURIComponent(initData);

    // Split the string into key-value pairs
    let keyValuePairs = decodedData.split('&');

    // Convert key-value pairs into an object
    let dataObj: { [key: string]: string } = {};
    keyValuePairs.forEach((pair) => {
      let [key, value] = pair.split('=');
      dataObj[key] = value;
    });

    // Extract the hash value and delete it from the object
    hashFromClient = dataObj['hash'];
    delete dataObj['hash'];

    // Sort the keys alphabetically
    let sortedKeys = Object.keys(dataObj).sort();

    // Append each key-value pair to dataCheckString
    sortedKeys.forEach((key) => {
      dataCheckString += `${key}=${dataObj[key]}\n`;
    });

    const _hash = crypto.createHmac('sha256', secret).update(dataCheckString.trim()).digest('hex');

    if (_hash !== hashFromClient) {
      response.status(401);
      return response.json({
        status: 0,
        message: 'invalid hash',
        data: {
          hashFromClient,
          _hash,
          dataCheckString,
        },
      });
    }

    const telegramUser = JSON.parse(dataObj['user']);

    // await ic.callRaw(Principal.fromText('bkyz2-fmaaa-aaaaa-qaaaq-cai'), '_azle_chunk', ic.candidEncode('()'), 0n);

    let findUser = await User.findOne({
      where: { 
          telegram_user_id: telegramUser.id, username: telegramUser.username
        }
    });

    try {
      if (!findUser) {
        let currentDate = Date.now();
        findUser = new User();
        findUser.telegram_user_id = telegramUser.id;
        findUser.username = telegramUser.username;
        findUser.created_at = currentDate;
        findUser.updated_at = currentDate;
        findUser.auth_hash = hashFromClient;
        await findUser.save();

        if (startParam) {
          const referral_telegram_id = getReferralNumber(startParam)
          if (referral_telegram_id) {
            // await ic.callRaw(Principal.fromText('bkyz2-fmaaa-aaaaa-qaaaq-cai'), '_azle_chunk', ic.candidEncode('()'), 0n);
            const checkReferrer = await User.findOne({ where: { telegram_user_id: referral_telegram_id } });
            if (checkReferrer && referral_telegram_id) {
              const newReferral = new Referral();
              newReferral.referralUserId = findUser.id;
              newReferral.referrerUserId = checkReferrer.id;
              await newReferral.save();
              
              findUser.referrerUserId = checkReferrer.id;

              checkReferrer.remaining_play_count = checkReferrer.remaining_play_count + 5;
              await checkReferrer.save();
            }
          }
        }
      }

      // await ic.callRaw(Principal.fromText('bkyz2-fmaaa-aaaaa-qaaaq-cai'), '_azle_chunk', ic.candidEncode('()'), 0n);

      findUser.auth_hash = hashFromClient;
      await findUser.save();
    } catch (error: any) {
      response.status(401);
      return response.json({
        status: 0,
        data: {
          error,
          message: error?.message
        },
      });
    }

    return response.json({
      status: 1,
      message: 'Login success from icp!',
      data: {
        hashFromClient,
        _hash,
        findUser,
        dataCheckString,
        // instructionCounter: ic.instructionCounter(),
        startParam,
      },
    });
  }

  static async tgbot_verify(request: Request, response: Response) {
    const { telegram_user_id, hashFromClient } = request.body;

    if(!telegram_user_id || !hashFromClient) {
      response.status(401);
      return response.json({
        status: 0,
        message: 'Invalid user!',
      });
    }
    
    const findUser = await User.findOne({
      where: { telegram_user_id: telegram_user_id, auth_hash: hashFromClient },
      relations: {
        referrer: true,
      },
    });
    if (!findUser) {
      response.status(401);
      return response.json({
        status: 0,
        message: 'Invalid user!',
      });
    }

    return response.json({
      status: 1,
      message: 'User verified!',
      data: {
        user: findUser,
      },
    });
  }

  static async referrals(request: Request, response: Response) {
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

    const referrals = await Referral.find({
      where: { referrerUserId: findUser.id },
      order: {
        id: 'DESC',
      },
      take: pageSize,
      skip
    })

    const count = await Referral.count({ where: { referrerUserId: findUser.id } })

    return response.json({
      status: 1,
      data: {
        referrals,
        count,
        currentPage,
        pageSize
      }
    });
  }
}