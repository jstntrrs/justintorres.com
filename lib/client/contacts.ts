export interface ContactLinks {
  cv: string;
  email: string;
  whatsapp: string;
}

export function buildContactLinks(): ContactLinks {
  const cv =
    "t" +
    "o" +
    "r" +
    "r" +
    "e" +
    "s" +
    "_" +
    "j" +
    "u" +
    "s" +
    "t" +
    "i" +
    "n" +
    "_" +
    "c" +
    "v" +
    "." +
    "p" +
    "d" +
    "f";

  const protocol = "m" + "a" + "i" + "l" + "t" + "o:";
  const user = "m" + "e";
  const domain =
    "j" +
    "u" +
    "s" +
    "t" +
    "i" +
    "n" +
    "t" +
    "o" +
    "r" +
    "r" +
    "e" +
    "s" +
    "." +
    "c" +
    "o" +
    "m";
  const email = protocol + user + "@" + domain;

  const waPrefix = "https://" + "wa" + ".me/";
  const waNumber =
    "+" + "3" + "4" + "6" + "0" + "4" + "0" + "0" + "7" + "1" + "7" + "8";
  const whatsapp = waPrefix + waNumber;

  return { cv, email, whatsapp };
}
