export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalHours: number;
  daysUntilNextBirthday: number;
  birthdayDOW: string;
  thisBirthdayDOW: string;
  zodiac: string;
  chineseZodiac: string;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function getZodiac(month: number, day: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

const CHINESE_ZODIAC = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];

function getChineseZodiac(year: number): string {
  return CHINESE_ZODIAC[(year - 1900) % 12];
}

export function calculateAge(birthDateStr: string, today: Date = new Date()): AgeResult {
  const birth = new Date(birthDateStr + "T00:00:00");
  if (isNaN(birth.getTime()) || birth > today) throw new Error("Invalid birth date");

  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  let years = todayYear - birthYear;
  let months = todayMonth - birthMonth;
  let days = todayDay - birthDay;

  if (days < 0) {
    months--;
    const prevMonth = new Date(todayYear, todayMonth - 1, 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const totalDays = Math.floor((today.getTime() - birth.getTime()) / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = totalDays * 24;

  // Next birthday
  let nextBirthday = new Date(todayYear, birthMonth - 1, birthDay);
  if (nextBirthday < today || (nextBirthday.getTime() === today.getTime())) {
    nextBirthday = new Date(todayYear + 1, birthMonth - 1, birthDay);
  }
  const daysUntilNextBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86400000);

  const birthdayDOW = DAYS_OF_WEEK[birth.getDay()];
  const thisBirthday = new Date(todayYear, birthMonth - 1, birthDay);
  const thisBirthdayDOW = DAYS_OF_WEEK[thisBirthday.getDay()];

  const zodiac = getZodiac(birthMonth, birthDay);
  const chineseZodiac = getChineseZodiac(birthYear);

  return {
    years,
    months,
    days,
    totalDays,
    totalWeeks,
    totalHours,
    daysUntilNextBirthday,
    birthdayDOW,
    thisBirthdayDOW,
    zodiac,
    chineseZodiac,
  };
}
