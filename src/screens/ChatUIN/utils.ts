import dayjs from 'dayjs';
import {Message} from '../../models';

export function isSameUser(currentMessage: Message, diffMessage: Message | null | undefined) {
  return !!(diffMessage && diffMessage.user === currentMessage.user);
}

export function isSameDay(currentMessage: Message, diffMessage: Message | null | undefined) {
  if (!diffMessage || !diffMessage.ts) {
    return false;
  }

  const currentCreatedAt = dayjs.unix(Number(currentMessage.ts.split('.')[0]));
  const diffCreatedAt = dayjs.unix(Number(diffMessage.ts.split('.')[0]));

  // if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
  //   return false;
  // }

  return currentCreatedAt.isSame(diffCreatedAt, 'day');
}
