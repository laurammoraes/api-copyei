import crypto from "crypto";

export function aaPanelSignature() {
  const nowTime = Math.floor(Date.now() / 1000); // Unix timestamp

  /* aaPanel signature */
  return {
    request_token: crypto
      .createHash("md5")
      .update(
        nowTime +
          crypto
            .createHash("md5")
            .update(process.env.AAPANEL_API_SECRET)
            .digest("hex")
      )
      .digest("hex"),
    request_time: nowTime,
  };
}
