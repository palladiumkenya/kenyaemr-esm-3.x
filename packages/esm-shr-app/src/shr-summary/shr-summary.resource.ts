import { openmrsFetch } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { z } from 'zod';
const PHONE_NUMBER_REGEX = /^(\+?254|0)((7|1)\d{8})$/;

export const authorizationSchema = z.object({
  otp: z.string().min(1, 'Required'),
  sender: z.string().regex(PHONE_NUMBER_REGEX),
  receiver: z.string().regex(PHONE_NUMBER_REGEX),
});

export function generateOTP(length = 5) {
  var string = '0123456789';
  let OTP = '';
  var len = string.length;
  for (let i = 0; i < length; i++) {
    OTP += string[Math.floor(Math.random() * len)];
  }
  return OTP;
}

export function persistOTP(otp: string, patientUuid: string) {
  sessionStorage.setItem(
    patientUuid,
    JSON.stringify({
      otp,
      timestamp: new Date().toISOString(),
    }),
  );
}

export async function sendOtp({ otp, receiver, sender }: z.infer<typeof authorizationSchema>) {
  const payload = parseMessage({ otp, name: 'Omosh' }, 'Dear {{name}}, Bellow is an SHR OTP: {{otp}}');

  const res = await openmrsFetch('send-sms-endpoint', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      destination: receiver,
      msg: payload,
      sender_id: sender,
      gateway: 'Pal_KeHMIS',
    }),
    redirect: 'follow',
  });
  if (res.ok) {
    return await res.json();
  }
  throw new Error('Error sending otp');
}

function parseMessage(object, template) {
  const placeholderRegex = /{{(.*?)}}/g;

  const parsedMessage = template.replace(placeholderRegex, (match, fieldName) => {
    if (object.hasOwnProperty(fieldName)) {
      return object[fieldName];
    } else {
      return match;
    }
  });

  return parsedMessage;
}
export function verifyOtp(otp: string, patientUuid: string) {
  const data = sessionStorage.getItem(patientUuid);
  if (!data) {
    throw new Error('Invalid OTP');
  }
  const { otp: storedOtp, timestamp } = JSON.parse(data);
  const isExpired = dayjs(timestamp).add(5, 'minutes').isBefore(dayjs());
  if (storedOtp !== otp) {
    throw new Error('Invalid OTP');
  }
  if (isExpired) {
    throw new Error('OTP Expired');
  }
  sessionStorage.removeItem(patientUuid);
  return 'Verification success';
}
